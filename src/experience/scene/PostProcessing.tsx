import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useExperienceStore } from '../../store/experienceStore'

export function PostProcessing() {
  const quality = useExperienceStore((state) => state.deviceQuality)
  if (quality === 'LOW') return null
  return (
    <EffectComposer multisampling={quality === 'HIGH' ? 4 : 0}>
      <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.8} intensity={0.75} mipmapBlur />
      <Vignette eskil={false} offset={0.18} darkness={0.72} />
    </EffectComposer>
  )
}
