/**
 * useB2DialogueEngine.ts — motor de diálogo semántico.
 *
 * NO tiene currentTurn como bloqueo.
 * El transcript se evalúa globalmente contra todos los intents.
 * El contexto conversacional (previousIntent, sceneContext) da bonuses
 * pero nunca bloquea una respuesta válida.
 *
 * Flujo:
 *   transcript → matchIntent(ctx) → B2_RESPONSES[intent] → audios → timeline
 *
 * API pública:
 *   processTranscript(text)   — llamado por SpeechRecognition
 *   executeIntent(intent)     — directo sin SR (testing)
 *   initialize()              — reset al montar
 */

import { useCallback, useEffect, useRef } from 'react'
import { matchIntent, type MatchContext, type IntentCandidate } from '../data/b2IntentMatcher'
import { B2_RESPONSES, audioPath } from '../data/b2Dialogue'
import type { B2AudioPart } from '../data/b2Dialogue'
import type { B2Intent } from '../data/b2Types'
import { useAvatarStore } from '../store/avatarStore'
import { useB2Audio } from './useB2Audio'

const IS_DEV = import.meta.env.DEV
const THINKING_MS    = 280
const POST_AUDIO_MS  = 350
const DEBOUNCE_MS    = 800

export function useB2DialogueEngine() {
  const setB2State         = useAvatarStore((s) => s.setB2State)
  const setPose            = useAvatarStore((s) => s.setPose)
  const setCurrentText     = useAvatarStore((s) => s.setCurrentText)
  const setCurrentTurnIndex = useAvatarStore((s) => s.setCurrentTurnIndex)
  const setTranscript      = useAvatarStore((s) => s.setTranscript)
  const setMicState        = useAvatarStore((s) => s.setMicState)
  const setDebugInfo       = useAvatarStore((s) => s.setDebugInfo)
  const setMatchCandidates = useAvatarStore((s) => s.setMatchCandidates)

  // ── ESTADO CONVERSACIONAL (contexto, NO secuencia) ─────────────────────
  const previousIntentRef  = useRef<B2Intent | null>(null)
  const sceneContextRef    = useRef<string | null>(null)

  const executingRef       = useRef(false)
  const lastExecutedAtRef  = useRef(0)
  const thinkingTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const postTimer          = useRef<ReturnType<typeof setTimeout> | null>(null)
  const b2StateRef         = useRef(useAvatarStore.getState().b2State)

  // El store guarda candidatos para el overlay
  const candidatesRef      = useRef<IntentCandidate[]>([])

  const { playAudioFile, isPlaying } = useB2Audio()

  useEffect(() => {
    return useAvatarStore.subscribe((s) => { b2StateRef.current = s.b2State })
  }, [])

  // ── FINISH B2 RESPONSE (centralizado) ──────────────────────────────────

  const finishB2Response = useCallback(() => {
    // Limpiar timers
    if (thinkingTimer.current) clearTimeout(thinkingTimer.current)
    if (postTimer.current) clearTimeout(postTimer.current)
    executingRef.current = false

    // No volver a idle si B2 está en transiciones de entrada/salida
    const currentState = b2StateRef.current
    if (currentState === 'entering' || currentState === 'hidden' || currentState === 'exiting') {
      return
    }

    // Volver a idle + waiting
    setTranscript('')
    setMicState('off')
    setCurrentText('')
    setB2State('waiting')
    setPose('executiveIdle')

    // Activar realmente el clip idle en el mixer (no solamente el state)
    const api = (window as unknown as Record<string, Record<string, () => void>>).__B2?.returnToIdle
    if (api) api()
  }, [setB2State, setCurrentText, setMicState, setPose, setTranscript])

  // ── RETURN TO WAITING (deprecated — usar finishB2Response) ────────────

  const returnToWaiting = useCallback(() => {
    finishB2Response()
  }, [finishB2Response])

  // ── HANDLE NO MATCH (fallback para transcripts no reconocidos) ──────────

  const handleNoMatch = useCallback((transcript: string) => {
    // Solo reproducir fallback si hay contenido (no silencio)
    if (!transcript || !transcript.trim()) {
      finishB2Response()
      return
    }

    executingRef.current = true
    lastExecutedAtRef.current = Date.now()

    setB2State('speaking')
    setMicState('off')

    if (IS_DEV) {
      setDebugInfo({
        state: 'speaking',
        turn: -1,
        mic: 'off',
        transcript: '',
        match: { label: 'NO_MATCH', confidence: 0 },
        audioId: 'no_entendi',
        pose: 'talking',
      })
    }

    // Solicitar pose talking
    const reqPose = (window as unknown as Record<string, (p: string) => void>).__B2RequestPose
    if (reqPose) {
      reqPose('talking')
    } else {
      setPose('talking')
    }

    // Reproducir audio fallback
    playAudioFile('no_entendi', () => {
      if (postTimer.current) clearTimeout(postTimer.current)
      postTimer.current = setTimeout(() => {
        finishB2Response()
      }, POST_AUDIO_MS)
    })
  }, [playAudioFile, finishB2Response, setB2State, setMicState, setPose, setDebugInfo])

  // ── PLAY AUDIO SEQUENCE ────────────────────────────────────────────────

  const playAudioSequence = useCallback((
    parts: B2AudioPart[],
    idx: number,
    intent: B2Intent,
  ) => {
    if (idx >= parts.length) {
      if (postTimer.current) clearTimeout(postTimer.current)
      postTimer.current = setTimeout(() => {
        finishB2Response()
      }, POST_AUDIO_MS)
      return
    }

    const part = parts[idx]

    if (IS_DEV) {
      setDebugInfo({
        state: 'speaking',
        turn: -1,
        mic: 'off',
        transcript: '',
        match: null,
        audioId: part.id,
        pose: part.pose,
      })
    }

    // Solicitar la pose via directPoseRef (NO store.setPose) — dispara el
    // gesto FBX one-shot inmediatamente (ver AvatarB2Model.gesture()).
    const api = (window as unknown as Record<string, (p: string) => void>).__B2RequestPose
    if (api) {
      api(part.pose)
    } else {
      setPose(part.pose as Parameters<typeof setPose>[0])
    }

    playAudioFile(part.id, () => {
      if (postTimer.current) clearTimeout(postTimer.current)
      postTimer.current = setTimeout(() => {
        playAudioSequence(parts, idx + 1, intent)
      }, POST_AUDIO_MS)
    })
  }, [playAudioFile, finishB2Response, setPose, setDebugInfo])

  // ── EXECUTE INTENT ─────────────────────────────────────────────────────

  const executeIntent = useCallback((intent: B2Intent) => {
    const response = B2_RESPONSES[intent]
    if (!response) {
      if (IS_DEV) console.warn('[B2] No response for intent:', intent)
      finishB2Response()
      return
    }

    previousIntentRef.current = intent
    executingRef.current = true
    lastExecutedAtRef.current = Date.now()

    setB2State('speaking')

    if (IS_DEV) {
      setDebugInfo({
        state: 'speaking',
        turn: -1,
        mic: 'off',
        transcript: '',
        match: { label: intent, confidence: 1.0 },
        audioId: response.audios[0]?.id ?? '',
        pose: response.audios[0]?.pose ?? 'talking',
      })
    }

    playAudioSequence(response.audios, 0, intent)
  }, [playAudioSequence, finishB2Response, setB2State, setDebugInfo])

  // ── PROCESS TRANSCRIPT ─────────────────────────────────────────────────

  const processTranscript = useCallback((transcript: string) => {
    // Ignorar si ya está en progreso
    if (b2StateRef.current === 'speaking' || b2StateRef.current === 'thinking') return
    if (isPlaying()) return
    if (executingRef.current) return

    // Debounce: evitar doble disparo accidental
    const now = Date.now()
    if (now - lastExecutedAtRef.current < DEBOUNCE_MS) return

    setTranscript(transcript)
    setMicState('off')

    const ctx: MatchContext = {
      previousIntent: previousIntentRef.current,
      sceneContext: sceneContextRef.current,
    }

    const result = matchIntent(transcript, ctx)
    candidatesRef.current = result.candidates
    setMatchCandidates(result.candidates)

    // Publicar debug
    if (IS_DEV) {
      setDebugInfo({
        state: b2StateRef.current,
        turn: -1,
        mic: 'off',
        transcript,
        match: result.accepted
          ? { label: result.best.intent, confidence: result.best.score }
          : null,
        audioId: '',
        pose: result.best.intent,
      })
      console.group('[B2] Intent Match')
      console.log('Transcript:', transcript)
      console.log('Normalized candidates:')
      result.candidates.slice(0, 4).forEach((c) => {
        console.log(`  ${c.intent.padEnd(25)} ${(c.score * 100).toFixed(1)}%`)
      })
      console.log('Accepted:', result.accepted, '|', result.best.reason)
      console.groupEnd()
    }

    if (!result.accepted) {
      handleNoMatch(transcript)
      return
    }

    // Thinking → Speaking
    setB2State('thinking')
    setPose('listen')
    executingRef.current = true

    if (thinkingTimer.current) clearTimeout(thinkingTimer.current)
    thinkingTimer.current = setTimeout(() => {
      executeIntent(result.best.intent)
    }, THINKING_MS)
  }, [isPlaying, executeIntent, handleNoMatch, setB2State, setPose, setMicState, setTranscript, setDebugInfo])

  // ── SCENE CONTEXT ─────────────────────────────────────────────────────

  const setSceneContextHint = useCallback((scene: string | null) => {
    sceneContextRef.current = scene
  }, [])

  // ── FALLBACKS DE TECLADO (B = re-ejecutar último intent) ───────────────

  const reExecuteLast = useCallback(() => {
    if (executingRef.current) return
    if (!previousIntentRef.current) return
    setB2State('thinking')
    setPose('listen')
    if (thinkingTimer.current) clearTimeout(thinkingTimer.current)
    thinkingTimer.current = setTimeout(() => {
      executeIntent(previousIntentRef.current!)
    }, THINKING_MS)
  }, [executeIntent, setB2State, setPose])

  // ── INITIALIZE ────────────────────────────────────────────────────────

  const initialize = useCallback(() => {
    previousIntentRef.current = null
    executingRef.current = false
    lastExecutedAtRef.current = 0
    setCurrentTurnIndex(-1)
    // No escribir b2State aquí — AvatarB2Model lo pone en 'waiting'
    // al completar setup. Solo limpiar contexto conversacional.
  }, [setCurrentTurnIndex])

  // ── window.__B2 API (fusiona con playClip/enter/hide/show de AvatarB2Model) ─

  useEffect(() => {
    if (!IS_DEV) return

    const api = {
      respond: (intent: B2Intent) => {
        if (executingRef.current) {
          console.warn('[B2] Already executing, try again')
          return
        }
        setB2State('thinking')
        setPose('listen')
        setTimeout(() => executeIntent(intent), THINKING_MS)
      },
      getCandidates: () => candidatesRef.current,
      getPreviousIntent: () => previousIntentRef.current,
      listIntents: () => Object.keys(B2_RESPONSES),
    }

    const w = window as unknown as Record<string, unknown>
    w.__B2 = Object.assign((w.__B2 as object) ?? {}, api)

    return () => {
      const cur = (w.__B2 as Record<string, unknown> | undefined)
      if (cur) Object.keys(api).forEach((k) => delete cur[k])
    }
  }, [executeIntent, setB2State, setPose])

  // También exponer executeNextTurn para compatibilidad con useB2Controller
  const executeNextTurn = reExecuteLast
  const executePreviousTurn = reExecuteLast

  return {
    processTranscript,
    executeIntent,
    executeNextTurn,
    executePreviousTurn,
    initialize,
    setSceneContextHint,
    getCandidates: () => candidatesRef.current,
  }
}
