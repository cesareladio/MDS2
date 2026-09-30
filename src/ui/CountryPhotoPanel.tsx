import { useState } from 'react'
import { countryPhotos } from '../data/photos'
import { countryIdentity } from '../data/countryIdentity'

type Country = 'peru' | 'chile'

/**
 * CountryPhotoPanel — legacy single-photo panel.
 * Currently unused in the main story (ChilePeruScene handles Scene 02).
 * Shows the first available photo from the gallery array.
 */
export function CountryPhotoPanel({ country }: { country: Country }) {
  const identity = countryIdentity[country]
  const src = countryPhotos[country].photos[0] ?? ''
  const [failed, setFailed] = useState(false)

  return (
    <div className={`country-photo-panel country-photo-panel--${country}`} aria-hidden="true">
      {failed || !src ? (
        <div className="country-photo-panel__fallback">
          <span>{identity.name}</span>
        </div>
      ) : (
        <img
          src={src}
          alt=""
          className="country-photo-panel__img"
          style={{ opacity: 1 }}
          onError={() => setFailed(true)}
        />
      )}
      <div className="country-photo-panel__frame" />
    </div>
  )
}
