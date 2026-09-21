import { chileHubs } from '../../data/chile'
import { peruHubs } from '../../data/peru'
import { useExperienceStore } from '../../store/experienceStore'
import { HubNetwork } from '../geography/HubNetwork'

export function CountryExplorer() {
  const phase = useExperienceStore((state) => state.phase)
  const showExploreGeography = phase === 'explore'
  if (!showExploreGeography) return null
  return (
    <>
      <HubNetwork hubs={peruHubs} color="#ffad42" glowColor="#ffd07a" />
      <HubNetwork hubs={chileHubs} color="#31c7ff" glowColor="#78e8ff" />
    </>
  )
}
