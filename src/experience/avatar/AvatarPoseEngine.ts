/**
 * AvatarPoseEngine.ts — motor de bones portado de b2-widget.js.
 *
 * PRINCIPIOS:
 *   - aim() y rotateWorld(): matemática intacta del proyecto funcional.
 *   - Targets de arms: amplitudes ORIGINALES de b2-widget.js (no reducidas).
 *   - Suavidad: SOLO en la transición (delta-time exponential lerp), NO en magnitud.
 *   - Intensity: 0.85–1.0 para gestos principales (el gesto debe verse).
 *   - Nuevas poses (presentRight, presentLeft, chest, question, playful, agree)
 *     construidas sobre el mismo sistema world-space aim().
 *
 * "NO quiero menos movimiento. Quiero el mismo gesto, pero más humano."
 *   → TARGET completo + entrada suave + hold + salida suave + micro-motion.
 */

import * as THREE from 'three'

export const BONES = [
  'Hips', 'Spine1', 'Spine2', 'Neck', 'Head',
  'LeftArm', 'LeftForeArm', 'LeftHand',
  'RightArm', 'RightForeArm', 'RightHand',
  'LeftUpLeg', 'LeftLeg', 'LeftFoot',
  'RightUpLeg', 'RightLeg', 'RightFoot',
] as const

export type BoneName = (typeof BONES)[number]

export interface Sides { L: number; R: number }
export interface ArmTarget { u: THREE.Vector3; f: THREE.Vector3 }
export interface PoseResult {
  L:  ArmTarget
  R:  ArmTarget
  hy: number
  hx: number
  /** 0–1: mezcla entre executiveIdle y el gesto. Default 1.0 */
  intensity?: number
}
export type PoseFn = (t: number) => PoseResult

// ─── TEMPORALES ──────────────────────────────────────────────────────────────

const tmp = new THREE.Vector3()
const tq  = new THREE.Quaternion()
const pq  = new THREE.Quaternion()
const wq  = new THREE.Quaternion()

const TEMP_CHILD_POS  = new THREE.Vector3()
const TEMP_BONE_POS   = new THREE.Vector3()
const TEMP_DIR        = new THREE.Vector3()
const TEMP_INV_PARENT = new THREE.Quaternion()
const TEMP_PARENT     = new THREE.Quaternion()

export const WORLD_X = new THREE.Vector3(1, 0, 0)
export const WORLD_Y = new THREE.Vector3(0, 1, 0)
export const WORLD_Z = new THREE.Vector3(0, 0, 1)

// ─── BONE SEARCH ─────────────────────────────────────────────────────────────

export function findBone(root: THREE.Object3D, shortName: string): THREE.Bone | undefined {
  let result: THREE.Bone | undefined
  root.traverse((o) => {
    if (!(o as THREE.Bone).isBone) return
    const clean = o.name.replace(/^mixamorig:?/, '').replace(/_\d+$/, '')
    if (clean === shortName) result = o as THREE.Bone
  })
  return result
}

// ─── aim() — portado sin tocar la matemática ─────────────────────────────────

export function aim(bone: THREE.Bone, child: THREE.Bone, direction: THREE.Vector3): void {
  bone.updateWorldMatrix(true, false)
  child.updateWorldMatrix(true, false)
  tmp.copy(child.getWorldPosition(TEMP_CHILD_POS))
     .sub(bone.getWorldPosition(TEMP_BONE_POS))
     .normalize()
  tq.setFromUnitVectors(tmp, TEMP_DIR.copy(direction).normalize())
  bone.getWorldQuaternion(wq)
  wq.premultiply(tq)
  bone.parent!.getWorldQuaternion(pq)
  bone.quaternion.copy(pq.invert().multiply(wq))
}

// ─── rotW() — portado sin tocar la matemática ────────────────────────────────

export function rotateWorld(bone: THREE.Bone, axis: THREE.Vector3, angle: number): void {
  bone.parent!.getWorldQuaternion(pq)
  tq.setFromAxisAngle(axis, angle)
  TEMP_INV_PARENT.copy(pq).invert()
  TEMP_PARENT.copy(pq)
  bone.quaternion.premultiply(TEMP_INV_PARENT.multiply(tq).multiply(TEMP_PARENT))
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const R = (side: number, x: number, y: number, z: number): THREE.Vector3 =>
  new THREE.Vector3(side * x, y, z)

/** Brazos en reposo — idéntico a b2-widget.js */
export const restingArms = (side: number): ArmTarget => ({
  u: R(side, .15, -1, .05),
  f: R(side, .10, -.90, .40),
})

// ─── DELTA-TIME SMOOTHING ────────────────────────────────────────────────────
// Exponencial: alpha = 1 - exp(-lambda * delta)
// NO usar constante k dependiente de FPS.

function expAlpha(lambda: number, delta: number): number {
  return 1 - Math.exp(-lambda * Math.min(delta, 0.05))
}

// ─── POSES ───────────────────────────────────────────────────────────────────
//
// REGLA: los targets de brazos son los mismos que b2-widget.js (originales).
// Nuevas poses usan el mismo sistema world-space.
// intensity por defecto = 1.0 (gesto completo visible).

export function createPoses(sx: Sides): Record<string, PoseFn> {
  const POSES: Record<string, PoseFn> = {

    // ── WAVE — idéntico a b2-widget.js ────────────────────────────────────
    wave: (t) => {
      if (t > 3) return POSES.present(t)
      const w = Math.sin(t * 9)
      return {
        L:  restingArms(sx.L),
        R:  { u: R(sx.R, .85, .5, .05), f: R(sx.R, .2 + .8 * w, 1, .1) },
        hy: .15,
        hx: -.04,
        intensity: 1.0,
      }
    },

    // ── BYE — idéntico a b2-widget.js ─────────────────────────────────────
    bye: (t) => {
      if (t > 3) return POSES.open(t)
      const w = Math.sin(t * 7)
      return {
        L:  { u: R(sx.L, .85, .5, .05), f: R(sx.L, .2 + .8 * w, 1, .1) },
        R:  restingArms(sx.R),
        hy: -.1,
        hx: .05,
        intensity: 1.0,
      }
    },

    // ── LISTEN — idéntico a b2-widget.js ──────────────────────────────────
    listen: (t) => ({
      L:  restingArms(sx.L),
      R:  restingArms(sx.R),
      hy: sx.R * .3,
      hx: Math.sin(t * 2) * .03,
      intensity: 1.0,
    }),

    // ── PRESENT — idéntico a b2-widget.js ─────────────────────────────────
    present: (t) => {
      const s = Math.sin(t * 3.2)
      const c = Math.cos(t * 2.4)
      return {
        L: {
          u: R(sx.L, .5, -.85, .3),
          f: R(sx.L, .25 + .15 * s, .1 + .15 * c, 1),
        },
        R: {
          u: R(sx.R, .5, -.85, .3),
          f: R(sx.R, .25 - .15 * s, .1 - .15 * c, 1),
        },
        hy: Math.sin(t * 1.5) * .2,
        hx: Math.sin(t * 3.2) * .04,
        intensity: 0.92,
      }
    },

    // ── PRESENT RIGHT — brazo derecho presenta, izquierdo en reposo ───────
    presentRight: (t) => {
      const s = Math.sin(t * 2.8)
      return {
        L: restingArms(sx.L),
        R: {
          u: R(sx.R, .55, -.82, .28),
          f: R(sx.R, .28 + .12 * s, .08 + .10 * s, .95),
        },
        hy: Math.sin(t * 1.3) * .12,
        hx: Math.sin(t * 2.8) * .025,
        intensity: 0.90,
      }
    },

    // ── PRESENT LEFT — brazo izquierdo presenta, derecho en reposo ────────
    presentLeft: (t) => {
      const s = Math.sin(t * 2.8)
      return {
        L: {
          u: R(sx.L, .55, -.82, .28),
          f: R(sx.L, .28 + .12 * s, .08 + .10 * s, .95),
        },
        R: restingArms(sx.R),
        hy: Math.sin(t * 1.3) * -.12,
        hx: Math.sin(t * 2.8) * .025,
        intensity: 0.90,
      }
    },

    // ── POINT — señalamiento suave ────────────────────────────────────────
    point: (t) => ({
      L:  restingArms(sx.L),
      R:  { u: R(sx.R, 1, -.1, .15), f: R(sx.R, 1, .02 + Math.sin(t * 4) * .04, .2) },
      hy: sx.R * .5,
      hx: .03,
      intensity: 0.90,
    }),

    // ── CHEST — mano derecha al pecho ─────────────────────────────────────
    chest: () => ({
      L:  restingArms(sx.L),
      R:  { u: R(sx.R, .25, -.8, .45), f: R(sx.R, -.7, .55, .6) },
      hy: .1,
      hx: .04,
      intensity: 0.88,
    }),

    // ── OPEN — apertura bilateral (complementariedad, equipo) ─────────────
    open: (t) => {
      const s = Math.sin(t * 2)
      return {
        L:  { u: R(sx.L, .9, -.45, .2), f: R(sx.L, .9 + .1 * s, 0, .45) },
        R:  { u: R(sx.R, .9, -.45, .2), f: R(sx.R, .9 + .1 * s, 0, .45) },
        hy: Math.sin(t * 1.2) * .12,
        hx: 0,
        intensity: 0.92,
      }
    },

    // ── SHRUG — humor muy sutil ───────────────────────────────────────────
    shrug: (t) => {
      const s = Math.sin(t * 3) * .08
      return {
        L:  { u: R(sx.L, .35, -.9, .2), f: R(sx.L, .5, -.25 + s, .8) },
        R:  { u: R(sx.R, .35, -.9, .2), f: R(sx.R, .5, -.25 + s, .8) },
        hy: .18,
        hx: -.06,
        intensity: 0.85,
      }
    },

    // ── QUESTION — un brazo abierto + head tilt ───────────────────────────
    question: (t) => ({
      L:  restingArms(sx.L),
      R:  {
        u: R(sx.R, .6, -.5, .3),
        f: R(sx.R, .55 + Math.sin(t * 1.8) * .05, .12, .65),
      },
      hy: sx.R * .2,
      hx: -.06 + Math.sin(t * 1.2) * .02,
      intensity: 0.88,
    }),

    // ── AGREE — pequeño nod + mano ────────────────────────────────────────
    agree: (t) => ({
      L:  restingArms(sx.L),
      R:  restingArms(sx.R),
      hy: Math.sin(t * 2.5) * .06,
      hx: Math.abs(Math.sin(t * 3.5)) * -.04,  // nod: cabeza baja ligeramente
      intensity: 1.0,
    }),

    // ── PLAYFUL — shrug pequeño + head tilt ──────────────────────────────
    playful: (t) => {
      const s = Math.sin(t * 2.8) * .06
      return {
        L:  { u: R(sx.L, .28, -.88, .18), f: R(sx.L, .38 + s, -.18, .72) },
        R:  { u: R(sx.R, .28, -.88, .18), f: R(sx.R, .38 + s, -.18, .72) },
        hy: .14,
        hx: -.05 + Math.sin(t * 2.0) * .02,
        intensity: 0.85,
      }
    },

    // ── FALLBACK — solo si falta el FBX correspondiente (sección 9) ───────
    // Alias directos a las poses equivalentes de arriba; nombres idénticos
    // a los clips semánticos (talking/laugh/clap/shy/nod/think).
    talking: (t) => POSES.present(t),
    laugh:   (t) => POSES.playful(t),
    clap:    (t) => POSES.open(t),
    shy:     (t) => POSES.shrug(t),
    nod:     (t) => POSES.agree(t),
    think:   (t) => POSES.question(t),
  }

  return POSES
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────

export interface AvatarPoseEngine {
  readonly ready: boolean
  sx:    Sides
  cur:   { uL: THREE.Vector3; fL: THREE.Vector3; uR: THREE.Vector3; fR: THREE.Vector3; hy: number; hx: number }
  bones: Partial<Record<BoneName, THREE.Bone>>
  rest:  Partial<Record<BoneName, THREE.Quaternion>>
  poses: Record<string, PoseFn>
  setup:  (model: THREE.Object3D) => boolean
  update: (model: THREE.Object3D, now: number, delta: number, poseName: string | null, poseStartedAt: number, energy: number) => void
}

export function createAvatarPoseEngine(): AvatarPoseEngine {
  const B:    Partial<Record<BoneName, THREE.Bone>>       = {}
  const rest: Partial<Record<BoneName, THREE.Quaternion>> = {}
  const sx: Sides = { L: 1, R: -1 }

  const cur = {
    uL: new THREE.Vector3(),
    fL: new THREE.Vector3(),
    uR: new THREE.Vector3(),
    fR: new THREE.Vector3(),
    hy: 0,
    hx: 0,
  }

  // Scratchpads para mezcla con intensity (sin alloc en loop)
  const _mixUL = new THREE.Vector3()
  const _mixFL = new THREE.Vector3()
  const _mixUR = new THREE.Vector3()
  const _mixFR = new THREE.Vector3()

  let poses: Record<string, PoseFn> = {}
  let ready = false

  function setup(model: THREE.Object3D): boolean {
    BONES.forEach((name) => {
      const bone = findBone(model, name)
      if (bone) { B[name] = bone; rest[name] = bone.quaternion.clone() }
    })
    if (!B.Hips || !B.LeftArm || !B.RightArm) { ready = false; return false }

    model.updateMatrixWorld(true)
    const wp = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3())
    const hipsX = wp(B.Hips).x
    sx.L = Math.sign(wp(B.LeftArm).x - hipsX) || 1
    sx.R = Math.sign(wp(B.RightArm).x - hipsX) || -1

    // Inicializar cur con resting pose
    const rL = restingArms(sx.L)
    const rR = restingArms(sx.R)
    cur.uL.copy(rL.u); cur.fL.copy(rL.f)
    cur.uR.copy(rR.u); cur.fR.copy(rR.f)
    cur.hy = 0; cur.hx = 0

    poses = createPoses(sx)
    ready = true
    return true
  }

  function update(
    model:        THREE.Object3D,
    now:          number,
    delta:        number,
    poseName:     string | null,
    poseStartedAt: number,
    energy:       number,
  ): void {
    if (!ready) return

    // ── 1. Evaluar pose target ────────────────────────────────────────────
    const idle: PoseResult = { L: restingArms(sx.L), R: restingArms(sx.R), hy: 0, hx: 0 }
    const poseFn = poseName ? poses[poseName] : undefined
    const raw: PoseResult = poseFn ? poseFn(now - poseStartedAt) : idle

    // ── 2. Aplicar intensity: mezcla idle ↔ target ───────────────────────
    // intensity = 1.0 → target completo (por defecto)
    // intensity = 0.85 → 85% del gesto, 15% idle
    const intensity = raw.intensity ?? 1.0

    _mixUL.copy(idle.L.u).lerp(raw.L.u, intensity)
    _mixFL.copy(idle.L.f).lerp(raw.L.f, intensity)
    _mixUR.copy(idle.R.u).lerp(raw.R.u, intensity)
    _mixFR.copy(idle.R.f).lerp(raw.R.f, intensity)
    const mixHy = raw.hy * intensity
    const mixHx = raw.hx * intensity

    // ── 3. Smooth exponential (delta-time) ───────────────────────────────
    // lambda 6 para cuerpo → suave pero llega al target en ~0.4s
    // lambda 4 para cabeza → algo más lento (natural)
    const bodyA = expAlpha(6.0, delta)
    const headA = expAlpha(4.0, delta)

    cur.uL.lerp(_mixUL, bodyA)
    cur.fL.lerp(_mixFL, bodyA)
    cur.uR.lerp(_mixUR, bodyA)
    cur.fR.lerp(_mixFR, bodyA)
    cur.hy += (mixHy - cur.hy) * headA
    cur.hx += (mixHx - cur.hx) * headA

    // ── 4. CRÍTICO: restore base pose cada frame ──────────────────────────
    BONES.forEach((name) => {
      const bone = B[name]; const base = rest[name]
      if (bone && base) bone.quaternion.copy(base)
    })
    model.updateMatrixWorld(true)

    // ── 5. Aplicar aim() ─────────────────────────────────────────────────
    if (B.LeftArm && B.LeftForeArm)    aim(B.LeftArm, B.LeftForeArm, cur.uL)
    if (B.LeftForeArm && B.LeftHand)   aim(B.LeftForeArm, B.LeftHand, cur.fL)
    if (B.RightArm && B.RightForeArm)  aim(B.RightArm, B.RightForeArm, cur.uR)
    if (B.RightForeArm && B.RightHand) aim(B.RightForeArm, B.RightHand, cur.fR)
    model.updateMatrixWorld(true)

    // ── 6. Procedural: spine + neck + head (idéntico a b2-widget.js) ────
    if (B.Spine2) rotateWorld(B.Spine2, WORLD_X, Math.sin(now * 1.7) * .008)
    if (B.Neck)   rotateWorld(B.Neck,   WORLD_Y, cur.hy * .5 + Math.sin(now * .6) * .03)
    if (B.Head)   rotateWorld(B.Head,   WORLD_Y, cur.hy * .5)
    if (B.Head)   rotateWorld(B.Head,   WORLD_X, cur.hx + energy * .05)

    // Root micro-sway idéntico a b2-widget.js
    model.rotation.y = Math.sin(now * .4) * .03

    model.updateMatrixWorld(true)
  }

  return {
    get ready() { return ready },
    sx, cur, bones: B, rest,
    get poses() { return poses },
    setup, update,
  }
}
