import { BackSide } from 'three'

export function GlobeGlow({ intensity = 1 }: { intensity?: number }) {
  return <mesh scale={1.055}><sphereGeometry args={[2, 64, 64]} /><meshBasicMaterial color="#1675d1" transparent opacity={0.012 * intensity} side={BackSide} blending={2} /></mesh>
}
