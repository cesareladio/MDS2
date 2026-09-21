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

export function EarthSystem({ showLatam }: { showLatam: boolean }) {
  const group = useRef<THREE.Group>(null)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const introProgress = THREE.MathUtils.smoothstep(scroll, 0, 0.12)

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.position.y = THREE.MathUtils.lerp(-3.55, 0, introProgress)
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.62, 0.9, introProgress))
    group.current.position.x = THREE.MathUtils.lerp(0.1, 0.18, Math.min(1, Math.max(0, (scroll - 0.1) / 0.15)))
    if (!reduced && scroll < 0.58) group.current.rotation.y += delta * THREE.MathUtils.lerp(0.008, 0.001, Math.min(1, scroll / 0.58))
  })

  const atmosphereIntensity = THREE.MathUtils.lerp(0.05, 1, introProgress)
  return (
    <group ref={group}>
      <Earth />
      <GeoParticles />
      <Atmosphere intensity={atmosphereIntensity} />
      <GlobeGlow intensity={atmosphereIntensity} />
      <LatamReveal active={showLatam} />
      <CountryExplorer />
    </group>
  )
}
