# Earth texture assets

The runtime uses local 2:1 equirectangular satellite-derived imagery with the existing custom day/night terminator shader. Clouds are fully disabled.

- `earth-day-4k.jpg` — 4096x2048 JPEG, final cloudless daylight/albedo map. Source asset: `Whole world - land and oceans.jpg` by NASA Earth Observatory, derived from NASA Visible Earth Blue Marble source. The source is a cloud-compensated land/ocean surface mosaic; no atmospheric cloud layer is baked into this final map. JPEG quality was set to approximately 90 after resizing to 4096x2048.
- `earth-day.jpg` — active copy of `earth-day-4k.jpg`, 4096x2048.
- `earth-night-4k.jpg` — 4096x2048 JPEG city-lights map. Original asset name: `BlackMarble20161km.jpg`, NASA Suomi NPP VIIRS 2016 composite. The source selects cloud-free nights and contains city lights only on a black background. JPEG quality was set to approximately 90 after resizing to 4096x2048.
- `earth-night.jpg` — active copy of `earth-night-4k.jpg`, 4096x2048.
- `earth-specular.jpg` — 4096x2048 JPEG grayscale ocean mask generated from NASA's aligned `Land_shallow_topo_2048.jpg`; oceans are white/light grey and land is black. It contains no clouds and is loaded as `THREE.NoColorSpace`.
- `earth-clouds.png` — retained legacy file but not loaded or rendered.

Sources and reuse terms:

- Day source page: https://commons.wikimedia.org/wiki/File:Whole_world_-_land_and_oceans.jpg
- Day original asset name: `Whole world - land and oceans.jpg`; source URLs and NASA Visible Earth attribution are recorded on the source page.
- Night source page: https://commons.wikimedia.org/wiki/File:BlackMarble20161km.jpg
- Night original asset name: `BlackMarble20161km.jpg`; NASA Earth Observatory images by Joshua Stevens using Suomi NPP VIIRS data from Miguel Román, NASA Goddard Space Flight Center.
- Specular source page: https://commons.wikimedia.org/wiki/File:Land_shallow_topo_2048.jpg
- The listed NASA-derived source assets are marked Public domain on Wikimedia Commons under the NASA public-domain terms. NASA logos, insignia, and emblems are not included. Redistribution retains the source URLs and NASA attribution.

Modifications performed: resized/cropped only to 4096x2048 equirectangular JPEGs; day and night recompressed at approximately JPEG quality 90; generated the binary ocean/land specular mask from the aligned land/topography source. No borders, labels, watermarks, artificial atmosphere, or baked cloud layer were added. No bump map is used.
