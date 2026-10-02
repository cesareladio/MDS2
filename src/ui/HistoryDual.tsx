import { Timeline } from './Timeline'
import { presentationData } from '../data/presentation'

export function HistoryDual() {
  return (
    <div className="history-dual">
      <div className="history-dual__col history-dual__col--chile">
        <header className="history-dual__header">
          <strong>Chile</strong>
          <span>Primer hub/centro de América</span>
        </header>
        <Timeline items={presentationData.chile.history} />
      </div>
      <div className="history-dual__col history-dual__col--peru">
        <header className="history-dual__header">
          <strong>Perú</strong>
          <span>Crecimiento desde 2016</span>
        </header>
        <Timeline items={presentationData.peru.history} />
      </div>
    </div>
  )
}
