import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export function EnergyLines() {
  const group = useRef<THREE.Group>(null)
  const lines = useMemo(() => Array.from({ length: 18 }, (_, index) => {
    const angle = index / 18 * Math.PI * 2
    const side = index % 2 === 0 ? -1 : 1
    return [
      new THREE.Vector3(Math.cos(angle) * 1.7, Math.sin(angle) * 1.2, -0.15),
      new THREE.Vector3(side * 0.75, Math.sin(angle * 1.3) * 0.45, 0.25),
      new THREE.Vector3(0, 0, 0.6),
    ]
  }), [])
  useFrame(({ clock }) => { if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.25) * 0.08 })
  return <group ref={group}>{lines.map((points, index) => <Line key={index} points={points} color={index % 2 ? '#39cfff' : '#ffad42'} lineWidth={1} transparent opacity={0.3} />)}</group>
}
