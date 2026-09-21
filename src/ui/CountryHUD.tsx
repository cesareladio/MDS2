import { useEffect, useState } from 'react'
import { chileCertifications, chileData, chileHistory, chileHubs } from '../data/chile'
import { peruData, peruDiversity, peruHistory, peruHubs } from '../data/peru'
import type { CountryId } from '../data/types'
import { useExperienceStore } from '../store/experienceStore'
import { Timeline } from './Timeline'
import { HubTooltip } from './HubTooltip'

type Layer = 'territory' | 'talent' | 'capabilities' | 'training' | 'history'
const layers: Array<{ id: Layer; label: string }> = [
  { id: 'territory', label: 'Territorio' }, { id: 'talent', label: 'Talento' }, { id: 'capabilities', label: 'Capacidades' }, { id: 'training', label: 'Formación' }, { id: 'history', label: 'Historia' },
]

function PeruLayer({ layer }: { layer: Layer }) {
  const selectHub = useExperienceStore((state) => state.selectHub)
  if (layer === 'territory') return <><p className="layer-intro">Selecciona un hub en el territorio o desde esta lista. El HC exacto por ciudad permanece pendiente.</p><div className="accessible-hubs">{peruHubs.map((hub) => <button key={hub.id} onClick={() => selectHub(hub.id)}>{hub.name}<span>Ver detalle →</span></button>)}</div></>
  if (layer === 'talent') return <div className="radial-stats">{peruData.roles.map((role) => <div key={role.role}><strong>{role.hc}</strong><span>{role.role}</span><small>{role.percent}%</small></div>)}</div>
  if (layer === 'capabilities') return <div className="word-field"><span>SAP</span><span>Testing</span><span>Data</span><span>Backend</span><span>Frontend</span><small>Capacidades cuantitativas · TBD</small></div>
  if (layer === 'training') return <div className="cert-grid">{peruData.certifications.map((item) => <div className={`status-${item.status}`} key={item.label}><small>{item.status}</small><strong>{item.value.toLocaleString('es-PE')}</strong><span>{item.label}</span></div>)}</div>
  return <Timeline items={layer === 'history' ? peruHistory : peruDiversity} />
}

function ChileLayer({ layer }: { layer: Layer }) {
  const selectHub = useExperienceStore((state) => state.selectHub)
  if (layer === 'territory') return <><div className="region-stack">{chileData.regions.map((item) => <div key={item.region}><span>{item.region}</span><i style={{ width: `${item.percent}%` }} /><strong>{item.hc}</strong><small>{item.percent}%</small></div>)}</div><div className="accessible-hubs accessible-hubs--compact">{chileHubs.map((hub) => <button key={hub.id} onClick={() => selectHub(hub.id)}>{hub.name}</button>)}</div></>
  if (layer === 'talent') return <div className="split-stat"><div><strong>510</strong><span>GDN-e</span></div><div><strong>609</strong><span>Bajo gestión</span></div><div><strong>15.9%</strong><span>HC femenino</span></div></div>
  if (layer === 'capabilities') return <div className="constellation-list">{chileData.capabilities.map((item) => <button key={item.name}><i style={{ transform: `scale(${0.6 + item.hc / 300})` }} /><strong>{item.hc}</strong><span>{item.name}</span><small>{item.percent ? `${item.percent}%` : 'HC confirmado'}</small></button>)}</div>
  if (layer === 'training') return <Timeline items={chileCertifications} />
  return <Timeline items={chileHistory} />
}

export function CountryHUD() {
  const active = useExperienceStore((state) => state.explorationMode)
  const country = useExperienceStore((state) => state.selectedCountry)
  const selectCountry = useExperienceStore((state) => state.selectCountry)
  const setExplorationMode = useExperienceStore((state) => state.setExplorationMode)
  const setPhase = useExperienceStore((state) => state.setPhase)
  const selectHub = useExperienceStore((state) => state.selectHub)
  const [layer, setLayer] = useState<Layer>('territory')

  useEffect(() => setLayer('territory'), [country])
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { selectHub(null); setExplorationMode(false) }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [selectHub, setExplorationMode])
  if (!active || !country) return null
  const switchCountry = (next: CountryId) => { selectHub(null); selectCountry(next) }
  const continueStory = () => {
    setPhase('complementarity')
    setExplorationMode(false)
    document.getElementById('complementarity')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <div className={`country-hud country-hud--${country}`} role="dialog" aria-modal="true" aria-label={`Explorar ${country === 'peru' ? 'Perú' : 'Chile'}`}>
      <header><span>05 · Explore</span><h2>{country === 'peru' ? 'Perú' : 'Chile'}</h2><p>{country === 'peru' ? 'Talento que impulsa el futuro' : 'Experiencia, especialización y talento distribuido'}</p></header>
      <nav aria-label="Capas de información">{layers.map((item, index) => <button key={item.id} className={layer === item.id ? 'is-active' : ''} onClick={() => setLayer(item.id)}><span>0{index + 1}</span>{item.label}</button>)}</nav>
      <section className="country-layer" aria-live="polite">{country === 'peru' ? <PeruLayer layer={layer} /> : <ChileLayer layer={layer} />}</section>
      <div className="country-actions">
        <button onClick={() => switchCountry(country === 'peru' ? 'chile' : 'peru')}>{country === 'peru' ? 'Explorar Chile' : 'Explorar Perú'} →</button>
        <button onClick={continueStory}>Continuar historia ↓</button>
      </div>
      <HubTooltip />
    </div>
  )
}
