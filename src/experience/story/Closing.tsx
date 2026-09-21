import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { makeArc } from '../../lib/geo'
import { useExperienceStore } from '../../store/experienceStore'

/* ────────────────────────────────────────────────────────────────────────────
   Cinematic Closing

   Sequence:
   1. Country glows (Peru amber, Chile cyan) emerge from the globe
   2. A luminous arc connects them
   3. Scene fades to elegant darkness
   ─────────────────────────────────────────────────────────────────────────── */

const PERU_POS: [number, number] = [-9, -75]
const CHILE_POS: [number, number] = [-35, -71]

function ConnectionArc({ progress, opacity }: { progress: number; opacity: number }) {
  const particleRef = useRef<THREE.Mesh>(null)
  const convergenceRef = useRef<THREE.Mesh>(null)

  const curve = useMemo(
    () => makeArc(PERU_POS, CHILE_POS, 2.18),
    [],
  )
  const allPoints = useMemo(() => curve.getPoints(100), [curve])
  const drawnPoints = useMemo(() => {
    const count = Math.max(2, Math.floor(allPoints.length * progress))
    return allPoints.slice(0, count)
  }, [allPoints, progress])

  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(drawnPoints), [drawnPoints])
  const mat  = useMemo(() => new THREE.LineBasicMaterial({
    color: '#a8d8ff',
    transparent: true,
    opacity: opacity * 0.6,
  }), [opacity])

  useFrame(({ clock }) => {
    const t = ((clock.elapsedTime * 0.3) % 1) * progress
    if (particleRef.current) {
      particleRef.current.position.copy(curve.getPoint(t))
      ;(particleRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.8
    }
    if (convergenceRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.08
      convergenceRef.current.scale.setScalar(pulse)
      ;(convergenceRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (progress - 0.72) * 0.8)
    }
  })

  return (
    <group>
      <primitive object={new THREE.Line(geom, mat)} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent />
      </mesh>
      <mesh ref={convergenceRef} position={curve.getPoint(0.5)}>
        <sphereGeometry args={[0.026, 12, 12]} />
        <meshBasicMaterial color="#d9f2ff" toneMapped={false} transparent opacity={0} />
      </mesh>
    </group>
  )
}

export function Closing({ active }: { active: boolean }) {
  const scroll  = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)

  // Local progress within closing phase (0.95 → 1.0)
  const localProgress = Math.min(1, Math.max(0, (scroll - 0.95) / 0.05))
  const fade = active ? Math.min(1, localProgress * 5) : 0

  const arcOpacity = Math.min(1, Math.max(0, (fade - 0.3) * 1.5))
  const arcProgress = reduced ? 1 : Math.min(1, Math.max(0, (fade - 0.5) * 2))

  if (!active && fade < 0.01) return null

  return (
    <group>
      <ConnectionArc progress={arcProgress} opacity={arcOpacity} />
    </group>
  )
}
