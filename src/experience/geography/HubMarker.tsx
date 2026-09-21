import { Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import type { Hub } from '../../data/types'
import { latLonToVector3 } from '../../lib/geo'
import { useExperienceStore } from '../../store/experienceStore'

interface HubMarkerProps { hub: Hub; color: string }

export function HubMarker({ hub, color }: HubMarkerProps) {
  const [hovered, setHovered] = useState(false)
  const selectedHub = useExperienceStore((state) => state.selectedHub)
  const selectHub = useExperienceStore((state) => state.selectHub)
  const position = useMemo(() => latLonToVector3(hub.lat, hub.lon, 2.085), [hub.lat, hub.lon])
  const selected = selectedHub === hub.id

  return (
    <group position={position}>
      <mesh scale={selected || hovered ? 1.35 : 1}>
        <sphereGeometry args={[0.045, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh scale={selected || hovered ? 1.8 : 1.25}>
        <ringGeometry args={[0.065, 0.08, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.68} side={2} toneMapped={false} />
      </mesh>
      <Html center transform={false} zIndexRange={[40, 0]}>
        <button
          className={`hub-label ${selected ? 'is-selected' : ''}`}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={(event) => { event.stopPropagation(); selectHub(selected ? null : hub.id) }}
          aria-label={`Explorar ${hub.name}`}
        >
          <span>{hub.name}</span>
          {(hovered || selected) && <small>{hub.hc == null ? 'HC por confirmar' : `${hub.hc} personas*`}</small>}
        </button>
      </Html>
    </group>
  )
}
