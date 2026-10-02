import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { latLonToVector3 } from '../../lib/geo'

type Waypoint = {
  at: number
  lat: number
  lon: number
  distance: number
  fov: number
  roll: number
}

const waypoints: Waypoint[] = [
  { at: 0.00, lat: 12, lon: -15, distance: 10.0, fov: 44, roll: 0 },
  { at: 0.12, lat: -22, lon: -74, distance: 5.8, fov: 36, roll: -0.01 },
  { at: 0.26, lat: -22, lon: -74, distance: 5.2, fov: 36, roll: 0 },
  { at: 0.46, lat: -20, lon: -72, distance: 5.4, fov: 40, roll: 0 },
  { at: 0.62, lat: -19, lon: -70, distance: 5.6, fov: 40, roll: 0.003 },
  { at: 0.78, lat: -18, lon: -68, distance: 6.4, fov: 44, roll: 0.006 },
  { at: 0.91, lat: -28, lon: -68, distance: 5.6, fov: 40, roll: 0 },
]

function buildPositionCurve(points: Waypoint[]) {
  return new THREE.CatmullRomCurve3(
    points.map((wp) => latLonToVector3(wp.lat, wp.lon, wp.distance)),
    false,
    'catmullrom',
    0.48,
  )
}

function curveT(points: Waypoint[], progress: number) {
  if (progress <= points[0].at) return 0
  if (progress >= points[points.length - 1].at) return 1
  const nextIndex = points.findIndex((wp) => wp.at >= progress)
  const index = Math.max(1, nextIndex)
  const a = points[index - 1]
  const b = points[index]
  const local = THREE.MathUtils.smoothstep((progress - a.at) / Math.max(0.0001, b.at - a.at), 0, 1)
  return (index - 1 + local) / (points.length - 1)
}

function scalarAt(points: Waypoint[], progress: number, key: 'fov' | 'roll') {
  const next = points.findIndex((wp) => wp.at >= progress)
  if (next <= 0) return points[0][key]
  if (next >= points.length) return points[points.length - 1][key]
  const a = points[next - 1]
  const b = points[next]
  const local = THREE.MathUtils.smoothstep((progress - a.at) / Math.max(0.0001, b.at - a.at), 0, 1)
  return THREE.MathUtils.lerp(a[key], b[key], local)
}

export function CameraRig() {
  const { camera, pointer } = useThree()
  const progress = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const positionCurve = useMemo(() => buildPositionCurve(waypoints), [])

  useFrame((_, delta) => {
    const perspCamera = camera as THREE.PerspectiveCamera
    targetPos.copy(positionCurve.getPoint(curveT(waypoints, progress)))
    if (!reduced) {
      targetPos.x += pointer.x * 0.08
      targetPos.y += pointer.y * 0.05
    }

    const ease = 1 - Math.pow(0.0004, delta)
    camera.position.lerp(targetPos, ease * 0.42)
    perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, scalarAt(waypoints, progress, 'fov'), ease * 0.5)
    perspCamera.updateProjectionMatrix()

    const roll = THREE.MathUtils.lerp(Math.atan2(camera.up.x, camera.up.y), scalarAt(waypoints, progress, 'roll'), ease * 0.3)
    camera.up.lerp(up.set(Math.sin(roll), Math.cos(roll), 0), ease * 0.6)
    lookTarget.set(0, 0, 0)
    camera.lookAt(lookTarget)
  })

  return null
}
