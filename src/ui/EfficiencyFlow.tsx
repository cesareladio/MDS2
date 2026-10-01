import { presentationData } from '../data/presentation'
import { countryIdentity } from '../data/countryIdentity'

function AdoptionTag({ label }: { label: string }) {
  return <div className="efficiency-adoption-tag"><span>{label}</span></div>
}

function PeruPanel() {
  const data = presentationData.efficiency.peru
  return (
    <article className="efficiency-country efficiency-country--peru">
      <span className="efficiency-country__name">{countryIdentity.peru.name}</span>
      <div className="efficiency-clusters">
        {data.clusters.map((cluster) => (
          <div className="efficiency-cluster" key={cluster.id}>
            <div className="efficiency-cluster__head"><strong>{cluster.name}</strong><span>{cluster.items.length} iniciativa{cluster.items.length > 1 ? 's' : ''}</span></div>
            <ul>{cluster.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="efficiency-collab">
        <span>Trabajo en conjunto con unidades</span>
        <div className="efficiency-collab__tags">{data.collaborationUnits.map((unit) => <i key={unit}>{unit}</i>)}</div>
      </div>
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
      <div className="efficiency-clients">
        <span>{data.clients.length} clientes</span>
        <div className="efficiency-clients__list">{data.clients.map((client) => <i key={client}>{client}</i>)}</div>
      </div>
      <ul className="efficiency-initiatives">
        {data.initiatives.map((item) => <li key={item.id}><strong>{item.name}</strong><span>{item.detail}</span></li>)}
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
