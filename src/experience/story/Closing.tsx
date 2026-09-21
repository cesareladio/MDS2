import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { latLonToVector3, makeArc } from '../../lib/geo'
import { useExperienceStore } from '../../store/experienceStore'

/* ────────────────────────────────────────────────────────────────────────────
   Cinematic Closing

   Sequence:
   1. Country glows (Peru amber, Chile cyan) emerge from the globe
   2. A luminous arc connects them
   3. Scene fades to elegant darkness
   ─────────────────────────────────────────────────────────────────────────── */

const PERU_POS  = latLonToVector3(-9.0,  -75.0, 2.06)
const CHILE_POS = latLonToVector3(-35.0, -71.0, 2.06)

function CountryGlow({ position, color, intensity }: {
  position: THREE.Vector3
  color: string
  intensity: number
}) {
  const haloRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const breathe = 1 + Math.sin(clock.elapsedTime * 0.9) * 0.1
    if (haloRef.current) {
      haloRef.current.scale.setScalar(breathe * (1 + intensity * 1.4))
      ;(haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 * intensity
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(breathe * intensity)
      ;(coreRef.current.material as THREE.MeshBasicMaterial).opacity = intensity
    }
  })

  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={1} />
      </mesh>
    </group>
  )
}

function ConnectionArc({ progress, opacity }: { progress: number; opacity: number }) {
  const particleRef = useRef<THREE.Mesh>(null)

  const curve = useMemo(
    () => makeArc([-9, -75], [-35, -71], 2.18),
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
    if (!particleRef.current) return
    const t = ((clock.elapsedTime * 0.3) % 1) * progress
    particleRef.current.position.copy(curve.getPoint(t))
    ;(particleRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
  })

  return (
    <group>
      <primitive object={new THREE.Line(geom, mat)} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent />
      </mesh>
    </group>
  )
}

export function Closing({ active }: { active: boolean }) {
  const scroll  = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)

  // Local progress within closing phase (0.91 → 1.0)
  const localProgress = Math.min(1, Math.max(0, (scroll - 0.91) / 0.09))
  const fade = active ? Math.min(1, localProgress * 5) : 0

  // Staggered reveals
  const peruGlow  = Math.min(1, fade * 1.5)
  const chileGlow = Math.min(1, Math.max(0, (fade - 0.3) * 1.5))
  const arcProgress = reduced ? 1 : Math.min(1, Math.max(0, (fade - 0.5) * 2))

  if (!active && fade < 0.01) return null

  return (
    <group>
      <CountryGlow position={PERU_POS}  color="#ffad42" intensity={peruGlow} />
      <CountryGlow position={CHILE_POS} color="#31c7ff" intensity={chileGlow} />
      <ConnectionArc progress={arcProgress} opacity={Math.min(peruGlow, chileGlow)} />
    </group>
  )
}
