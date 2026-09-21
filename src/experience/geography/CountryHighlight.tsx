import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  ringToSpherePoints,
  extractCountryRings,
  buildCountryTexture,
  PERU_ID,
  CHILE_ID,
  type loadSouthAmericaGeo,
} from '../../lib/countryGeo'
import type { FeatureCollection } from 'geojson'
import { CountryInteractionMesh } from './CountryInteractionMesh'
import { useExperienceStore } from '../../store/experienceStore'
import type { CountryId } from '../../data/types'

type SouthAmericaGeo = Awaited<ReturnType<typeof loadSouthAmericaGeo>>

interface CountryHighlightProps {
  geo: SouthAmericaGeo | null
  countryId: typeof PERU_ID | typeof CHILE_ID
  countryKey: CountryId
  color: string
  glowColor: string
  active: boolean
  /** 0..1 opacity/visibility driven by scroll */
  progress?: number
}

export function CountryHighlight({
  geo,
  countryId,
  countryKey,
  color,
  glowColor,
  active,
  progress = 1,
}: CountryHighlightProps) {
  const groupRef   = useRef<THREE.Group>(null)
  const glowMesh   = useRef<THREE.Mesh>(null)
  const pulseRing  = useRef<THREE.Mesh>(null)
  const [hovered, setHovered]  = useState(false)
  const selectCountry  = useExperienceStore((state) => state.selectCountry)
  const setExploration = useExperienceStore((state) => state.setExplorationMode)
  const setPhase       = useExperienceStore((state) => state.setPhase)
  const selectedCountry = useExperienceStore((state) => state.selectedCountry)
  const { gl } = useThree()

  const rings = useMemo(() => {
    if (!geo) return []
    return extractCountryRings(geo as FeatureCollection, countryId)
  }, [geo, countryId])

  const linePoints = useMemo(
    () => rings.map((ring) => ringToSpherePoints(ring, 2.034)),
    [rings]
  )

  // Glow overlay texture on the globe surface
  const glowTexture = useMemo(() => {
    if (!geo) return null
    return buildCountryTexture(geo as FeatureCollection, countryId, color, glowColor)
  }, [geo, countryId, color, glowColor])

  useEffect(() => {
    return () => { glowTexture?.dispose() }
  }, [glowTexture])

  // Center point from all ring points averaged
  const centerPos = useMemo(() => {
    if (!linePoints.length) return new THREE.Vector3()
    const all = linePoints.flat()
    return all
      .reduce((acc, p) => acc.add(p), new THREE.Vector3())
      .divideScalar(all.length)
      .normalize()
      .multiplyScalar(2.08)
  }, [linePoints])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const baseOpacity = active ? Math.min(1, progress * 2) : 0

    // Pulse ring expand
    if (pulseRing.current) {
      const pScale = 1 + (t % 2.4) * 0.25
      pulseRing.current.scale.setScalar(pScale)
      const pMat = pulseRing.current.material as THREE.MeshBasicMaterial
      pMat.opacity = (1 - (t % 2.4) / 2.4) * 0.7 * baseOpacity * (hovered ? 1.4 : 1)
    }

    // Glow mesh emissive intensity
    if (glowMesh.current) {
      const mat = glowMesh.current.material as THREE.MeshBasicMaterial
      const target = baseOpacity * (hovered ? 1.2 : 0.85)
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.08)
    }

    // Lines opacity
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        if (child.type === 'Line') {
          const mat = (child as THREE.Line).material as THREE.LineBasicMaterial
          const target = baseOpacity * (hovered ? 1.0 : 0.75)
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.08)
        }
      })
    }
  })

  if (!geo || !linePoints.length) return null

  const handleClick = () => {
    if (!active) return
    setPhase('explore')
    selectCountry(countryKey)
    setExploration(true)
    gl.domElement.style.cursor = 'default'
  }

  return (
    <group ref={groupRef}>
      {/* Country outline lines */}
      {linePoints.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={hovered ? glowColor : color}
          lineWidth={hovered ? 2.2 : 1.4}
          transparent
          opacity={0.58}
        />
      ))}

      {/* Central pulse ring + hover clickable mesh */}
      <group position={centerPos}>
        {/* Pulse */}
        <mesh ref={pulseRing}>
          <ringGeometry args={[0.06, 0.08, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        <mesh scale={hovered ? 1.5 : 1}>
          <sphereGeometry args={[0.048, 20, 20]} />
          <meshBasicMaterial color={hovered ? glowColor : color} toneMapped={false} />
        </mesh>
      </group>

      <CountryInteractionMesh
        geo={geo as FeatureCollection}
        countryId={countryId}
        active={active && progress > 0.02}
        onEnter={() => { setHovered(true); gl.domElement.style.cursor = 'pointer' }}
        onLeave={() => { setHovered(false); gl.domElement.style.cursor = 'default' }}
        onClick={handleClick}
      />

      {/* Glow overlay on globe surface */}
      {glowTexture && (
        <mesh ref={glowMesh} scale={1.001}>
          <sphereGeometry args={[2, 128, 128]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            opacity={active ? 0.85 : 0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}
