/**
 * useB2Controller.ts — orquestador central de B2.
 *
 * Flujo de inicio:
 *   1. Modelo carga → model.visible=true, go('idle'), b2State='waiting'
 *      (AvatarB2Model hace esto al completar setup)
 *   2. Click sobre B2 → startListening() → semantic router → respuesta
 *   3. intro bootstrap (useB2IntroBootstrap) corre en paralelo para
 *      detectar la primera presentación de Bárbara.
 *
 * Teclas:
 *   B               → executeNextTurn (post-entrada)
 *   Shift+B         → executePreviousTurn (solo dev)
 */

import { useCallback, useEffect } from 'react'
import { useB2DialogueEngine } from './useB2DialogueEngine'
import { useB2SpeechRecognition } from './useB2SpeechRecognition'
import { useB2IntroBootstrap } from './useB2IntroBootstrap'
import { useAvatarStore } from '../store/avatarStore'
import type { B2SceneContext, B2SceneReaction } from '../data/b2Types'

const IS_DEV = import.meta.env.DEV

export function useB2Controller() {
  const setSceneContext  = useAvatarStore((s) => s.setSceneContext)
  const reactToScene    = useAvatarStore((s) => s.reactToScene)
  const setAudioUnlocked = useAvatarStore((s) => s.setAudioUnlocked)
  const audioUnlocked   = useAvatarStore((s) => s.audioUnlocked)

  const { processTranscript, executeNextTurn, executePreviousTurn, initialize } =
    useB2DialogueEngine()

  const { startListening } = useB2SpeechRecognition(processTranscript)

  // Bootstrap de introducción (corre en paralelo, no bloquea visibilidad)
  useB2IntroBootstrap()

  // ── INICIALIZAR ───────────────────────────────────────────────────────────
  // El modelo se muestra visible + idle directamente en AvatarB2Model.setup().
  // initialize() solo limpia el estado conversacional del dialogue engine.

  useEffect(() => {
    initialize()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── AUDIO UNLOCK (primer gesto del usuario) ───────────────────────────────

  useEffect(() => {
    if (audioUnlocked) return
    const unlock = () => setAudioUnlocked(true)
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [audioUnlocked, setAudioUnlocked])

  // ── CLICK SOBRE B2 ────────────────────────────────────────────────────────

  const handleAvatarClick = useCallback(() => {
    const state = useAvatarStore.getState().b2State
    // Ignorar si B2 no está visible o está en transición
    if (state === 'hidden' || state === 'speaking' || state === 'thinking' || state === 'entering') return

    if (!useAvatarStore.getState().audioUnlocked) setAudioUnlocked(true)

    if (state === 'listening') {
      useAvatarStore.getState().setB2State('waiting')
      useAvatarStore.getState().setPose('executiveIdle')
      useAvatarStore.getState().setMicState('off')
      return
    }

    // waiting → activar escucha
    startListening()
  }, [setAudioUnlocked, startListening])

  // ── FALLBACK TECLADO B ────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'b' && e.key !== 'B') return
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName ?? '')) return
      e.preventDefault()
      if (e.shiftKey) {
        if (IS_DEV) executePreviousTurn()
      } else {
        executeNextTurn()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [executeNextTurn, executePreviousTurn])

  // ── API PÚBLICA ───────────────────────────────────────────────────────────

  const updateSceneContext = useCallback((ctx: B2SceneContext) => {
    setSceneContext(ctx)
  }, [setSceneContext])

  const react = useCallback((reaction: B2SceneReaction) => {
    reactToScene(reaction)
  }, [reactToScene])

  return { handleAvatarClick, executeNextTurn, updateSceneContext, react }
}
