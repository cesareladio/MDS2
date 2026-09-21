import { useEffect, useState } from 'react'
import type { FeatureCollection } from 'geojson'
import { loadSouthAmericaGeo, PERU_ID, CHILE_ID } from '../../lib/countryGeo'
import { CountryHighlight } from '../geography/CountryHighlight'
import { useExperienceStore } from '../../store/experienceStore'

export function LatamReveal({ active }: { active: boolean }) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)
  const scroll = useExperienceStore((state) => state.scrollProgress)
  const selectedCountry = useExperienceStore((state) => state.selectedCountry)
  const explorationMode = useExperienceStore((state) => state.explorationMode)

  useEffect(() => {
    loadSouthAmericaGeo().then(setGeo)
  }, [])

  // Progress: 0→1 as scroll moves through latam phase (0.25..0.45)
  const progress = Math.min(1, Math.max(0, (scroll - 0.25) / 0.12))
  const peruActive = active && (!explorationMode || selectedCountry === 'peru')
  const chileActive = active && (!explorationMode || selectedCountry === 'chile')
  const subduedProgress = Math.min(0.08, progress)

  return (
    <>
      <CountryHighlight
        geo={geo}
        countryId={PERU_ID}
        countryKey="peru"
        color="#ffad42"
        glowColor="#ffd07a"
        active={peruActive}
        progress={peruActive ? progress : subduedProgress}
      />
      <CountryHighlight
        geo={geo}
        countryId={CHILE_ID}
        countryKey="chile"
        color="#31c7ff"
        glowColor="#78e8ff"
        active={chileActive}
        progress={chileActive ? progress : subduedProgress}
      />
    </>
  )
}
