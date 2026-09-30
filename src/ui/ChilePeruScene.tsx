import { useEffect, useRef, useState } from 'react'
import { countryIdentity } from '../data/countryIdentity'
import { countryPhotos } from '../data/photos'
import { useExperienceStore } from '../store/experienceStore'

const HOLD_MS = 4500
const PERU_HOLD_MS = 6000
const STAGGER_MS = 2200

type Country = 'chile' | 'peru'

function GalleryCard({ country, staggerMs, active, reducedMotion, holdMs = HOLD_MS }: {
  country: Country
  staggerMs: number
  active: boolean
  reducedMotion: boolean
  holdMs?: number
}) {
  const identity = countryIdentity[country]
  const sources = countryPhotos[country].photos
  const [loaded, setLoaded] = useState<number[]>([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    const requests = sources.map((source, index) => {
      const image = new Image()
      image.onload = () => {
        if (!cancelled) {
          setLoaded((previous) => previous.includes(index) ? previous : [...previous, index])
        }
      }
      image.onerror = () => undefined
      image.src = source
      return image
    })

    return () => {
      cancelled = true
      requests.forEach((image) => { image.onload = null; image.onerror = null })
    }
  }, [sources])

  useEffect(() => {
    if (!loaded.includes(current) && loaded.length > 0) setCurrent(loaded[0])
  }, [current, loaded])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!active || reducedMotion || loaded.length < 2) return

    const delay = staggerMs || holdMs
    const schedule = (wait: number) => {
      timerRef.current = setTimeout(() => {
        setCurrent((previous) => {
          const currentPosition = loaded.indexOf(previous)
          return loaded[(currentPosition + 1) % loaded.length]
        })
        schedule(holdMs)
      }, wait)
    }

    schedule(delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, loaded, reducedMotion, staggerMs, holdMs])

  const validPhotos = loaded.map((index) => ({ index, source: sources[index] }))

  return (
    <figure
      className={`cpcard cpcard--${country}`}
      tabIndex={0}
      aria-label={`${identity.name} · ${identity.tagline}`}
    >
      {validPhotos.length === 0 ? (
        <div className="cpcard__fallback" aria-hidden="true" />
      ) : (
        validPhotos.map(({ index, source }) => (
          <img
            key={source}
            src={source}
            alt=""
            className={`cpcard__photo${index === current ? ' cpcard__photo--visible' : ''}`}
            aria-hidden="true"
          />
        ))
      )}
      <div className="cpcard__gradient" aria-hidden="true" />
      <figcaption className="cpcard__caption">
        <strong className={`cpcard__name cpcard__name--${country}`}>{identity.name}</strong>
        <span className="cpcard__tagline">{identity.tagline}</span>
      </figcaption>
      <div className={`cpcard__border cpcard__border--${country}`} aria-hidden="true" />
    </figure>
  )
}

export function ChilePeruScene() {
  const phase = useExperienceStore((state) => state.phase)
  const reducedMotion = useExperienceStore((state) => state.reducedMotion)
  const active = phase === 'chilePeru'

  return (
    <div className="cp-scene">
      <header className="cp-scene__header">
        <p className="cp-scene__kicker">
          <span className="cp-scene__kicker-num">02</span>
          Chile + Perú
        </p>
        <h2 className="cp-scene__headline">
          <span className="cp-scene__headline-a">Dos identidades.</span>
          <br />
          <em className="cp-scene__headline-b">Una capacidad.</em>
        </h2>
        <p className="cp-scene__copy">
          Diferentes historias.<br />
          Fortalezas complementarias.<br />
          Un mismo propósito para IBIOL.
        </p>
        <strong className="cp-scene__gdne">One GDN-E</strong>
      </header>
      <div className="cp-scene__cards">
        <GalleryCard country="chile" staggerMs={0} active={active} reducedMotion={reducedMotion} />
        <GalleryCard country="peru" staggerMs={STAGGER_MS} active={active} reducedMotion={reducedMotion} holdMs={PERU_HOLD_MS} />
      </div>
    </div>
  )
}
