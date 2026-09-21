import { Stars as DreiStars } from '@react-three/drei'
import { useExperienceStore } from '../../store/experienceStore'

export function Stars() {
  const quality = useExperienceStore((state) => state.deviceQuality)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const introProgress = Math.min(1, scroll / 0.12)
  const count = quality === 'LOW' ? 600 : quality === 'MEDIUM' ? 1050 : 1600
  return <DreiStars radius={70} depth={45} count={Math.max(80, Math.round(count * (0.18 + introProgress * 0.82)))} factor={1.4 + introProgress * 1.1} saturation={0.2} fade={false} />
}
