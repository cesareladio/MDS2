import { geoEquirectangular, geoPath } from 'd3-geo'
import type { Feature, Geometry, FeatureCollection } from 'geojson'
import * as THREE from 'three'

/** ISO numeric IDs for our two target countries */
export const PERU_ID  = 604
export const CHILE_ID = 152

/** Fetch and parse the GeoJSON once */
let _cachedFeatures: FeatureCollection | null = null

export async function loadSouthAmericaGeo(): Promise<FeatureCollection> {
  if (_cachedFeatures) return _cachedFeatures
  const res = await fetch('/geo/south-america.geojson')
  _cachedFeatures = await res.json() as FeatureCollection
  return _cachedFeatures
}

/** Convert a GeoJSON polygon ring (lon,lat pairs) to 3D sphere points */
export function ringToSpherePoints(
  ring: number[][],
  radius = 2.032,
): THREE.Vector3[] {
  return ring.map(([lon, lat]) => {
    const phi   = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    )
  })
}

/** Build a canvas texture highlighting one country */
export function buildCountryTexture(
  fc: FeatureCollection,
  targetId: number,
  color: string,
  glowColor: string,
): THREE.CanvasTexture {
  const W = 2048, H = 1024
  const cvs = document.createElement('canvas')
  cvs.width = W; cvs.height = H
  const ctx = cvs.getContext('2d')!

  const proj = geoEquirectangular()
    .translate([W / 2, H / 2])
    .scale(W / (2 * Math.PI))
    .precision(0.15)
  const path = geoPath(proj, ctx)

  // Transparent base
  ctx.clearRect(0, 0, W, H)

  fc.features.forEach((f: Feature<Geometry>) => {
    const id = Number(f.id)
    if (id === targetId) {
      ctx.beginPath()
      path(f)

      // Fill with glow
      ctx.shadowColor = glowColor
      ctx.shadowBlur  = 22
      ctx.fillStyle   = color + '55'
      ctx.fill()
      ctx.shadowBlur  = 0

      // Bright outline
      ctx.strokeStyle = color
      ctx.lineWidth   = 2.2
      ctx.stroke()

      // Second pass outline for thickness
      ctx.strokeStyle = glowColor + 'cc'
      ctx.lineWidth   = 5
      ctx.stroke()
    }
  })

  const tex = new THREE.CanvasTexture(cvs)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.needsUpdate = true
  return tex
}

/** Return every polygon, including interior rings, for territory raycasting. */
export function extractCountryPolygons(
  fc: FeatureCollection,
  targetId: number,
): number[][][][] {
  const polygons: number[][][][] = []
  for (const f of fc.features) {
    if (Number(f.id) !== targetId) continue
    const geometry = f.geometry
    if (!geometry) continue
    if (geometry.type === 'Polygon') polygons.push(geometry.coordinates as number[][][])
    if (geometry.type === 'MultiPolygon') polygons.push(...(geometry.coordinates as number[][][][]))
  }
  return polygons
}

/** Extract all outer ring points for a country (for 3D outline lines) */
export function extractCountryRings(
  fc: FeatureCollection,
  targetId: number,
): number[][][] {
  return extractCountryPolygons(fc, targetId).map((polygon) => polygon[0])
}
