import { capabilities } from '../data/capabilities'
import { useExperienceStore } from '../store/experienceStore'

export function CapabilityHUD() {
  const selected = useExperienceStore((state) => state.selectedCapability)
  const phase = useExperienceStore((state) => state.phase)
  const selectCapability = useExperienceStore((state) => state.selectCapability)
  const item = capabilities.find((capability) => capability.id === selected)
  if (!item || phase !== 'ibiol') return null
  return (
    <aside className="capability-hud" aria-live="polite">
      <button onClick={() => selectCapability(null)} aria-label="Cerrar capability">×</button>
      <span>Capability · validación pendiente</span>
      <h3>{item.name}</h3>
      <dl><div><dt>Chile contribution</dt><dd>{item.chile}</dd></div><div><dt>Perú contribution</dt><dd>{item.peru}</dd></div><div><dt>People</dt><dd>TBD</dd></div><div><dt>Certifications</dt><dd>TBD</dd></div></dl>
    </aside>
  )
}
