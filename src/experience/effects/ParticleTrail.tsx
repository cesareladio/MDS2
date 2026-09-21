import { Sparkles } from '@react-three/drei'

export function ParticleTrail({ color }: { color: string }) {
  return <Sparkles count={70} scale={[3.8, 2.2, 1.5]} size={2.4} speed={0.25} opacity={0.42} color={color} />
}
