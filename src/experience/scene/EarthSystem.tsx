import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { Earth } from './Earth'
import { Atmosphere } from './Atmosphere'
import { GlobeGlow } from '../effects/GlobeGlow'
import { LatamReveal } from '../story/LatamReveal'
import { CountryExplorer } from '../story/CountryExplorer'
import { GeoParticles } from '../geography/GeoParticles'
import { GeoAlignmentDebug } from '../geography/GeoAlignmentDebug'
import { Closing } from '../story/Closing'

const GEO_DEBUG = false

export function EarthSystem({ showCountryHighlight, showHubs, showClose }: { showCountryHighlight: boolean; showHubs: boolean; showClose: boolean }) {
  const group = useRef<THREE.Group>(null)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const introProgress = THREE.MathUtils.smoothstep(scroll, 0, 0.12)

  useFrame(() => {
    if (!group.current) return
    group.current.position.y = THREE.MathUtils.lerp(-3.55, 0, introProgress)
    const revealProgress = THREE.MathUtils.smoothstep(scroll, 0.09, 0.22)
    const revealScale = THREE.MathUtils.lerp(1, 0.86, revealProgress)
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.6, 0.82, introProgress) * revealScale)
    group.current.position.x = THREE.MathUtils.lerp(0.08, 0.16, Math.min(1, Math.max(0, (scroll - 0.09) / 0.13)))
  })

  const atmosphereIntensity = THREE.MathUtils.lerp(0.05, 1, introProgress)
  return (
    <group ref={group}>
      {GEO_DEBUG && <GeoAlignmentDebug />}
      <Earth />
      <GeoParticles />
      <Atmosphere intensity={atmosphereIntensity} />
      <GlobeGlow intensity={atmosphereIntensity} />
      <LatamReveal active={showCountryHighlight} />
      {showHubs && <CountryExplorer />}
      <Closing active={showClose} />
    </group>
  )
}
