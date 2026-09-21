import { Sparkles } from '@react-three/drei'

export function Closing({ active }: { active: boolean }) {
  if (!active) return null
  return <group position={[0, -0.2, 2.5]}><Sparkles count={100} scale={[3, 1.8, 1]} color="#b9dfff" size={3} speed={0.2} /></group>
}
