import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useExperienceStore } from '../../store/experienceStore'

export function PostProcessing() {
  const quality = useExperienceStore((state) => state.deviceQuality)
  if (quality === 'LOW') return null
  return (
    <EffectComposer multisampling={quality === 'HIGH' ? 4 : 0}>
      <Bloom
        luminanceThreshold={0.48}
        luminanceSmoothing={0.9}
        intensity={quality === 'HIGH' ? 0.28 : 0.18}
        mipmapBlur
        radius={0.72}
      />
      <Vignette eskil={false} offset={0.16} darkness={0.58} />
    </EffectComposer>
  )
}
