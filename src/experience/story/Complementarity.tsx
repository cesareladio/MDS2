import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { latLonToVector3 } from '../../lib/geo'
import { useExperienceStore } from '../../store/experienceStore'

/* ────────────────────────────────────────────────────────────────────────────
   Complementarity — Energy Convergence

   Peru (amber) and Chile (cyan) each emit energy paths from their geographic
   centroids. The paths converge at a central convergence point, blending toward
   bright white/NTT-blue at the core. Scroll-driven via scrollProgress.
   ─────────────────────────────────────────────────────────────────────────── */

// Geographic origins
const PERU_ORIGIN  = latLonToVector3(-9.0,  -75.0, 2.06)   // central Peru
const CHILE_ORIGIN = latLonToVector3(-35.0, -71.0, 2.06)   // central Chile
const CONVERGENCE  = new THREE.Vector3(0, -0.35, 2.72)      // in front of both countries

// Build smooth Bezier/Catmull paths from each origin to convergence
function buildEnergyPath(
  origin: THREE.Vector3,
  convergence: THREE.Vector3,
  lift: number,
): THREE.CatmullRomCurve3 {
  const mid1 = origin.clone().lerp(convergence, 0.33).add(new THREE.Vector3(0, lift * 0.4, 0))
  const mid2 = origin.clone().lerp(convergence, 0.66).add(new THREE.Vector3(0, lift * 0.18, 0))
  return new THREE.CatmullRomCurve3([origin, mid1, mid2, convergence], false, 'catmullrom', 0.5)
}

// Build a tube-like set of parallel strands for each country
function buildStrands(
  origin: THREE.Vector3,
  convergence: THREE.Vector3,
  count: number,
  spread: number,
  lift: number,
): THREE.CatmullRomCurve3[] {
  return Array.from({ length: count }, (_, i) => {
    const offset = new THREE.Vector3(
      (i / (count - 1) - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.5,
      0,
    )
    const o = origin.clone().add(offset)
    return buildEnergyPath(o, convergence, lift)
  })
}

interface EnergyStrandProps {
  curve: THREE.CatmullRomCurve3
  color: string
  progress: number
  particleOffset: number
  opacity: number
}

function EnergyStrand({ curve, color, progress, particleOffset, opacity }: EnergyStrandProps) {
  const particleRef = useRef<THREE.Mesh>(null)
  const lineRef     = useRef<THREE.Line>(null)

  const points = useMemo(() => curve.getPoints(80), [curve])

  // Draw-progress geometry — only shows the first `progress` fraction of points
  const drawnPoints = useMemo(() => {
    const count = Math.max(2, Math.floor(points.length * progress))
    return points.slice(0, count)
  }, [points, progress])

  const geom = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(drawnPoints),
    [drawnPoints],
  )
  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    [color, opacity],
  )

  useFrame(({ clock }) => {
    if (!particleRef.current) return
    const t = ((clock.elapsedTime * 0.35 + particleOffset) % 1) * progress
    particleRef.current.position.copy(curve.getPoint(t))
    ;(particleRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.85
  })

  return (
    <group>
      <primitive object={new THREE.Line(geom, mat)} ref={lineRef} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={opacity} />
      </mesh>
    </group>
  )
}

// Convergence glow core
function ConvergenceCore({ intensity }: { intensity: number }) {
  const coreRef  = useRef<THREE.Mesh>(null)
  const haloRef  = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const breathe = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.08
    if (coreRef.current) coreRef.current.scale.setScalar(breathe * intensity)
    if (haloRef.current) {
      haloRef.current.scale.setScalar(breathe * intensity * 1.9)
      ;(haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 * intensity
    }
  })

  return (
    <group position={CONVERGENCE}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#a8d8ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshBasicMaterial color="#e8f4ff" toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Complementarity({ active }: { active: boolean }) {
  const scroll  = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)

  // Local progress within the complementarity phase (0.58 → 0.70)
  const localProgress = Math.min(1, Math.max(0, (scroll - 0.58) / 0.12))
  const fade = active ? Math.min(1, localProgress * 3) : 0

  const peruStrands  = useMemo(() => buildStrands(PERU_ORIGIN,  CONVERGENCE, 6, 0.12, 0.28), [])
  const chileStrands = useMemo(() => buildStrands(CHILE_ORIGIN, CONVERGENCE, 6, 0.12, 0.28), [])

  if (!active && fade < 0.01) return null

  return (
    <group>
      {/* Peru strands — amber */}
      {peruStrands.map((curve, i) => (
        <EnergyStrand
          key={`peru-${i}`}
          curve={curve}
          color="#ffad42"
          progress={reduced ? 1 : localProgress}
          particleOffset={i / peruStrands.length}
          opacity={fade * (0.45 + (i % 2) * 0.15)}
        />
      ))}

      {/* Chile strands — cyan */}
      {chileStrands.map((curve, i) => (
        <EnergyStrand
          key={`chile-${i}`}
          curve={curve}
          color="#31c7ff"
          progress={reduced ? 1 : localProgress}
          particleOffset={i / chileStrands.length + 0.5}
          opacity={fade * (0.45 + (i % 2) * 0.15)}
        />
      ))}

      {/* Convergence core — grows with progress */}
      <ConvergenceCore intensity={localProgress * fade} />
    </group>
  )
}
