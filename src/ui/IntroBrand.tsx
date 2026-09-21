import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useExperienceStore } from '../store/experienceStore'

/**
 * IntroBrand
 * Cinematic opening: NTT DATA wordmark → expanding light line → Earth rise.
 * The wordmark fades and shrinks as the user scrolls past the intro phase.
 * No hard cut: it dissolves continuously with scroll.
 */
export function IntroBrand() {
  const root   = useRef<HTMLDivElement>(null)
  const light  = useRef<HTMLDivElement>(null)
  const phase  = useExperienceStore((state) => state.phase)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const reduced = useExperienceStore((state) => state.reducedMotion)

  // Entry animation on mount
  useEffect(() => {
    if (reduced || !root.current) return
    const el = root.current
    gsap.fromTo(
      el.querySelectorAll('.intro-eyebrow, .intro-title, .intro-claim'),
      { opacity: 0, y: 22, filter: 'blur(6px)' },
      { opacity: 1, y: 0,  filter: 'blur(0px)', stagger: 0.18, duration: 1.2, ease: 'power3.out', delay: 0.3 }
    )
    gsap.fromTo(
      el.querySelector('.intro-light'),
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 1.6, ease: 'power3.inOut', delay: 0.9 }
    )
    gsap.fromTo(
      el.querySelector('.scroll-cue'),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.8 }
    )
  }, [reduced])

  // Scroll-linked fade out
  const introFade = Math.max(0, 1 - scroll * 14)   // fades out in first ~7% scroll
  const lightExpand = Math.min(1, scroll * 20)       // light expands at start of scroll

  return (
    <div
      ref={root}
      className="intro-lockup"
      style={{ opacity: introFade, pointerEvents: phase === 'intro' ? 'auto' : 'none' }}
      aria-hidden={phase !== 'intro'}
    >
      <p className="intro-eyebrow">People · Connect · Possibilities</p>
      <h1 className="intro-title">NTT <strong>DATA</strong></h1>
      <p className="intro-claim">Technology<br />for a brighter society</p>

      {/* The light line that "becomes" the Earth horizon */}
      <div
        ref={light}
        className="intro-light"
        style={{ transform: `scaleX(${1 + lightExpand * 4})`, opacity: 1 - lightExpand * 1.5 }}
        aria-hidden="true"
      />

      <span className="scroll-cue" aria-label="Scroll para comenzar">
        Scroll to begin <i />
      </span>
    </div>
  )
}
