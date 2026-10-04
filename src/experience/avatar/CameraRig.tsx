import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useAvatarStore } from '../../store/avatarStore'

const scratchTarget   = new THREE.Vector3()
const scratchPosition = new THREE.Vector3()

// Desplazamiento de cámara durante entrada — muy pequeño, ~10% del movimiento de B2
// Se suma temporalmente y se disuelve en 0 al terminar entrance.
// Cámara parte ligeramente desplazada hacia el lado contrario de la entrada
// (desde la derecha) para dar el parallax de "acompañar suavemente".
const ENTRANCE_CAM_OFFSET_X = -0.12   // pan sutil hacia izquierda mientras B2 llega
const camOffsetCurrent = new THREE.Vector3()

/**
 * CameraRig — posición de cámara interpolada hacia el frame del store.
 *
 * Durante `entering`: aplica un pequeño offset adicional que se disuelve
 * al terminar la entrada. El movimiento total de la cámara es ~10% del de B2.
 *
 * FOV permanece constante (no animar FOV).
 */
export function CameraRig() {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const frame    = useAvatarStore.getState().frame
    const b2State  = useAvatarStore.getState().b2State
    const isEntering = b2State === 'entering'

    // Offset de cámara durante entrada: disolver al salir de entering
    const offsetTarget = isEntering ? ENTRANCE_CAM_OFFSET_X : 0
    const offsetAlpha  = 1 - Math.exp(-3.5 * Math.min(delta, 0.05))
    camOffsetCurrent.x += (offsetTarget - camOffsetCurrent.x) * offsetAlpha

    // Alpha base para interpolación de frame (suaviza cambios del store)
    const alpha = 1 - Math.pow(0.0005, delta)

    scratchTarget.set(
      frame.targetX + camOffsetCurrent.x * 0.5,   // pequeño pan del target
      frame.targetY,
      frame.targetZ,
    )
    scratchPosition.set(
      frame.targetX + camOffsetCurrent.x,          // desplazamiento de posición
      frame.targetY,
      frame.targetZ + frame.distance,
    )

    camera.position.lerp(scratchPosition, alpha)

    // FOV fijo — no animar
    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - frame.fov) > 0.5) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, frame.fov, alpha)
      camera.updateProjectionMatrix()
    }

    camera.lookAt(scratchTarget)
  })

  return null
}
