import { EnergyLines } from '../effects/EnergyLines'
import { ParticleTrail } from '../effects/ParticleTrail'

export function Complementarity({ active }: { active: boolean }) {
  if (!active) return null
  return <group position={[0, 0, 2.65]} scale={0.72}><EnergyLines /><ParticleTrail color="#73c8ff" /></group>
}
