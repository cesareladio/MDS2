import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { latLonToVector3 } from '../../lib/geo'

const GEO_DEBUG = false
const points = [
  ['TOKYO', 35.6762, 139.6503],
  ['MADRID', 40.4168, -3.7038],
  ['LIMA', -12.0464, -77.0428],
  ['SANTIAGO', -33.4489, -70.6693],
] as const

export function GeoAlignmentDebug() {
  const markers = useMemo(() => points.map(([name, lat, lon]) => ({ name, position: latLonToVector3(lat, lon, 2.08) })), [])
  if (!GEO_DEBUG) return null
  return <>{markers.map(({ name, position }) => <group key={name} position={position}>
    <mesh><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#fff" toneMapped={false} /></mesh>
    <Html center><span style={{ color: 'white', fontSize: '10px' }}>{name}</span></Html>
  </group>)}</>
}
