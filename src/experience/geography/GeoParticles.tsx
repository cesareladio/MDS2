import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'

export function GeoParticles() {
  const points = useRef<THREE.Points>(null)
  const quality = useExperienceStore((state) => state.deviceQuality)
  const count = quality === 'LOW' ? 140 : quality === 'MEDIUM' ? 280 : 520
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 2.3 + Math.random() * 1.3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      array[i * 3 + 1] = radius * Math.cos(phi)
      array[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return array
  }, [count])
  useFrame((_, delta) => { if (points.current) points.current.rotation.y -= delta * 0.012 })
  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#65adff" size={0.018} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  )
}
