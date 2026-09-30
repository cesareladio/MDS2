import { useEffect, useState } from 'react'
import type { FeatureCollection } from 'geojson'
import { loadSouthAmericaGeo, PERU_ID, CHILE_ID } from '../../lib/countryGeo'
import { CountryHighlight } from '../geography/CountryHighlight'
import { useExperienceStore } from '../../store/experienceStore'

export function LatamReveal({ active }: { active: boolean }) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)
  const scroll = useExperienceStore((state) => state.scrollProgress)

  useEffect(() => {
    loadSouthAmericaGeo().then(setGeo)
  }, [])

  // Resolve during Chile+Perú, then remain at a calm stable intensity through One GDN-e.
  const progress = Math.min(1, Math.max(0, (scroll - 0.14) / 0.16))
  const peruActive = active
  const chileActive = active
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
