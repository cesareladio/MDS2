import { useEffect, useState } from 'react'
import { presentationData } from '../data/presentation'
import { countryIdentity } from '../data/countryIdentity'
import type { HighlightList, PartnerLogo, Studios } from '../data/types'
import { scrollToChapter } from '../lib/storyNavigation'
import { useExperienceStore, type OneGdneSection } from '../store/experienceStore'

function formatPercent(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1).replace('.', ',')}%`
}

function LocalSubNav<T extends string>({ options, active, onSelect, className }: { options: Array<{ id: T; label: string }>; active: T; onSelect: (id: T) => void; className: string }) {
  return <div className={`og-subnav ${className}`} role="tablist">{options.map((opt) => <button key={opt.id} type="button" role="tab" aria-selected={active === opt.id} className={active === opt.id ? 'is-active' : ''} onClick={() => onSelect(opt.id)}>{opt.label}</button>)}</div>
}

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
  return <div className={`og-talent-funnel og-talent-funnel--${country}`}><strong className="og-talent-funnel__title">ESTRUCTURA GDN-e</strong><div className="og-talent-funnel__pyramid">{levels.map((level, index) => <div key={level.name} className={`og-talent-funnel__level og-talent-funnel__level--${index + 1}`} style={{ width: widths[index] ?? '100%' }}><div className="og-talent-funnel__level-surface"><span>{level.name}</span><strong>{level.value === null ? 'Por validar' : `${level.value.toLocaleString('es-PE')}${level.percent !== undefined ? ` · ${formatPercent(level.percent)}` : ''}`}</strong></div></div>)}</div></div>
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

function TalentDepthPeru() {
  const data = presentationData.oneGdne.talentDepth.peru
  const comp = data.pyramidComposition
  const groups: Array<{ id: string; label: string } & typeof comp.contributors> = [
    { id: 'contributors', label: 'Contributors', ...comp.contributors },
    { id: 'leads', label: 'Leads', ...comp.leads },
    { id: 'executives', label: 'Executives', ...comp.executives },
  ]
  return <div className="og-talent-depth-col og-talent-depth-col--peru">
    <CountryLabel country="peru" />
    <section className="og-talent-depth__section og-talent-depth__composition">
      <h3>Composición de la pirámide</h3>
      <div className="og-talent-depth__composition-grid">
        {groups.map((group) => <div className={`og-talent-depth__composition-group og-talent-depth__composition-group--${group.id}`} key={group.id}>
          <header><span>{group.label}</span><strong>{group.total.toLocaleString('es-PE')} · {formatPercent(group.percent)}</strong></header>
          <ul>{group.breakdown.map((item) => <li key={item.name}><span>{item.name}</span><strong>{item.value}</strong></li>)}</ul>
        </div>)}
      </div>
    </section>
    <section className="og-talent-depth__section og-talent-depth__comparison">
      <h3>Contributor — GDN-e vs AS Oficina</h3>
      <div className="og-talent-depth__comparison-grid">
        <div className="og-talent-depth__comparison-card og-talent-depth__comparison-card--gdne">
          <span>GDN-e</span>
          <small>HC total {data.contributorComparison.gdne.hcTotal.toLocaleString('es-PE')}</small>
          <strong>{data.contributorComparison.gdne.contributor}</strong>
          <b>Contributor · {formatPercent(data.contributorComparison.gdne.percent)}</b>
        </div>
        <div className="og-talent-depth__comparison-card og-talent-depth__comparison-card--office">
          <span>AS Oficina</span>
          <small>HC total {data.contributorComparison.office.hcTotal.toLocaleString('es-PE')}</small>
          <strong>{data.contributorComparison.office.contributor}</strong>
          <b>Contributor · {formatPercent(data.contributorComparison.office.percent)}</b>
        </div>
        <div className="og-talent-depth__comparison-deltas">
          <div><strong>+{data.contributorComparison.deltaPp.toFixed(1).replace('.', ',')} pp</strong><span>Mayor concentración GDN-e vs Oficina</span></div>
          <div><strong>+{data.contributorComparison.deltaCount}</strong><span>Contributors ({data.contributorComparison.gdne.contributor} vs {data.contributorComparison.office.contributor})</span></div>
        </div>
      </div>
      <p className="og-talent-depth__insight">{data.contributorComparison.insight}</p>
    </section>
    <section className="og-talent-depth__section og-talent-depth__sap">
      <h3>Enterprise Solutions Engineering / SAP</h3>
      <div className="og-talent-depth__sap-grid">
        <div><strong>{data.sapDepth.ese}</strong><span>Perfiles SAP</span><small>Enterprise Solutions Engineering</small></div>
        <div><strong>{data.sapDepth.totalGdne}</strong><span>Perfiles SAP</span><small>Total GDN-e</small></div>
        <div><strong>{formatPercent(data.sapDepth.concentrationPercent)}</strong><span>Concentración</span><small>en Enterprise Solutions Engineering</small></div>
      </div>
      <p className="og-talent-depth__insight">{data.sapDepth.insight}</p>
    </section>
  </div>
}

function TalentDepthChile() {
  const data = presentationData.oneGdne.talentDepth.chile
  return <div className="og-talent-depth-col og-talent-depth-col--chile">
    <CountryLabel country="chile" />
    <span className="og-chile-marker">{data.tag}</span>
    <section className="og-talent-depth__section og-talent-depth__composition og-talent-depth__section--pending">
      <h3>Composición de la pirámide</h3>
      <div className="og-talent-depth__composition-grid">
        {data.pyramidComposition.groups.map((group) => <div className={`og-talent-depth__composition-group og-talent-depth__composition-group--${group.id}`} key={group.id}>
          <header><span>{group.label}</span><strong>{group.total.toLocaleString('es-PE')} · {group.percent}%</strong></header>
          <p className="og-talent-depth__pending-note">{data.pyramidComposition.breakdownNote}</p>
        </div>)}
      </div>
    </section>
    <section className="og-talent-depth__section og-talent-depth__comparison og-talent-depth__section--pending">
      <h3>Contributor — GDN-e vs AS Oficina</h3>
      <div className="og-talent-depth__comparison-grid og-talent-depth__comparison-grid--pending">
        <div className="og-talent-depth__comparison-card og-talent-depth__comparison-card--gdne is-pending">
          <span>{data.contributorComparison.gdne.label}</span>
          <strong>{data.contributorComparison.gdne.value}</strong>
          <b>POR VALIDAR</b>
        </div>
        <div className="og-talent-depth__comparison-card og-talent-depth__comparison-card--office is-pending">
          <span>{data.contributorComparison.office.label}</span>
          <strong>{data.contributorComparison.office.value}</strong>
          <b>POR VALIDAR</b>
        </div>
        <div className="og-talent-depth__comparison-deltas og-talent-depth__comparison-deltas--pending">
          <div><strong>{data.contributorComparison.deltaPp}</strong><span>{data.contributorComparison.note}</span></div>
        </div>
      </div>
    </section>
    <section className="og-talent-depth__section og-talent-depth__sap og-talent-depth__section--pending">
      <h3>Enterprise Solutions Engineering / Especialización</h3>
      <p className="og-talent-depth__pending-note og-talent-depth__pending-note--large">{data.specialization.label}<br />{data.specialization.note}</p>
    </section>
  </div>
}

function TalentDepth() {
  return <div className="og-talent-depth-compare"><TalentDepthPeru /><TalentDepthChile /></div>
}

function Talent() {
  const combined = presentationData.oneGdne.talentCombined
  const [view, setView] = useState<'resumen' | 'profundidad'>('resumen')
  return <div className="og-view og-view--talent">
    <h2>Más de 2.000 personas<br />construyendo nuestra<br /><em>capacidad tecnológica</em></h2>
    <LocalSubNav className="og-subnav--talent" active={view} onSelect={setView} options={[{ id: 'resumen', label: 'Resumen' }, { id: 'profundidad', label: 'Profundidad' }]} />
    {view === 'resumen'
      ? <><div className="og-combined-kpi"><strong>{combined.value.toLocaleString('es-PE')}</strong><span>Talentos</span></div><div className="og-talent-grid"><TalentCard country="peru" /><TalentCard country="chile" /></div></>
      : <TalentDepth />}
  </div>
}

function StudiosHighlights({ title, items }: { title: string; items: string[] }) {
  const hasItems = items.length > 0
  return <div className="og-highlights og-highlights--studios"><strong className="og-highlights__title">{title}</strong>{hasItems ? <ul>{items.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul> : <div className="og-highlights__pending"><span>DATA POR CONFIRMAR</span><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /></div>}</div>
}

function StudiosGoalsChallenges({ goals, challenges }: { goals: HighlightList; challenges: HighlightList }) {
  return <div className="og-highlights og-highlights--studios og-studios-goals"><div><strong className="og-highlights__title">{goals.title}</strong><ul>{goals.items.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong className="og-highlights__title">{challenges.title}</strong><ul>{challenges.items.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
}

function StudiosCard({ country, studios }: { country: 'peru' | 'chile'; studios: Studios }) {
  if (studios.status === 'pending_validation') return <article className={`og-studios-card og-studios-card--${country}`}><CountryLabel country={country} /><div className="og-studios-card__meta"><strong>{studios.focusCount} Studios</strong></div><p className="og-studios-card__pending-copy">Distribución de talento<br />DATA POR CONFIRMAR</p>{studios.highlights && <StudiosHighlights title={studios.highlights.title} items={studios.highlights.items} />}</article>
  return <article className={`og-studios-card og-studios-card--${country}`}><CountryLabel country={country} /><div className="og-studios-card__meta"><strong>{studios.focusCount} Studios</strong><span className="og-studios-card__meta-totals"><strong>{studios.totalTalent.toLocaleString('es-PE')} talentos</strong>{studios.specialistTotal !== undefined}</span></div><ul>{studios.groups.map((group) => <li key={group.id}><div><span>{group.name}</span><strong>{group.totalHc}<small>{group.percent}%</small></strong></div>{group.note && <small className="og-studios-card__note">{group.note}</small>}{group.subgroups && <small>{group.subgroups.map((sub) => `${sub.name} ${sub.hc}`).join(' · ')}</small>}</li>)}</ul>{studios.goals && studios.challenges ? <StudiosGoalsChallenges goals={studios.goals} challenges={studios.challenges} /> : studios.highlights && <StudiosHighlights title={studios.highlights.title} items={studios.highlights.items} />}</article>
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

function ApprovalSequence({ history }: { history: Array<{ period: string; percent: number }> }) {
  return <div className="og-approval-sequence">{history.map((step, index) => <div className="og-approval-sequence__item" key={step.period}>{index > 0 && <i className="og-approval-sequence__arrow" aria-hidden="true">→</i>}<div className={`og-approval-sequence__step ${index === history.length - 1 ? 'is-current' : ''}`}><strong>{step.percent}%</strong><span>{step.period}</span></div></div>)}</div>
}

function CapabilitiesPanorama() {
  const data = presentationData.oneGdne.capabilities
  return <div className="og-capabilities-grid"><article className="og-capability-card og-capability-card--peru"><CountryLabel country="peru" /><strong>{data.peru.certifications.value}</strong><span>{data.peru.certifications.label}</span><CapabilityHighlights title="HIGHLIGHTS" items={data.peru.highlights} /><div className="og-capability-card__approval"><span className="og-capability-card__approval-label">Tasa de aprobación</span><ApprovalSequence history={data.peru.approvalHistory} /></div><CapabilityPartners partners={data.peru.partners} /><p>{data.peru.progression}</p></article><article className="og-capability-card og-capability-card--chile"><CountryLabel country="chile" /><strong>{data.chile.certifiedPeople.value}</strong><span>certificaciones obtenidas</span><CapabilityHighlights title="HIGHLIGHTS" items={data.chile.highlights} /><CapabilityPartners partners={data.chile.partners} /><p>{data.chile.progression}</p></article></div>
}

function CapabilitiesEvolucion() {
  const data = presentationData.oneGdne.capabilities.peru
  const evolution = data.certificationEvolution
  const approval = data.approvalHistory
  const chile = presentationData.oneGdne.capabilities.chileDepth
  return <div className="og-cert-evolution-compare">
    <div className="og-cert-evolution-col og-cert-evolution-col--peru">
      <CountryLabel country="peru" />
      <h3>Evolución de la población certificada</h3>
      <div className="og-cert-evolution__population">
        <div className="og-cert-evolution__population-main">
          <div className="og-cert-evolution__step"><strong>{evolution.fy25}</strong><span>FY25</span><small>Personas certificadas</small></div>
          <i className="og-cert-evolution__arrow" aria-hidden="true">→</i>
          <div className="og-cert-evolution__step is-current"><strong>{evolution.fy26}</strong><span>FY26</span><small>Personas certificadas</small></div>
        </div>
        <div className="og-cert-evolution__deltas"><div><strong>+{evolution.increment}</strong><span>Incremento FY26 vs FY25</span></div><div><strong>{evolution.multiplier}</strong><span>Población FY26 vs FY25</span></div></div>
      </div>
      <div className="og-cert-evolution__focus"><div><strong>FY25</strong><p>{evolution.fy25Focus}</p></div><div><strong>FY26</strong><p>{evolution.fy26Focus}</p></div></div>
      <h3>Tasa de aprobación</h3>
      <div className="og-cert-evolution__approval-row">
        <ApprovalSequence history={approval} />
        <strong className="og-cert-evolution__delta">+{data.approvalDeltaPp} pp <span>FY26 vs FY25</span></strong>
      </div>
      <div className="og-cert-evolution__approval-notes">{approval.map((step) => <div key={step.period}><strong>{step.period}</strong><p>{step.note}</p></div>)}</div>
    </div>
    <div className="og-cert-evolution-col og-cert-evolution-col--chile">
      <CountryLabel country="chile" />
      <span className="og-chile-marker">{chile.tag}</span>
      <h3>Evolución de la población certificada</h3>
      <div className="og-cert-evolution__population og-cert-evolution__population--pending">
        <div className="og-cert-evolution__population-main">
          <div className="og-cert-evolution__step is-pending"><strong>{chile.certificationEvolution.fy25}</strong><span>FY25</span><small>POR VALIDAR</small></div>
          <i className="og-cert-evolution__arrow" aria-hidden="true">→</i>
          <div className="og-cert-evolution__step is-pending"><strong>{chile.certificationEvolution.fy26}</strong><span>FY26</span><small>POR VALIDAR</small></div>
        </div>
        <div className="og-cert-evolution__deltas og-cert-evolution__deltas--pending"><div><strong>{chile.certificationEvolution.increment}</strong><span>Incremento FY26 vs FY25</span></div><div><strong>{chile.certificationEvolution.multiplier}</strong><span>Población FY26 vs FY25</span></div></div>
      </div>
      <p className="og-talent-depth__pending-note">{chile.certificationEvolution.focusNote}</p>
      <h3>Tasa de aprobación</h3>
      <div className="og-cert-evolution__approval-row">
        <div className="og-approval-sequence og-approval-sequence--pending">{chile.approvalHistory.map((step) => <div className="og-approval-sequence__item" key={step.period}><div className="og-approval-sequence__step is-pending"><strong>{step.value}</strong><span>{step.period}</span></div></div>)}</div>
        <strong className="og-cert-evolution__delta og-cert-evolution__delta--pending">{chile.approvalDeltaNote}</strong>
      </div>
    </div>
  </div>
}

function CapabilitiesProgresion() {
  const funnel = presentationData.oneGdne.capabilities.peru.certificationFunnel
  const focuses = presentationData.oneGdne.capabilities.peru.certificationFocuses
  const chile = presentationData.oneGdne.capabilities.chileDepth
  return <div className="og-cert-progression-compare">
    <h3>Progresión por nivel de certificación</h3>
    <div className="og-cert-funnel-compare">
      <div className="og-cert-funnel-compare__col og-cert-funnel-compare__col--peru">
        <CountryLabel country="peru" />
        <div className="og-mini-funnel">
          <div className="og-mini-funnel__level"><strong>{funnel.fundamentals}</strong><span>Fundamentals</span></div>
          <i aria-hidden="true">↓</i>
          <div className="og-mini-funnel__level og-mini-funnel__level--highlight"><strong>{funnel.associate}</strong><span>Associate</span><b>{formatPercent(funnel.associateProgressionPercent)} · {funnel.associate} de {funnel.fundamentals}</b></div>
          <i aria-hidden="true">↓</i>
          <div className="og-mini-funnel__level"><strong>{funnel.professional}</strong><span>Professional</span></div>
          <i aria-hidden="true">↓</i>
          <div className="og-mini-funnel__level"><strong>{funnel.expert}</strong><span>Expert</span></div>
        </div>
      </div>
      <div className="og-cert-funnel-compare__col og-cert-funnel-compare__col--chile">
        <CountryLabel country="chile" />
        <span className="og-chile-marker">{chile.tag}</span>
        <div className="og-mini-funnel og-mini-funnel--pending">
          <div className="og-mini-funnel__level is-pending"><strong>{chile.certificationFunnel.fundamentals}</strong><span>Fundamentals</span><b>POR VALIDAR</b></div>
          <i aria-hidden="true">↓</i>
          <div className="og-mini-funnel__level is-pending"><strong>{chile.certificationFunnel.associate}</strong><span>Associate</span><b>POR VALIDAR</b></div>
          <i aria-hidden="true">↓</i>
          <div className="og-mini-funnel__level is-pending"><strong>{chile.certificationFunnel.professional}</strong><span>Professional</span><b>POR VALIDAR</b></div>
          <i aria-hidden="true">↓</i>
          <div className="og-mini-funnel__level is-pending"><strong>{chile.certificationFunnel.expert}</strong><span>Expert</span><b>POR VALIDAR</b></div>
        </div>
      </div>
    </div>
    <div className="og-cert-focus-compare">
      <div className="og-cert-focus-compare__col">
        <div className="og-cert-focus-grid">{focuses.map((focus) => <div className="og-cert-focus-card" key={focus.area}><strong>{focus.area}</strong><span>Nivel: {focus.level}</span><p>{focus.text}</p></div>)}</div>
      </div>
      <div className="og-cert-focus-compare__col">
        <div className="og-cert-focus-grid og-cert-focus-grid--pending">{[1, 2, 3].map((n) => <div className="og-cert-focus-card og-cert-focus-card--pending" key={n}><strong>Foco 0{n}</strong><span>Por validar</span></div>)}</div>
      </div>
    </div>
  </div>
}

function CapabilitiesPrograma() {
  const data = presentationData.oneGdne.capabilities.peru.fy26Program
  const chile = presentationData.oneGdne.capabilities.chileDepth.fy26Program
  return <div className="og-cert-program-compare">
    <h3>Programa actual de certificaciones FY26</h3>
    <div className="og-cert-program-compare__cols">
      <div className="og-cert-program-col og-cert-program-col--peru">
        <CountryLabel country="peru" />
        <div className="og-cert-program__cell og-cert-program__cell--primary"><strong>{data.inProgress}</strong><span>Personas cursando certificaciones FY26</span></div>
        <div className="og-cert-program__row"><div className="og-cert-program__cell"><strong>{data.upskillingParticipants}</strong><span>Upskilling · participantes</span></div><div className="og-cert-program__cell"><strong>{data.otherPrograms}</strong><span>Otros programas</span><small>{data.otherProgramsDetail}</small></div></div>
        <div className="og-cert-program__row"><div className="og-cert-program__cell"><strong>{data.currentApprovalRate}%</strong><span>Tasa de aprobación actual</span></div><div className="og-cert-program__cell"><strong>{data.targetApprovalRate}%</strong><span>Meta de aprobación · cierre FY26</span></div></div>
      </div>
      <div className="og-cert-program-col og-cert-program-col--chile">
        <CountryLabel country="chile" />
        <span className="og-chile-marker">{presentationData.oneGdne.capabilities.chileDepth.tag}</span>
        <div className="og-cert-program__cell og-cert-program__cell--primary is-pending"><strong>{chile.inProgress}</strong><span>Personas cursando certificaciones FY26</span><b>POR VALIDAR</b></div>
        <div className="og-cert-program__row"><div className="og-cert-program__cell is-pending"><strong>{chile.upskillingParticipants}</strong><span>Upskilling · participantes</span></div><div className="og-cert-program__cell is-pending"><strong>{chile.otherPrograms}</strong><span>Otros programas</span></div></div>
        <div className="og-cert-program__row"><div className="og-cert-program__cell is-pending"><strong>{chile.currentApprovalRate}</strong><span>Tasa de aprobación actual</span></div><div className="og-cert-program__cell is-pending"><strong>{chile.targetApprovalRate}</strong><span>Meta de aprobación · cierre FY26</span></div></div>
      </div>
    </div>
  </div>
}

function Capabilities() {
  const data = presentationData.oneGdne.capabilities
  const [view, setView] = useState<'panorama' | 'evolucion' | 'progresion' | 'programa'>('panorama')
  return <div className="og-view og-view--capabilities">
    <h2>Talento en<br /><em>constante evolución</em></h2>
    <ol className="og-capability-pipeline">{data.funnel.map((stage) => <li key={stage}>{stage}</li>)}</ol>
    <div className="og-capability-concepts"><span>Talento</span><span>Profundidad</span><span>Aplicación</span><span>Impacto</span></div>
    <LocalSubNav className="og-subnav--capabilities" active={view} onSelect={setView} options={[{ id: 'panorama', label: 'Panorama' }, { id: 'evolucion', label: 'Evolución' }, { id: 'progresion', label: 'Progresión' }, { id: 'programa', label: 'Programa FY26' }]} />
    {view === 'panorama' && <CapabilitiesPanorama />}
    {view === 'evolucion' && <CapabilitiesEvolucion />}
    {view === 'progresion' && <CapabilitiesProgresion />}
    {view === 'programa' && <CapabilitiesPrograma />}
  </div>
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
