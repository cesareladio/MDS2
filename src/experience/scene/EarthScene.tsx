import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useExperienceStore } from '../../store/experienceStore'
import { Atmosphere } from './Atmosphere'
import { CameraRig } from './CameraRig'
import { Earth } from './Earth'
import { Lighting } from './Lighting'
import { PostProcessing } from './PostProcessing'
import { Stars } from './Stars'
import { GlobeGlow } from '../effects/GlobeGlow'
import { GeoParticles } from '../geography/GeoParticles'
import { GlobalJourney } from '../story/GlobalJourney'
import { LatamReveal } from '../story/LatamReveal'
import { CountryExplorer } from '../story/CountryExplorer'
import { Complementarity } from '../story/Complementarity'
import { CapabilityEngine } from '../story/CapabilityEngine'
import { Closing } from '../story/Closing'

export function EarthScene() {
  const phase = useExperienceStore((state) => state.phase)
  const quality = useExperienceStore((state) => state.deviceQuality)
  const showLatam = ['latam', 'snapshot', 'explore', 'complementarity', 'ibiol', 'closing'].includes(phase)
  return (
    <div className="canvas-shell" aria-hidden="true">
      <Canvas dpr={quality === 'LOW' ? [0.8, 1] : [1, 1.75]} camera={{ position: [0, 0, 10], fov: 42 }} gl={{ antialias: quality !== 'LOW', powerPreference: 'high-performance' }}>
        <color attach="background" args={['#02060d']} />
        <fog attach="fog" args={['#02060d', 9, 24]} />
        <Suspense fallback={null}>
          <Lighting />
          <Stars />
          <GeoParticles />
          <Earth />
          <Atmosphere />
          <GlobeGlow />
          <GlobalJourney active={phase === 'global'} />
          <LatamReveal active={showLatam} />
          <CountryExplorer />
          <Complementarity active={phase === 'complementarity'} />
          <CapabilityEngine active={phase === 'ibiol'} />
          <Closing active={phase === 'closing'} />
          <CameraRig />
          <PostProcessing />
        </Suspense>
      </Canvas>
    </div>
  )
}
