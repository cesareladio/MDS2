import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { capabilities } from '../../data/capabilities'
import { useExperienceStore } from '../../store/experienceStore'

interface NodeData {
  item: (typeof capabilities)[number]
  basePos: THREE.Vector3
  ibiOLPos: THREE.Vector3
}

const ENGINE_POSITIONS = [
  [0, 1.32, 0.12],
  [-1.35, 0.54, 0.06],
  [1.38, 0.38, 0.08],
  [-1.02, -0.98, 0.03],
  [1.03, -1.02, 0.02],
] as const

const IBIOL_POSITIONS = [
  [0, 1.02, 0.1],
  [-1.02, 0.42, 0.04],
  [1.05, 0.32, 0.06],
  [-0.78, -0.72, 0.03],
  [0.8, -0.74, 0.02],
] as const

function buildNodes(): NodeData[] {
  return capabilities.map((item, index) => ({
    item,
    basePos: new THREE.Vector3(...ENGINE_POSITIONS[index]),
    ibiOLPos: new THREE.Vector3(...IBIOL_POSITIONS[index]),
  }))
}

function ConnectionLine({ from, to, color, opacity, showTraveler }: {
  from: THREE.Vector3
  to: THREE.Vector3
  color: string
  opacity: number
  showTraveler: boolean
}) {
  const particle = useRef<THREE.Mesh>(null)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints([from, to]), [from, to])
  const material = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity }), [color, opacity])

  useFrame(({ clock }) => {
    if (!particle.current || reduced || !showTraveler) return
    particle.current.position.lerpVectors(from, to, (clock.elapsedTime * 0.14) % 1)
  })

  return (
    <group>
      <primitive object={new THREE.Line(geometry, material)} />
      <mesh ref={particle} visible={showTraveler && !reduced}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.5} toneMapped={false} />
      </mesh>
    </group>
  )
}

function OrbitalRing({ radius, tilt, opacity }: { radius: number; tilt: number; opacity: number }) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.62, 0, Math.PI * 2, false, 0)
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(96))
  }, [radius])
  const material = useMemo(() => new THREE.LineBasicMaterial({ color: '#2a68cc', transparent: true, opacity }), [opacity])
  return <group rotation={[tilt, 0, 0]}><primitive object={new THREE.Line(geometry, material)} /></group>
}

export function CapabilityEngine({ active }: { active: boolean }) {
  const phase = useExperienceStore((state) => state.phase)
  const selectedCapability = useExperienceStore((state) => state.selectedCapability)
  const selectCapability = useExperienceStore((state) => state.selectCapability)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const { gl } = useThree()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const nodes = useMemo(() => buildNodes(), [])
  const engineProgress = Math.min(1, Math.max(0, (scroll - 0.70) / 0.10))
  const ibiOLProgress = Math.min(1, Math.max(0, (scroll - 0.80) / 0.125))
  const networkOpacity = active ? Math.min(1, engineProgress * 3 + 0.25) : 0
  const isIbiOL = phase === 'ibiol' || ibiOLProgress > 0.4
  const nodePositions = useMemo(() => nodes.map((node) => node.basePos.clone().lerp(node.ibiOLPos, ibiOLProgress)), [nodes, ibiOLProgress])

  if (!active && networkOpacity < 0.01) return null

  return (
    <group position={[0.95, -0.08, 2.7]} scale={0.64}>
      <OrbitalRing radius={1.55} tilt={0.4} opacity={networkOpacity * 0.12} />
      <OrbitalRing radius={1.2} tilt={-0.32} opacity={networkOpacity * 0.08} />
      {nodePositions.map((position, index) => (
        <ConnectionLine
          key={`line-${nodes[index].item.id}`}
          from={new THREE.Vector3()}
          to={position}
          color={isIbiOL ? '#5cb8ff' : '#3d8cff'}
          opacity={networkOpacity * 0.28}
          showTraveler={index === 0 && !isIbiOL}
        />
      ))}
      <mesh scale={isIbiOL ? 0.56 : 0.56}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color="#0a3070" emissive="#1466d8" emissiveIntensity={isIbiOL ? 1.55 : 1.2} roughness={0.35} metalness={0.6} />
      </mesh>
      <Html center>
        <div className="engine-core" style={{ opacity: networkOpacity }}>{isIbiOL ? 'IBIOL' : <>ONE<br />GDN-e</>}</div>
      </Html>
      {nodes.map((node, index) => {
        const hovered = hoveredNode === node.item.id
        const selected = selectedCapability === node.item.id
        return (
          <group key={node.item.id} position={nodePositions[index]}>
            <mesh
              scale={selected ? 1.14 : hovered ? 1.25 : 1}
              onPointerEnter={() => { setHoveredNode(node.item.id); gl.domElement.style.cursor = 'pointer' }}
              onPointerLeave={() => { setHoveredNode(null); gl.domElement.style.cursor = 'default' }}
              onClick={(event) => { event.stopPropagation(); selectCapability(node.item.id) }}
            >
              <sphereGeometry args={[0.108, 24, 24]} />
              <meshStandardMaterial color="#1455b8" emissive={hovered || selected ? '#5cb8ff' : '#3078e0'} emissiveIntensity={hovered || selected ? 1.2 : 0.8} roughness={0.4} metalness={0.5} />
            </mesh>
            <Html center>
              <button
                className={`capability-node ${hovered ? 'is-hovered' : ''} ${selected ? 'is-selected' : ''}`}
                style={{ opacity: networkOpacity }}
                onPointerEnter={() => { setHoveredNode(node.item.id); gl.domElement.style.cursor = 'pointer' }}
                onPointerLeave={() => { setHoveredNode(null); gl.domElement.style.cursor = 'default' }}
                onClick={(event) => { event.stopPropagation(); selectCapability(node.item.id) }}
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
