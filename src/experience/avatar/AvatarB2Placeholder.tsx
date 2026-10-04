import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { POSE_FALLBACK_TRANSFORM } from '../../data/b2Poses'
import { useAvatarStore } from '../../store/avatarStore'

/**
 * AvatarB2Placeholder — humanoide low-poly mostrado mientras avatar.glb no
 * está disponible (Suspense) o si falla su carga/render (ErrorBoundary).
 * Reacciona a la misma pose global que el modelo real.
 */
export function AvatarB2Placeholder() {
  const pose = useAvatarStore((state) => state.pose)
  const torso    = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const leftArm  = useRef<THREE.Group>(null)
  const elapsed  = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta
    const target = POSE_FALLBACK_TRANSFORM[pose] ?? POSE_FALLBACK_TRANSFORM['idle']
    const bob   = pose === 'idle' ? Math.sin(elapsed.current * 1.6) * 0.02 : 0
    const alpha = 1 - Math.pow(0.001, delta)

    if (rightArm.current) rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, target.rightArm, alpha)
    if (leftArm.current)  leftArm.current.rotation.z  = THREE.MathUtils.lerp(leftArm.current.rotation.z,  target.leftArm,  alpha)
    if (torso.current) {
      torso.current.rotation.z = THREE.MathUtils.lerp(torso.current.rotation.z, target.tilt, alpha)
      torso.current.position.y = bob
    }
  })

  return (
    <group ref={torso}>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color="#f4c9a0" />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <capsuleGeometry args={[0.28, 0.75, 6, 12]} />
        <meshStandardMaterial color="#2b4f7a" />
      </mesh>
      <group ref={rightArm} position={[-0.34, 1.3, 0]}>
        <mesh position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
          <meshStandardMaterial color="#2b4f7a" />
        </mesh>
      </group>
      <group ref={leftArm} position={[0.34, 1.3, 0]}>
        <mesh position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
          <meshStandardMaterial color="#2b4f7a" />
        </mesh>
      </group>
    </group>
  )
}
