# Earth texture asset strategy

This build ships **procedurally generated** Earth textures (see
`src/lib/earthTexture.ts`). They are produced at runtime from the same
`world-atlas` country topology already used for geometry, rendered onto a
`<canvas>` and uploaded as `THREE.CanvasTexture`s:

- `day` — albedo map (oceans + landmasses, latitude-tinted)
- `night` — city-light emissive map, revealed only on the unlit hemisphere
  by the custom day/night terminator shader (`earthMaterial.ts`)
- `specular` — ocean/land mask used to restrict specular highlights to water
- `clouds` — soft, sparse cloud alpha layer

## Why procedural instead of shipped bitmaps

This repository has no vetted, redistributable, high-resolution Earth
imagery on disk, and the project rules for this pass explicitly forbid
hot-linking external image URLs at runtime (unstable, licensing risk, no
offline/build guarantee). Rather than guess at a CDN URL, the renderer
upgrades the *procedural* pipeline: real coastlines (via `world-atlas`),
a day/night terminator, specular ocean response and Fresnel rim lighting,
so the globe reads as a premium satellite render without any network
dependency.

## Swapping in real imagery later

If/when a properly licensed asset pack is approved (e.g. NASA Visible
Earth / Blue Marble, which is public domain), drop the files here using
these exact names and the loader in `earthTexture.ts` can be switched to
`THREE.TextureLoader` with almost no other changes:

```
public/textures/earth/day.jpg        (equirectangular albedo, 4096x2048)
public/textures/earth/night.jpg       (equirectangular city lights, 4096x2048)
public/textures/earth/specular.jpg    (equirectangular ocean mask, 2048x1024)
public/textures/earth/clouds.png      (equirectangular cloud alpha, 2048x1024)
```

Keep file sizes reasonable (JPEG quality ~80, or basis/ktx2 compressed) so
the preloader gate in `Preloader.tsx` stays fast on mobile connections.
