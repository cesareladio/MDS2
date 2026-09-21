# South America GeoJSON asset

`south-america.geojson` is extracted (not hand-approximated) from the
`world-atlas` `countries-110m` topology already used elsewhere in this
project, filtered to South American ISO numeric country codes. It is
regenerated with the throwaway script below (kept here for reproducibility,
not part of the build):

```js
import { feature } from 'topojson-client'
import fs from 'fs'
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'))
const countries = feature(topo, topo.objects.countries)
const southAmericaIds = new Set(['032','068','076','152','170','218','238','254','328','600','604','740','858','862'])
const sa = countries.features.filter(f => southAmericaIds.has(String(f.id).padStart(3, '0')))
fs.writeFileSync('public/geo/south-america.geojson', JSON.stringify({
  type: 'FeatureCollection',
  features: sa.map(f => ({ type: 'Feature', id: f.id, properties: { iso_n3: f.id }, geometry: f.geometry })),
}))
```

Peru = `604`, Chile = `152`. The rest of the continent is included only as
subdued context geometry. This file is fetched by the preloader (see
`src/lib/countryGeo.ts`) so real country borders — not manual lat/lon
polylines — drive `CountryHighlight` and the Peru/Chile raycast surfaces.
