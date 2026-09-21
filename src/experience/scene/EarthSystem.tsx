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

const GEO_DEBUG = false

export function EarthSystem({ showLatam }: { showLatam: boolean }) {
  const group = useRef<THREE.Group>(null)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const introProgress = THREE.MathUtils.smoothstep(scroll, 0, 0.12)

  useFrame(() => {
    if (!group.current) return
    group.current.position.y = THREE.MathUtils.lerp(-3.55, 0, introProgress)
    const globalProgress = THREE.MathUtils.smoothstep(scroll, 0.1, 0.24)
    const globalScale = THREE.MathUtils.lerp(1, 0.86, globalProgress)
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.6, 0.82, introProgress) * globalScale)
    group.current.position.x = THREE.MathUtils.lerp(0.08, 0.16, Math.min(1, Math.max(0, (scroll - 0.1) / 0.15)))
  })

  const atmosphereIntensity = THREE.MathUtils.lerp(0.05, 1, introProgress)
  return (
    <group ref={group}>
      {GEO_DEBUG && <GeoAlignmentDebug />}
      <Earth />
      <GeoParticles />
      <Atmosphere intensity={atmosphereIntensity} />
      <GlobeGlow intensity={atmosphereIntensity} />
      <LatamReveal active={showLatam} />
      <CountryExplorer />
    </group>
  )
}
