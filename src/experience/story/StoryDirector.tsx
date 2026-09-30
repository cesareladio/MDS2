import { useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { storyChapters } from '../../data/story'
import { useExperienceStore } from '../../store/experienceStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * StoryDirector
 *
 * Two separate responsibilities:
 *
 * 1. Global scroll-progress (0–1) → fed to WebGL / CameraRig via setScrollProgress.
 *    Uses a single ScrollTrigger on #story. This is NOT changed.
 *
 * 2. Active phase / active-nav highlight.
 *    Old approach: ScrollTrigger "top top" per section → fires when section
 *    top hits viewport top, which is the START of the animation, not the
 *    designed presentation frame. This caused nav to lag one chapter behind.
 *
 *    New approach: on every scroll event, measure each section's current
 *    geometry and find the one whose [sectionTop … sectionTop + offsetHeight]
 *    range contains the current scrollY + a small look-ahead offset (10% of
 *    viewport). This gives an "ownership" model: the chapter that most owns
 *    the current viewport position is active.
 *    The look-ahead matches the landingProgress concept — we consider a chapter
 *    active slightly before its pure top, which keeps the nav tight.
 */
export function StoryDirector() {
  const phase = useExperienceStore((state) => state.phase)
  const setPhase = useExperienceStore((state) => state.setPhase)
  const setScrollProgress = useExperienceStore((state) => state.setScrollProgress)
  const setExploration = useExperienceStore((state) => state.setExplorationMode)
  const selectHub = useExperienceStore((state) => state.selectHub)

  useEffect(() => {
    setExploration(phase === 'explore')
    if (phase !== 'explore') selectHub(null)
  }, [phase, setExploration, selectHub])

  useLayoutEffect(() => {
    const story = document.querySelector<HTMLElement>('#story')
    if (!story) return

    // Build element list sorted by DOM order (at values ascend with DOM order)
    const chapterElements = storyChapters
      .map((chapter) => ({
        chapter,
        element: document.getElementById(chapter.id),
      }))
      .filter((item): item is { chapter: (typeof storyChapters)[number]; element: HTMLElement } => item.element !== null)
      .sort((a, b) => a.chapter.at - b.chapter.at)

    // ── 1. Global progress tracker (unchanged — feeds WebGL) ──────────────
    const storyTrigger = ScrollTrigger.create({
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    // ── 2. Phase / active-nav from real scroll geometry ────────────────────
    const LOOK_AHEAD = 0.10  // treat chapter as active when viewport centre is within 10% past its top

    const resolveActiveChapter = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      // Use the midpoint of the viewport as the "ownership" probe
      const probe = scrollY + vh * LOOK_AHEAD

      let active = chapterElements[0].chapter.phase

      for (const { chapter, element } of chapterElements) {
        const top = element.getBoundingClientRect().top + scrollY
        const bottom = top + element.offsetHeight
        if (probe >= top && probe < bottom) {
          active = chapter.phase
          break
        }
        // If probe is past all sections, keep last
        if (probe >= top) active = chapter.phase
      }

      // Apply is-physically-active CSS class
      chapterElements.forEach(({ chapter, element }) => {
        element.classList.toggle('is-physically-active', chapter.phase === active)
      })

      // Update store phase if changed
      const currentPhase = useExperienceStore.getState().phase
      if (currentPhase !== active) {
        setPhase(active)
      }
    }

    // Run once on mount to set initial state
    resolveActiveChapter()

    // Listen for scroll events — this is lightweight (no per-event DOM layout
    // thrash: getBoundingClientRect is cheap on a static section element)
    window.addEventListener('scroll', resolveActiveChapter, { passive: true })

    return () => {
      chapterElements.forEach(({ element }) => element.classList.remove('is-physically-active'))
      storyTrigger.kill()
      window.removeEventListener('scroll', resolveActiveChapter)
    }
  }, [setPhase, setScrollProgress])

  return null
}
