import { BackSide } from 'three'

export function GlobeGlow() {
  return <mesh scale={1.11}><sphereGeometry args={[2, 64, 64]} /><meshBasicMaterial color="#0088ff" transparent opacity={0.025} side={BackSide} blending={2} /></mesh>
}
