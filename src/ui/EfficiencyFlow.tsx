import { presentationData, type EfficiencyCase } from '../data/presentation'

function ImpactCaseCard({ item, country }: { item: Omit<EfficiencyCase, 'country'>; country: 'peru' | 'chile' }) {
  const identity = presentationData[country].identity
  return (
    <article className={`impact-case impact-case--${country}`}>
      <header className="impact-case__header"><strong>{identity.name}</strong><span>Case success</span></header>
      <div className="impact-case__client"><span>Cliente / proyecto</span><strong>{item.client ?? 'Caso en validación'}</strong><small>{item.logo ? 'Logo validado' : 'Cliente por validar'}</small></div>
      <ol className="impact-case__flow">
        <li><span>Challenge</span><strong>{item.challenge ?? 'Por validar'}</strong></li>
        <li><span>Solution</span><strong>{item.solution ?? 'Por validar'}</strong></li>
        <li><span>Impact</span><strong>{item.impactValue === null ? 'Caso en validación' : `${item.impactValue}${item.impactUnit}`}</strong><small>{item.impactValue === null ? item.impactLabel : ''}</small></li>
      </ol>
    </article>
  )
}

export function EfficiencyFlow() {
  const data = presentationData.efficiency
  return (
    <div className="efficiency-story">
      <div className="efficiency-story__concept"><strong>{data.concept}</strong></div>
      <div className="efficiency-story__pipeline" aria-hidden="true"><span>Talent</span><i /><span>Applied solution</span><i /><span>Measurable impact</span></div>
      <div className="impact-case-grid"><ImpactCaseCard item={data.cases.peru} country="peru" /><ImpactCaseCard item={data.cases.chile} country="chile" /></div>
      <div className="efficiency-adoption"><div><strong>Perú · {data.adoption.peru.label}</strong><span>Por validar</span><small>{data.adoption.peru.supporting}</small></div><div><strong>Chile · {data.adoption.chile.label}</strong><span>Por validar</span><small>{data.adoption.chile.supporting}</small></div></div>
      <p className="efficiency-story__closing">No solo desarrollamos capacidades.<br /><strong>Las convertimos en soluciones.</strong></p>
    </div>
  )
}
