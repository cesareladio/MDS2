/**
 * b2Poses.ts — mapping semántico de poses → clips FBX.
 *
 * Idéntico a CFG.poseClips de b2-widget.js (ver sección 12 del plan de
 * paridad). `POSE_TO_CLIP` resuelve cada pose semántica usada por el
 * guion/intent matcher a un ClipName real cargado en AvatarB2Model.
 *
 * `POSE_FALLBACK_TRANSFORM` solo se usa en AvatarB2Placeholder (low-poly,
 * cuando avatar_web.glb no está disponible) — no participa en el motor FBX.
 */

export type { B2Pose } from './b2Types'
import type { B2Pose } from './b2Types'
import type { ClipName } from '../experience/avatar/b2Clips'

export const B2_POSES: B2Pose[] = [
  'executiveIdle', 'idle', 'talking',
  'wave', 'bye', 'point', 'shrug', 'think', 'laugh', 'clap', 'shy', 'nod',
  'present', 'open', 'chest', 'listen',
]

/** Idéntico a CFG.poseClips en b2-widget.js */
export const POSE_TO_CLIP: Record<B2Pose, ClipName> = {
  executiveIdle: 'idle',
  idle:          'idle',
  talking:       'talking',
  wave:          'greeting',
  bye:           'greeting',
  point:         'pointing',
  shrug:         'shrugging',
  think:         'thinking',
  laugh:         'laughing',
  clap:          'clapping',
  shy:           'bashful',
  nod:           'nod',
  present:       'talking',
  open:          'talking',
  chest:         'talking',
  listen:        'idle',
}

export interface B2FallbackTransform {
  rightArm: number
  leftArm: number
  tilt: number
}

/** Solo para AvatarB2Placeholder (low-poly, sin FBX ni skeleton real). */
export const POSE_FALLBACK_TRANSFORM: Record<B2Pose, B2FallbackTransform> = {
  executiveIdle: { rightArm: -0.4, leftArm: 0.4, tilt: 0 },
  idle:          { rightArm: -0.4, leftArm: 0.4, tilt: 0 },
  talking:       { rightArm: -1.0, leftArm: 1.0, tilt: 0 },
  wave:          { rightArm: -2.2, leftArm: 0,   tilt: 0.05 },
  bye:           { rightArm: -2.0, leftArm: 0,   tilt: -0.05 },
  point:         { rightArm: -1.2, leftArm: 0,   tilt: 0.03 },
  shrug:         { rightArm: -0.5, leftArm: 0.5, tilt: 0.08 },
  think:         { rightArm: -0.3, leftArm: 0.3, tilt: 0.08 },
  laugh:         { rightArm: -0.8, leftArm: 0,   tilt: 0.06 },
  clap:          { rightArm: -0.9, leftArm: 0.9, tilt: 0 },
  shy:           { rightArm: -0.3, leftArm: 0.3, tilt: 0.1 },
  nod:           { rightArm: -0.3, leftArm: 0.3, tilt: 0.1 },
  present:       { rightArm: -1.0, leftArm: 1.0, tilt: 0 },
  open:          { rightArm: -0.9, leftArm: 0.9, tilt: 0 },
  chest:         { rightArm: -0.8, leftArm: 0,   tilt: 0 },
  listen:        { rightArm: -0.3, leftArm: 0.3, tilt: 0.12 },
}
