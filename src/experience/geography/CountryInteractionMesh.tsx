import { useMemo } from 'react'
import * as THREE from 'three'
import type { FeatureCollection } from 'geojson'
import { extractCountryPolygons, ringToSpherePoints } from '../../lib/countryGeo'

interface CountryInteractionMeshProps {
  geo: FeatureCollection
  countryId: number
  active: boolean
  onEnter: () => void
  onLeave: () => void
  onClick: () => void
}

export function CountryInteractionMesh({ geo, countryId, active, onEnter, onLeave, onClick }: CountryInteractionMeshProps) {
  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry()
    const vertices: number[] = []
    for (const polygon of extractCountryPolygons(geo, countryId)) {
      const contour = polygon[0].map(([lon, lat]) => new THREE.Vector2(lon, lat))
      const holes = polygon.slice(1).map((ring) => ring.map(([lon, lat]) => new THREE.Vector2(lon, lat)))
      const triangles = THREE.ShapeUtils.triangulateShape(contour, holes)
      const points = [...polygon[0], ...polygon.slice(1).flat()]
      for (const triangle of triangles as unknown as THREE.Vector2[][]) {
        for (const point of triangle) {
          const source = points.find(([lon, lat]) => Math.abs(lon - point.x) < 1e-8 && Math.abs(lat - point.y) < 1e-8)
          if (source) vertices.push(...ringToSpherePoints([source], 2.045)[0].toArray())
        }
      }
    }
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    result.computeVertexNormals()
    return result
  }, [geo, countryId])

  if (!active || geometry.attributes.position.count === 0) return null
  return (
    <mesh geometry={geometry} onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onClick}>
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}
