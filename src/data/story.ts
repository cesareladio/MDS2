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
  { id: 'intro',      index: '01', short: 'Intro',      phase: 'intro',      at: 0.00, navOffsetVh: 0.0 },
  { id: 'chilePeru',  index: '02', short: 'Chile+Perú', phase: 'chilePeru',  at: 0.12, navOffsetVh: 3.0 },
  { id: 'oneGdne',    index: '03', short: 'One GDN-e',  phase: 'oneGdne',    at: 0.26, navOffsetVh: 3.5 },
  { id: 'efficiency', index: '04', short: 'Eficiencia', phase: 'efficiency', at: 0.46, navOffsetVh: 3.5 },
  { id: 'value',      index: '05', short: 'Valor',      phase: 'value',      at: 0.62, navOffsetVh: 3.5 },
  { id: 'challenges', index: '06', short: 'Desafíos',   phase: 'challenges', at: 0.78, navOffsetVh: 3.0 },
  { id: 'closing',    index: '07', short: 'One team',   phase: 'closing',    at: 0.91, navOffsetVh: 0.0 },
] as const
