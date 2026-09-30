/**
 * storyChapters — canonical chapter registry.
 *
 * at           → WebGL / camera interpolation boundary (0–1 of full story scroll).
 *                Do NOT use for nav clicks.
 *
 * navOffsetVh  → direct viewport-height offset added to the section's absolute top
 *                by scrollToChapter(). Positive = scroll further down into the section.
 *                This is the ONLY field that controls navbar landing position.
 *
 *                Formula used at runtime:
 *                  elementTop = window.scrollY + element.getBoundingClientRect().top
 *                  offsetPx   = (navOffsetVh / 100) * window.innerHeight
 *                  targetY    = elementTop + offsetPx
 */
export const storyChapters = [
  { id: 'intro',      index: '01', short: 'Intro',      phase: 'intro',      at: 0.00, navOffsetVh:  0.0 },
  { id: 'chilePeru',  index: '02', short: 'Chile+Perú', phase: 'chilePeru',  at: 0.09, navOffsetVh:  3.0 },
  { id: 'history',    index: '03', short: 'Historia',   phase: 'history',    at: 0.22, navOffsetVh:  3.5 },
  { id: 'territory',  index: '04', short: 'Territorio', phase: 'territory',  at: 0.35, navOffsetVh:  3.5 },
  { id: 'explore',    index: '05', short: 'Explore',    phase: 'explore',    at: 0.48, navOffsetVh:  0.0 },
  { id: 'efficiency', index: '06', short: 'Eficiencia', phase: 'efficiency', at: 0.62, navOffsetVh:  3.5 },
  { id: 'challenges', index: '07', short: 'Desafíos',   phase: 'challenges', at: 0.76, navOffsetVh:  0.0 },
  { id: 'closing',    index: '08', short: 'One team',   phase: 'closing',    at: 0.90, navOffsetVh:  0.0 },
] as const
