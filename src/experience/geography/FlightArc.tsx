import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { makeArc } from '../../lib/geo'

export function FlightArc({ start, end, color = '#70b8ff', offset = 0 }: { start: [number, number]; end: [number, number]; color?: string; offset?: number }) {
  const particle = useRef<THREE.Mesh>(null)
  const curve = useMemo(() => makeArc(start, end), [start, end])
  const points = useMemo(() => curve.getPoints(80), [curve])
  useFrame(({ clock }) => {
    if (!particle.current) return
    particle.current.position.copy(curve.getPoint((clock.elapsedTime * 0.07 + offset) % 1))
  })
  return (
    <group>
      <Line points={points} color={color} transparent opacity={0.38} lineWidth={1} />
      <mesh ref={particle}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  )
}
