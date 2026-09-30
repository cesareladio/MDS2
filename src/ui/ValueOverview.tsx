import { presentationData } from '../data/presentation'

function DeliveryPanel({ country }: { country: 'peru' | 'chile' }) {
  const data = presentationData.value[country]
  const identity = presentationData[country].identity
  return (
    <article className={`value-panel value-panel--${country}`}>
      <header className="delivery-mix__header">
        <img src={identity.flag} alt="" />
        <strong>{identity.name}</strong>
      </header>
      <div className="delivery-mix__bar" aria-hidden="true">
        <span className="delivery-mix__local" style={{ width: `${data.local}%` }} />
        <span className="delivery-mix__offshore" style={{ width: `${data.offshore}%` }} />
        {data.nearshore > 0 && <span className="delivery-mix__nearshore" style={{ width: `${data.nearshore}%` }} />}
      </div>
      <ul className="delivery-mix__legend">
        <li><i className="delivery-mix__dot delivery-mix__dot--local" />Local · {data.local}%</li>
        <li><i className="delivery-mix__dot delivery-mix__dot--offshore" />Offshore · {data.offshore}%</li>
        {data.nearshore > 0 && <li><i className="delivery-mix__dot delivery-mix__dot--nearshore" />Nearshore · {data.nearshore}%</li>}
      </ul>
      <p className="value-panel__strength"><span>Fortaleza</span>{data.strength}</p>
      <p className="value-panel__clients">Principales clientes / proyectos<small>En validación</small></p>
    </article>
  )
}

export function ValueOverview() {
  const network = presentationData.value.network
  return (
    <div className="value-overview">
      <div className="value-overview__grid">
        <DeliveryPanel country="peru" />
        <div className="value-network" aria-hidden="true">
          <span className="value-network__node value-network__node--peru">Perú</span>
          <span className="value-network__core">{network.core}</span>
          <span className="value-network__node value-network__node--chile">Chile</span>
          <span className="value-network__target">{network.target}</span>
        </div>
        <DeliveryPanel country="chile" />
      </div>
    </div>
  )
}
