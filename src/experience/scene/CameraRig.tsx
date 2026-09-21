import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { latLonToVector3 } from '../../lib/geo'

type Waypoint = { at: number; lat: number; lon: number; distance: number }

const waypoints: Waypoint[] = [
  { at: 0, lat: 8, lon: -25, distance: 10.5 },
  { at: 0.11, lat: 35.7, lon: 139.7, distance: 6.6 },
  { at: 0.19, lat: 40.4, lon: -3.7, distance: 6.2 },
  { at: 0.29, lat: -16, lon: -70, distance: 5.6 },
  { at: 0.48, lat: -18, lon: -71, distance: 5.2 },
  { at: 0.68, lat: -20, lon: -71, distance: 6.1 },
  { at: 0.82, lat: -18, lon: -71, distance: 6.4 },
  { at: 1, lat: -20, lon: -71, distance: 7.1 },
]

export function CameraRig() {
  const { camera, pointer } = useThree()
  const progress = useExperienceStore((state) => state.scrollProgress)
  const selectedCountry = useExperienceStore((state) => state.selectedCountry)
  const explorationMode = useExperienceStore((state) => state.explorationMode)
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const target = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    let lat: number
    let lon: number
    let distance: number
    if (explorationMode && selectedCountry) {
      lat = selectedCountry === 'peru' ? -10 : -37
      lon = selectedCountry === 'peru' ? -76 : -71
      distance = 4.35
    } else {
      const nextIndex = Math.min(waypoints.length - 1, waypoints.findIndex((point) => point.at >= progress))
      const b = waypoints[nextIndex === -1 ? waypoints.length - 1 : nextIndex]
      const a = waypoints[Math.max(0, (nextIndex === -1 ? waypoints.length - 1 : nextIndex) - 1)]
      const span = Math.max(0.001, b.at - a.at)
      const t = THREE.MathUtils.smoothstep((progress - a.at) / span, 0, 1)
      lat = THREE.MathUtils.lerp(a.lat, b.lat, t)
      lon = THREE.MathUtils.lerp(a.lon, b.lon, t)
      distance = THREE.MathUtils.lerp(a.distance, b.distance, t)
    }
    target.copy(latLonToVector3(lat, lon, distance))
    if (!reduced) {
      target.x += pointer.x * 0.1
      target.y += pointer.y * 0.06
    }
    const ease = 1 - Math.pow(0.001, delta)
    camera.position.lerp(target, ease * 0.38)
    camera.lookAt(0, 0, 0)
  })
  return null
}
