import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useExperienceStore } from '../../store/experienceStore'
import { CameraRig } from './CameraRig'
import { EarthSystem } from './EarthSystem'
import { Lighting } from './Lighting'
import { PostProcessing } from './PostProcessing'
import { Stars } from './Stars'
import { WebGLDiagnostics } from './WebGLDiagnostics'
import { GeoParticles } from '../geography/GeoParticles'
import { GlobalJourney } from '../story/GlobalJourney'
import { Complementarity } from '../story/Complementarity'
import { CapabilityEngine } from '../story/CapabilityEngine'

export function EarthScene() {
  const phase   = useExperienceStore((state) => state.phase)
  const quality = useExperienceStore((state) => state.deviceQuality)

  const showLatam  = ['latam', 'snapshot', 'explore'].includes(phase)
  const showEngine = phase === 'engine' || phase === 'ibiol'
  const showClose  = phase === 'closing'

  return (
    <div className="canvas-shell" aria-hidden="true">
      <Canvas
        dpr={quality === 'LOW' ? [0.8, 1] : quality === 'MEDIUM' ? [1, 1.25] : [1, 1.4]}
        camera={{ position: [0, 0, 10], fov: 44 }}
        gl={{ antialias: quality === 'HIGH', powerPreference: 'high-performance', toneMapping: 3 /* ACESFilmic */ }}
      >
        <color attach="background" args={['#01050c']} />
        <fog attach="fog" args={['#01050c', 10, 28]} />

        <Suspense fallback={null}>
          <WebGLDiagnostics />
          <Lighting />
          <Stars />
          <EarthSystem showLatam={showLatam} showClose={showClose} />

          {/* Story components — keep mounted during neighbouring phases, fade internally */}
          <GlobalJourney active={phase === 'global'} />
          <Complementarity active={phase === 'complementarity'} />
          <CapabilityEngine active={showEngine} />

          <CameraRig />
          <PostProcessing />
        </Suspense>
      </Canvas>
    </div>
  )
}
