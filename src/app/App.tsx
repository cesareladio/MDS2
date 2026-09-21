import { useCallback, useState } from 'react'
import { useDeviceCapability } from '../hooks/useDeviceCapability'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { Experience } from './Experience'
import { Preloader } from './Preloader'

export function App() {
  const [loaded, setLoaded] = useState(false)
  useReducedMotion()
  useDeviceCapability()
  const complete = useCallback(() => setLoaded(true), [])
  return loaded ? <Experience /> : <Preloader onComplete={complete} />
}
