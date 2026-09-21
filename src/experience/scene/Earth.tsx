import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'

function GlobeGrid() {
  const lines = useMemo(() => {
    const result: THREE.Vector3[][] = []
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: THREE.Vector3[] = []
      for (let lon = -180; lon <= 180; lon += 5) {
        const phi = (90 - lat) * Math.PI / 180
        const theta = (lon + 180) * Math.PI / 180
        points.push(new THREE.Vector3(-2.015 * Math.sin(phi) * Math.cos(theta), 2.015 * Math.cos(phi), 2.015 * Math.sin(phi) * Math.sin(theta)))
      }
      result.push(points)
    }
    for (let lon = -180; lon < 180; lon += 30) {
      const points: THREE.Vector3[] = []
      for (let lat = -85; lat <= 85; lat += 4) {
        const phi = (90 - lat) * Math.PI / 180
        const theta = (lon + 180) * Math.PI / 180
        points.push(new THREE.Vector3(-2.015 * Math.sin(phi) * Math.cos(theta), 2.015 * Math.cos(phi), 2.015 * Math.sin(phi) * Math.sin(theta)))
      }
      result.push(points)
    }
    return result
  }, [])

  return <>{lines.map((points, index) => <Line key={index} points={points} color="#297fc8" transparent opacity={0.1} lineWidth={0.45} />)}</>
}

export function Earth() {
  const mesh = useRef<THREE.Mesh>(null)
  const reduced = useExperienceStore((state) => state.reducedMotion)

  useFrame((_, delta) => {
    if (mesh.current && !reduced) mesh.current.rotation.y += delta * 0.014
  })

  return (
    <group>
      <mesh ref={mesh}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial color="#061b35" roughness={0.72} metalness={0.22} emissive="#00152f" emissiveIntensity={0.72} />
      </mesh>
      <GlobeGrid />
    </group>
  )
}
