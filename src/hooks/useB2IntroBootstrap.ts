/**
 * useB2IntroBootstrap.ts — listener especial de introducción.
 *
 * Activo SOLO mientras: b2State === 'hidden' && !hasEverEntered
 *
 * Detecta INTRODUCE_B2 con un matcher propio (secciones 16-17):
 *   A) transcript normalizado contiene "b2" + una context word
 *   B) phrase similarity >= 0.30 contra variantes INTRODUCE_B2
 *   C) semantic score INTRODUCE_B2 >= 0.30
 *
 * NO lanza el semantic router global completo.
 * Al detectarlo dispara la secuencia:
 *   entering → walk → hola.mp3 (greeting) → s01b.mp3 (talking) → idle/waiting
 *
 * Fallback:
 *   tecla B mientras hidden+!hasEverEntered
 *   window.__B2.introduce()
 *
 * Guard: introSequenceRunning evita doble disparo.
 */

import { useCallback, useEffect, useRef } from 'react'
import { useAvatarStore } from '../store/avatarStore'
import { useB2Audio } from './useB2Audio'
import { normalizeText } from '../data/b2IntentMatcher'

// ─── BOOTSTRAP MATCHER (sección 16) ─────────────────────────────────────────

const INTRO_B2_ALIASES = /\bb\s?2\b|b\s?dos|be\s?dos|ve\s?dos|bedos/gi

const INTRO_CONTEXT_WORDS = [
  'saluda', 'presenta', 'presento', 'presentate', 'equipo', 'ejecutivo',
  'refuerzos', 'conoce', 'todos', 'aca', 'aqui', 'toca', 'traje',
]

const INTRO_VARIANTS = [
  'saluda al equipo',
  'saluda a todos',
  'presentate',
  'b2 presentate',
  'te presento al equipo',
  'saluda al equipo ejecutivo',
  'ahora te toca b2',
  'b2 saluda al equipo',
  'b2 te presento al equipo',
  'te presento al equipo ejecutivo',
  'b2 conoce al equipo',
  'con nosotros esta b2',
  'traje refuerzos b2',
  'saluda a todos b2',
  'b2 saluda a todos',
  'ahora b2',
  'b2 aca estas',
  'presentate b2',
]

function jaccardWords(a: string, b: string): number {
  const sa = new Set(a.split(/\s+/).filter((w) => w.length > 2))
  const sb = new Set(b.split(/\s+/).filter((w) => w.length > 2))
  if (!sa.size || !sb.size) return 0
  let inter = 0; sa.forEach((w) => { if (sb.has(w)) inter++ })
  return (2 * inter) / (sa.size + sb.size)
}

/** Normaliza aliases de "B2" en el transcript antes de evaluar. */
export function canonicalizeB2(raw: string): string {
  return raw.replace(INTRO_B2_ALIASES, 'b2')
}

export function matchIntroB2(raw: string): boolean {
  const normalized = normalizeText(canonicalizeB2(raw))

  // A) contiene "b2" + context word
  if (normalized.includes('b2')) {
    if (INTRO_CONTEXT_WORDS.some((w) => normalized.includes(w))) return true
  }

  // B) phrase similarity >= 0.30
  for (const v of INTRO_VARIANTS) {
    const normV = normalizeText(v)
    if (normalized === normV || normalized.includes(normV) || normV.includes(normalized)) return true
    if (jaccardWords(normalized, normV) >= 0.30) return true
  }

  return false
}

// ─── HOOK ────────────────────────────────────────────────────────────────────

const IS_DEV = import.meta.env.DEV

export function useB2IntroBootstrap() {
  const setB2State        = useAvatarStore((s) => s.setB2State)
  const setAudioUnlocked  = useAvatarStore((s) => s.setAudioUnlocked)

  const { playAudioFile } = useB2Audio()

  const runningRef      = useRef(false)   // guard doble disparo (sección 23)
  const hasEverRef      = useRef(false)   // primera intro ever
  const introRecRef     = useRef<SpeechRecognitionInstance | null>(null)
  const introActiveRef  = useRef(false)

  interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean; interimResults: boolean; lang: string
    start(): void; stop(): void; abort(): void
    onresult: ((e: Event & { results: SpeechRecognitionResultList; resultIndex: number }) => void) | null
    onerror: ((e: Event & { error: string }) => void) | null
    onend: (() => void) | null; onstart: (() => void) | null
  }

  // runIntroSequence — reproduce hola+s01b cuando B2 ya está visible (waiting).
  // Si B2 todavía está entering, espera la transición entering→waiting primero.
  // Ya NO lanza la entrada — el auto-entrance del modelo la gestiona al cargar.
  const runIntroSequence = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    hasEverRef.current = true

    stopIntroListener()
    setAudioUnlocked(true)

    const reqPose = (window as unknown as Record<string, (p: string) => void>).__B2RequestPose

    function playIntroAudio() {
      useAvatarStore.getState().setB2State('speaking')
      if (reqPose) reqPose('wave')
      playAudioFile('hola', () => {
        if (reqPose) reqPose('talking')
        playAudioFile('s01b', () => {
          useAvatarStore.getState().setB2State('waiting')
          useAvatarStore.getState().setPose('executiveIdle')
          runningRef.current = false
          if (IS_DEV) console.log('[B2] Intro sequence complete → waiting')
        })
      })
    }

    const cur = useAvatarStore.getState().b2State
    if (cur === 'waiting') {
      // B2 ya está idle — reproducir audio inmediatamente
      playIntroAudio()
    } else {
      // B2 todavía entrando o en otro estado — esperar waiting
      const unsub = useAvatarStore.subscribe((s, prev) => {
        if (s.b2State !== 'waiting') return
        if (prev.b2State === 'speaking') return  // evitar loops
        unsub()
        playIntroAudio()
      })
    }
  }, [playAudioFile, setAudioUnlocked])

  // ── Intro speech listener ────────────────────────────────────────────────

  function stopIntroListener() {
    const rec = introRecRef.current
    if (rec && introActiveRef.current) {
      try { rec.abort() } catch { /* ok */ }
    }
    introActiveRef.current = false
    introRecRef.current = null
    if (IS_DEV) useAvatarStore.getState().setDebugInfo?.(null)
  }

  function armIntroListener() {
    if (hasEverRef.current || runningRef.current) return
    const Ctor = (window as Window).SpeechRecognition ?? (window as Window).webkitSpeechRecognition
    if (!Ctor) {
      if (IS_DEV) console.log('[B2] Intro SR no disponible — usa tecla B')
      return
    }

    if (introRecRef.current) return   // ya armado

    const rec = new Ctor() as SpeechRecognitionInstance
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'es-ES'

    rec.onstart = () => { introActiveRef.current = true; if (IS_DEV) console.log('[B2] Intro listener: armed') }
    rec.onend = () => { introActiveRef.current = false }
    rec.onerror = () => { introActiveRef.current = false }

    rec.onresult = (e) => {
      const ev = e as Event & { results: SpeechRecognitionResultList; resultIndex: number }
      let text = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript
      }
      if (IS_DEV) useAvatarStore.getState().setTranscript(`[intro] ${text}`)
      if (matchIntroB2(text)) {
        if (IS_DEV) console.log('[B2] Intro match:', text)
        runIntroSequence()
      }
    }

    introRecRef.current = rec
    try { rec.start() } catch { /* ok */ }
  }

  // ── Primer gesto del usuario → unlock audio + arm listener ──────────────

  useEffect(() => {
    const onFirstGesture = () => {
      if (hasEverRef.current || runningRef.current) return
      setAudioUnlocked(true)
      armIntroListener()
    }
    window.addEventListener('pointerdown', onFirstGesture, { once: true })
    window.addEventListener('keydown',     onFirstGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown',     onFirstGesture)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Tecla B (fallback) — funciona cuando B2 no está en intro sequence ──────

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key !== 'b' && ev.key !== 'B') return
      if (['INPUT', 'TEXTAREA'].includes((ev.target as HTMLElement)?.tagName ?? '')) return
      if (runningRef.current) return
      // Solo interferir con B si aún no hubo intro alguna vez
      if (hasEverRef.current) return
      ev.preventDefault()
      runIntroSequence()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [runIntroSequence])

  // ── window.__B2.introduce() (sección 22) ─────────────────────────────────

  useEffect(() => {
    if (!IS_DEV) return
    const w = window as unknown as Record<string, unknown>
    const api = { introduce: runIntroSequence }
    w.__B2 = Object.assign((w.__B2 as object) ?? {}, api)
    return () => {
      const cur = w.__B2 as Record<string, unknown> | undefined
      if (cur) delete cur.introduce
    }
  }, [runIntroSequence])

  return { runIntroSequence }
}
