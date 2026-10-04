import { Canvas } from '@react-three/fiber'
import { AvatarB2 } from './AvatarB2'
import { CameraRig } from './CameraRig'

/**
 * AvatarB2Scene — mini-canvas R3F independiente del Canvas principal.
 *
 * near=0.1, far=20 cubre holgadamente el rango de entrada (Z -3.8 → 0).
 * FOV inicial 30° coincide con el cálculo de framing de AvatarB2Model.
 * La cámara permanece fija; CameraRig la mueve a la posición calculada.
 */
export function AvatarB2Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0.85, 3.5], fov: 30, near: 0.1, far: 20 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent', pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <directionalLight position={[-2, 1, -2]} intensity={0.35} />
      <CameraRig />
      <AvatarB2 />
    </Canvas>
  )
}
