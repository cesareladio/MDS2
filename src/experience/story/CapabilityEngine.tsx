import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { capabilities } from '../../data/capabilities'
import { useExperienceStore } from '../../store/experienceStore'

export function CapabilityEngine({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null)
  const selectCapability = useExperienceStore((state) => state.selectCapability)
  const nodes = useMemo(() => capabilities.map((item, index) => {
    const angle = index / capabilities.length * Math.PI * 2 - Math.PI / 2
    return { item, point: new THREE.Vector3(Math.cos(angle) * 1.5, Math.sin(angle) * 1.1, 0) }
  }), [])
  useFrame(({ clock }) => { if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.28) * 0.045 })
  if (!active) return null
  return (
    <group ref={group} position={[0, 0, 2.75]} scale={0.72}>
      <mesh><sphereGeometry args={[0.36, 36, 36]} /><meshStandardMaterial color="#0b4c9b" emissive="#097cff" emissiveIntensity={1.1} /></mesh>
      <Html center><div className="engine-core">IBIOL</div></Html>
      {nodes.map(({ item, point }) => (
        <group key={item.id}>
          <Line points={[new THREE.Vector3(), point]} color="#3d9dff" transparent opacity={0.38} lineWidth={1} />
          <group position={point}>
            <mesh><sphereGeometry args={[0.13, 24, 24]} /><meshBasicMaterial color="#52b7ff" toneMapped={false} /></mesh>
            <Html center>
              <button className="capability-node" onClick={() => selectCapability(item.id)} aria-label={`Ver ${item.name}`}>{item.name}</button>
            </Html>
          </group>
        </group>
      ))}
    </group>
  )
}
