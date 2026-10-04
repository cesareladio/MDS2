/**
 * AvatarB2Model.tsx — motor de animación FBX Mixamo.
 *
 * CONGELADO: retarget(), AnimationMixer, go(), crossfade, clips.
 * Esta versión añade únicamente:
 *   A) entrance mirrored (x: +2.6) — derecha → izquierda
 *   B) facingGroup — capa externa de orientación global (sección 5-9)
 *   C) damping frontal post-entrance y post-one-shot
 */

import { useGLTF } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { useAvatarStore } from '../../store/avatarStore'
import type { B2Pose } from '../../data/b2Types'
import { createAvatarPoseEngine, BONES } from './AvatarPoseEngine'
import { buildBoneMap, retarget } from './b2Retarget'
import {
  CLIP_NAMES, CLIP_URLS, LOOP_CLIPS, ENTRANCE_CLIP, ENTRANCE_CONFIG, CROSSFADE_S,
  type ClipName,
} from './b2Clips'
import { POSE_TO_CLIP } from '../../data/b2Poses'

const AVATAR_URL = '/assets/b2/avatar_web.glb'
const IS_DEV = import.meta.env.DEV

// Velocidad de damping del facingGroup hacia target (en rad/s aprox)
const FACING_DAMP = 8.0  // tau ≈ 125ms → frontal en ~350ms

// Orientación de presentación: B2 mira ligeramente hacia el centro/izquierda.
// Positivo = gira hacia la izquierda (CCW mirando desde arriba) = mira hacia el
// contenido cuando B2 está posicionada a la derecha de la slide.
// Ajustar el signo si visualmente gira al lado incorrecto.
const PRESENTATION_FACING_YAW = THREE.MathUtils.degToRad(-12)

type EntPhase = 'walk' | 'turn'
interface EntranceRuntime {
  t0: number
  dur: number
  f: { x: number; z: number }
  yaw0: number
  phase: EntPhase
  t1?: number
}

const CAM_TARGET = { x: 0, y: 0.82, z: 0 }
const CAM_DISTANCE = 3.5
const CAM_FOV = 30

export function AvatarB2Model() {
  const { scene: model } = useGLTF(AVATAR_URL)
  const fbxResults = useLoader(FBXLoader, CLIP_NAMES.map((n) => CLIP_URLS[n]))

  const setFrame = useAvatarStore((s) => s.setFrame)
  const setFrameCount = useAvatarStore((s) => s.setFrameCount)
  const setHasAvatarEntered = useAvatarStore((s) => s.setHasAvatarEntered)

  const setupDoneRef = useRef(false)
  const skinnedRef = useRef<THREE.SkinnedMesh | null>(null)
  const frameRef = useRef(0)

  // facingGroup: controla orientación GLOBAL (section 5-8)
  // avatarGroup: posición durante entrance
  const facingGroupRef = useRef<THREE.Group>(null)
  const avatarGroupRef = useRef<THREE.Group>(null)
  const basePosRef = useRef(new THREE.Vector3())

  // facing damping
  const facingYawRef = useRef(0)   // current
  const facingTargetRef = useRef(0)   // target (siempre 0 post-entrance)

  // ── Motor de clips ────────────────────────────────────────────────────────
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const clipsRef = useRef<Partial<Record<ClipName, THREE.AnimationClip>>>({})
  const clipActiveRef = useRef<THREE.AnimationAction | null>(null)
  const clipModeRef = useRef(false)
  const onceARef = useRef<THREE.AnimationAction | null>(null)
  const boneMapRef = useRef<Record<string, THREE.Bone>>({})

  // ── Entrance ─────────────────────────────────────────────────────────────
  const entRef = useRef<EntranceRuntime | null>(null)
  const enteredRef = useRef(false)

  // ── Fallback procedural ───────────────────────────────────────────────────
  const engineRef = useRef(createAvatarPoseEngine())
  const poseNameRef = useRef<B2Pose | null>(null)
  const poseStartedAtRef = useRef(0)
  const energyRef = useRef(0)
  const directPoseRef = useRef<B2Pose | null>(null)

  // ── GO ────────────────────────────────────────────────────────────────────

  function go(name: ClipName, once: boolean): THREE.AnimationAction | null {
    const clip = clipsRef.current[name]
    const mixer = mixerRef.current
    if (!clip || !mixer) return null
    if (entRef.current && entRef.current.phase === 'walk' && name !== ENTRANCE_CLIP) return null

    const action = mixer.clipAction(clip)
    const prev = clipActiveRef.current
    if (prev === action && !once) return action

    action.reset()
    action.enabled = true
    action.setEffectiveWeight(1)
    action.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity)
    action.clampWhenFinished = once

    if (prev && prev !== action) {
      action.crossFadeFrom(prev, CROSSFADE_S, false)
      setTimeout(() => { if (clipActiveRef.current !== prev) prev.stop() }, CROSSFADE_S * 1000 + 100)
    } else {
      action.fadeIn(CROSSFADE_S)
    }
    action.play()
    clipActiveRef.current = action
    return action
  }

  function gesture(pose: B2Pose): void {
    if (!mixerRef.current) return
    const clipName = POSE_TO_CLIP[pose]
    if (!clipName || !clipsRef.current[clipName]) return
    if (LOOP_CLIPS.has(clipName)) {
      go(clipName, false)
    } else {
      onceARef.current = go(clipName, true)
    }
  }

  // ── FACING (section 5-9) ──────────────────────────────────────────────────
  // Sólo facingGroup.rotation.y — AnimationMixer sigue siendo único owner del skeleton.

  function setFacingTarget(yaw: number): void {
    facingTargetRef.current = yaw
  }

  // ── ENTRANCE ──────────────────────────────────────────────────────────────

  function enterWalk(): void {
    enteredRef.current = true
    const ag = avatarGroupRef.current
    if (!clipsRef.current[ENTRANCE_CLIP] || !mixerRef.current || !ag) {
      model.visible = true
      useAvatarStore.getState().setB2State('waiting')
      setHasAvatarEntered(true)
      return
    }
    const f = ENTRANCE_CONFIG.from
    const yaw0 = Math.atan2(-f.x, -f.z)  // mira en dirección de desplazamiento
    entRef.current = {
      t0: performance.now(),
      dur: ENTRANCE_CONFIG.time * 1000,
      f,
      yaw0,
      phase: 'walk',
    }
    ag.position.set(basePosRef.current.x + f.x, basePosRef.current.y, basePosRef.current.z + f.z)
    // Durante walk, facingGroup sigue el yaw de la trayectoria
    facingYawRef.current = yaw0
    facingTargetRef.current = yaw0
    go(ENTRANCE_CLIP, false)
    model.visible = true

    if (IS_DEV) {
      console.group('[B2 FIRST REVEAL]')
      console.log('state', useAvatarStore.getState().b2State)
      console.log('clip', ENTRANCE_CLIP)
      console.log('model.visible', model.visible)
      console.log('position', ag.position.toArray().map((v) => +v.toFixed(3)))
      console.log('facingYaw', +(yaw0 * 180 / Math.PI).toFixed(1) + '°')
      console.groupEnd()
    }
  }

  function stepEnt(t: number): void {
    const e = entRef.current
    const ag = avatarGroupRef.current
    if (!e || !ag) return

    if (e.phase === 'walk') {
      const k = Math.min(1, (t - e.t0) / e.dur)
      const s = 1 - Math.pow(1 - k, 1.35)
      ag.position.set(
        basePosRef.current.x + e.f.x * (1 - s),
        basePosRef.current.y,
        basePosRef.current.z + e.f.z * (1 - s),
      )
      // avatarGroup no rota; facingGroup tiene el yaw de trayectoria
      if (k >= 1) {
        e.phase = 'turn'
        e.t1 = t
        go('idle', false)
        // target: orientación de presentación (hacia el centro)
        facingTargetRef.current = PRESENTATION_FACING_YAW
      }
      return
    }

    // turn phase: suavizado por damping en useFrame (facingTargetRef ya=0)
    const k = Math.min(1, (t - (e.t1 ?? t)) / ENTRANCE_CONFIG.turnMs)
    if (k >= 1) {
      ag.position.copy(basePosRef.current)
      facingYawRef.current = PRESENTATION_FACING_YAW
      facingTargetRef.current = PRESENTATION_FACING_YAW
      entRef.current = null
      useAvatarStore.getState().setB2State('waiting')
      setHasAvatarEntered(true)
      if (IS_DEV) console.log('[B2] Entrance complete → waiting')
    }
  }

  // ── HIDE / SHOW ──────────────────────────────────────────────────────────

  function showB2(): void {
    entRef.current = null
    enteredRef.current = true
    const ag = avatarGroupRef.current
    if (ag) ag.position.copy(basePosRef.current)
    facingYawRef.current = PRESENTATION_FACING_YAW
    facingTargetRef.current = PRESENTATION_FACING_YAW
    model.visible = true
    go('idle', false)
    useAvatarStore.getState().setB2State('waiting')
    setHasAvatarEntered(true)
  }

  function hideB2(opts?: { animated?: boolean }): void {
    const animated = opts?.animated ?? false
    if (!animated || !clipsRef.current.greeting || !mixerRef.current) {
      model.visible = false
      entRef.current = null
      useAvatarStore.getState().setB2State('hidden')
      return
    }
    useAvatarStore.getState().setB2State('exiting')
    onceARef.current = go('greeting', true)
    const action = onceARef.current
    const finish = () => { model.visible = false; useAvatarStore.getState().setB2State('hidden') }
    if (action) {
      const dur = (clipsRef.current.greeting?.duration ?? 1) * 1000
      setTimeout(finish, dur + CROSSFADE_S * 1000)
    } else {
      finish()
    }
  }

  // enterB2() es incondicional — NO verifica guards de intro ni hasEntered.
  function enterB2(): void {
    model.visible = true
    useAvatarStore.getState().setB2State('entering')
  }

  // ── SETUP ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (setupDoneRef.current) return
    setupDoneRef.current = true

    model.updateMatrixWorld(true)

    // Full-body normalization (port literal de b2-widget.js)
    let lo = Infinity, hi = -Infinity, cx = 0
    model.traverse((o) => {
      if (!(o as THREE.Bone).isBone) return
      const p = o.getWorldPosition(new THREE.Vector3())
      if (p.y < lo) lo = p.y
      if (p.y > hi) hi = p.y
      if (/Hips/.test(o.name)) cx = p.x
    })
    if (hi > lo) { model.scale.multiplyScalar(1.6 / (hi - lo)); model.updateMatrixWorld(true) }
    lo = Infinity; cx = 0
    model.traverse((o) => {
      if (!(o as THREE.Bone).isBone) return
      const p = o.getWorldPosition(new THREE.Vector3())
      if (p.y < lo) lo = p.y
      if (/Hips/.test(o.name)) cx = p.x
    })
    model.position.y -= lo
    model.position.x -= cx
    model.updateMatrixWorld(true)

    let avatarMesh: THREE.SkinnedMesh | null = null
    model.traverse((o) => {
      if ((o as THREE.SkinnedMesh).isSkinnedMesh && !avatarMesh) avatarMesh = o as THREE.SkinnedMesh
    })
    skinnedRef.current = avatarMesh

    engineRef.current.setup(model)
    if (IS_DEV && !engineRef.current.ready) {
      console.warn('[B2] AvatarPoseEngine (fallback): bones no encontrados')
    }

    setFrame({ targetX: CAM_TARGET.x, targetY: CAM_TARGET.y, targetZ: CAM_TARGET.z, distance: CAM_DISTANCE, fov: CAM_FOV })

    if (avatarGroupRef.current) basePosRef.current.copy(avatarGroupRef.current.position)

    // Retarget + Mixer
    boneMapRef.current = buildBoneMap(model)
    const mixer = new THREE.AnimationMixer(model)
    mixerRef.current = mixer

    mixer.addEventListener('finished', (e) => {
      if (e.action !== onceARef.current) return
      onceARef.current = null
      // Reset facing a orientación de presentación tras one-shot (sección 5)
      setFacingTarget(PRESENTATION_FACING_YAW)
      if (clipModeRef.current) {
        const speaking = useAvatarStore.getState().b2State === 'speaking'
        go(speaking ? 'talking' : 'idle', false)
      } else {
        e.action.stop()
        if (clipActiveRef.current === e.action) clipActiveRef.current = null
      }
    })

    let matched = 0
    CLIP_NAMES.forEach((name, i) => {
      const fbx = fbxResults[i]
      const clip = fbx?.animations?.[0]
      if (!clip) {
        if (IS_DEV) console.warn('[B2] FBX sin animations[0]:', CLIP_URLS[name])
        return
      }
      clipsRef.current[name] = retarget(clip, boneMapRef.current)
      matched++
    })

    clipModeRef.current = !!clipsRef.current.idle

    if (IS_DEV) {
      console.group('[B2] Mixamo retarget')
      console.log('clips matched:', matched, '/', CLIP_NAMES.length)
      console.log('clipMode:', clipModeRef.current, '| entrance: x=+2.6,z=-7 (right→left)')
      console.groupEnd()
    }

    // Startup: oculto hasta que enterWalk() lo muestre con la posición correcta.
    model.visible = false
    useAvatarStore.getState().setHasAvatarEntered(false)

      ; (window as unknown as Record<string, unknown>).__B2RequestPose =
        (pose: string) => { directPoseRef.current = pose as B2Pose; gesture(pose as B2Pose) }

    if (IS_DEV) {
      const api = {
        playClip: (name: string) => go(name as ClipName, !LOOP_CLIPS.has(name as ClipName)),
        enter: enterB2,
        hide: (opts?: { animated?: boolean }) => hideB2(opts),
        show: showB2,
        setFacing: setFacingTarget,
        replayEntrance: () => { hideB2(); setTimeout(() => enterB2(), 80) },
        // introduce() is wired from useB2IntroBootstrap via __B2 merge
      }
        ; (window as unknown as Record<string, unknown>).__B2 = Object.assign(
          (window as unknown as Record<string, unknown>).__B2 ?? {}, api,
        )
    }

    // AUTO-ENTRANCE: iniciar la caminata automáticamente al cargar.
    // El subscribe captura re-entradas manuales posteriores (replayEntrance / enter()).
    const unsub = useAvatarStore.subscribe((s, prev) => {
      if (s.b2State === 'entering' && prev.b2State !== 'entering' && !entRef.current) {
        enterWalk()
      }
    })

    // Primera entrada automática — sin esperar interacción del usuario.
    useAvatarStore.getState().setB2State('entering')
    enterWalk()

    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, fbxResults])

  // ── TECLADO DEV ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!IS_DEV) return
    const keyMap: Record<string, ClipName> = {
      '1': 'idle', '2': 'talking', '3': 'greeting', '4': 'pointing', '5': 'thinking',
      '6': 'shrugging', '7': 'laughing', '8': 'clapping', '9': 'bashful', '0': 'nod',
    }
    const handler = (ev: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((ev.target as HTMLElement)?.tagName ?? '')) return
      const clip = keyMap[ev.key]
      if (clip) { go(clip, !LOOP_CLIPS.has(clip)); return }
      if (ev.key === 'e' || ev.key === 'E') enterB2()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── FRAME LOOP ────────────────────────────────────────────────────────────

  useFrame((state, delta) => {
    frameRef.current++
    if (frameRef.current % 20 === 0) setFrameCount(frameRef.current)

    const now = state.clock.elapsedTime
    const safeDelta = Math.min(delta, 0.05)

    stepEnt(performance.now())

    // ── Facing damping (section 6) — ANTES del mixer ─────────────────────
    const fg = facingGroupRef.current
    if (fg) {
      const diff = facingTargetRef.current - facingYawRef.current
      if (Math.abs(diff) > 0.0001) {
        const step = diff * Math.min(1, FACING_DAMP * safeDelta)
        facingYawRef.current += step
        fg.rotation.y = facingYawRef.current
      } else {
        facingYawRef.current = facingTargetRef.current
        fg.rotation.y = facingTargetRef.current
      }
    }

    // ── CLIP OWNERSHIP ESTRICTO ───────────────────────────────────────────
    if (clipModeRef.current || clipActiveRef.current) {
      mixerRef.current?.update(safeDelta)
      skinnedRef.current?.skeleton.update()
      return
    }

    // ── FALLBACK PROCEDURAL ───────────────────────────────────────────────
    const engine = engineRef.current
    if (!engine.ready) return

    const b2State = useAvatarStore.getState().b2State
    const storePose = useAvatarStore.getState().pose
    const direct = directPoseRef.current
    const resolved = direct ?? storePose

    if (b2State !== 'speaking' && b2State !== 'thinking') directPoseRef.current = null

    if (resolved !== poseNameRef.current) {
      poseNameRef.current = resolved
      poseStartedAtRef.current = now
    }

    const speaking = b2State === 'speaking'
    const eT = speaking
      ? 0.4 + 0.6 * Math.abs(Math.sin(now * 7.3)) * Math.abs(Math.sin(now * 2.9 + 1))
      : 0
    energyRef.current += (eT - energyRef.current) * 0.2

    engine.update(model, now, safeDelta, resolved, poseStartedAtRef.current, energyRef.current)
    skinnedRef.current?.skeleton.update()
  })

  // ─── JSX: facingGroup > avatarGroup > model ───────────────────────────────
  // facingGroup: rotación global (orientation cleanup)
  // avatarGroup: traslación durante entrada
  return (
    <group ref={facingGroupRef}>
      <group ref={avatarGroupRef}>
        <primitive object={model} />
      </group>
    </group>
  )
}

export { BONES }

useGLTF.preload(AVATAR_URL)
