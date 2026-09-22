import { useEffect, useState } from 'react'
import { chileCertifications, chileData, chileHistory, chileHubs } from '../data/chile'
import { peruData, peruHistory, peruHubs } from '../data/peru'
import { countryIdentity } from '../data/countryIdentity'
import { useExperienceStore } from '../store/experienceStore'
import { HubTooltip } from './HubTooltip'

type Layer = 'territory' | 'talent' | 'capabilities' | 'training' | 'history'

const layers: Array<{ id: Layer; label: string; num: string }> = [
  { id: 'territory', label: 'Territorio', num: '01' },
  { id: 'talent', label: 'Talento', num: '02' },
  { id: 'capabilities', label: 'Capacidades', num: '03' },
  { id: 'training', label: 'Formación', num: '04' },
  { id: 'history', label: 'Historia', num: '05' },
]

function Column({ country, children }: { country: 'peru' | 'chile'; children: React.ReactNode }) {
  const identity = countryIdentity[country]
  return (
    <article className={`compare-card compare-card--${country}`}>
      <header className="compare-card__header">
        <img src={identity.flag} alt="" />
        <div><strong>{identity.name}</strong><span>{identity.tagline}</span></div>
      </header>
      <div className="compare-card__content">{children}</div>
    </article>
  )
}

function TerritoryComparison() {
  return <>
    <Column country="peru">
      <p className="comparison-label">DISTRIBUCIÓN TERRITORIAL</p>
      <ul className="comparison-list">
        {peruData.territoryDistribution.regions.map((region) => (
          <li key={region.name}>
            <span>{region.name}</span>
            <strong>{region.hc} · {region.percentage}%</strong>
          </li>
        ))}
        <li className="comparison-total"><span>TOTAL</span><strong>{peruData.territoryDistribution.total} · 100%</strong></li>
      </ul>
    </Column>
    <Column country="chile">
      <p className="comparison-label">DISTRIBUCIÓN TERRITORIAL</p>
      <ul className="comparison-list">
        {chileData.territoryDistribution.regions.map((region) => (
          <li key={region.name}>
            <span>{region.name}</span>
            <strong>{region.hc} · {region.percentage}%</strong>
          </li>
        ))}
        <li className="comparison-total"><span>TOTAL</span><strong>{chileData.territoryDistribution.total} · 100%</strong></li>
      </ul>
    </Column>
  </>
}


function TalentComparison() {
  return <>
    <Column country="peru">
      <div className="comparison-stat"><strong>{peruData.hc.toLocaleString('es-PE')}</strong><span>HC</span></div>
      <div className="comparison-stat"><strong>{peruData.gender.femalePercent}%</strong><span>HC femenino</span></div>
      {Array.isArray(peruData.talent?.roles) && peruData.talent.roles.length > 0 && (
  <ul className="comparison-list">
    {peruData.talent.roles.map(role => (
      <li key={role.name}><span>{role.name}</span><strong>{role.hc} · {role.percentage}%</strong></li>
    ))}
  </ul>
)}
    </Column>
    <Column country="chile">
      <div className="comparison-stat"><strong>{chileData.gdneHC}</strong><span>GDN-e</span></div>
      <div className="comparison-stat"><strong>{chileData.peopleUnderManagement}</strong><span>Bajo gestión</span></div>
      <div className="comparison-stat"><strong>{chileData.femalePercent}%</strong><span>HC femenino</span></div>
    </Column>
  </>
}

function CapabilitiesComparison() {
  const peruCapabilities = Array.isArray(peruData.capabilities) ? peruData.capabilities : [];
  const chileCapabilities = Array.isArray(chileData.capabilities) ? chileData.capabilities : [];
  return <>
    <Column country="peru">
      <ul className="comparison-list">
        {peruCapabilities.map((item) => (
          <li key={item.name}>
            <span>{item.name}</span>
            <strong>{item.hc} · {item.percent}%</strong>
          </li>
        ))}
      </ul>
    </Column>
    <Column country="chile">
      <ul className="comparison-list">
        {chileCapabilities.map((item) => (
          <li key={item.name}>
            <span>{item.name}</span>
            <strong>{item.hc} · {item.percent}%</strong>
          </li>
        ))}
      </ul>
    </Column>
  </>
}

function TrainingComparison() {
  return <>
    <Column country="peru">
      <ul className="comparison-timeline">{peruData.certifications.map((item) => <li key={item.label}><small>{item.status}</small><strong>{item.value.toLocaleString('es-PE')}</strong><span>{item.label}</span></li>)}</ul>
    </Column>
    <Column country="chile">
      <ul className="comparison-timeline">{chileCertifications.map((item) => <li key={item.title}><small>{item.status ?? 'current'}</small><strong>{item.year}</strong><span>{item.title} · {item.detail}</span></li>)}</ul>
    </Column>
  </>
}

function HistoryComparison() {
  return <>
    <Column country="peru">
      <ul className="comparison-timeline">{peruHistory.map((item) => <li key={`${item.year}-${item.title}`}><strong>{item.year}</strong><span>{item.title} · {item.detail}</span></li>)}</ul>
    </Column>
    <Column country="chile">
      <ul className="comparison-timeline">{chileHistory.map((item) => <li key={`${item.year}-${item.title}`}><strong>{item.year}</strong><span>{item.title} · {item.detail}</span></li>)}</ul>
    </Column>
  </>
}

function ComparisonLayer({ layer }: { layer: Layer }) {
  const content = layer === 'territory' ? <TerritoryComparison />
    : layer === 'talent' ? <TalentComparison />
      : layer === 'capabilities' ? <CapabilitiesComparison />
        : layer === 'training' ? <TrainingComparison />
          : <HistoryComparison />
  return <div className="compare-stack">{content}</div>
}

export function CountryHUD() {
  const phase = useExperienceStore((state) => state.phase)
  const selectHub = useExperienceStore((state) => state.selectHub)
  const [layer, setLayer] = useState<Layer>('territory')
  const [exploreVisible, setExploreVisible] = useState(false)

  // Sync with physical #explore section visibility
  useEffect(() => {
    const exploreEl = document.getElementById('explore')
    if (!exploreEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setExploreVisible(entry.isIntersecting)
      },
      { threshold: 0.45 }
    )

    observer.observe(exploreEl)
    return () => observer.disconnect()
  }, [])

  const active = phase === 'explore' && exploreVisible

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') selectHub(null)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [selectHub])

  if (!active) return null

  const continueStory = () => {
    requestAnimationFrame(() => {
      document.getElementById('complementarity')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="country-hud country-hud--comparison" role="dialog" aria-modal="true" aria-label="Explorar Chile y Perú">
      <header className="chud-header">
        <span className="chud-chapter">05 · Explore</span>
        <div className="chud-flags"><img className="chud-flag" src={countryIdentity.chile.flag} alt="" /><img className="chud-flag" src={countryIdentity.peru.flag} alt="" /></div>
        <h2 className="chud-title">Chile + Perú</h2>
        <p className="chud-identity">Dos identidades. Una capacidad compartida.</p>
      </header>
      <nav className="chud-rail" aria-label="Capas de información">
        {layers.map((item) => <button key={item.id} className={`chud-rail__item ${layer === item.id ? 'is-active' : ''}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setLayer(item.id) }}><span className="chud-rail__num">{item.num}</span><span className="chud-rail__label">{item.label}</span></button>)}
      </nav>
      <section className="chud-panel chud-panel--comparison" aria-live="polite"><ComparisonLayer layer={layer} /></section>
      <div className="chud-actions"><button className="chud-continue" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); continueStory() }}>Continuar historia ↓</button></div>
      <HubTooltip />
    </div>
  )
}
