import * as THREE from 'three'

export function latLonToVector3(lat: number, lon: number, radius = 2.03) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

export function makeArc(start: [number, number], end: [number, number], radius = 2.08) {
  const from = latLonToVector3(start[0], start[1], radius)
  const to = latLonToVector3(end[0], end[1], radius)
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(radius + from.distanceTo(to) * 0.42)
  return new THREE.CatmullRomCurve3([from, mid, to])
}

export const peruOutline: Array<[number, number]> = [
  [-3.4, -80.3], [-4.5, -81.1], [-6.2, -80.8], [-8.7, -79.2], [-11.2, -77.7],
  [-14.6, -76.1], [-18.3, -70.4], [-17.3, -69.5], [-14.4, -69.9], [-11.1, -69.6],
  [-8.5, -74.2], [-5.2, -75.5], [-3.4, -80.3],
]

export const chileOutline: Array<[number, number]> = [
  [-17.5, -69.5], [-20.5, -69.1], [-24.5, -69.4], [-29.5, -70.7], [-34, -70.7],
  [-38, -72.1], [-42, -72.8], [-46, -73.5], [-51.5, -74.5], [-55, -68.7],
  [-50.5, -72.7], [-44, -72.2], [-39, -71.6], [-33, -70.1], [-26, -68.7], [-17.5, -69.5],
]
