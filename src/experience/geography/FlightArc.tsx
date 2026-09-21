import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { makeArc } from '../../lib/geo'
import { useExperienceStore } from '../../store/experienceStore'

interface FlightArcProps {
  start: [number, number]
  end: [number, number]
  color?: string
  /** 0..1 progress range within the global scroll that this arc is "active" */
  progressStart?: number
  progressEnd?: number
  /** legacy offset kept for backwards compat, converted internally */
  offset?: number
}

export function FlightArc({
  start,
  end,
  color = '#70b8ff',
  progressStart = 0.1,
  progressEnd   = 0.22,
  offset        = 0,
}: FlightArcProps) {
  const particleRef  = useRef<THREE.Mesh>(null)
  const trailRef     = useRef<THREE.Line>(null)
  const scrollProgress = useExperienceStore((state) => state.scrollProgress)

  const curve  = useMemo(() => makeArc(start, end), [start, end])
  const points = useMemo(() => curve.getPoints(90), [curve])

  // Build a THREE.BufferGeometry line for the trail
  const trailGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points)
    return geom
  }, [points])

  const trailMat = useMemo(() => new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.38,
  }), [color])

  // Map global scroll into local 0..1 progress for this arc
  const span     = Math.max(0.001, progressEnd - progressStart)
  const rawLocal = (scrollProgress - progressStart) / span + offset
  const local    = THREE.MathUtils.clamp(rawLocal, 0, 1)

  useFrame(() => {
    if (!particleRef.current) return
    particleRef.current.position.copy(curve.getPoint(local))

    // Fade: visible only while arc is in its active window
    const inRange = scrollProgress >= progressStart - 0.04 && scrollProgress <= progressEnd + 0.04
    const vis = inRange ? 1 : 0
    ;(particleRef.current.material as THREE.MeshBasicMaterial).opacity = vis
    if (trailRef.current) trailMat.opacity = vis * 0.38
  })

  return (
    <group>
      <primitive object={new THREE.Line(trailGeom, trailMat)} ref={trailRef} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent />
      </mesh>
    </group>
  )
}
