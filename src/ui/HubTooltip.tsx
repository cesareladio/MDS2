import { chileHubs } from '../data/chile'
import { peruHubs } from '../data/peru'
import { useExperienceStore } from '../store/experienceStore'

export function HubTooltip() {
  const country = useExperienceStore((state) => state.selectedCountry)
  const selectedHub = useExperienceStore((state) => state.selectedHub)
  const selectHub = useExperienceStore((state) => state.selectHub)
  if (!country || !selectedHub) return null
  const hub = (country === 'peru' ? peruHubs : chileHubs).find((item) => item.id === selectedHub)
  if (!hub) return null
  return (
    <aside className="hub-tooltip" aria-live="polite">
      <button onClick={() => selectHub(null)} aria-label="Cerrar detalle">×</button>
      <span>Hub / ubicación</span>
      <h3>{hub.name}</h3>
      <strong>{hub.hc == null ? 'HC · por confirmar' : `${hub.hc} personas*`}</strong>
      <p>{hub.note}</p>
      {country === 'chile' && <small>*Dato regional aproximado, no HC exclusivo de la ciudad.</small>}
    </aside>
  )
}
