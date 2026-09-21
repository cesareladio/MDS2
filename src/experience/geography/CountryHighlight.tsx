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
  const glowMesh = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { gl } = useThree()
  const phase = useExperienceStore((state) => state.phase)

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

  useFrame(() => {
    const baseOpacity = active ? Math.min(1, progress * 2) : 0

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


      {phase !== 'explore' && (
        <CountryInteractionMesh
          geo={geo as FeatureCollection}
          countryId={countryId}
          active={active && progress > 0.02}
          onEnter={() => { setHovered(true); gl.domElement.style.cursor = 'default' }}
          onLeave={() => { setHovered(false); gl.domElement.style.cursor = 'default' }}
          onClick={() => undefined}
        />
      )}

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
