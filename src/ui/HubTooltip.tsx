import { chileHubs } from '../data/chile'
import { peruHubs } from '../data/peru'
import { useExperienceStore } from '../store/experienceStore'

export function HubTooltip() {
  const selectedHub = useExperienceStore((state) => state.selectedHub)
  const selectHub = useExperienceStore((state) => state.selectHub)
  if (!selectedHub) return null
  const peruHub = peruHubs.find((item) => item.id === selectedHub)
  const chileHub = chileHubs.find((item) => item.id === selectedHub)
  const hub = peruHub ?? chileHub
  const country = peruHub ? 'peru' : chileHub ? 'chile' : null
  if (!hub || !country) return null
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
