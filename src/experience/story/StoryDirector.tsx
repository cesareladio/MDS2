import { useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useExperienceStore, type ExperiencePhase } from '../../store/experienceStore'

gsap.registerPlugin(ScrollTrigger)

const phaseStops: Array<{ phase: ExperiencePhase; at: number }> = [
  { phase: 'intro', at: 0.00 },
  { phase: 'global', at: 0.10 },
  { phase: 'latam', at: 0.25 },
  { phase: 'snapshot', at: 0.36 },
  { phase: 'explore', at: 0.46 },
  { phase: 'complementarity', at: 0.58 },
  { phase: 'engine', at: 0.70 },
  { phase: 'ibiol', at: 0.80 },
  { phase: 'closing', at: 0.925 },
]

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

    const trigger = ScrollTrigger.create({
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = self.progress
        setScrollProgress(progress)
        let current = phaseStops[0].phase
        for (const stop of phaseStops) {
          if (progress >= stop.at) current = stop.phase
        }
        const currentState = useExperienceStore.getState()
        if (currentState.phase !== current) {
          setPhase(current)
        }
      },
    })

    return () => trigger.kill()
  }, [setPhase, setScrollProgress])

  return null
}
