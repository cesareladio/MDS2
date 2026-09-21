import { FlightArc } from '../geography/FlightArc'

export function GlobalJourney({ active }: { active: boolean }) {
  if (!active) return null
  return <><FlightArc start={[35.68, 139.76]} end={[40.42, -3.7]} /><FlightArc start={[40.42, -3.7]} end={[-12.05, -77.04]} offset={0.45} /></>
}
