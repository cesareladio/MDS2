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

export interface StudioSubgroup {
  name: string
  hc: number
  percent: number
}

export interface StudioGroup {
  id: string
  name: string
  totalHc: number
  percent: number
  subgroups?: StudioSubgroup[]
}

export interface HighlightList {
  title: string
  items: string[]
}

export interface PartnerLogo {
  name: string
  logo: string
}

export interface StudioBlock {
  status: 'validated'
  totalTalent: number
  focusCount: number
  groups: StudioGroup[]
  highlights?: HighlightList
}

export interface StudioBlockPending {
  status: 'pending_validation'
  focusCount: number
  highlights?: HighlightList
}

export type Studios = StudioBlock | StudioBlockPending

