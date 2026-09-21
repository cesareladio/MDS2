import gsap from 'gsap'

export function scrollToStoryProgress(progress: number) {
  const story = document.querySelector<HTMLElement>('#story')
  if (!story) return

  const storyTop = story.getBoundingClientRect().top + window.scrollY
  const scrollableDistance = story.scrollHeight - window.innerHeight
  const epsilonPx = progress > 0 ? 2 : 0
  const target = storyTop + scrollableDistance * progress + epsilonPx

  gsap.to(window, {
    scrollTo: { y: target, autoKill: false },
    duration: 0.9,
    ease: 'power2.inOut',
    overwrite: 'auto',
    onComplete: () => {
      window.scrollTo({ top: Math.round(target), behavior: 'auto' })
    },
  })
}
