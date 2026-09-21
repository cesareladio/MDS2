import { create } from 'zustand'
import type { CountryId } from '../data/types'

export type ExperiencePhase =
  | 'intro'
  | 'global'
  | 'latam'
  | 'snapshot'
  | 'explore'
  | 'complementarity'
  | 'engine'      // ← distinct 3D capability-engine phase (was merged with 'ibiol')
  | 'ibiol'       // IBIOL proposition (network transforms)
  | 'closing'
export type DeviceQuality = 'HIGH' | 'MEDIUM' | 'LOW'

interface ExperienceState {
  phase: ExperiencePhase
  scrollProgress: number
  selectedCountry: CountryId | null
  selectedHub: string | null
  visitedCountries: CountryId[]
  explorationMode: boolean
  selectedCapability: string | null
  reducedMotion: boolean
  deviceQuality: DeviceQuality
  setPhase: (phase: ExperiencePhase) => void
  setScrollProgress: (progress: number) => void
  selectCountry: (country: CountryId | null) => void
  selectHub: (hub: string | null) => void
  setExplorationMode: (active: boolean) => void
  selectCapability: (capability: string | null) => void
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
  selectedCapability: null,
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
  selectCapability: (selectedCapability) => set({ selectedCapability }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setDeviceQuality: (deviceQuality) => set({ deviceQuality }),
}))
