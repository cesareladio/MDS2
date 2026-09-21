# Earth texture assets

The runtime uses local equirectangular imagery and keeps the existing day/night terminator shader:

- `earth-day.jpg` — NASA Blue Marble-derived daylight map, 2048x1024.
- `earth-night.jpg` — NASA Black Marble-derived city-light map.
- `earth-clouds.png` — cloud alpha layer.
- `specular` — generated ocean fallback mask; no separate specular asset is required.

The files are bundled locally; runtime code does not hotlink remote URLs. NASA source credits are retained in the asset provenance: Blue Marble (`svs.gsfc.nasa.gov/2915`) and Black Marble (`science.nasa.gov/earth/earth-observatory/earth-at-night/maps/`). The cloud layer is the locally bundled open webgl-earth cloud map and should retain its upstream attribution if redistributed.

A normal map is intentionally optional and currently absent. The loader uses a generated specular fallback, so missing optional maps cannot block startup. The preloader gates on the day, night, clouds, GeoJSON, and flag assets.
