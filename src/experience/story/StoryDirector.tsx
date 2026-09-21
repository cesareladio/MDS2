import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { storyChapters } from '../../data/story'
import { useExperienceStore } from '../../store/experienceStore'

gsap.registerPlugin(ScrollTrigger)

export function StoryDirector() {
  const phase = useExperienceStore((state) => state.phase)
  const previousPhaseRef = useRef(phase)
  const setPhase = useExperienceStore((state) => state.setPhase)
  const setScrollProgress = useExperienceStore((state) => state.setScrollProgress)
  const setExploration = useExperienceStore((state) => state.setExplorationMode)
  const selectHub = useExperienceStore((state) => state.selectHub)
  const selectCapability = useExperienceStore((state) => state.selectCapability)

  useEffect(() => {
    const previousPhase = previousPhaseRef.current
    setExploration(phase === 'explore')
    if (phase !== 'explore') selectHub(null)
    if (previousPhase === 'engine' && phase === 'ibiol') selectCapability(null)
    previousPhaseRef.current = phase
  }, [phase, setExploration, selectHub, selectCapability])

  useLayoutEffect(() => {
    const story = document.querySelector<HTMLElement>('#story')
    if (!story) return

    const chapterElements = storyChapters
      .map((chapter) => ({
        chapter,
        element: document.getElementById(chapter.id),
      }))
      .filter((item): item is { chapter: (typeof storyChapters)[number]; element: HTMLElement } => item.element !== null)
      .sort((a, b) => a.chapter.at - b.chapter.at)

    const setPhysicalActiveChapter = (activePhase: typeof storyChapters[number]['phase']) => {
      chapterElements.forEach(({ chapter, element }) => {
        element.classList.toggle('is-physically-active', chapter.phase === activePhase)
      })
    }

    const storyTrigger = ScrollTrigger.create({
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    const chapterTriggers = chapterElements.map(({ chapter, element }) => {
      const activatePhase = () => {
        const currentPhase = useExperienceStore.getState().phase
        const currentProgress = useExperienceStore.getState().scrollProgress
        setPhysicalActiveChapter(chapter.phase)
        if (currentPhase !== chapter.phase) {
          // console.debug('[phase-change]', currentPhase, '→', chapter.phase, 'at', currentProgress.toFixed(3))
          setPhase(chapter.phase)
        }
      }

      return ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: 'bottom top',
        onEnter: activatePhase,
        onEnterBack: activatePhase,
      })
    })

    const syncPhaseFromProgress = () => {
      const progress = useExperienceStore.getState().scrollProgress
      const current = chapterElements.reduce((acc, item) => (progress >= item.chapter.at ? item.chapter.phase : acc), chapterElements[0].chapter.phase)
      const currentPhase = useExperienceStore.getState().phase
      setPhysicalActiveChapter(current)
      if (currentPhase !== current) {
        // console.debug('[phase-change]', currentPhase, '→', current, 'at', progress.toFixed(3))
        setPhase(current)
      }
    }

    syncPhaseFromProgress()

    const currentPhase = useExperienceStore.getState().phase
    setPhysicalActiveChapter(currentPhase)

    return () => {
      chapterElements.forEach(({ element }) => element.classList.remove('is-physically-active'))
      storyTrigger.kill()
      chapterTriggers.forEach((trigger) => trigger.kill())
    }
  }, [setPhase, setScrollProgress])

  return null
}
