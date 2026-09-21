import { useEffect } from 'react'
import { useExperienceStore } from '../store/experienceStore'

export function useScrollProgress() {
  const setScrollProgress = useExperienceStore((state) => state.setScrollProgress)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? window.scrollY / max : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [setScrollProgress])
}
