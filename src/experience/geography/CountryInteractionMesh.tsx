import { useMemo } from 'react'
import * as THREE from 'three'
import type { FeatureCollection } from 'geojson'
import { extractCountryPolygons } from '../../lib/countryGeo'
import { latLonToVector3 } from '../../lib/geo'

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
      const contour = polygon[0].map(
        ([lon, lat]) => new THREE.Vector2(lon, lat)
      )

      const holes = polygon.slice(1).map((ring) =>
        ring.map(([lon, lat]) => new THREE.Vector2(lon, lat))
      )

      const triangles =
        THREE.ShapeUtils.triangulateShape(contour, holes)

      const allPoints = [
        ...contour,
        ...holes.flat()
      ]

      for (const triangle of triangles) {
        for (const index of triangle) {
          const point = allPoints[index]
          const spherePoint = latLonToVector3(
            point.y,
            point.x,
            2.045
          )

          vertices.push(
            spherePoint.x,
            spherePoint.y,
            spherePoint.z
          )
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
