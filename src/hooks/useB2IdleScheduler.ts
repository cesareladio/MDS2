/**
 * useB2IdleScheduler.ts — animaciones procedurales de espera (waiting state).
 *
 * Cuando B2 está en 'waiting', este scheduler produce acciones discretas
 * con intervalos aleatorios para que el personaje se vea vivo:
 *   - breathing (siempre, via amplitudes en el animation loop)
 *   - smallHeadTurn (giro sutil de cabeza)
 *   - smallNod (asentimiento)
 *   - postureShift (reposición leve del torso)
 *   - lookCenter (centrar cabeza)
 *
 * Las acciones no cambian la pose semántica (pose del store), solo mutan
 * el valor de las perturbaçiones procedurales del AnimationController.
 * Se expone un ref compartido: idleProceduralRef.
 */

import { useEffect, useRef } from 'react'
import { useAvatarStore } from '../store/avatarStore'

export interface IdleProcedural {
  headYOffset: number     // grados Y (turn left/right)
  headXOffset: number     // grados X (nod)
  spineZOffset: number    // grados Z (weight shift)
  shoulderExtra: number   // grados extra en hombros
}

const IDLE_ACTIONS = [
  'breathing',
  'smallHeadTurn',
  'smallNod',
  'postureShift',
  'lookCenter',
] as const

type IdleAction = (typeof IDLE_ACTIONS)[number]

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function useB2IdleScheduler(proceduralRef: React.MutableRefObject<IdleProcedural>) {
  const b2State = useAvatarStore((s) => s.b2State)
  const b2StateRef = useRef(b2State)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tweenRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { b2StateRef.current = b2State }, [b2State])

  function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

  function smoothTo(
    key: keyof IdleProcedural,
    target: number,
    durationMs: number,
  ) {
    if (tweenRef.current) clearInterval(tweenRef.current)
    const start = proceduralRef.current[key]
    const startTime = performance.now()

    tweenRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / durationMs, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t  // ease in-out
      proceduralRef.current[key] = lerp(start, target, ease)
      if (t >= 1) {
        clearInterval(tweenRef.current!)
        tweenRef.current = null
      }
    }, 16)
  }

  function executeAction(action: IdleAction) {
    switch (action) {
      case 'breathing':
        // Breathing es procedural en el frame loop, nada aquí
        break
      case 'smallHeadTurn': {
        const angle = randBetween(-1.5, 1.5)
        smoothTo('headYOffset', angle, randBetween(600, 1200))
        break
      }
      case 'smallNod': {
        // Bajar y subir cabeza
        smoothTo('headXOffset', randBetween(3, 6), 300)
        setTimeout(() => smoothTo('headXOffset', 0, 400), 350)
        break
      }
      case 'postureShift': {
        const shift = randBetween(-0.8, 0.8)
        smoothTo('spineZOffset', shift, randBetween(800, 1500))
        break
      }
      case 'lookCenter': {
        smoothTo('headYOffset', 0, randBetween(400, 800))
        smoothTo('headXOffset', 0, 400)
        smoothTo('spineZOffset', 0, 600)
        break
      }
    }
  }

  function scheduleNext() {
    if (timerRef.current) clearTimeout(timerRef.current)
    const delay = randBetween(3000, 8000)
    timerRef.current = setTimeout(() => {
      const state = b2StateRef.current
      if (state === 'waiting' || state === 'listening') {
        const action = randItem(IDLE_ACTIONS)
        executeAction(action)
      }
      scheduleNext()
    }, delay)
  }

  useEffect(() => {
    scheduleNext()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (tweenRef.current) clearInterval(tweenRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
