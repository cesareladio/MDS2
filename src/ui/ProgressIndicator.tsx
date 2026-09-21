import { storyChapters } from '../data/story'
import { useExperienceStore } from '../store/experienceStore'

export function ProgressIndicator() {
  const phase   = useExperienceStore((state) => state.phase)
  const setPhase = useExperienceStore((state) => state.setPhase)
  const scroll = useExperienceStore((state) => state.scrollProgress)

  const jump = (id: string, nextPhase: typeof phase) => {
    setPhase(nextPhase)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navOpacity = Math.min(1, Math.max(0, (scroll - 0.1) / 0.1))

  return (
    <nav className="progress-nav" style={{ opacity: navOpacity }} aria-label="Navegación de la historia">
      <div className="progress-brand">
        NTT <strong>DATA</strong>
        <span>Chile + Perú · One GDN-e</span>
      </div>
      <div className="progress-track">
        {storyChapters.map((chapter) => (
          <button
            key={chapter.id}
            className={phase === chapter.phase ? 'is-active' : ''}
            onClick={() => jump(chapter.id, chapter.phase as typeof phase)}
            aria-label={`Ir a ${chapter.short}`}
          >
            <i />
            <span>{chapter.index}</span>
            <small>{chapter.short}</small>
          </button>
        ))}
      </div>
    </nav>
  )
}
