import { useEffect } from 'react'
import { presentationData } from '../data/presentation'
import { countryIdentity } from '../data/countryIdentity'
import type { PartnerLogo, Studios } from '../data/types'
import { scrollToChapter } from '../lib/storyNavigation'
import { useExperienceStore, type OneGdneSection } from '../store/experienceStore'

const sections: Array<{ id: Exclude<OneGdneSection, 'overview'>; label: string; number: string }> = [
  { id: 'history', label: 'Nuestra historia', number: '01' },
  { id: 'territory', label: 'Territorio', number: '02' },
  { id: 'talent', label: 'Talento', number: '03' },
  { id: 'studios', label: 'Studios', number: '04' },
  { id: 'capabilities', label: 'Capacidades', number: '05' },
]

function CountryLabel({ country }: { country: 'peru' | 'chile' }) {
  const identity = countryIdentity[country]
  return <header className={`og-country-label og-country-label--${country}`}><img src={identity.flag} alt="" /><div><strong>{identity.name}</strong><span>{identity.tagline}</span></div></header>
}

function Overview() {
  const overview = presentationData.oneGdne.overview
  return <div className="og-view og-view--overview">
    <p className="og-overview__eyebrow">Una capacidad que conecta Chile + Perú</p>
    <strong className="og-overview__headline-hc">{overview.headlineHC.value}</strong>
    <span className="og-overview__headline-label">Talentos</span>
    <div className="og-overview__countries">
      <div className="og-overview__country og-overview__country--peru"><span>Perú</span><strong>{overview.peruHC.value.toLocaleString('es-PE')}</strong><small>Personas</small></div>
      <div className="og-overview__country og-overview__country--chile"><span>Chile</span><strong>{overview.chileHC.value}</strong><small>Personas</small></div>
    </div>
  </div>
}

function History() {
  const history = presentationData.oneGdne.history
  return <div className="og-view og-view--history">
    <h2>Dos historias<br />que hoy convergen<br /><em>en una misma capacidad</em></h2>
    <div className="og-history-grid">
      <div className="og-history-column og-history-column--chile"><CountryLabel country="chile" /><ol>{history.chile.map((event) => <li key={`${event.year}-${event.title}`}><time>{event.year}</time><div><strong>{event.title}</strong><p>{event.detail}</p></div></li>)}</ol></div>
      <div className="og-history-column og-history-column--peru"><CountryLabel country="peru" /><ol>{history.peru.map((event) => <li key={`${event.year}-${event.title}`}><time>{event.year}</time><div><strong>{event.title}</strong><p>{event.detail}</p></div></li>)}</ol></div>
    </div>
  </div>
}

function TerritoryCard({ country }: { country: 'peru' | 'chile' }) {
  const territory = presentationData.oneGdne.territory[country]
  const isPeru = country === 'peru'
  const primaryRegions = isPeru ? new Set(['La Libertad (Trujillo)', 'Arequipa']) : new Set(['Araucanía', 'Biobío'])
  return <article className={`og-territory-hud og-territory-hud--${country}`}>
    <CountryLabel country={country} />
    <div className="og-territory-hud__insight">
      <div className="og-territory-hud__arc" aria-hidden="true"><i /></div>
      <div><strong>{territory.principalShare.value}%</strong><span>{isPeru ? 'La Libertad + Arequipa' : 'Araucanía + Biobío'}</span></div>
    </div>
    <strong className="og-territory-hud__total">{territory.total.value.toLocaleString('es-PE')}<small>personas</small></strong>
    <ul className="og-territory-hud__regions">
      {territory.regions.map((region) => {
        const percent = 'percent' in region && region.percent !== undefined ? region.percent : region.value
        const pending = region.value === null
        const prominent = primaryRegions.has(region.name)
        return <li key={region.name} className={`${pending ? 'is-pending' : ''} ${prominent ? 'is-primary' : ''}`.trim()}>
          <span>{region.name}</span>
          <strong>{pending ? 'Por validar' : region.value}</strong>
          <b>{pending ? '' : `${percent}%`}</b>
          <i><em style={{ width: pending ? '100%' : `${percent}%` }} /></i>
        </li>
      })}
    </ul>
    <p className="og-territory-hud__message">{isPeru ? 'Talento distribuido' : 'Talento regional'}<small>{isPeru ? 'Más allá de las capitales.' : 'Fuertemente conectado al sur.'}</small></p>
  </article>
}

function Territory() {
  return <div className="og-view og-view--territory og-view--territory-map">
    <h2>Talento tecnológico<br /><em>desde las regiones</em></h2>
    <div className="og-territory-huds"><TerritoryCard country="peru" /><TerritoryCard country="chile" /></div>
  </div>
}

function TalentFunnel({ country, levels }: { country: 'peru' | 'chile'; levels: Array<{ name: string; value: number | null; percent?: number }> }) {
  const widths = ['42%', '68%', '100%']
  return <div className={`og-talent-funnel og-talent-funnel--${country}`}><strong className="og-talent-funnel__title">ESTRUCTURA GDN-e</strong><div className="og-talent-funnel__pyramid">{levels.map((level, index) => <div key={level.name} className={`og-talent-funnel__level og-talent-funnel__level--${index + 1}`} style={{ width: widths[index] ?? '100%' }}><div className="og-talent-funnel__level-surface"><span>{level.name}</span><strong>{level.value === null ? 'Por validar' : `${level.value}${level.percent ? ` · ${level.percent}%` : ''}`}</strong></div></div>)}</div></div>
}

function TalentCard({ country }: { country: 'peru' | 'chile' }) {
  const data = presentationData.oneGdne.talent[country]
  const pendingLevels = [{ name: 'Executive', value: null }, { name: 'Lead', value: null }, { name: 'Contributor', value: null }]
  const levels = 'pyramid' in data ? data.pyramid : pendingLevels
  return <article className={`og-talent-card og-talent-card--${country}`}>
    <CountryLabel country={country} />
    <div className="og-talent-card__metrics"><strong>{data.total.value.toLocaleString('es-PE')}</strong><span>personas</span><small>{data.femaleRepresentation.value} representación femenina</small></div>
    <ul>{data.families.map((family) => <li key={family.name}><div><span>{family.name}</span><i><b style={{ width: `${family.percent}%` }} /></i></div><strong>{family.value} <small>/ {family.percent}%</small></strong></li>)}</ul>
    <TalentFunnel country={country} levels={levels} />
  </article>
}

function Talent() {
  const combined = presentationData.oneGdne.talentCombined
  return <div className="og-view og-view--talent"><h2>Más de 2.000 personas<br />construyendo nuestra<br /><em>capacidad tecnológica</em></h2><div className="og-combined-kpi"><strong>{combined.value.toLocaleString('es-PE')}</strong><span>Talentos</span></div><div className="og-talent-grid"><TalentCard country="peru" /><TalentCard country="chile" /></div></div>
}

function StudiosHighlights({ title, items }: { title: string; items: string[] }) {
  const hasItems = items.length > 0
  return <div className="og-highlights og-highlights--studios"><strong className="og-highlights__title">{title}</strong>{hasItems ? <ul>{items.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul> : <div className="og-highlights__pending"><span>DATA POR CONFIRMAR</span><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /></div>}</div>
}

function StudiosCard({ country, studios }: { country: 'peru' | 'chile'; studios: Studios }) {
  if (studios.status === 'pending_validation') return <article className={`og-studios-card og-studios-card--${country}`}><CountryLabel country={country} /><div className="og-studios-card__meta"><strong>{studios.focusCount} Studios</strong></div><p className="og-studios-card__pending-copy">Distribución de talento<br />DATA POR CONFIRMAR</p>{studios.highlights && <StudiosHighlights title={studios.highlights.title} items={studios.highlights.items} />}</article>
  return <article className={`og-studios-card og-studios-card--${country}`}><CountryLabel country={country} /><div className="og-studios-card__meta"><strong>{studios.focusCount} Studios</strong><span>{studios.totalTalent.toLocaleString('es-PE')} talentos</span></div><ul>{studios.groups.map((group) => <li key={group.id}><div><span>{group.name}</span><strong>{group.totalHc}</strong></div>{group.subgroups && <small>{group.subgroups.map((sub) => `${sub.name} ${sub.hc}`).join(' · ')}</small>}</li>)}</ul>{studios.highlights && <StudiosHighlights title={studios.highlights.title} items={studios.highlights.items} />}</article>
}

function StudiosView() {
  const studios = presentationData.oneGdne.studios
  return <div className="og-view og-view--studios"><h2>Dónde se concentra<br />nuestra <em>capacidad tecnológica</em></h2><div className="og-studios-grid"><StudiosCard country="peru" studios={studios.peru} /><StudiosCard country="chile" studios={studios.chile} /></div><p className="og-closing-line">{studios.editorialLine}</p></div>
}

function CapabilityHighlights({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return <div className="og-highlights og-highlights--studios"><strong className="og-highlights__title">{title}</strong><ul>{items.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
}

function CapabilityPartners({ partners }: { partners?: PartnerLogo[] }) {
  if (!partners || partners.length === 0) return null
  return <div className="og-capability-partners"><span>Tecnologías / Certificaciones</span><div>{partners.map((partner) => <img key={partner.name} src={partner.logo} alt={partner.name} />)}</div></div>
}

function Capabilities() {
  const data = presentationData.oneGdne.capabilities
  return <div className="og-view og-view--capabilities"><h2>Talento en<br /><em>constante evolución</em></h2><ol className="og-capability-pipeline">{data.funnel.map((stage) => <li key={stage}>{stage}</li>)}</ol><div className="og-capability-concepts"><span>Talento</span><span>Profundidad</span><span>Aplicación</span><span>Impacto</span></div><div className="og-capabilities-grid"><article className="og-capability-card og-capability-card--peru"><CountryLabel country="peru" /><strong>{data.peru.certifications.value}</strong><span>{data.peru.certifications.label}</span><CapabilityHighlights title="HIGHLIGHTS" items={data.peru.highlights} /><CapabilityPartners partners={data.peru.partners} /><p>{data.peru.progression}</p></article><article className="og-capability-card og-capability-card--chile"><CountryLabel country="chile" /><strong>{data.chile.certifiedPeople.value}</strong><span>personas o certificaciones · por validar</span><CapabilityHighlights title="HIGHLIGHTS" items={data.chile.highlights} /><CapabilityPartners partners={data.chile.partners} /><p>{data.chile.progression}</p></article></div></div>
}

function View({ section }: { section: OneGdneSection }) {
  if (section === 'history') return <History />
  if (section === 'territory') return <Territory />
  if (section === 'talent') return <Talent />
  if (section === 'studios') return <StudiosView />
  if (section === 'capabilities') return <Capabilities />
  return <Overview />
}

export function OneGdneScene() {
  const phase = useExperienceStore((state) => state.phase)
  const section = useExperienceStore((state) => state.selectedOneGdneSection)
  const select = useExperienceStore((state) => state.setSelectedOneGdneSection)
  const reset = useExperienceStore((state) => state.resetOneGdneSection)
  const active = phase === 'oneGdne'

  useEffect(() => {
    if (phase !== 'oneGdne') reset()
  }, [phase, reset])

  if (!active) return null

  return <div className="one-gdne-scene" aria-label="One GDN-e">
    <header className="one-gdne-scene__intro"><p><span>03</span> ONE GDN-e</p></header>
    <nav className="one-gdne-rail" aria-label="Explorar ONE GDN-e">
      {sections.map((item) => <button key={item.id} className={section === item.id ? 'is-active' : ''} onClick={() => select(item.id)}><span>{item.number}</span>{item.label}</button>)}
    </nav>
    <div className={`one-gdne-content one-gdne-content--${section}`} key={section}><View section={section} /></div>
    {section === 'capabilities' && <button className="one-gdne-continue" onClick={() => scrollToChapter('efficiency')}>Continuar historia ↓</button>}
  </div>
}
