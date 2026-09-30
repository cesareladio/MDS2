/**
 * Centralized photo gallery paths for the cinematic Chile + Perú scene (Scene 02).
 *
 * GALLERY POLICY:
 * Each country has an ordered array of photo paths.
 * The gallery component cycles through them with soft crossfades.
 *
 * TO ADD / REPLACE FINAL STAKEHOLDER PHOTOGRAPHY:
 *   1. Drop the image files into public/photos/chile/ or public/photos/peru/
 *   2. Update the arrays below — no component changes required.
 *
 * 0 entries  → elegant fallback (country name + tagline, dark gradient)
 * 1 entry    → single static image, no crossfade
 * 2+ entries → automatic cinematic crossfade gallery
 *
 * Missing or broken files are skipped gracefully — no broken-image icon.
 */
export const countryPhotos = {
  chile: {
    photos: [
      '/photos/chile/team-01.jpg',
      '/photos/chile/team-02.jpg',
      '/photos/chile/office-01.jpg',
    ],
  },
  peru: {
    photos: [
      '/photos/peru/team-01.jpg',
      '/photos/peru/team-02.jpg',
      '/photos/peru/office-01.jpg',
    ],
  },
} as const
