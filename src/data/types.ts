export type CountryId = 'peru' | 'chile'
export type DataStatus = 'current' | 'program' | 'target' | 'pending'

export interface Hub {
  id: string
  name: string
  lat: number
  lon: number
  hc: number | null
  note: string
}

export interface TimelineEvent {
  year: string
  title: string
  detail: string
  status?: DataStatus
}
