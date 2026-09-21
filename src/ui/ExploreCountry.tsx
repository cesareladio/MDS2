import type { CountryId } from '../data/types'
import { useExperienceStore } from '../store/experienceStore'

/**
 * ExploreCountry
 * The primary interaction is clicking Peru/Chile directly on the 3D globe.
 * This component is an accessible DOM fallback — visually minimal, kept
 * for keyboard/screen-reader users who cannot interact with the canvas.
 */
export function ExploreCountry() {
  const phase          = useExperienceStore((state) => state.phase)
  const selectCountry  = useExperienceStore((state) => state.selectCountry)
  const setExploration = useExperienceStore((state) => state.setExplorationMode)
  const setPhase       = useExperienceStore((state) => state.setPhase)
  
  if (phase !== 'explore') return null

  const enter = (country: CountryId) => {
    setPhase('explore')
    selectCountry(country)
    setExploration(true)
  }
  return (
    <div className="country-select" aria-label="Selecciona un país">
      <p className="country-select__hint">
        Click on the territory
      </p>
      <div className="country-select__compact" role="group" aria-label="Country selection">
        <button className="country-select__btn country-select__btn--peru" onClick={() => enter('peru')}>
          Perú
        </button>
        <span className="country-select__divider">·</span>
        <button className="country-select__btn country-select__btn--chile" onClick={() => enter('chile')}>
          Chile
        </button>
      </div>
    </div>
  )
}
