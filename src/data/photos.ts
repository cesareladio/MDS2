/**
 * Centralized photo asset paths for the cinematic Chile + Perú entry scene.
 *
 * Files are NOT guaranteed to exist yet — CountryPhotoPanel must degrade
 * gracefully (no broken-image icon, no layout shift) if a path 404s.
 * Drop real photography into /public/photos using these exact filenames
 * and the experience picks them up automatically.
 */
export const countryPhotos = {
  peru: {
    team: '/photos/peru-team.jpg',
    office: '/photos/peru-office.jpg',
  },
  chile: {
    team: '/photos/chile-team.jpg',
    office: '/photos/chile-office.jpg',
  },
} as const
