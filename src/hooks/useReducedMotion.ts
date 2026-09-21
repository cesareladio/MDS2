import { useEffect } from 'react'
import { useExperienceStore } from '../store/experienceStore'

export function useReducedMotion() {
  const setReducedMotion = useExperienceStore((state) => state.setReducedMotion)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [setReducedMotion])
}
