import { useExperienceStore } from '../../store/experienceStore'
import { FlightArc } from '../geography/FlightArc'

export function GlobalJourney({ active }: { active: boolean }) {
  const scroll = useExperienceStore((state) => state.scrollProgress)

  // Keep mounted while near the global phase; fade handled internally by FlightArc
  if (scroll < 0.06 || scroll > 0.34) return null

  return (
    <>
      {/* Japan → Spain */}
      <FlightArc
        start={[35.68, 139.76]}
        end={[40.42, -3.7]}
        color="#70b8ff"
        progressStart={0.10}
        progressEnd={0.20}
      />
      {/* Spain → LATAM */}
      <FlightArc
        start={[40.42, -3.7]}
        end={[-12.05, -77.04]}
        color="#70b8ff"
        progressStart={0.19}
        progressEnd={0.30}
        offset={0}
      />
    </>
  )
}
