import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { capabilities } from '../../data/capabilities'
import { useExperienceStore } from '../../store/experienceStore'

/**
 * Scene 07 — Capability Engine
 *
 * Visual language: precision technology, NOT planets.
 *   • ONE GDN-e = thin concentric arc rings + luminous dot center + typography
 *   • Capabilities = tiny signal beacon dots + thin outer halo ring + label
 *   • Connections = very thin low-opacity curved lines
 *   • Particles = a few slow traveling points
 *
 * No filled spheres anywhere.
 */

const ENGINE_POSITIONS: THREE.Vector3[] = [
  new THREE.Vector3(0,     1.32, 0.12),
  new THREE.Vector3(-1.35, 0.54, 0.06),
  new THREE.Vector3(1.38,  0.38, 0.08),
  new THREE.Vector3(-1.02,-0.98, 0.03),
  new THREE.Vector3(1.03, -1.02, 0.02),
]

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)) }

// ─── Arc ring helper (no ellipse, just open circular arc) ────────────────────

function ArcRing({
  radius, tiltX, tiltZ, openRatio, opacity, color = '#4ab8ff',
}: {
  radius: number
  tiltX: number
  tiltZ: number
  openRatio: number   // 0 = full circle, 0.2 = 20% gap
  opacity: number
  color?: string
}) {
  const geometry = useMemo(() => {
    const span = Math.PI * 2 * (1 - openRatio)
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, span, false, 0)
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(96))
  }, [radius, openRatio])
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    [color, opacity],
  )
  return (
    <group rotation={[tiltX, 0, tiltZ]}>
      <primitive object={new THREE.Line(geometry, material)} />
    </group>
  )
}

// ─── Core energy center ──────────────────────────────────────────────────────

function EngineCoreRings({ opacity }: { opacity: number }) {
  if (opacity < 0.01) return null
  return (
    <group>
      {/* Outer arc */}
      <ArcRing radius={0.38} tiltX={0.25} tiltZ={0.0}  openRatio={0.12} opacity={opacity * 0.55} color="#3aa8f0" />
      {/* Middle arc, different tilt */}
      <ArcRing radius={0.26} tiltX={-0.15} tiltZ={0.4}  openRatio={0.20} opacity={opacity * 0.45} color="#5ec8ff" />
      {/* Inner tight arc */}
      <ArcRing radius={0.14} tiltX={0.0}  tiltZ={-0.28} openRatio={0.08} opacity={opacity * 0.38} color="#80d8ff" />
      {/* Central luminous dot */}
      <mesh>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color="#c8eeff" toneMapped={false} transparent opacity={opacity * 0.9} />
      </mesh>
    </group>
  )
}

// ─── Connection line capability → core ──────────────────────────────────────

function CapabilityLine({ to, opacity }: { to: THREE.Vector3; opacity: number }) {
  const origin = useMemo(() => new THREE.Vector3(), [])
  const mid = useMemo(() => {
    const m = origin.clone().lerp(to, 0.5)
    const perp = new THREE.Vector3(-to.y, to.x, 0).normalize()
    return m.addScaledVector(perp, 0.18)
  }, [to])

  const geometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(origin, mid, to)
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(40))
  }, [origin, mid, to])

  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#2a7cc8', transparent: true, opacity }),
    [opacity],
  )
  if (opacity < 0.01) return null
  return <primitive object={new THREE.Line(geometry, material)} />
}

// ─── Traveling particle on connection ────────────────────────────────────────

function CapabilityParticle({
  to, index, opacity,
}: { to: THREE.Vector3; index: number; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const reduced = useExperienceStore((s) => s.reducedMotion)
  const origin = useMemo(() => new THREE.Vector3(), [])
  const mid = useMemo(() => {
    const m = origin.clone().lerp(to, 0.5)
    const perp = new THREE.Vector3(-to.y, to.x, 0).normalize()
    return m.addScaledVector(perp, 0.18)
  }, [to])
  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(origin, mid, to),
    [origin, mid, to],
  )

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return
    // Phase offset per particle so they don't all sync
    const t = ((clock.elapsedTime * 0.22) + index * 0.21) % 1
    ref.current.position.copy(curve.getPoint(t))
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity =
      opacity * 0.65 * Math.sin(t * Math.PI)
  })

  if (opacity < 0.01) return null
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.012, 8, 8]} />
      <meshBasicMaterial color="#7ed0ff" transparent opacity={0} toneMapped={false} />
    </mesh>
  )
}

// ─── Capability signal beacon ────────────────────────────────────────────────

function SignalBeacon({
  position, label, opacity, selected, hovered,
  onEnter, onLeave, onClick,
}: {
  position: THREE.Vector3
  label: string
  opacity: number
  selected: boolean
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}) {
  if (opacity < 0.01) return null

  const active = hovered || selected
  const dotOpacity = opacity * (active ? 1.0 : 0.82)
  const haloOpacity = opacity * (active ? 0.55 : 0.22)

  // Thin halo ring around beacon
  const haloGeom = useMemo(() => {
    const c = new THREE.EllipseCurve(0, 0, 0.075, 0.075, 0, Math.PI * 2, false, 0)
    return new THREE.BufferGeometry().setFromPoints(c.getPoints(32))
  }, [])
  const haloMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: active ? '#90dfff' : '#4ab8ff', transparent: true, opacity: haloOpacity }),
    [active, haloOpacity],
  )

  return (
    <group position={position}>
      {/* Halo ring */}
      <primitive object={new THREE.Line(haloGeom, haloMat)} />

      {/* Dot center */}
      <mesh onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onClick}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial
          color={active ? '#d0f0ff' : '#8ad4ff'}
          toneMapped={false}
          transparent
          opacity={dotOpacity}
        />
      </mesh>

      {/* Label */}
      <Html center>
        <button
          className={`capability-node${hovered ? ' is-hovered' : ''}${selected ? ' is-selected' : ''}`}
          style={{ opacity }}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          onClick={(e) => { e.stopPropagation(); onClick() }}
          aria-label={`Ver ${label}`}
        >
          {label}
        </button>
      </Html>
    </group>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function CapabilityEngine({ active }: { active: boolean }) {
  const selectedCapability = useExperienceStore((s) => s.selectedCapability)
  const selectCapability   = useExperienceStore((s) => s.selectCapability)
  const scroll = useExperienceStore((s) => s.scrollProgress)
  const [hovered, setHovered] = useState<string | null>(null)

  // Fade in as Scene 07 enters (0.70 → 0.80), fade out at ibiol boundary
  const enterProgress = clamp((scroll - 0.70) / 0.10, 0, 1)
  const exitProgress  = clamp((scroll - 0.80) / 0.03, 0, 1)
  const networkOpacity = active
    ? clamp(enterProgress * 3 + 0.25, 0, 1) * Math.max(0, 1 - exitProgress)
    : 0

  useEffect(() => {
    if (selectedCapability) setHovered(null)
  }, [selectedCapability])

  if (!active && networkOpacity < 0.01) return null

  return (
    <group position={[0.95, -0.08, 2.7]} scale={0.64}>
      {/* Connection curves: capability → core */}
      {ENGINE_POSITIONS.map((pos, i) => (
        <CapabilityLine
          key={`ln-${capabilities[i].id}`}
          to={pos}
          opacity={networkOpacity * 0.22}
        />
      ))}

      {/* Traveling particles on each connection */}
      {ENGINE_POSITIONS.map((pos, i) => (
        <CapabilityParticle
          key={`pt-${capabilities[i].id}`}
          to={pos}
          index={i}
          opacity={networkOpacity}
        />
      ))}

      {/* ONE GDN-e energy core — rings, no sphere */}
      <EngineCoreRings opacity={networkOpacity} />
      <Html center>
        <div className="engine-core" style={{ opacity: networkOpacity }}>
          ONE<br />GDN-e
        </div>
      </Html>

      {/* Capability beacons */}
      {capabilities.map((cap, i) => (
        <SignalBeacon
          key={cap.id}
          position={ENGINE_POSITIONS[i]}
          label={cap.name}
          opacity={networkOpacity}
          selected={selectedCapability === cap.id}
          hovered={hovered === cap.id}
          onEnter={() => setHovered(cap.id)}
          onLeave={() => setHovered(null)}
          onClick={() => selectCapability(cap.id)}
        />
      ))}
    </group>
  )
}
