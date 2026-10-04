/**
 * useB2Audio.ts — capa de audio de B2.
 *
 * Trabaja con B2Part[] (partes del guion del ZIP).
 * Reproduce cada parte en secuencia; llama onEnded al completar todas.
 * Web Audio API AnalyserNode para audioEnergy real.
 * Desbloqueo de AudioContext por primer gesto.
 */

import { useCallback, useEffect, useRef } from 'react'
import { audioUrl, type B2Part } from '../data/b2Script'
import { useAvatarStore } from '../store/avatarStore'

const IS_DEV = import.meta.env.DEV

const audioExistCache = new Map<string, boolean>()
async function audioExists(src: string): Promise<boolean> {
  const cached = audioExistCache.get(src)
  if (cached !== undefined) return cached
  try {
    const r = await fetch(src, { method: 'HEAD' })
    audioExistCache.set(src, r.ok)
    return r.ok
  } catch {
    audioExistCache.set(src, false)
    return false
  }
}

function estimatedMs(text: string) {
  return Math.max(2000, Math.min(10000, text.length * 90))
}

export function useB2Audio() {
  const setAudioEnergy  = useAvatarStore((s) => s.setAudioEnergy)
  const setPose         = useAvatarStore((s) => s.setPose)
  const setCurrentText  = useAvatarStore((s) => s.setCurrentText)
  const audioUnlocked   = useAvatarStore((s) => s.audioUnlocked)
  const setAudioUnlocked = useAvatarStore((s) => s.setAudioUnlocked)

  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const energyBufRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const rafRef      = useRef<number | null>(null)
  const isPlayingRef = useRef(false)
  const unlockedRef  = useRef(false)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = 1
    audio.setAttribute('data-b2-audio', 'true')
    audioRef.current = audio
    return () => { audio.pause(); audioRef.current = null }
  }, [])

  useEffect(() => { unlockedRef.current = audioUnlocked }, [audioUnlocked])

  // ── AUDIO CONTEXT ─────────────────────────────────────────────────────────

  function setupCtx() {
    if (audioCtxRef.current || !audioRef.current) return
    try {
      const ctx      = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.75
      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      energyBufRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
    } catch { /* no disponible */ }
  }

  function startEnergyLoop() {
    stopEnergyLoop()
    const loop = () => {
      const an = analyserRef.current; const buf = energyBufRef.current
      if (!an || !buf) return
      an.getByteTimeDomainData(buf)
      let sum = 0
      for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v }
      setAudioEnergy(Math.min(1, Math.sqrt(sum / buf.length) * 4))
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  function stopEnergyLoop() {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    setAudioEnergy(0)
  }

  // ── UNLOCK ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (audioUnlocked) { setupCtx(); return }
    const unlock = () => {
      setAudioUnlocked(true)
      setupCtx()
      if (audioRef.current && isPlayingRef.current) {
        audioCtxRef.current?.resume().then(() => audioRef.current?.play().catch(() => {}))
      }
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown',     unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown',     unlock)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUnlocked])

  // ── PLAY PARTS SEQUENCE ───────────────────────────────────────────────────

  const playParts = useCallback(async (parts: B2Part[], onEnded: () => void) => {
    isPlayingRef.current = true

    for (const part of parts) {
      if (!isPlayingRef.current) break

      // Cambiar pose y texto de B2
      setPose(part.pose as Parameters<typeof setPose>[0])
      setCurrentText(part.t)

      const audio = audioRef.current
      if (!audio) { await new Promise((r) => setTimeout(r, estimatedMs(part.t))); continue }

      const url    = part.id ? audioUrl(part.id) : ''
      const exists = part.id ? await audioExists(url) : false

      if (!exists) {
        if (IS_DEV && part.id) console.warn(`[B2] Missing audio: ${part.id}`)
        // Fallback: esperar tiempo estimado por longitud de texto
        await new Promise<void>((resolve) => {
          fallbackTimerRef.current = setTimeout(() => resolve(), estimatedMs(part.t))
        })
        continue
      }

      audio.src = url
      audio.currentTime = 0
      startEnergyLoop()

      await new Promise<void>((resolve) => {
        const done = () => { stopEnergyLoop(); resolve() }
        audio.onended = done
        audio.onerror = done

        const doPlay = () => {
          audioCtxRef.current?.resume().then(() => {
            audio.play().catch(() => {
              stopEnergyLoop()
              fallbackTimerRef.current = setTimeout(() => resolve(), estimatedMs(part.t))
            })
          })
        }

        if (unlockedRef.current) {
          doPlay()
        } else {
          const waitUnlock = () => { doPlay(); window.removeEventListener('pointerdown', waitUnlock); window.removeEventListener('keydown', waitUnlock) }
          window.addEventListener('pointerdown', waitUnlock, { once: true })
          window.addEventListener('keydown',     waitUnlock, { once: true })
        }
      })
    }

    isPlayingRef.current = false
    onEnded()
  }, [setPose, setCurrentText])

  const stopAudio = useCallback(() => {
    isPlayingRef.current = false
    if (fallbackTimerRef.current) { clearTimeout(fallbackTimerRef.current); fallbackTimerRef.current = null }
    stopEnergyLoop()
    audioRef.current?.pause()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isPlaying = useCallback(() => isPlayingRef.current, [])

  // ── PLAY SINGLE AUDIO FILE (para nuevo sistema de intents) ────────────────

  const playAudioFile = useCallback((
    id: string,
    onEnded: () => void,
    onTimeUpdate?: (currentTime: number) => void,
  ) => {
    isPlayingRef.current = true
    const audio = audioRef.current
    if (!audio) {
      isPlayingRef.current = false
      onEnded()
      return
    }

    const url = `/assets/b2/audio/${id}.mp3`

    audio.src = url
    audio.currentTime = 0
    startEnergyLoop()

    const done = () => {
      stopEnergyLoop()
      isPlayingRef.current = false
      if (onTimeUpdate) audio.removeEventListener('timeupdate', handleTimeUpdate)
      onEnded()
    }

    const handleTimeUpdate = () => {
      if (onTimeUpdate) onTimeUpdate(audio.currentTime)
    }

    if (onTimeUpdate) audio.addEventListener('timeupdate', handleTimeUpdate)

    audio.onended = done
    audio.onerror = done

    const doPlay = () => {
      audioCtxRef.current?.resume().then(() => {
        audio.play().catch(() => {
          stopEnergyLoop()
          isPlayingRef.current = false
          if (onTimeUpdate) audio.removeEventListener('timeupdate', handleTimeUpdate)
          onEnded()
        })
      })
    }

    if (unlockedRef.current) {
      doPlay()
    } else {
      const waitUnlock = () => {
        doPlay()
        window.removeEventListener('pointerdown', waitUnlock)
        window.removeEventListener('keydown', waitUnlock)
      }
      window.addEventListener('pointerdown', waitUnlock, { once: true })
      window.addEventListener('keydown', waitUnlock, { once: true })
    }
  }, [])

  const getCurrentAudio = useCallback(() => audioRef.current, [])

  return { playParts, stopAudio, isPlaying, playAudioFile, getCurrentAudio, audioRef }
}
