import { create } from 'zustand'
import type { CountryId } from '../data/types'

export type ExperiencePhase =
  | 'intro'
  | 'chilePeru'
  | 'oneGdne'
  | 'efficiency'
  | 'value'
  | 'challenges'
  | 'closing'

export type OneGdneSection =
  | 'overview'
  | 'history'
  | 'territory'
  | 'talent'
  | 'studios'
  | 'capabilities'

export type DeviceQuality = 'HIGH' | 'MEDIUM' | 'LOW'

interface ExperienceState {
  phase: ExperiencePhase
  scrollProgress: number
  selectedCountry: CountryId | null
  selectedHub: string | null
  visitedCountries: CountryId[]
  explorationMode: boolean
  selectedOneGdneSection: OneGdneSection
  reducedMotion: boolean
  deviceQuality: DeviceQuality
  setPhase: (phase: ExperiencePhase) => void
  setScrollProgress: (progress: number) => void
  selectCountry: (country: CountryId | null) => void
  selectHub: (hub: string | null) => void
  setExplorationMode: (active: boolean) => void
  setSelectedOneGdneSection: (section: OneGdneSection) => void
  resetOneGdneSection: () => void
  setReducedMotion: (active: boolean) => void
  setDeviceQuality: (quality: DeviceQuality) => void
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  phase: 'intro',
  scrollProgress: 0,
  selectedCountry: null,
  selectedHub: null,
  visitedCountries: [],
  explorationMode: false,
  selectedOneGdneSection: 'overview',
  reducedMotion: false,
  deviceQuality: 'HIGH',
  setPhase: (phase) => set({ phase }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  selectCountry: (selectedCountry) =>
    set((state) => ({
      selectedCountry,
      selectedHub: null,
      visitedCountries:
        selectedCountry && !state.visitedCountries.includes(selectedCountry)
          ? [...state.visitedCountries, selectedCountry]
          : state.visitedCountries,
    })),
  selectHub: (selectedHub) => set({ selectedHub }),
  setExplorationMode: (explorationMode) => set({ explorationMode }),
  setSelectedOneGdneSection: (selectedOneGdneSection) => set({ selectedOneGdneSection }),
  resetOneGdneSection: () => set({ selectedOneGdneSection: 'overview' }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setDeviceQuality: (deviceQuality) => set({ deviceQuality }),
}))
