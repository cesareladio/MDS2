import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Hub } from '../../data/types'
import { latLonToVector3 } from '../../lib/geo'
import { useExperienceStore } from '../../store/experienceStore'

interface HubMarkerProps {
  hub: Hub
  color: string
  glowColor: string
}

export function HubMarker({ hub, color, glowColor }: HubMarkerProps) {
  const [hovered, setHovered] = useState(false)
  const selectedHub = useExperienceStore((state) => state.selectedHub)
  const selectHub = useExperienceStore((state) => state.selectHub)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const position = useMemo(() => latLonToVector3(hub.lat, hub.lon, 2.088), [hub.lat, hub.lon])
  const selected = selectedHub === hub.id
  const surfaceNormal = useMemo(() => position.clone().normalize(), [position])
  const ringQuaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfaceNormal), [surfaceNormal])
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const hoverStartedAt = useRef<number | null>(null)

  useFrame(({ clock }) => {
    if (hovered && hoverStartedAt.current === null) hoverStartedAt.current = clock.elapsedTime
    if (coreRef.current) {
      coreRef.current.scale.setScalar(selected ? 1.08 : hovered ? 1.1 : 1)
      const material = coreRef.current.material as THREE.MeshBasicMaterial
      material.color.setStyle(hovered || selected ? glowColor : color)
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(selected ? 1.35 : hovered ? 1.25 : 1.15)
      ;(haloRef.current.material as THREE.MeshBasicMaterial).opacity = selected ? 0.12 : hovered ? 0.1 : 0.035
    }
    if (ringRef.current) {
      const material = ringRef.current.material as THREE.MeshBasicMaterial
      if (selected) {
        ringRef.current.scale.setScalar(1)
        material.opacity = 0.18
      } else if (!reduced && hoverStartedAt.current !== null) {
        const phase = Math.min(1, (clock.elapsedTime - hoverStartedAt.current) / 1.05)
        ringRef.current.scale.setScalar(1 + phase * 0.35)
        material.opacity = (1 - phase) * 0.16
        if (phase === 1) hoverStartedAt.current = null
      } else {
        ringRef.current.scale.setScalar(1)
        material.opacity = 0
      }
    }
  })

  const enter = () => {
    hoverStartedAt.current = null
    setHovered(true)
  }

  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.035} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group quaternion={ringQuaternion}>
        <mesh ref={ringRef}>
          <ringGeometry args={[0.044, 0.055, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
      <mesh
        ref={coreRef}
        onPointerEnter={enter}
        onPointerLeave={() => { hoverStartedAt.current = null; setHovered(false) }}
        onClick={(event) => { event.stopPropagation(); selectHub(selected ? null : hub.id) }}
      >
        <sphereGeometry args={[0.04, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Html center transform={false} zIndexRange={[40, 0]} style={{ pointerEvents: 'auto' }}>
        <button
          className={`hub-label ${selected ? 'is-selected' : ''} ${hovered ? 'is-hovered' : ''}`}
          onPointerEnter={enter}
          onPointerLeave={() => { hoverStartedAt.current = null; setHovered(false) }}
          onClick={(event) => { event.stopPropagation(); selectHub(selected ? null : hub.id) }}
          aria-label={`Explorar ${hub.name}`}
          aria-pressed={selected}
        >
          <span className="hub-label__name">{hub.name}</span>
          {(hovered || selected) && <span className="hub-label__metric">{hub.hc == null ? 'HC · por confirmar' : `${hub.hc} personas*`}</span>}
        </button>
      </Html>
    </group>
  )
}
