import { presentationData } from '../data/presentation'

interface Region { name: string; hc: number; percentage: number }

function topRegions(regions: Region[], total: number, topN: number) {
  const named = regions.filter((region) => region.name !== 'Otros')
  const sorted = [...named].sort((a, b) => b.hc - a.hc)
  const top = sorted.slice(0, topN)
  const topHC = top.reduce((sum, region) => sum + region.hc, 0)
  const otherHC = Math.max(0, total - topHC)
  const otherPercent = total > 0 ? Math.round((otherHC / total) * 1000) / 10 : 0
  return { top, otherHC, otherPercent }
}

function TerritoryCard({ country, topN }: { country: 'peru' | 'chile'; topN: number }) {
  const data = presentationData[country]
  const { top, otherHC, otherPercent } = topRegions(data.territory.regions, data.territory.total, topN)
  return (
    <article className={`territory-card territory-card--${country}`}>
      <header className="territory-card__header">
        <img src={data.identity.flag} alt="" />
        <div>
          <strong>{data.identity.name}</strong>
          <span>{data.hc.toLocaleString('es-PE')} personas</span>
        </div>
      </header>
      <ul className="territory-card__list">
        {top.map((region) => (
          <li key={region.name}>
            <span>{region.name}</span>
            <strong>{region.hc}</strong>
          </li>
        ))}
        <li className="territory-card__other">
          <span>Otros</span>
          <strong>{otherHC} · {otherPercent}%</strong>
        </li>
      </ul>
    </article>
  )
}

export function TerritoryOverview() {
  const combined = presentationData.story.combinedHC
  return (
    <div className="territory-overview">
      <div className="territory-overview__combined">
        <strong>{combined.toLocaleString('es-PE')}</strong>
        <span>Personas · ONE GDN-e</span>
      </div>
      <div className="territory-overview__grid">
        <TerritoryCard country="peru" topN={3} />
        <TerritoryCard country="chile" topN={2} />
      </div>
    </div>
  )
}
