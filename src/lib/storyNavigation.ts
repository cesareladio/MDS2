import { storyChapters } from '../data/story'

/**
 * In-flight navigation token.
 * Incrementing this on every new click makes any rAF callback from a
 * superseded click a no-op, preventing two competing smooth scrolls.
 */
let _navToken = 0

/**
 * scrollToChapter — lands on the designed presentation frame of a chapter.
 *
 * Formula:
 *   elementTop = window.scrollY + element.getBoundingClientRect().top
 *   offsetPx   = (chapter.navOffsetVh / 100) * window.innerHeight
 *   targetY    = clamp(elementTop + offsetPx, 0, maxScroll)
 *
 * navOffsetVh is a DIRECT vh addition to the section's absolute top.
 * It is independent of section height, so it works correctly even when
 * a section renders at exactly 100svh (scrollRange would be 0 — the old
 * landingProgress × scrollRange formula was silently multiplied by zero
 * for those sections, making any data changes have no visible effect).
 *
 * chapter.at is intentionally never read here — it belongs to WebGL/CameraRig.
 */
export function scrollToChapter(chapterId: string) {
  _navToken++
  const myToken = _navToken

  const section = document.getElementById(chapterId)
  if (!section) return

  const chapter = storyChapters.find((c) => c.id === chapterId)
  const navOffsetVh = chapter?.navOffsetVh ?? 0

  const elementTop = window.scrollY + section.getBoundingClientRect().top
  const offsetPx   = (navOffsetVh / 100) * window.innerHeight
  const rawTarget  = elementTop + offsetPx

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  const targetY   = Math.round(Math.min(maxScroll, Math.max(0, rawTarget)))

  if (Math.abs(window.scrollY - targetY) < 2) return

  // Snap-stop any in-progress scroll, then issue the new one.
  window.scrollTo({ top: window.scrollY, behavior: 'instant' as ScrollBehavior })

  requestAnimationFrame(() => {
    if (myToken !== _navToken) return
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  })
}
