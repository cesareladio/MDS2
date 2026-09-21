import { useEffect } from 'react'
import { useExperienceStore, type DeviceQuality } from '../store/experienceStore'

export function useDeviceCapability() {
  const setDeviceQuality = useExperienceStore((state) => state.setDeviceQuality)

  useEffect(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
    const cores = navigator.hardwareConcurrency ?? 8
    const width = window.innerWidth
    const quality: DeviceQuality = width < 640 || memory <= 4 || cores <= 4 ? 'LOW' : width < 1100 || memory <= 6 ? 'MEDIUM' : 'HIGH'
    setDeviceQuality(quality)
  }, [setDeviceQuality])
}
