import { Stars as DreiStars } from '@react-three/drei'
import { useExperienceStore } from '../../store/experienceStore'

export function Stars() {
  const quality = useExperienceStore((state) => state.deviceQuality)
  return <DreiStars radius={70} depth={45} count={quality === 'LOW' ? 700 : quality === 'MEDIUM' ? 1400 : 2300} factor={2.5} saturation={0.2} fade speed={0.25} />
}
