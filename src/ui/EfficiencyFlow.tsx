import { presentationData, type EfficiencyCase } from '../data/presentation'

const PENDING_LABEL = 'Caso en validación'

function ImpactCaseCard({ item, country }: { item: Omit<EfficiencyCase, 'country'>; country: 'peru' | 'chile' }) {
  const identity = presentationData[country].identity
  const projectName = item.client ?? item.project ?? PENDING_LABEL
  const impact = item.impactValue === null ? PENDING_LABEL : `${item.impactValue}${item.impactUnit}`
  return (
    <article className={`impact-case impact-case--${country}`}>
      <header className="impact-case__header"><span className="impact-case__country">{identity.name}</span></header>
      <div className="impact-case__project">
        <span>Caso / Proyecto</span>
        <strong className={item.client === null && item.project === null ? 'is-pending' : undefined}>{projectName}</strong>
      </div>
      <dl className="impact-case__detail">
        <div>
          <dt>Desafío</dt>
          <dd className={item.challenge === null ? 'is-pending' : undefined}>{item.challenge ?? PENDING_LABEL}</dd>
        </div>
        <div>
          <dt>Solución</dt>
          <dd className={item.solution === null ? 'is-pending' : undefined}>{item.solution ?? PENDING_LABEL}</dd>
        </div>
        <div>
          <dt>Impacto</dt>
          <dd className={item.impactValue === null ? 'is-pending' : undefined}>{impact}</dd>
          {item.impactValue !== null && <small>{item.impactLabel}</small>}
        </div>
      </dl>
    </article>
  )
}

export function EfficiencyFlow() {
  const data = presentationData.efficiency
  return (
    <div className="efficiency-story">
      <div className="impact-case-grid">
        <ImpactCaseCard item={data.cases.peru} country="peru" />
        <ImpactCaseCard item={data.cases.chile} country="chile" />
      </div>
    </div>
  )
}
