import { BackSide } from 'three'

export function Atmosphere() {
  return (
    <mesh scale={1.065}>
      <sphereGeometry args={[2, 96, 96]} />
      <meshBasicMaterial color="#148dff" transparent opacity={0.08} side={BackSide} blending={2} />
    </mesh>
  )
}
