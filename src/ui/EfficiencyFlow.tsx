import { presentationData } from '../data/presentation'
import type { EfficiencyInitiative } from '../data/presentation'

function EfficiencyColumn({ country, items }: { country: 'peru' | 'chile'; items: EfficiencyInitiative[] }) {
  const identity = presentationData[country].identity
  return (
    <div className={`efficiency-column efficiency-column--${country}`}>
      <header className="efficiency-column__header"><strong>{identity.name}</strong></header>
      {items.length === 0 ? (
        <p className="efficiency-column__pending">Casos en validación</p>
      ) : (
        <ul className="efficiency-column__list">
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.initiative}</strong>
              <p><span>Challenge</span>{item.challenge}</p>
              <p><span>Solution</span>{item.solution}</p>
              <p><span>Impact</span>{item.impact}</p>
              {item.kpi && <strong className="efficiency-column__kpi">{item.kpi}</strong>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function EfficiencyFlow() {
  const { efficiency } = presentationData
  return (
    <div className="efficiency-flow">
      <div className="efficiency-flow__concept">
        <span>Concepto principal</span>
        <strong>{efficiency.concept}</strong>
      </div>
      <div className="efficiency-flow__pipeline" aria-hidden="true">
        <span>Challenge</span><i /><span>Solution</span><i /><span>Impact</span>
      </div>
      <div className="efficiency-flow__columns">
        <EfficiencyColumn country="chile" items={efficiency.chile} />
        <EfficiencyColumn country="peru" items={efficiency.peru} />
      </div>
    </div>
  )
}
