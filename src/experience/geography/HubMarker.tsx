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
  const selectedHub  = useExperienceStore((state) => state.selectedHub)
  const selectHub    = useExperienceStore((state) => state.selectHub)
  const position     = useMemo(() => latLonToVector3(hub.lat, hub.lon, 2.088), [hub.lat, hub.lon])
  const selected     = selectedHub === hub.id
  const surfaceNormal = useMemo(() => position.clone().normalize(), [position])
  const ringQuaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), surfaceNormal), [surfaceNormal])

  const coreRef    = useRef<THREE.Mesh>(null)
  const pulse1Ref  = useRef<THREE.Mesh>(null)
  const pulse2Ref  = useRef<THREE.Mesh>(null)
  const haloRef    = useRef<THREE.Mesh>(null)
  const offsetRef  = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + offsetRef.current
    const active = hovered || selected

    // Core pulsing
    if (coreRef.current) {
      const s = active ? 1.3 : 1.0 + Math.sin(t * 1.8) * 0.06
      coreRef.current.scale.setScalar(s)
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      mat.color.setStyle(active ? glowColor : color)
    }

    // Pulse ring 1 — slow
    if (pulse1Ref.current) {
      const phase = (t * 0.65) % 1
      pulse1Ref.current.scale.setScalar(1 + phase * 0.78)
      ;(pulse1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        (1 - phase) * 0.34 * (active ? 1.18 : 1)
    }

    // Pulse ring 2 — fast, offset
    if (pulse2Ref.current) {
      const phase = ((t * 0.65) + 0.5) % 1
      pulse2Ref.current.scale.setScalar(1 + phase * 0.78)
      ;(pulse2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        (1 - phase) * 0.22 * (active ? 1.18 : 1)
    }

    // Outer soft halo
    if (haloRef.current) {
      const targetScale = active ? 1.7 : 1.3
      const cur = haloRef.current.scale.x
      haloRef.current.scale.setScalar(cur + (targetScale - cur) * 0.12)
      ;(haloRef.current.material as THREE.MeshBasicMaterial).opacity = active ? 0.14 : 0.08
    }
  })

  return (
    <group position={position}>
      {/* Outer soft halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Pulse rings tangent to the Earth surface */}
      <group quaternion={ringQuaternion}>
      <mesh ref={pulse1Ref}>
        <ringGeometry args={[0.044, 0.055, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh ref={pulse2Ref}>
        <ringGeometry args={[0.044, 0.055, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      </group>

      {/* Core light dot */}
      <mesh
        ref={coreRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); selectHub(selected ? null : hub.id) }}
      >
        <sphereGeometry args={[0.04, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Leader line + label */}
      <Html
        center
        transform={false}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          className={`hub-label ${selected ? 'is-selected' : ''} ${hovered ? 'is-hovered' : ''}`}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={(e) => { e.stopPropagation(); selectHub(selected ? null : hub.id) }}
          aria-label={`Explorar ${hub.name}`}
          aria-pressed={selected}
        >
          <span className="hub-label__name">{hub.name}</span>
          {(hovered || selected) && (
            <span className="hub-label__metric">
              {hub.hc == null ? 'HC · por confirmar' : `${hub.hc} personas*`}
            </span>
          )}
        </button>
      </Html>
    </group>
  )
}
