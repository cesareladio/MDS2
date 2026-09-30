import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { latLonToVector3 } from '../../lib/geo'

/* ────────────────────────────────────────────────────────────────────────────
   Cinematic Waypoints (normalised scroll 0–1)
   Each waypoint defines where the camera should be at that scroll position.
   Arcs between waypoints are interpolated via CatmullRomCurve3 for cinematic
   curvature — no linear robotic orbiting.
   ─────────────────────────────────────────────────────────────────────────── */
type Waypoint = {
  at: number
  lat: number
  lon: number
  distance: number
  fov: number
  roll: number        // Z-roll in radians (subtle tilt for drama)
  targetLat?: number  // where the camera looks (defaults to origin)
  targetLon?: number
}

const waypoints: Waypoint[] = [
  // INTRO – wide establishing view, slightly above equator
  { at: 0.00, lat:  12,  lon:  -15, distance: 10.0, fov: 44, roll:  0.000 },

  // CHILE + PERÚ – direct arc south-west toward the Andean region
  { at: 0.09, lat: -22,  lon:  -74, distance:  5.8, fov: 36, roll: -0.010 },

  // HISTORY – settle over Peru/Chile, slightly closer
  { at: 0.22, lat: -22,  lon:  -74, distance:  5.4, fov: 36, roll:  0.000 },

  // TERRITORY – close West-face of South America
  { at: 0.35, lat: -23,  lon:  -75, distance:  5.1, fov: 36, roll:  0.004 },

  // EXPLORE (country selection active)
  { at: 0.48, lat: -23,  lon:  -75, distance:  5.0, fov: 36, roll:  0.004 },

  // EFFICIENCY – pull back slightly for bilateral geometry
  { at: 0.62, lat: -20,  lon:  -72, distance:  5.4, fov: 40, roll:  0.000 },

  // CHALLENGES – drift further back, tilt slightly
  { at: 0.76, lat: -18,  lon:  -68, distance:  6.4, fov: 44, roll:  0.006 },

  // CLOSING – return to South America, twilight view
  { at: 1.00, lat: -28,  lon:  -68, distance:  5.6, fov: 40, roll:  0.000 },
]

/* Build a CatmullRom position curve from the waypoints */
function buildPositionCurve(points: Waypoint[]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    points.map((wp) => latLonToVector3(wp.lat, wp.lon, wp.distance)),
    false,
    'catmullrom',
    0.48,
  )
}

/* Smooth scalar interpolation along the waypoint timeline */
function mapProgressToCurveT(
  points: Waypoint[],
  progress: number,
) {
  if (progress <= points[0].at) return 0
  if (progress >= points[points.length - 1].at) return 1

  const nextIndex = points.findIndex(
    (wp) => wp.at >= progress
  )

  const currentIndex = Math.max(1, nextIndex)

  const a = points[currentIndex - 1]
  const b = points[currentIndex]

  const span = Math.max(
    0.0001,
    b.at - a.at
  )

  const local =
    (progress - a.at) / span

  const eased =
    THREE.MathUtils.smoothstep(
      local,
      0,
      1
    )

  return (
    (currentIndex - 1 + eased) /
    (points.length - 1)
  )
}

function interpolateScalar(
  points: Waypoint[],
  progress: number,
  key: 'fov' | 'roll',
): number {
  const next  = points.findIndex((wp) => wp.at >= progress)
  if (next <= 0) return points[0][key]
  if (next >= points.length) return points[points.length - 1][key]
  const a    = points[next - 1]
  const b    = points[next]
  const span = Math.max(0.0001, b.at - a.at)
  const t    = THREE.MathUtils.smoothstep((progress - a.at) / span, 0, 1)
  return THREE.MathUtils.lerp(a[key], b[key], t)
}

/* ────────────────────────────────────────────────────────────────────────────
   CameraRig — the single camera authority.
   Every other component that wants to influence camera MUST route through here.
   ─────────────────────────────────────────────────────────────────────────── */
export function CameraRig() {
  const { camera, pointer } = useThree()
  const progress = useExperienceStore((state) => state.scrollProgress)
  const phase = useExperienceStore((state) => state.phase)
  const reduced = useExperienceStore((state) => state.reducedMotion)

  const targetPos  = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])
  const up         = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const posCurve   = useMemo(() => buildPositionCurve(waypoints), [])

  // Store last non-exploration progress so we can interpolate back out
  const lastProgress = useRef(0)

  useFrame((_, delta) => {
    const perspCamera = camera as THREE.PerspectiveCamera

    if (phase === 'explore') {
      /* ── Comparative exploration framing ── */
      targetPos.copy(latLonToVector3(-23, -74, 5.0))
      const ease = 1 - Math.pow(0.0008, delta)
      camera.position.lerp(targetPos, ease * 0.5)

      // FOV tightens slightly for exploration
      perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, 36, ease * 0.4)
      perspCamera.updateProjectionMatrix()

      lookTarget.set(0, 0, 0)
      camera.up.lerp(up, ease * 0.6)
      camera.lookAt(lookTarget)
      return
    }

    lastProgress.current = progress

    /* ── Story scroll – CatmullRom curve ── */
    const t =
      mapProgressToCurveT(
        waypoints,
        progress
      )

    const curvePos =
      posCurve.getPoint(t)
    targetPos.copy(curvePos)

    if (!reduced) {
      targetPos.x += pointer.x * 0.08
      targetPos.y += pointer.y * 0.05
    }

    const ease = 1 - Math.pow(0.0004, delta)
    camera.position.lerp(targetPos, ease * 0.42)

    // FOV
    const targetFov = interpolateScalar(waypoints, progress, 'fov')
    perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, targetFov, ease * 0.5)
    perspCamera.updateProjectionMatrix()

    // Roll (very subtle)
    const targetRoll = interpolateScalar(waypoints, progress, 'roll')
    const currentRoll = Math.atan2(camera.up.x, camera.up.y)
    const newRoll = THREE.MathUtils.lerp(currentRoll, targetRoll, ease * 0.3)
    camera.up.set(Math.sin(newRoll), Math.cos(newRoll), 0)

    lookTarget.set(0, 0, 0)
    camera.lookAt(lookTarget)
  })

  return null
}
