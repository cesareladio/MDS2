/**
 * b2AvatarStates.ts — definición de los estados de animación del avatar B2.
 *
 * MODELO: avatar_web.glb
 * SKELETON: mixamorig:Hips como raíz, rig de Blender/Mixamo
 *
 * SISTEMA:
 *   cada estado define StateBoneDeltas: por cada bone, un quaternion delta
 *   que se multiplica SOBRE la base pose.
 *
 *   Frame loop:
 *     1. resetToBase(bones, basePose)
 *     2. applyStateDeltas(state, bones, basePose, t_transition)
 *     3. applyProcedural(bones, basePose, clock)
 *
 *   El modelo GLB base ya tiene brazos orientados hacia abajo:
 *     LeftArm→LeftForeArm:   (0.526, -0.850, -0.019)
 *     RightArm→RightForeArm: (-0.526, -0.850, -0.011)
 *   Por tanto executiveIdle solo necesita ajustes mínimos.
 *
 * IMPORTANTE:
 *   No usar Euler acumulativos. No usar bone.rotation.x += ...
 *   Todos los deltas se expresan como Quaternion relativos a base pose.
 */

import * as THREE from 'three'
import type { BoneKey } from '../experience/avatar/boneRig'

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export type AvatarState =
  | 'hidden'
  | 'executiveIdle'
  | 'listening'
  | 'talking'
  | 'thinking'
  | 'presentLeft'
  | 'presentRight'
  | 'danceEasterEgg'

/** Delta sobre base pose, en radianes sobre un eje local del bone. */
export interface BoneAxisDelta {
  /** Eje en espacio LOCAL del bone (no world). Debe ser unitario. */
  axis:  THREE.Vector3
  angle: number
}

/** Conjunto de deltas por bone para un estado semántico. */
export type StateBoneDeltas = Partial<Record<BoneKey, BoneAxisDelta[]>>

// ─── EJES CONSTANTES ─────────────────────────────────────────────────────────
//
// IMPORTANTE: estos ejes son LOCALES de cada bone del rig Mixamo.
// El rig tiene AvatarRig con rot ~90° X, y la cadena Hips → Spine → ...
// Los ejes locales de los bones NO coinciden intuitivamente con world X/Y/Z.
//
// Estrategia empleada:
//   - Para spine/neck/head se usa aim() world-space en AvatarB2Model (no aquí)
//   - Para hombros/brazos se usa aim() world-space también en AvatarB2Model
//   - Este archivo define TARGETS world-space direction para el sistema aim()
//
// ─────────────────────────────────────────────────────────────────────────────

// World axes (usados para aim() y proceduralDelta con rotW si fuera necesario)
export const WORLD_X = new THREE.Vector3(1, 0, 0)
export const WORLD_Y = new THREE.Vector3(0, 1, 0)
export const WORLD_Z = new THREE.Vector3(0, 0, 1)

// ─── WORLD-SPACE ARM TARGETS ─────────────────────────────────────────────────
//
// Estos vectores son las direcciones WORLD deseadas para el sistema aim():
//   bone → child  debe apuntar hacia este vector
//
// BASE POSE confirmada (avatar_web.glb, sin modificar):
//   LeftArm → LeftForeArm:   (0.526, -0.850, -0.019)
//   RightArm → RightForeArm: (-0.526, -0.850, -0.011)
//   LeftForeArm → LeftHand:  (0.637, -0.748,  0.188)
//   RightForeArm → RightHand:(-0.637, -0.748,  0.188)
//
// executiveIdle: ajuste mínimo sobre base pose — llevar brazos ligeramente
// más hacia el cuerpo y antebrazos ligeramente más hacia delante.
// Los valores están muy próximos a la base pose confirmada.

export interface ArmTargets {
  leftArm:      THREE.Vector3   // LeftArm → LeftForeArm direction
  leftForeArm:  THREE.Vector3   // LeftForeArm → LeftHand direction
  rightArm:     THREE.Vector3   // RightArm → RightForeArm direction
  rightForeArm: THREE.Vector3   // RightForeArm → RightHand direction
}

/** Direcciones de base pose — no las modifiques, son la referencia. */
export const BASE_ARM_DIRS: ArmTargets = {
  leftArm:       new THREE.Vector3( 0.526, -0.850, -0.019),
  leftForeArm:   new THREE.Vector3( 0.637, -0.748,  0.188),
  rightArm:      new THREE.Vector3(-0.526, -0.850, -0.011),
  rightForeArm:  new THREE.Vector3(-0.637, -0.748,  0.188),
}

// ─── EXECUTIVE IDLE ARM TARGETS ───────────────────────────────────────────────
//
// Objetivos:
//   - brazos naturales, hombros relajados
//   - sin sensación de A-pose
//   - antebrazos ligeramente hacia delante
//   - manos neutrales
//
// Partimos de la base y hacemos ajustes muy pequeños:
//   - Traer upper arm ligeramente más hacia el cuerpo (-X para izquierdo)
//   - Antebrazos con un poco más de flexión hacia delante (+Z)

export const EXEC_IDLE_ARM_TARGETS: ArmTargets = {
  leftArm:      new THREE.Vector3( 0.38, -0.925, -0.02).normalize(),
  leftForeArm:  new THREE.Vector3( 0.55, -0.78,   0.30).normalize(),
  rightArm:     new THREE.Vector3(-0.38, -0.925, -0.01).normalize(),
  rightForeArm: new THREE.Vector3(-0.55, -0.78,   0.30).normalize(),
}

// ─── PRESENT RIGHT ARM TARGETS ────────────────────────────────────────────────
//
// Objetivos:
//   - brazo izquierdo: prácticamente igual a executiveIdle
//   - brazo derecho: upper arm moderadamente elevado/lateral
//   - antebrazo derecho: principal portador del gesto de presentación
//   - mano derecha: orientación abierta
//   - sin subir hasta horizontal, sin cruzar torso

export const PRESENT_RIGHT_ARM_TARGETS: ArmTargets = {
  leftArm:      new THREE.Vector3( 0.38, -0.925, -0.02).normalize(),
  leftForeArm:  new THREE.Vector3( 0.55, -0.78,   0.30).normalize(),
  rightArm:     new THREE.Vector3(-0.60, -0.68,  -0.42).normalize(),
  rightForeArm: new THREE.Vector3(-0.72, -0.35,   0.60).normalize(),
}

// ─── SPINE / HEAD TARGETS por estado ─────────────────────────────────────────
//
// Expresados como offsets en radianes sobre ejes locales SIMPLIFICADOS.
// Para spine/head el eje local Y del bone es aproximadamente world-up dado
// el rig Mixamo (verificar en runtime con el log de world directions).
// Usamos valores pequeños — el procedural overlay maneja el micro-motion.

export interface SpineHeadDeltas {
  /** Spine2: leve rotación lateral (world-ish Y) */
  spine2Yaw:    number
  /** Spine2: leve inclinación fwd/bck (world-ish X) */
  spine2Pitch:  number
  /** Neck: orientación general (world Y) */
  neckYaw:      number
  /** Head: girar hacia el contenido (world Y) */
  headYaw:      number
  /** Head: pitch up/down (world X) */
  headPitch:    number
}

export const SPINE_HEAD_TARGETS: Record<'executiveIdle' | 'presentRight', SpineHeadDeltas> = {
  executiveIdle: {
    spine2Yaw:   0,
    spine2Pitch: 0,
    neckYaw:     0,
    headYaw:     0,
    headPitch:   0,
  },
  presentRight: {
    spine2Yaw:   -0.08,  // torso gira ~4.6° hacia contenido (derecha desde POV avatar = -Y world)
    spine2Pitch:  0.03,
    neckYaw:     -0.05,
    headYaw:     -0.10,  // cabeza acompaña la dirección
    headPitch:    0.02,
  },
}

// ─── TRANSICIÓN ───────────────────────────────────────────────────────────────

/** Duración de transición entre estados en segundos. */
export const TRANSITION_DURATION_S = 0.42   // ~420ms, dentro del rango 350–500ms

// ─── PROCEDURAL PARAMS ────────────────────────────────────────────────────────

export const PROCEDURAL = {
  breathing: {
    /** Frecuencia principal de respiración (ciclos/s) */
    freq:      0.22,
    /** Segunda frecuencia (armonía) */
    freq2:     0.17,
    /** Amplitud en radianes de Spine1 (0.3°–1° = 0.005–0.017 rad) */
    ampSpine1: 0.008,
    /** Amplitud en radianes de Spine2 */
    ampSpine2: 0.006,
  },
  headMotion: {
    /** Frecuencia yaw (ciclos/s) — lento */
    freqYaw:   0.07,
    /** Frecuencia pitch */
    freqPitch: 0.11,
    /** Amplitud yaw en radianes (±2° = ±0.035 rad) */
    ampYaw:    0.030,
    /** Amplitud pitch en radianes (±1° = ±0.017 rad) */
    ampPitch:  0.015,
  },
  weightShift: {
    /** Frecuencia del weight shift (ciclos/s) — 6–10 s de periodo */
    freq:      0.10,
    /** Amplitud en radianes de Hips/Spine lateral */
    amp:       0.012,
  },
  handMicro: {
    freqL:    0.13,
    freqR:    0.19,
    amp:      0.008,
  },
} as const
