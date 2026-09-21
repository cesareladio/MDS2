import { geoEquirectangular, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import countriesTopology from 'world-atlas/countries-110m.json'
import type { FeatureCollection, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import * as THREE from 'three'

const topology = countriesTopology as unknown as Topology<{ countries: GeometryCollection }>
const countries = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>

function canvas(width: number, height: number) {
  const element = document.createElement('canvas')
  element.width = width
  element.height = height
  return element
}

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function drawMap(context: CanvasRenderingContext2D, width: number, height: number) {
  const projection = geoEquirectangular().translate([width / 2, height / 2]).scale(width / (2 * Math.PI)).precision(0.15)
  const path = geoPath(projection, context)
  context.beginPath()
  path(countries)
  return { projection, path }
}

/* ── High-quality procedural day texture ───────────────────────────────── */
function createDayTexture(width: number, height: number): THREE.CanvasTexture {
  const cvs = canvas(width, height)
  const ctx = cvs.getContext('2d')!

  // Deep ocean gradient – slightly warmer at equator, darker toward poles
  const ocean = ctx.createLinearGradient(0, 0, 0, height)
  ocean.addColorStop(0,    '#04101e')
  ocean.addColorStop(0.25, '#05182a')
  ocean.addColorStop(0.5,  '#071d32')
  ocean.addColorStop(0.75, '#05182a')
  ocean.addColorStop(1,    '#040e1b')
  ctx.fillStyle = ocean
  ctx.fillRect(0, 0, width, height)

  // Ocean subtle Fresnel shimmer bands (very faint horizontal banding)
  for (let i = 0; i < 14; i++) {
    const y = (i / 14) * height
    ctx.save()
    ctx.globalAlpha = 0.018
    ctx.fillStyle = '#5ba8e8'
    ctx.fillRect(0, y, width, 1)
    ctx.restore()
  }

  const projection = geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI))
    .precision(0.1)
  const path = geoPath(projection, ctx)

  // Land fill with subtle latitude tint
  countries.features.forEach((feature) => {
    ctx.beginPath()
    path(feature)

    // Latitude of centroid for tinting
    const [cx, cy] = geoPath(projection).centroid(feature) ?? [0, height / 2]
    const latFraction = cy / height  // 0 = north, 1 = south

    // Tropical → warm muted green-brown; polar → dark steel blue-grey
    const r = Math.round(14 + latFraction * 12)
    const g = Math.round(36 + latFraction * 18)
    const b = Math.round(52 + latFraction * 8)
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fill()

    // Subtle coastline glow
    ctx.strokeStyle = 'rgba(72, 148, 200, 0.42)'
    ctx.lineWidth = 0.9
    ctx.stroke()
  })

  // Fine shadow under coastlines
  ctx.save()
  ctx.globalAlpha = 0.12
  countries.features.forEach((feature) => {
    ctx.beginPath()
    path(feature)
    ctx.strokeStyle = '#001830'
    ctx.lineWidth = 2.5
    ctx.stroke()
  })
  ctx.restore()

  // Very subtle lat/lon grid — barely visible
  ctx.save()
  ctx.globalAlpha = 0.04
  ctx.strokeStyle = '#5fa0d4'
  ctx.lineWidth = 0.4
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
  ctx.restore()

  const tex = new THREE.CanvasTexture(cvs)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

/* ── Specular / ocean mask ──────────────────────────────────────────────── */
function createSpecularTexture(width: number, height: number): THREE.CanvasTexture {
  const cvs = canvas(width, height)
  const ctx = cvs.getContext('2d')!

  // White = reflective (ocean), black = matte (land)
  ctx.fillStyle = '#888'
  ctx.fillRect(0, 0, width, height)

  const projection = geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI))
    .precision(0.15)
  const path = geoPath(projection, ctx)

  countries.features.forEach((feature) => {
    ctx.beginPath()
    path(feature)
    ctx.fillStyle = '#111'
    ctx.fill()
  })

  const tex = new THREE.CanvasTexture(cvs)
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

/* ── Night / city-lights emissive ───────────────────────────────────────── */
function createNightTexture(width: number, height: number): THREE.CanvasTexture {
  const cvs = canvas(width, height)
  const ctx = cvs.getContext('2d')!

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  const projection = geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI))
    .precision(0.15)
  const path = geoPath(projection, ctx)

  // Clip to landmasses
  ctx.save()
  countries.features.forEach((feature) => {
    ctx.beginPath()
    path(feature)
  })
  ctx.clip()

  const rng = seededRandom(12026)
  const cityCount = 7800
  for (let i = 0; i < cityCount; i++) {
    const x = rng() * width
    const y = height * (0.1 + rng() * 0.78)
    const isBlue = rng() > 0.18
    const big = rng() > 0.88
    const size = big ? 2.2 : rng() > 0.7 ? 1.3 : 0.7
    const alpha = big ? 0.6 + rng() * 0.4 : 0.18 + rng() * 0.45

    if (big) {
      // Warm glow for metro areas
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 7)
      glow.addColorStop(0, isBlue ? `rgba(130,210,255,${alpha})` : `rgba(255,200,120,${alpha})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(x - size * 7, y - size * 7, size * 14, size * 14)
    }

    ctx.fillStyle = isBlue
      ? `rgba(100,190,255,${alpha})`
      : `rgba(255,${155 + Math.round(rng() * 75)},80,${alpha})`
    ctx.fillRect(x, y, size, size)
  }
  ctx.restore()

  // Key hub glows (Tokyo, Madrid, Lima, Santiago, Temuco, Arequipa, Trujillo, Concepcion)
  const hubs: [number, number, string, number][] = [
    [35.68, 139.76, '#9ed4ff', 7],
    [40.42, -3.7,   '#9ed4ff', 7],
    [-12.05, -77.04, '#ffb54d', 6],
    [-33.45, -70.67, '#50d4ff', 6],
    [-38.74, -72.59, '#50d4ff', 5],
    [-16.4,  -71.54, '#ffb54d', 4.5],
    [-8.11,  -79.03, '#ffb54d', 4],
    [-36.83, -73.05, '#50d4ff', 4.5],
  ]

  hubs.forEach(([lat, lon, color, radius]) => {
    const pt = projection([lon, lat])
    if (!pt) return
    const [px, py] = pt
    const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 6)
    glow.addColorStop(0, color)
    glow.addColorStop(0.25, color)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(px - radius * 6, py - radius * 6, radius * 12, radius * 12)
  })

  const tex = new THREE.CanvasTexture(cvs)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

/* ── Cloud alpha texture ────────────────────────────────────────────────── */
function createCloudTexture(width: number, height: number): THREE.CanvasTexture {
  const cvs = canvas(width, height)
  const ctx = cvs.getContext('2d')!

  const rng = seededRandom(501)
  // Multiple blur passes for soft layered clouds
  const passes = [
    { blur: 12, count: 180, alpha: 0.07 },
    { blur: 6,  count: 260, alpha: 0.05 },
    { blur: 3,  count: 140, alpha: 0.04 },
  ]

  for (const pass of passes) {
    ctx.filter = `blur(${pass.blur}px)`
    for (let i = 0; i < pass.count; i++) {
      const x = rng() * width
      const y = 40 + rng() * (height - 80)
      const len = 28 + rng() * 120
      const alpha = pass.alpha + rng() * 0.065
      ctx.strokeStyle = `rgba(215, 235, 252, ${alpha})`
      ctx.lineWidth = 3 + rng() * 9
      ctx.beginPath()
      ctx.arc(x, y, len, Math.PI * 0.15, Math.PI * (0.65 + rng() * 0.5))
      ctx.stroke()
    }
  }
  ctx.filter = 'none'

  const tex = new THREE.CanvasTexture(cvs)
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

/* ── Public API ──────────────────────────────────────────────────────────── */
export function createEarthTextures() {
  const W = 2048, H = 1024
  const day      = createDayTexture(W, H)
  const night    = createNightTexture(W, H)
  const specular = createSpecularTexture(W / 2, H / 2)
  const clouds   = createCloudTexture(1024, 512)
  return { day, night, specular, clouds }
}
