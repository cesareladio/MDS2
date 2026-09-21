import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { latLonToVector3 } from '../../lib/geo'

interface CountryHighlightProps {
  outline: Array<[number, number]>
  color: string
  active: boolean
}

export function CountryHighlight({ outline, color, active }: CountryHighlightProps) {
  const pulse = useRef<THREE.Mesh>(null)
  const points = useMemo(() => outline.map(([lat, lon]) => latLonToVector3(lat, lon, 2.045)), [outline])
  const center = useMemo(() => points.reduce((sum, point) => sum.add(point), new THREE.Vector3()).divideScalar(points.length).normalize().multiplyScalar(2.07), [points])

  useFrame(({ clock }) => {
    if (!pulse.current) return
    const value = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.17
    pulse.current.scale.setScalar(value)
  })

  return (
    <group visible={active}>
      <Line points={points} color={color} lineWidth={1.7} transparent opacity={0.95} />
      <mesh ref={pulse} position={center}>
        <sphereGeometry args={[0.035, 18, 18]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  )
}
