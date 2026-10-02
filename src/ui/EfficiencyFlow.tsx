import { presentationData } from '../data/presentation'
import { countryIdentity } from '../data/countryIdentity'
import { useExperienceStore, type EfficiencySection } from '../store/experienceStore'

const sections: Array<{ id: EfficiencySection; label: string; number: string }> = [
  { id: 'adoption', label: 'Adopción', number: '01' },
  { id: 'aiEvolution', label: 'Evolución IA', number: '02' },
  { id: 'initiatives', label: 'Iniciativas', number: '03' },
  { id: 'capabilities', label: 'Capacidades', number: '04' },
  { id: 'upskilling', label: 'Upskilling', number: '05' },
  { id: 'results', label: 'Resultados', number: '06' },
]

const titles: Record<EfficiencySection, string> = {
  adoption: 'Adopción y uso de IA',
  aiEvolution: 'Evolución del alcance de IA',
  initiatives: 'De la adopción a la ejecución',
  capabilities: 'Capacidades que hacen posible la escala',
  upskilling: 'Talento en evolución continua',
  results: 'Capacidad que se convierte en resultado',
}

function CountryTag({ country }: { country: 'peru' | 'chile' }) {
  const identity = countryIdentity[country]
  return <div className={`ef-country-tag ef-country-tag--${country}`}><img src={identity.flag} alt="" /><span>{identity.name}</span></div>
}

function PendingTag({ children = 'POR VALIDAR' }: { children?: string }) {
  return <div className="ef-pending-tag">{children}</div>
}

function AdoptionPeru() {
  const data = presentationData.efficiency.peru.adoption
  return (
    <>
      <div className="ef-adoption-kpis">
        <div className="ef-adoption-kpi">
          <strong>{data.onboarded.value.toLocaleString('es-PE')}</strong>
          <span>Usuarios onboarded GDN-e</span>
          <b>{data.onboarded.percentOfPeru}% de Perú</b>
          <small>{data.onboarded.value.toLocaleString('es-PE')} de {data.onboarded.sourceTotal.toLocaleString('es-PE')} usuarios Perú</small>
        </div>
        <div className="ef-adoption-kpi">
          <strong>{data.active.value.toLocaleString('es-PE')}</strong>
          <span>Usuarios activos GDN-e</span>
          <b>{data.active.percentOfPeru}% de Perú</b>
          <small>{data.active.value.toLocaleString('es-PE')} de {data.active.sourceTotal.toLocaleString('es-PE')} usuarios Perú</small>
        </div>
      </div>
      <div className="ef-adoption-rates">
        <div className="ef-adoption-rate">
          <strong>{data.onboardingRate.percent.toLocaleString('es-PE')}%</strong>
          <span>Onboarding</span>
          <small>+{data.onboardingRate.deltaPp.toLocaleString('es-PE')} pp vs Perú</small>
        </div>
        <div className="ef-adoption-rate">
          <strong>{data.activeRate.percent.toLocaleString('es-PE')}%</strong>
          <span>Active users</span>
          <small>+{data.activeRate.deltaPp.toLocaleString('es-PE')} pp vs Perú</small>
        </div>
      </div>
      <p className="ef-insight">{data.insight}</p>
    </>
  )
}

function AdoptionChile() {
  const data = presentationData.efficiency.chilePlaceholder.adoption
  return (
    <>
      <div className="ef-adoption-kpis ef-adoption-kpis--pending">
        <div className="ef-adoption-kpi ef-adoption-kpi--pending">
          <strong>{data.onboarded.value}</strong>
          <span>{data.onboarded.label}</span>
          <PendingTag />
        </div>
        <div className="ef-adoption-kpi ef-adoption-kpi--pending">
          <strong>{data.active.value}</strong>
          <span>{data.active.label}</span>
          <PendingTag />
        </div>
      </div>
      <div className="ef-adoption-rates ef-adoption-rates--pending">
        <div className="ef-adoption-rate ef-adoption-rate--pending">
          <strong>{data.onboardingRate.value}</strong>
          <span>{data.onboardingRate.label}</span>
          <PendingTag />
        </div>
        <div className="ef-adoption-rate ef-adoption-rate--pending">
          <strong>{data.activeRate.value}</strong>
          <span>{data.activeRate.label}</span>
          <PendingTag />
        </div>
      </div>
    </>
  )
}

function Adoption() {
  return (
    <div className="ef-compare ef-compare--adoption">
      <div className="ef-compare__col ef-compare__col--peru"><CountryTag country="peru" /><AdoptionPeru /></div>
      <div className="ef-compare__col ef-compare__col--chile"><CountryTag country="chile" /><span className="ef-chile-marker">{presentationData.efficiency.chilePlaceholder.tag}</span><AdoptionChile /></div>
    </div>
  )
}

function AiEvolutionPeru() {
  const data = presentationData.efficiency.peru.aiEvolution
  return (
    <ol className="ef-timeline">
      {data.stages.map((stage) => (
        <li key={stage.id} className="ef-timeline__stage">
          <strong>{stage.label}</strong>
          {stage.items && <ul>{stage.items.map((item) => <li key={item}>{item}</li>)}</ul>}
          {stage.detail && <p>{stage.detail}</p>}
        </li>
      ))}
    </ol>
  )
}

function AiEvolutionChile() {
  const data = presentationData.efficiency.chilePlaceholder.aiEvolution
  return (
    <ol className="ef-timeline ef-timeline--pending">
      {data.stages.map((stage) => (
        <li key={stage.id} className="ef-timeline__stage ef-timeline__stage--pending">
          <strong>{stage.label}</strong>
          <PendingTag />
        </li>
      ))}
    </ol>
  )
}

function AiEvolutionView() {
  return (
    <div className="ef-compare ef-compare--ai-evolution">
      <div className="ef-compare__col ef-compare__col--peru"><CountryTag country="peru" /><AiEvolutionPeru /></div>
      <div className="ef-compare__col ef-compare__col--chile"><CountryTag country="chile" /><span className="ef-chile-marker">{presentationData.efficiency.chilePlaceholder.tag}</span><AiEvolutionChile /></div>
    </div>
  )
}

function InitiativesPeru() {
  const data = presentationData.efficiency.peru.initiatives
  return (
    <>
      <div className="ef-initiatives-top">
        <div className="ef-initiatives-primary">
          <strong>+{data.implementedOrProduction}</strong>
          <span>Iniciativas implementadas o en producción</span>
        </div>
        <div className="ef-initiatives-secondary">
          <div><strong>{data.activeExplorations}</strong><span>Exploraciones activas</span></div>
          <div><strong>{data.collaborationUnits.length}</strong><span>Unidades en colaboración · {data.collaborationUnits.join(' · ')}</span></div>
        </div>
      </div>
      <div className="ef-initiatives-grid">
        {data.groups.map((group) => (
          <div className="ef-initiatives-card" key={group.id}>
            <div className="ef-initiatives-card__head"><strong>{group.name}</strong><span>{group.count}</span></div>
            <small>{group.countLabel}{group.period ? ` · ${group.period}` : ''}</small>
            <p>{group.items.join(' · ')}</p>
          </div>
        ))}
        <div className="ef-initiatives-card ef-initiatives-card--bps">
          <div className="ef-initiatives-card__head"><strong>BPS</strong></div>
          <div className="ef-initiatives-card__row"><small>{data.bps.exploration.count} exploraciones</small><p>{data.bps.exploration.items.map((item) => `${item.name} — ${item.value}`).join(' · ')}</p></div>
          <div className="ef-initiatives-card__row"><small>{data.bps.production.count} en producción</small><p>{data.bps.production.items.map((item) => `${item.name} — ${item.value}`).join(' · ')}</p></div>
        </div>
      </div>
      <div className="ef-initiatives-conclusion">
        <strong>{data.conclusion.title}</strong>
        <span>{data.conclusion.levelLabel}: {data.conclusion.count} {data.conclusion.countLabel}</span>
        <p>{data.conclusion.items.join(' · ')}</p>
      </div>
    </>
  )
}

function InitiativesChile() {
  const data = presentationData.efficiency.chilePlaceholder.initiatives
  return (
    <>
      <div className="ef-initiatives-top ef-initiatives-top--pending">
        <div className="ef-initiatives-primary ef-initiatives-primary--pending">
          <strong>{data.primary.value}</strong>
          <span>{data.primary.label}</span>
          <PendingTag />
        </div>
        <div className="ef-initiatives-secondary ef-initiatives-secondary--pending">
          <div><strong>{data.explorations.value}</strong><span>{data.explorations.label}</span></div>
          <PendingTag />
        </div>
      </div>
      <div className="ef-initiatives-grid ef-initiatives-grid--pending">
        {data.fronts.map((front) => (
          <div className="ef-initiatives-card ef-initiatives-card--pending" key={front.id}>
            <div className="ef-initiatives-card__head"><strong>{front.label}</strong></div>
            <PendingTag />
          </div>
        ))}
      </div>
    </>
  )
}

function InitiativesView() {
  return (
    <div className="ef-compare ef-compare--initiatives">
      <div className="ef-compare__col ef-compare__col--peru"><CountryTag country="peru" /><InitiativesPeru /></div>
      <div className="ef-compare__col ef-compare__col--chile"><CountryTag country="chile" /><span className="ef-chile-marker">{presentationData.efficiency.chilePlaceholder.tag}</span><InitiativesChile /></div>
    </div>
  )
}

function CapabilitiesPeru() {
  const data = presentationData.efficiency.peru.capabilities
  return (
    <>
      <div className="ef-capabilities-primary">
        <span className="ef-capabilities-primary__label">AI Build Team</span>
        <div className="ef-capabilities-primary__rows">
          {data.aiBuildTeam.map((row) => (
            <div className="ef-capabilities-primary__row" key={row.code}>
              <strong>{row.percent}%</strong>
              <span>{row.code}</span>
              <i><em style={{ width: `${row.percent}%` }} /></i>
            </div>
          ))}
        </div>
      </div>
      <div className="ef-capabilities-supporting">
        {data.supporting.map((group, index) => (
          <div className={`ef-capabilities-supporting__group ef-capabilities-supporting__group--${index}`} key={group.category}>
            <strong>{group.category}</strong>
            <p>{group.items.join(' · ')}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function CapabilitiesChile() {
  const data = presentationData.efficiency.chilePlaceholder.capabilities
  return (
    <>
      <div className="ef-capabilities-primary ef-capabilities-primary--pending">
        <span className="ef-capabilities-primary__label">AI Build Team</span>
        <div className="ef-capabilities-primary__rows">
          {data.aiBuildTeam.map((row) => (
            <div className="ef-capabilities-primary__row ef-capabilities-primary__row--pending" key={row.code}>
              <strong>{row.value}</strong>
              <span>{row.code}</span>
              <PendingTag />
            </div>
          ))}
        </div>
      </div>
      <div className="ef-capabilities-supporting ef-capabilities-supporting--pending">
        {data.groups.map((group) => (
          <div className="ef-capabilities-supporting__group ef-capabilities-supporting__group--pending" key={group.category}>
            <strong>{group.category}</strong>
            <p>{group.value}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function CapabilitiesView() {
  return (
    <div className="ef-compare ef-compare--capabilities">
      <div className="ef-compare__col ef-compare__col--peru"><CountryTag country="peru" /><CapabilitiesPeru /></div>
      <div className="ef-compare__col ef-compare__col--chile"><CountryTag country="chile" /><span className="ef-chile-marker">{presentationData.efficiency.chilePlaceholder.tag}</span><CapabilitiesChile /></div>
    </div>
  )
}

function UpskillingPeru() {
  const data = presentationData.efficiency.peru.upskilling
  return (
    <>
      <div className="ef-upskilling-items">
        {data.items.map((item) => (
          <div className="ef-upskilling-item" key={item.code}>
            <strong>{item.percent}%</strong>
            <span>{item.code}</span>
            <small>{item.certified} personas certificadas</small>
          </div>
        ))}
      </div>
      <div className="ef-upskilling-proof">
        <div className="ef-upskilling-proof__metric"><strong>{data.openAI.certifications}</strong><span>Certificaciones OpenAI</span></div>
        <div className="ef-upskilling-proof__metric"><strong>{data.openAI.fte}</strong><span>FTE asociados</span></div>
      </div>
      <p className="ef-upskilling-summary"><strong>AI Build Team</strong> {data.aiBuildTeamSummary}</p>
    </>
  )
}

function UpskillingChile() {
  const data = presentationData.efficiency.chilePlaceholder.upskilling
  return (
    <>
      <div className="ef-upskilling-items ef-upskilling-items--pending">
        {data.items.map((item) => (
          <div className="ef-upskilling-item ef-upskilling-item--pending" key={item.code}>
            <strong>{item.percent}</strong>
            <span>{item.code}</span>
            <small>{item.certified} personas</small>
            <PendingTag />
          </div>
        ))}
      </div>
      <div className="ef-upskilling-proof ef-upskilling-proof--pending">
        <div className="ef-upskilling-proof__metric ef-upskilling-proof__metric--pending"><strong>{data.openAI.certifications}</strong><span>Certificaciones OpenAI</span><PendingTag /></div>
        <div className="ef-upskilling-proof__metric ef-upskilling-proof__metric--pending"><strong>{data.openAI.fte}</strong><span>FTE</span><PendingTag /></div>
      </div>
    </>
  )
}

function UpskillingView() {
  return (
    <div className="ef-compare ef-compare--upskilling">
      <div className="ef-compare__col ef-compare__col--peru"><CountryTag country="peru" /><UpskillingPeru /></div>
      <div className="ef-compare__col ef-compare__col--chile"><CountryTag country="chile" /><span className="ef-chile-marker">{presentationData.efficiency.chilePlaceholder.tag}</span><UpskillingChile /></div>
    </div>
  )
}

function ResultsPeru() {
  const data = presentationData.efficiency.peru.results
  return (
    <>
      <div className="ef-results-kpis">
        {data.kpis.map((kpi) => (
          <div className="ef-results-kpi" key={kpi.id}>
            <strong>{kpi.value}</strong>
            <span>{kpi.label}</span>
            <small>{kpi.detail}</small>
          </div>
        ))}
      </div>
      <div className="ef-results-budget">
        <div><span>Presupuesto anual FY26</span><strong>{data.budget.annualBudget}</strong></div>
        <div><span>Ingreso anual proyectado</span><strong>{data.budget.annualProjectedRevenue}</strong></div>
        <div className="ef-results-budget__over"><span>Superación prevista</span><strong>{data.budget.overperformance.value}<small>{data.budget.overperformance.percent}</small></strong></div>
      </div>
      <div className="ef-results-detail">
        <div><span>Presupuesto acumulado Abr–Sep</span><strong>{data.detail.accumulatedBudget}</strong></div>
        <div><span>Ingreso real Abr–Sep</span><strong>{data.detail.actualRevenue}</strong></div>
        <div><span>Costes</span><strong>{data.detail.costs}</strong></div>
        <div><span>Margen</span><strong>{data.detail.margin}</strong></div>
        <div><span>Proyección Oct–Mar</span><strong>{data.detail.projection}</strong></div>
      </div>
    </>
  )
}

function ResultsChile() {
  const data = presentationData.efficiency.chilePlaceholder.results
  return (
    <>
      <div className="ef-results-kpis ef-results-kpis--pending">
        {data.kpis.map((kpi) => (
          <div className="ef-results-kpi ef-results-kpi--pending" key={kpi.id}>
            <strong>{kpi.value}</strong>
            <span>{kpi.label}</span>
            <PendingTag />
          </div>
        ))}
      </div>
      <div className="ef-results-economic-pending">
        <span>{data.economicLabel}</span>
        <PendingTag />
      </div>
    </>
  )
}

function ResultsView() {
  return (
    <div className="ef-compare ef-compare--results">
      <div className="ef-compare__col ef-compare__col--peru"><CountryTag country="peru" /><ResultsPeru /></div>
      <div className="ef-compare__col ef-compare__col--chile"><CountryTag country="chile" /><span className="ef-chile-marker">{presentationData.efficiency.chilePlaceholder.tag}</span><ResultsChile /></div>
    </div>
  )
}

function View({ section }: { section: EfficiencySection }) {
  if (section === 'aiEvolution') return <AiEvolutionView />
  if (section === 'initiatives') return <InitiativesView />
  if (section === 'capabilities') return <CapabilitiesView />
  if (section === 'upskilling') return <UpskillingView />
  if (section === 'results') return <ResultsView />
  return <Adoption />
}

export function EfficiencyFlow() {
  const phase = useExperienceStore((state) => state.phase)
  const section = useExperienceStore((state) => state.selectedEfficiencySection)
  const select = useExperienceStore((state) => state.setSelectedEfficiencySection)
  const active = phase === 'efficiency'

  if (!active) return null

  return (
    <div className="efficiency-scene" aria-label="Eficiencia · AI + Automation">
      <header className="efficiency-scene__intro"><p><span>04</span> AI + AUTOMATION</p></header>
      <nav className="efficiency-rail" aria-label="Explorar Eficiencia">
        {sections.map((item) => (
          <button key={item.id} className={section === item.id ? 'is-active' : ''} onClick={() => select(item.id)}>
            <span>{item.number}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className={`efficiency-content efficiency-content--${section}`} key={section}>
        <h2 className="ef-view-title">{titles[section]}</h2>
        <View section={section} />
      </div>
    </div>
  )
}
