import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export function Pulse({ color = '#52a9ff' }: { color?: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const scale = 1 + (clock.elapsedTime % 2) * 0.7
    ref.current.scale.setScalar(scale)
    const material = ref.current.material as THREE.MeshBasicMaterial
    material.opacity = 0.45 * (1 - (clock.elapsedTime % 2) / 2)
  })
  return <mesh ref={ref}><ringGeometry args={[0.7, 0.72, 64]} /><meshBasicMaterial color={color} transparent opacity={0.4} side={2} /></mesh>
}
