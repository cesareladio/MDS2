/**
 * useB2SpeechRecognition.ts — reconocimiento de voz activado por click.
 *
 * Diferencias clave respecto a la versión anterior:
 * - NO escucha continuamente. El micrófono se activa SOLO con click.
 * - Detecta fin de frase por: resultado final de SpeechRecognition O
 *   timeout de silencio (SILENCE_TIMEOUT_MS sin nuevo resultado).
 * - Al terminar: llama onFinalTranscript(text) → motor evalúa intent.
 * - Si falla o es rechazado: vuelve a 'waiting'.
 * - Expone startListening() para llamar desde el handler de click.
 */

import { useCallback, useEffect, useRef } from 'react'
import { useAvatarStore } from '../store/avatarStore'

const SILENCE_TIMEOUT_MS = 1200  // ms de silencio para cerrar la escucha

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList
  resultIndex: number
}
type SpeechRecognitionErrorEvent = Event & { error: string }

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  onnomatch: (() => void) | null
}

export function useB2SpeechRecognition(
  onFinalTranscript: (text: string) => void,
) {
  const setB2State  = useAvatarStore((s) => s.setB2State)
  const setMicState = useAvatarStore((s) => s.setMicState)
  const setTranscript = useAvatarStore((s) => s.setTranscript)
  const setPose     = useAvatarStore((s) => s.setPose)

  const recRef          = useRef<SpeechRecognitionInstance | null>(null)
  const activeRef       = useRef(false)
  const availableRef    = useRef(false)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accumulatedRef  = useRef('')
  const onFinalRef      = useRef(onFinalTranscript)
  const b2StateRef      = useRef(useAvatarStore.getState().b2State)

  useEffect(() => { onFinalRef.current = onFinalTranscript }, [onFinalTranscript])

  useEffect(() => {
    return useAvatarStore.subscribe((s) => { b2StateRef.current = s.b2State })
  }, [])

  // ── INIT RECOGNITION ──────────────────────────────────────────────────────

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) {
      if (import.meta.env.DEV) console.warn('[B2] SpeechRecognition no disponible — modo manual (B key)')
      setMicState('unavailable')
      return
    }
    availableRef.current = true

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'es-ES'

    rec.onstart = () => {
      activeRef.current = true
      setMicState('on')
      accumulatedRef.current = ''
    }

    rec.onresult = (e: SpeechRecognitionEvent) => {
      // Reiniciar timeout de silencio con cada palabra nueva
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

      let interim = ''
      let finalText = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          finalText += t
        } else {
          interim += t
        }
      }

      const currentText = (accumulatedRef.current + ' ' + finalText).trim()
      if (currentText) accumulatedRef.current = currentText

      // Mostrar en debug lo que se va detectando
      setTranscript((accumulatedRef.current + ' ' + interim).trim())

      // Si hay resultado final definitivo: pequeña pausa luego cerrar
      if (finalText) {
        silenceTimerRef.current = setTimeout(() => {
          stopAndDeliver()
        }, SILENCE_TIMEOUT_MS)
      } else {
        // Solo interim: esperar silencio más largo
        silenceTimerRef.current = setTimeout(() => {
          if (accumulatedRef.current.trim()) stopAndDeliver()
          else stopListening()
        }, SILENCE_TIMEOUT_MS + 400)
      }
    }

    rec.onnomatch = () => {
      stopListening()
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      activeRef.current = false
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicState('denied')
        availableRef.current = false
        setB2State('waiting')
        setPose('executiveIdle')
        return
      }
      // Error transitorio: volver a waiting
      setMicState('off')
      setB2State('waiting')
      setPose('executiveIdle')
    }

    rec.onend = () => {
      activeRef.current = false
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      setMicState('off')
    }

    recRef.current = rec

    return () => {
      rec.onresult = null
      rec.onerror = null
      rec.onend = null
      rec.onstart = null
      rec.onnomatch = null
      rec.abort()
      recRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── STOP AND DELIVER ─────────────────────────────────────────────────────

  function stopAndDeliver() {
    const text = accumulatedRef.current.trim()
    accumulatedRef.current = ''
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

    const rec = recRef.current
    if (rec && activeRef.current) {
      try { rec.stop() } catch { /* ok */ }
    }

    if (text) {
      onFinalRef.current(text)
    } else {
      // Sin transcript útil: volver a waiting
      setB2State('waiting')
      setPose('executiveIdle')
    }
  }

  // ── STOP ─────────────────────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    const rec = recRef.current
    if (rec && activeRef.current) {
      try { rec.stop() } catch { /* ok */ }
    }
    setMicState('off')
  }, [setMicState])

  // ── START (llamar desde click) ────────────────────────────────────────────

  const startListening = useCallback(() => {
    const rec = recRef.current
    if (!rec || !availableRef.current || activeRef.current) {
      // API no disponible: modo manual
      if (!availableRef.current) {
        if (import.meta.env.DEV) console.info('[B2] Modo manual — usa B para avanzar turno')
        // En modo manual solo cambiar pose visualmente
        setB2State('listening')
        setPose('listen')
        setMicState('unavailable')
      }
      return
    }

    accumulatedRef.current = ''
    setTranscript('')
    setB2State('listening')
    setPose('listen')
    setMicState('on')

    try {
      rec.start()
    } catch {
      // Ya activo o error
      setMicState('off')
      setB2State('waiting')
      setPose('executiveIdle')
    }
  }, [setB2State, setMicState, setPose, setTranscript])

  return { startListening, stopListening, available: availableRef.current }
}
