import { presentationData, type PeruInitiativeGroup, type PeruBps } from '../data/presentation'
import { countryIdentity } from '../data/countryIdentity'

function AdoptionTag({ label }: { label: string }) {
  return <div className="efficiency-adoption-tag"><span>{label}</span></div>
}

function InitiativeGroup({ group }: { group: PeruInitiativeGroup }) {
  return (
    <div className="efficiency-cluster" key={group.id}>
      <div className="efficiency-cluster__head">
        <strong>{group.name}</strong>
        <span>{group.count} {group.countLabel}{group.period ? ` · ${group.period}` : ''}</span>
      </div>
      <p className="efficiency-cluster__items">{group.items.join(' · ')}</p>
    </div>
  )
}

function BpsBlock({ bps }: { bps: PeruBps }) {
  return (
    <div className="efficiency-bps">
      <div className="efficiency-cluster__head"><strong>BPS</strong></div>
      <div className="efficiency-bps__row">
        <span className="efficiency-bps__row-count">{bps.exploration.count} exploraciones</span>
        <span className="efficiency-bps__row-items">{bps.exploration.items.map((item) => `${item.name} — ${item.value}`).join(' · ')}</span>
      </div>
      <div className="efficiency-bps__row">
        <span className="efficiency-bps__row-count">{bps.production.count} en producción</span>
        <span className="efficiency-bps__row-items">{bps.production.items.map((item) => `${item.name} — ${item.value}`).join(' · ')}</span>
      </div>
    </div>
  )
}

function PeruProofStrip() {
  const data = presentationData.efficiency.peru
  return (
    <div className="efficiency-proof">
      <div className="efficiency-proof__upskilling">
        <span className="efficiency-proof__label">Programas de upskilling</span>
        <div className="efficiency-proof__items">
          {data.upskilling.map((item) => (
            <div className="efficiency-proof__item" key={item.code}>
              <strong>{item.code}</strong>
              <span>{item.percent}%</span>
              <small>{item.certified} certificados</small>
            </div>
          ))}
        </div>
      </div>
      <div className="efficiency-proof__buildteam">
        <span className="efficiency-proof__label">AI Build Team</span>
        {data.aiBuildTeam.map((row, index) => (
          <div className="efficiency-proof__build-row" key={index}>
            <strong>{row.percent}%</strong>
            <span>{row.codes.join(' | ')}</span>
          </div>
        ))}
      </div>
      <div className="efficiency-proof__openai">
        <div className="efficiency-proof__openai-metric"><strong>{data.openAI.certifications}</strong><span>Certificaciones OpenAI</span></div>
        <div className="efficiency-proof__openai-metric"><strong>{data.openAI.fte}</strong><span>FTE</span></div>
      </div>
    </div>
  )
}

function PeruPanel() {
  const data = presentationData.efficiency.peru
  const groupById = (id: string) => data.initiativeGroups.find((group) => group.id === id)!
  return (
    <article className="efficiency-country efficiency-country--peru">
      <span className="efficiency-country__name">{countryIdentity.peru.name}</span>
      <div className="efficiency-peru-columns">
        <div className="efficiency-peru-col">
          <InitiativeGroup group={groupById('ibiol')} />
          <InitiativeGroup group={groupById('finanzas')} />
          <InitiativeGroup group={groupById('people')} />
        </div>
        <div className="efficiency-peru-col">
          <InitiativeGroup group={groupById('legal')} />
          <BpsBlock bps={data.bps} />
          <div className="efficiency-collab">
            <span>Trabajo en conjunto con unidades</span>
            <div className="efficiency-collab__tags">{data.collaborationUnits.map((unit) => <i key={unit}>{unit}</i>)}</div>
          </div>
        </div>
      </div>
      <PeruProofStrip />
      <AdoptionTag label={data.adoption.label} />
      <p className="efficiency-country__message">{data.message}</p>
    </article>
  )
}

function ChilePanel() {
  const data = presentationData.efficiency.chile
  const tracker = data.maturityTracker
  return (
    <article className="efficiency-country efficiency-country--chile">
      <span className="efficiency-country__name">{countryIdentity.chile.name}</span>
      <ul className="efficiency-initiatives">
        {data.initiatives.map((item) => {
          const hasClients = 'clients' in item && item.clients && item.clients.length > 0
          return (
            <li key={item.id} className={hasClients ? 'efficiency-initiatives__li--dispatcher' : undefined}>
              {hasClients ? (
                <>
                  <strong>{item.name}</strong>
                  <div className="efficiency-dispatcher__right">
                    <span className="efficiency-dispatcher__clients">{(item as { clients: string[] }).clients.join(' · ')}</span>
                    <span className="efficiency-dispatcher__detail">{item.detail}</span>
                  </div>
                </>
              ) : (
                <>
                  <strong>{item.name}</strong>
                  <span>{item.detail}</span>
                </>
              )}
            </li>
          )
        })}
      </ul>
      <div className="efficiency-maturity">
        <div className="efficiency-maturity__head"><span>{tracker.title}</span><strong>{tracker.subtitle}</strong></div>
        <div className="efficiency-maturity__metrics">
          <div><strong>{tracker.servicesEvaluated.value}</strong><span>{tracker.servicesEvaluated.label}</span></div>
          <div><strong>{tracker.peopleEvaluated.value}</strong><span>{tracker.peopleEvaluated.label}</span></div>
        </div>
      </div>
      <AdoptionTag label={data.adoption.label} />
      <p className="efficiency-country__message">{data.message}</p>
    </article>
  )
}

export function EfficiencyFlow() {
  return (
    <div className="efficiency-story">
      <div className="efficiency-grid">
        <PeruPanel />
        <ChilePanel />
      </div>
    </div>
  )
}
