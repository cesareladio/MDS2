import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Hub } from '../../data/types'
import { latLonToVector3, makeArc } from '../../lib/geo'
import { HubMarker } from './HubMarker'

interface HubNetworkProps {
  hubs: Hub[]
  color: string
  glowColor?: string
}

/** Traveling pulse along a geodesic arc segment */
function ArcSegment({
  start,
  end,
  color,
  delay = 0,
}: {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  delay?: number
}) {
  const particle = useRef<THREE.Mesh>(null)
  const phaseRef = useRef(delay)

  // Build geodesic arc
  const points = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(
      start.distanceTo(end) * 0.22 + 2.1,
    )
    const curve = new THREE.CatmullRomCurve3([start, mid, end])
    return curve.getPoints(60)
  }, [start, end])

  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  const mat  = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.32, linewidth: 1 }),
    [color],
  )

  useFrame((_, delta) => {
    if (!particle.current) return
    phaseRef.current = (phaseRef.current + delta * 0.28) % 1
    const idx = Math.floor(phaseRef.current * (points.length - 1))
    particle.current.position.copy(points[idx])
  })

  return (
    <group>
      <primitive object={new THREE.Line(geom, mat)} />
      <mesh ref={particle}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function HubNetwork({ hubs, color, glowColor }: HubNetworkProps) {
  const glow = glowColor ?? color
  const positions = useMemo(
    () => hubs.map((h) => latLonToVector3(h.lat, h.lon, 2.078)),
    [hubs],
  )

  return (
    <group>
      {/* Geodesic arc segments between consecutive hubs */}
      {positions.map((pos, i) => {
        if (i === positions.length - 1) return null
        return (
          <ArcSegment
            key={i}
            start={pos}
            end={positions[i + 1]}
            color={color}
            delay={i * 0.35}
          />
        )
      })}

      {/* Hub markers */}
      {hubs.map((hub) => (
        <HubMarker key={hub.id} hub={hub} color={color} glowColor={glow} />
      ))}
    </group>
  )
}
