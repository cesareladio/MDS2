import { presentationData } from '../data/presentation'

function DeliveryMix({ country }: { country: 'peru' | 'chile' }) {
  const data = presentationData.challenges[country]
  const identity = presentationData[country].identity
  return (
    <div className={`delivery-mix delivery-mix--${country}`}>
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
        {data.nearshore > 0 && (
          <li><i className="delivery-mix__dot delivery-mix__dot--nearshore" />Nearshore · {data.nearshore}%</li>
        )}
      </ul>
      {data.projects.length > 0 && (
        <div className="delivery-mix__logos">
          {data.projects.slice(0, 4).map((project) => (
            <img key={project.id} src={project.logo} alt={project.name} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ChallengesOverview() {
  return (
    <div className="challenges-overview">
      <DeliveryMix country="peru" />
      <DeliveryMix country="chile" />
    </div>
  )
}
