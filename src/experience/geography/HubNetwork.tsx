import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import type { Hub } from '../../data/types'
import { latLonToVector3 } from '../../lib/geo'
import { HubMarker } from './HubMarker'

export function HubNetwork({ hubs, color }: { hubs: Hub[]; color: string }) {
  const points = useMemo(() => hubs.map((hub) => latLonToVector3(hub.lat, hub.lon, 2.075)), [hubs])
  return (
    <group>
      <Line points={points} color={color} transparent opacity={0.4} lineWidth={1} />
      {hubs.map((hub) => <HubMarker key={hub.id} hub={hub} color={color} />)}
    </group>
  )
}
