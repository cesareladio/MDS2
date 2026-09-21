import { chileHubs } from '../../data/chile'
import { peruHubs } from '../../data/peru'
import { useExperienceStore } from '../../store/experienceStore'
import { HubNetwork } from '../geography/HubNetwork'

export function CountryExplorer() {
  const active  = useExperienceStore((state) => state.explorationMode)
  const country = useExperienceStore((state) => state.selectedCountry)
  if (!active || !country) return null
  return (
    <HubNetwork
      hubs={country === 'peru' ? peruHubs : chileHubs}
      color={country === 'peru' ? '#ffad42' : '#31c7ff'}
      glowColor={country === 'peru' ? '#ffd07a' : '#78e8ff'}
    />
  )
}
