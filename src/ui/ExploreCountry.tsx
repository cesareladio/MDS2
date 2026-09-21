import type { CountryId } from '../data/types'
import { useExperienceStore } from '../store/experienceStore'

export function ExploreCountry() {
  const selectCountry = useExperienceStore((state) => state.selectCountry)
  const setExplorationMode = useExperienceStore((state) => state.setExplorationMode)
  const setPhase = useExperienceStore((state) => state.setPhase)
  const enter = (country: CountryId) => { setPhase('explore'); selectCountry(country); setExplorationMode(true) }
  return (
    <div className="country-select" aria-label="Selecciona un país">
      <p>Select a country</p>
      <div>
        <button className="country-choice country-choice--peru" onClick={() => enter('peru')}><span>01</span><strong>Perú</strong><small>Escala · talento · crecimiento</small><i>Explorar →</i></button>
        <button className="country-choice country-choice--chile" onClick={() => enter('chile')}><span>02</span><strong>Chile</strong><small>Madurez · especialización · territorio</small><i>Explorar →</i></button>
      </div>
    </div>
  )
}
