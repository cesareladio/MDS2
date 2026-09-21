import type { TimelineEvent } from '../data/types'

export function Timeline({ items }: { items: TimelineEvent[] }) {
  return (
    <ol className="timeline-list">
      {items.map((item) => <li key={`${item.year}-${item.title}`} className={item.status === 'target' ? 'is-target' : ''}><span>{item.year}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div></li>)}
    </ol>
  )
}
