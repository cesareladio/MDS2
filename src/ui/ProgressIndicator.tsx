import { storyChapters } from '../data/story'
import { scrollToStoryProgress } from '../lib/storyNavigation'
import { useExperienceStore } from '../store/experienceStore'
import { BrandLogo } from './BrandLogo'

export function ProgressIndicator() {
  const phase   = useExperienceStore((state) => state.phase)

  const jump = (at: number) => {
    scrollToStoryProgress(at)
  }

  return (
    <nav className="progress-nav" aria-label="Navegación de la historia">
      <div className="progress-brand">
        <BrandLogo className="progress-brand__logo" decorative />
        <span>Chile + Perú · One GDN-e</span>
      </div>
      <div className="progress-track">
        {storyChapters.map((chapter) => (
          <button
            key={chapter.id}
            className={phase === chapter.phase ? 'is-active' : ''}
            onClick={() => jump(chapter.presentationAt)}
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
