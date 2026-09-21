import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Hub } from '../../data/types'
import { latLonToVector3 } from '../../lib/geo'
import { useExperienceStore } from '../../store/experienceStore'
import { HubMarker } from './HubMarker'

interface HubNetworkProps {
  hubs: Hub[]
  color: string
  glowColor?: string
}

function NetworkLine({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const points = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(start.distanceTo(end) * 0.22 + 2.1)
    return new THREE.CatmullRomCurve3([start, mid, end]).getPoints(60)
  }, [start, end])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  const material = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.32, linewidth: 1 }), [color])
  return <primitive object={new THREE.Line(geometry, material)} />
}

function NetworkTraveler({ positions, color }: { positions: THREE.Vector3[]; color: string }) {
  const particle = useRef<THREE.Mesh>(null)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const phase = useExperienceStore((state) => state.phase)
  const path = useMemo(() => {
    if (positions.length < 2) return null
    return new THREE.CatmullRomCurve3(positions)
  }, [positions])

  const visible = !reduced && phase !== 'explore'

  useFrame(({ clock }) => {
    if (!particle.current || !path || !visible) return
    particle.current.position.copy(path.getPoint((clock.elapsedTime * 0.07) % 1))
  })

  if (!path) return null
  return (
    <mesh ref={particle} visible={visible}>
      <sphereGeometry args={[0.012, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.55} />
    </mesh>
  )
}

export function HubNetwork({ hubs, color, glowColor }: HubNetworkProps) {
  const glow = glowColor ?? color
  const positions = useMemo(() => hubs.map((hub) => latLonToVector3(hub.lat, hub.lon, 2.078)), [hubs])

  return (
    <group>
      {positions.map((position, index) => index === positions.length - 1 ? null : <NetworkLine key={index} start={position} end={positions[index + 1]} color={color} />)}
      <NetworkTraveler positions={positions} color={color} />
      {hubs.map((hub) => <HubMarker key={hub.id} hub={hub} color={color} glowColor={glow} />)}
    </group>
  )
}
