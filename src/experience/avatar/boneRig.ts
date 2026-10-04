/**
 * boneRig.ts — tipos de bones para avatar_web.glb (Mixamo / Blender I/O 5.2.40).
 *
 * DESACTIVADO: el motor de animación activo es AvatarPoseEngine.ts (puerto
 * literal de b2-widget.js). Este archivo solo conserva los tipos de nombres
 * de bone que siguen usándose como referencia (p.ej. en b2AvatarStates.ts).
 * NO añadir aquí lógica que escriba bone.quaternion — el único owner del
 * skeleton es AvatarPoseEngine.
 */

// ─── BONE NAMES ──────────────────────────────────────────────────────────────

export const BONE_KEYS = [
  'hips',
  'spine', 'spine1', 'spine2',
  'neck', 'head',
  'leftShoulder', 'leftArm', 'leftForeArm', 'leftHand',
  'rightShoulder', 'rightArm', 'rightForeArm', 'rightHand',
  'leftUpLeg', 'leftLeg', 'leftFoot',
  'rightUpLeg', 'rightLeg', 'rightFoot',
] as const

export type BoneKey = (typeof BONE_KEYS)[number]

/** Nombres Mixamo completos para cada BoneKey */
export const MIXAMO_NAME: Record<BoneKey, string> = {
  hips:          'mixamorig:Hips',
  spine:         'mixamorig:Spine',
  spine1:        'mixamorig:Spine1',
  spine2:        'mixamorig:Spine2',
  neck:          'mixamorig:Neck',
  head:          'mixamorig:Head',
  leftShoulder:  'mixamorig:LeftShoulder',
  leftArm:       'mixamorig:LeftArm',
  leftForeArm:   'mixamorig:LeftForeArm',
  leftHand:      'mixamorig:LeftHand',
  rightShoulder: 'mixamorig:RightShoulder',
  rightArm:      'mixamorig:RightArm',
  rightForeArm:  'mixamorig:RightForeArm',
  rightHand:     'mixamorig:RightHand',
  leftUpLeg:     'mixamorig:LeftUpLeg',
  leftLeg:       'mixamorig:LeftLeg',
  leftFoot:      'mixamorig:LeftFoot',
  rightUpLeg:    'mixamorig:RightUpLeg',
  rightLeg:      'mixamorig:RightLeg',
  rightFoot:     'mixamorig:RightFoot',
}
