import type { CountryId } from '../data/types'
import { useExperienceStore } from '../store/experienceStore'

/**
 * ExploreCountry
 * The primary interaction is clicking Peru/Chile directly on the 3D globe.
 * This component is an accessible DOM fallback — visually minimal, kept
 * for keyboard/screen-reader users who cannot interact with the canvas.
 */
export function ExploreCountry() {
  const selectCountry  = useExperienceStore((state) => state.selectCountry)
  const setExploration = useExperienceStore((state) => state.setExplorationMode)
  const setPhase       = useExperienceStore((state) => state.setPhase)
  const enter = (country: CountryId) => {
    setPhase('explore')
    selectCountry(country)
    setExploration(true)
  }
  return (
    <div className="country-select" aria-label="Selecciona un país">
      <p className="country-select__hint">
        Haz clic en el territorio en el globo, o selecciona abajo
      </p>
      <div className="country-select__actions" role="group" aria-label="Selección de país">
        <button
          className="country-choice country-choice--peru"
          onClick={() => enter('peru')}
        >
          <span>01</span>
          <strong>Perú</strong>
          <small>Escala · talento · crecimiento</small>
          <i>Explorar →</i>
        </button>
        <button
          className="country-choice country-choice--chile"
          onClick={() => enter('chile')}
        >
          <span>02</span>
          <strong>Chile</strong>
          <small>Madurez · especialización · territorio</small>
          <i>Explorar →</i>
        </button>
      </div>
    </div>
  )
}
