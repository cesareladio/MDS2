import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useExperienceStore, type ExperiencePhase } from '../../store/experienceStore'

gsap.registerPlugin(ScrollTrigger)

const phaseStops: Array<{ phase: ExperiencePhase; at: number }> = [
  { phase: 'intro', at: 0 },
  { phase: 'global', at: 0.1 },
  { phase: 'latam', at: 0.25 },
  { phase: 'snapshot', at: 0.36 },
  { phase: 'explore', at: 0.46 },
  { phase: 'complementarity', at: 0.6 },
  { phase: 'ibiol', at: 0.72 },
  { phase: 'closing', at: 0.91 },
]

export function StoryDirector() {
  const setPhase = useExperienceStore((state) => state.setPhase)
  const setScrollProgress = useExperienceStore((state) => state.setScrollProgress)
  const explorationMode = useExperienceStore((state) => state.explorationMode)

  useLayoutEffect(() => {
    const story = document.querySelector<HTMLElement>('#story')
    if (!story) return
    const state = { progress: 0 }
    const timeline = gsap.timeline({ paused: true })
    phaseStops.forEach(({ phase, at }, index) => {
      timeline.addLabel(phase, at * 100)
      timeline.call(() => setPhase(phase), [], at * 100)
      if (index < phaseStops.length - 1) timeline.to(state, { progress: phaseStops[index + 1].at, duration: (phaseStops[index + 1].at - at) * 100, ease: 'none' })
    })
    const trigger = ScrollTrigger.create({
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      animation: timeline,
      onUpdate: (self) => {
        if (explorationMode) return
        setScrollProgress(self.progress)
        let current = phaseStops[0].phase
        for (const stop of phaseStops) if (self.progress >= stop.at) current = stop.phase
        setPhase(current)
      },
    })
    return () => { trigger.kill(); timeline.kill() }
  }, [explorationMode, setPhase, setScrollProgress])
  return null
}
