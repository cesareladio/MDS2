/**
 * b2Retarget.ts — puerto CASI LITERAL de retarget() en
 * b2-avatar6/public/b2-widget.js (SOLO LECTURA, línea 96-109).
 *
 * Reglas (ver plan de paridad, secciones 4-5):
 *   - Solo se aceptan tracks `.quaternion` del FBX; position/scale se ignoran
 *     (B2 camina en el sitio; la traslación world la gestiona enterWalk()).
 *   - El bone target se resuelve por nombre Mixamo (sin prefijo, sin sufijo
 *     `_N` de FBXLoader cuando hay bones duplicados).
 *   - Hips es la ÚNICA excepción: cada frame se convierte en delta respecto
 *     al primer frame del FBX, y ese delta se aplica sobre el quaternion de
 *     reposo del Hips del target. Ninguna otra corrección por bone.
 */

import * as THREE from 'three'

const Q = THREE.Quaternion

/** Resuelve nombre corto Mixamo: quita "mixamorig:" y sufijo "_N" de duplicados. */
export function shortBoneName(rawName: string): string {
  return rawName.replace(/^mixamorig:?/, '').replace(/_\d+$/, '')
}

/** Construye el mapa shortName → bone para el skeleton target (ALLB en el widget). */
export function buildBoneMap(root: THREE.Object3D): Record<string, THREE.Bone> {
  const map: Record<string, THREE.Bone> = {}
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) map[shortBoneName(o.name)] = o as THREE.Bone
  })
  return map
}

/**
 * retarget — convierte un AnimationClip FBX (Mixamo) en un clip reproducible
 * directamente sobre el target (bone.name + '.quaternion'), vía
 * mixer.clipAction(). Debe llamarse con el target en bind pose (antes de
 * reproducir cualquier otro clip sobre él).
 */
export function retarget(clip: THREE.AnimationClip, targetBones: Record<string, THREE.Bone>): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = []

  clip.tracks.forEach((tr) => {
    const m = tr.name.match(/([^.[\]]+)\]?\.(\w+)$/)
    if (!m || m[2] !== 'quaternion') return

    const nm = shortBoneName(m[1])
    const bone = targetBones[nm]
    if (!bone) return

    const v = Array.from(tr.values)

    if (nm === 'Hips') {
      const q0 = new Q(v[0], v[1], v[2], v[3]).invert()
      const r = bone.quaternion.clone()
      for (let i = 0; i < v.length; i += 4) {
        const q = r.clone().multiply(q0.clone().multiply(new Q(v[i], v[i + 1], v[i + 2], v[i + 3])))
        v[i] = q.x; v[i + 1] = q.y; v[i + 2] = q.z; v[i + 3] = q.w
      }
    }

    tracks.push(new THREE.QuaternionKeyframeTrack(bone.name + '.quaternion', Array.from(tr.times), v))
  })

  return new THREE.AnimationClip(clip.name, clip.duration, tracks)
}
