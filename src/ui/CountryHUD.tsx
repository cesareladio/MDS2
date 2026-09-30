import { useEffect, useState } from 'react'
import { presentationData } from '../data/presentation'
import { countryIdentity } from '../data/countryIdentity'
import { scrollToChapter } from '../lib/storyNavigation'
import { useExperienceStore } from '../store/experienceStore'
import { HubTooltip } from './HubTooltip'

type Layer = 'talent' | 'studios' | 'capabilities'

const layers: Array<{ id: Layer; label: string; num: string }> = [
  { id: 'talent', label: 'Talento', num: '01' },
  { id: 'studios', label: 'Studios', num: '02' },
  { id: 'capabilities', label: 'Capacidades', num: '03' },
]

const PYRAMID_TIERS = ['executive', 'lead', 'contributor'] as const
const PYRAMID_LABEL: Record<(typeof PYRAMID_TIERS)[number], string> = {
  executive: 'Executive',
  lead: 'Lead',
  contributor: 'Contributor',
}
const PYRAMID_WIDTH: Record<(typeof PYRAMID_TIERS)[number], string> = {
  executive: '36%',
  lead: '64%',
  contributor: '100%',
}

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

function TalentPyramid({ country }: { country: 'peru' | 'chile' }) {
  const pyramid = presentationData[country].talent.pyramid
  return (
    <div className="talent-pyramid">
      {PYRAMID_TIERS.map((tier) => {
        const tierData = pyramid[tier] as { status: string; hc?: number }
        const value = tierData.status === 'current' && typeof tierData.hc === 'number' ? tierData.hc : null
        return (
          <div key={tier} className={`talent-pyramid__tier talent-pyramid__tier--${tier}`} style={{ width: PYRAMID_WIDTH[tier] }}>
            <span className="talent-pyramid__label">{PYRAMID_LABEL[tier]}</span>
            <strong>{value !== null ? value : 'Validación pendiente'}</strong>
          </div>
        )
      })}
    </div>
  )
}

function TalentFamilies({ country }: { country: 'peru' | 'chile' }) {
  const families = presentationData[country].talent.families
  return (
    <ul className="comparison-list talent-families">
      {families.map((family) => (
        <li key={family.name}>
          <span>{family.name}</span>
          <strong>{family.hc} · {Math.round(family.percent * 10) / 10}%</strong>
        </li>
      ))}
    </ul>
  )
}

function TalentComparison() {
  return <>
    <Column country="peru">
      <TalentPyramid country="peru" />
      <TalentFamilies country="peru" />
    </Column>
    <Column country="chile">
      <TalentPyramid country="chile" />
      <TalentFamilies country="chile" />
    </Column>
  </>
}

function StudiosList({ country }: { country: 'peru' | 'chile' }) {
  const studios = presentationData[country].studios
  return (
    <ul className="studios-list">
      {studios.map((studio) => (
        <li key={studio.name}>
          <div className="studios-list__row">
            <span>{studio.name}</span>
            {studio.status === 'current' && 'hc' in studio && <strong>{studio.hc}</strong>}
          </div>
          <small>{studio.focus}</small>
        </li>
      ))}
    </ul>
  )
}

function StudiosComparison() {
  return <>
    <Column country="peru"><StudiosList country="peru" /></Column>
    <Column country="chile"><StudiosList country="chile" /></Column>
  </>
}

function CapabilitiesFunnel({ country }: { country: 'peru' | 'chile' }) {
  const data = presentationData[country]
  const funnel = presentationData.capabilities.funnel
  return (
    <div className="capabilities-funnel">
      <ol className="capabilities-funnel__stages">
        {funnel.map((stage) => <li key={stage}>{stage}</li>)}
      </ol>
      <ul className="comparison-timeline">
        {data.certifications.map((item) => {
          const label = 'label' in item ? item.label : item.title
          const value = 'value' in item ? item.value : item.year
          return (
            <li key={`${label}-${value}`}>
              <small>{item.status ?? 'current'}</small>
              <strong>{value}</strong>
              <span>{label}{'detail' in item ? ` · ${item.detail}` : ''}</span>
            </li>
          )
        })}
      </ul>
      {country === 'chile' && (
        <p className="comparison-note">
          Foco de especialización (pendiente de validación): {presentationData.chile.certificationFocus.areas.join(' · ')}
        </p>
      )}
      {country === 'peru' && (
        <p className="comparison-note">Foco estratégico: SAP &amp; Enterprise Solutions</p>
      )}
    </div>
  )
}

function CapabilitiesComparison() {
  return <>
    <Column country="peru"><CapabilitiesFunnel country="peru" /></Column>
    <Column country="chile"><CapabilitiesFunnel country="chile" /></Column>
  </>
}

function ComparisonLayer({ layer }: { layer: Layer }) {
  const content = layer === 'talent' ? <TalentComparison />
    : layer === 'studios' ? <StudiosComparison />
      : <CapabilitiesComparison />
  return <div className="compare-stack">{content}</div>
}

export function CountryHUD() {
  const phase = useExperienceStore((state) => state.phase)
  const selectHub = useExperienceStore((state) => state.selectHub)
  const [layer, setLayer] = useState<Layer>('talent')
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
      scrollToChapter('efficiency')
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
