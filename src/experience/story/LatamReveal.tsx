import { CountryHighlight } from '../geography/CountryHighlight'
import { chileOutline, peruOutline } from '../../lib/geo'

export function LatamReveal({ active }: { active: boolean }) {
  return <><CountryHighlight outline={peruOutline} color="#ffad42" active={active} /><CountryHighlight outline={chileOutline} color="#31c7ff" active={active} /></>
}
