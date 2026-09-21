import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { capabilities } from '../../data/capabilities'
import { useExperienceStore } from '../../store/experienceStore'

/* ────────────────────────────────────────────────────────────────────────────
   CapabilityEngine — genuine 3D spatial network

   Nodes float at different radii, angles AND z-depths.
   Orbital rings rotate at slightly different speeds.
   Pulse travels along connection lines.
   Phase 'engine'  → capability network visible, IBIOL core hidden
   Phase 'ibiol'   → network reorganises to point toward IBIOL core
   ─────────────────────────────────────────────────────────────────────────── */

interface NodeData {
  item: (typeof capabilities)[number]
  basePos: THREE.Vector3
  ibildPos: THREE.Vector3   // position when transforming to IBIOL
  orbitAxis: THREE.Vector3
  orbitSpeed: number
  orbitRadius: number
  phase: number
}

function buildNodes(): NodeData[] {
  return capabilities.map((item, i) => {
    const total  = capabilities.length
    const angle  = (i / total) * Math.PI * 2 - Math.PI * 0.5

    // Vary Z depth so nodes aren't flat
    const zDepth = Math.sin(angle * 1.3) * 0.45 + Math.cos(i * 1.7) * 0.25
    const r      = 1.35 + Math.cos(angle * 2.1) * 0.28

    const basePos = new THREE.Vector3(
      Math.cos(angle) * r,
      Math.sin(angle) * 1.1,
      zDepth,
    )

    // IBIOL target: spread outward, tilt upward
    const ibildAngle = angle * 0.75
    const ibildPos = new THREE.Vector3(
      Math.cos(ibildAngle) * (r * 1.3),
      Math.sin(ibildAngle) * 0.8 + 0.4,
      zDepth * 0.5,
    )

    return {
      item,
      basePos,
      ibildPos,
      orbitAxis:  new THREE.Vector3(0, 0.3, 1).normalize(),
      orbitSpeed: 0.05 + Math.abs(Math.sin(i * 2.1)) * 0.04,
      orbitRadius: 0,
      phase: i / total,
    }
  })
}

/* Animated connection line with travelling pulse */
function ConnectionLine({
  from,
  to,
  color,
  opacity,
  particleOffset,
}: {
  from: THREE.Vector3
  to: THREE.Vector3
  color: string
  opacity: number
  particleOffset: number
}) {
  const particleRef = useRef<THREE.Mesh>(null)
  const lineRef     = useRef<THREE.Line | null>(null)

  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints([from, to]), [from, to])
  const mat  = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity }), [color, opacity])

  useFrame(({ clock }) => {
    if (!particleRef.current) return
    const t = ((clock.elapsedTime * 0.45 + particleOffset) % 1)
    particleRef.current.position.lerpVectors(from, to, t)
    ;(particleRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
  })

  return (
    <group>
      <primitive object={new THREE.Line(geom, mat)} ref={lineRef} />
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent />
      </mesh>
    </group>
  )
}

/* Orbital ring decoration */
function OrbitalRing({ radius, tilt, color, opacity }: { radius: number; tilt: number; color: string; opacity: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08
  })
  const geom = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.62, 0, Math.PI * 2, false, 0)
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(96))
  }, [radius])
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity }), [color, opacity])
  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <primitive object={new THREE.Line(geom, mat)} />
    </group>
  )
}

export function CapabilityEngine({ active }: { active: boolean }) {
  const phase          = useExperienceStore((state) => state.phase)
  const selectCapability = useExperienceStore((state) => state.selectCapability)
  const scroll         = useExperienceStore((state) => state.scrollProgress)
  const reduced        = useExperienceStore((state) => state.reducedMotion)

  const groupRef   = useRef<THREE.Group>(null)
  const coreRef    = useRef<THREE.Mesh>(null)
  const coreHaloRef = useRef<THREE.Mesh>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const nodes = useMemo(() => buildNodes(), [])

  // Progress: engine phase 0.70→0.80, ibiol phase 0.80→0.91
  const engineProgress = Math.min(1, Math.max(0, (scroll - 0.70) / 0.10))
  const transitionProgress = Math.min(1, Math.max(0, (scroll - 0.66) / 0.10))
  const ibildProgress  = Math.min(1, Math.max(0, (scroll - 0.80) / 0.11))

  // Node positions (lerp between base and ibiol target based on ibil progress)
  const nodePositions = useMemo(
    () => nodes.map((n) => n.basePos.clone().lerp(n.ibildPos, ibildProgress)),
    [nodes, ibildProgress],
  )

  const fadeIn  = active ? Math.max(engineProgress * 4, transitionProgress * 0.7) : 0
  const coreScale = 0.3 + ibildProgress * 0.6
  const continuityFade = fadeIn

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    // Subtle breathing rotation
    if (!reduced) groupRef.current.rotation.y += delta * 0.055
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.22) * 0.04

    // Core pulse
    if (coreRef.current) {
      const breathe = 1 + Math.sin(clock.elapsedTime * 1.6) * 0.07
      coreRef.current.scale.setScalar(coreScale * breathe)
    }
    if (coreHaloRef.current) {
      const breathe = 1 + Math.sin(clock.elapsedTime * 1.1) * 0.12
      coreHaloRef.current.scale.setScalar(coreScale * breathe * 2.2)
      ;(coreHaloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.12 * coreScale
    }
  })

  if (!active && continuityFade < 0.01) return null

  const showIbiol = ibildProgress > 0.4
  const networkOpacity = Math.min(1, continuityFade)

  return (
    <group ref={groupRef} position={[0, -0.35, 2.7]} scale={0.68}>
      {/* Orbital decorations */}
      <OrbitalRing radius={1.7}  tilt={0.4}  color="#2a68cc" opacity={fadeIn * 0.35} />
      <OrbitalRing radius={1.35} tilt={-0.3} color="#1a4e9e" opacity={fadeIn * 0.25} />
      <OrbitalRing radius={2.1}  tilt={0.9}  color="#1e3a7a" opacity={fadeIn * 0.18} />

      {/* Connection lines from core to each node */}
      {nodePositions.map((pos, i) => (
        <ConnectionLine
          key={`line-${i}`}
          from={new THREE.Vector3(0, 0, 0)}
          to={pos}
          color={ibildProgress > 0.3 ? '#5cb8ff' : '#3d8cff'}
          opacity={networkOpacity * 0.35}
          particleOffset={i / nodes.length}
        />
      ))}

      {/* Central core */}
      <mesh ref={coreHaloRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshBasicMaterial color="#2a88ff" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.38, 40, 40]} />
        <meshStandardMaterial
          color="#0a3070"
          emissive="#1466d8"
          emissiveIntensity={1.2 + ibildProgress * 0.8}
          roughness={0.35}
          metalness={0.6}
        />
      </mesh>
      <Html center>
        <div className="engine-core" style={{ opacity: fadeIn }}>
          {showIbiol ? 'IBIOL' : 'ONE GDN-e'}
        </div>
      </Html>

      {/* Capability nodes */}
      {nodes.map((node, i) => {
        const pos     = nodePositions[i]
        const hovered = hoveredNode === node.item.id
        return (
          <group key={node.item.id} position={pos}>
            {/* Node sphere */}
            <mesh scale={hovered ? 1.5 : 1}>
              <sphereGeometry args={[0.12, 24, 24]} />
              <meshStandardMaterial
                color="#1455b8"
                emissive={hovered ? '#5cb8ff' : '#3078e0'}
                emissiveIntensity={hovered ? 1.4 : 0.8}
                roughness={0.4}
                metalness={0.5}
              />
            </mesh>

            {/* Node label */}
            <Html center>
              <button
                className={`capability-node ${hovered ? 'is-hovered' : ''}`}
                style={{ opacity: networkOpacity }}
                onPointerEnter={() => setHoveredNode(node.item.id)}
                onPointerLeave={() => setHoveredNode(null)}
                onClick={() => selectCapability(node.item.id)}
                aria-label={`Ver ${node.item.name}`}
              >
                {node.item.name}
              </button>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
