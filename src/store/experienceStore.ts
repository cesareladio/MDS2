import { create } from 'zustand'
import type { CountryId } from '../data/types'

export type ExperiencePhase =
  | 'intro'
  | 'chilePeru'   // 03 · Chile + Perú entry (replaces global/latam)
  | 'history'     // 04 · Nuestra historia (promoted out of Explore)
  | 'territory'   // 05 · Territorio (merge snapshot + territory)
  | 'explore'     // 06 · Explore (talent / studios / capacidades)
  | 'efficiency'  // 07 · Eficiencia (replaces complementarity)
  | 'challenges'  // 08 · Desafíos / Oportunidades (replaces ibiol)
  | 'closing'
export type DeviceQuality = 'HIGH' | 'MEDIUM' | 'LOW'

interface ExperienceState {
  phase: ExperiencePhase
  scrollProgress: number
  selectedCountry: CountryId | null
  selectedHub: string | null
  visitedCountries: CountryId[]
  explorationMode: boolean
  reducedMotion: boolean
  deviceQuality: DeviceQuality
  setPhase: (phase: ExperiencePhase) => void
  setScrollProgress: (progress: number) => void
  selectCountry: (country: CountryId | null) => void
  selectHub: (hub: string | null) => void
  setExplorationMode: (active: boolean) => void
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
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setDeviceQuality: (deviceQuality) => set({ deviceQuality }),
}))
