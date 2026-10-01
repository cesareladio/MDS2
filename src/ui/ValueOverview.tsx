import { presentationData, type ChileClient } from '../data/presentation'

function ChileClientRow({ client }: { client: ChileClient }) {
  return (
    <div className="value-client">
      {client.logo && <img src={client.logo} alt={client.name} className="value-client__logo" />}
      <span className="value-client__name">{client.name}</span>
      <small className="value-client__country">{client.country}</small>
    </div>
  )
}

function DeliveryPanel({ country }: { country: 'peru' | 'chile' }) {
  const data = presentationData.value[country]
  const identity = presentationData[country].identity
  const chileClients = country === 'chile' && data.clientsStatus === 'validated'
    ? (data.clients as ChileClient[])
    : null
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
        <li><i className="delivery-mix__dot delivery-mix__dot--offshore" />Offshore (NEAR+OFF) · {data.offshore}%</li>
        {data.nearshore > 0 && <li><i className="delivery-mix__dot delivery-mix__dot--nearshore" />Nearshore · {data.nearshore}%</li>}
      </ul>
      <p className="value-panel__strength"><span>Fortaleza</span>{data.strength}</p>
      {chileClients ? (
        <div className="value-panel__chile-clients">
          <span className="value-panel__chile-clients-label">Clientes</span>
          <div className="value-client-row">
            {chileClients.map((client) => <ChileClientRow key={client.id} client={client} />)}
          </div>
        </div>
      ) : (
        <p className="value-panel__clients">Principales clientes / proyectos<small>En validación</small></p>
      )}
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
