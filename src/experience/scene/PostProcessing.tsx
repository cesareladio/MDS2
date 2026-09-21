import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useExperienceStore } from '../../store/experienceStore'

export function PostProcessing() {
  const quality = useExperienceStore((state) => state.deviceQuality)
  if (quality === 'LOW') return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.56}
        luminanceSmoothing={0.82}
        intensity={quality === 'HIGH' ? 0.18 : 0.12}
        mipmapBlur={false}
        radius={0.48}
      />
      <Vignette eskil={false} offset={0.14} darkness={0.5} />
    </EffectComposer>
  )
}
