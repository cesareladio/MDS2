import { useEffect, useState } from 'react'
import { presentationData } from '../data/presentation'
import { useExperienceStore } from '../store/experienceStore'

type Country = 'peru' | 'chile'

const CYCLE_MS = 7500

export function CountryPhotoPanel({ country }: { country: Country }) {
  const data = presentationData[country]
  const photos = [data.photos.team, data.photos.office]
  const reduced = useExperienceStore((state) => state.reducedMotion)
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length)
    }, CYCLE_MS)
    return () => window.clearInterval(id)
  }, [reduced, photos.length])

  const availableCount = photos.filter((_, i) => !failed[i]).length
  const allFailed = availableCount === 0
  const firstAvailable = photos.findIndex((_, i) => !failed[i])

  return (
    <div className={`country-photo-panel country-photo-panel--${country}`} aria-hidden="true">
      {allFailed ? (
        <div className="country-photo-panel__fallback">
          <span>{data.identity.name}</span>
        </div>
      ) : (
        photos.map((src, i) => {
          if (failed[i]) return null
          const visible = reduced ? i === firstAvailable : i === index
          return (
            <img
              key={src}
              src={src}
              alt=""
              className="country-photo-panel__img"
              style={{ opacity: visible ? 1 : 0 }}
              onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
            />
          )
        })
      )}
      <div className="country-photo-panel__frame" />
    </div>
  )
}
