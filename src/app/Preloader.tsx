import { useEffect, useState } from 'react'

const criticalAssets = [
  '/textures/earth/earth-day-4k.jpg',
  '/textures/earth/earth-night-4k.jpg',
  '/textures/earth/earth-specular.jpg',
  '/geo/south-america.geojson',
  '/flags/peru.svg',
  '/flags/chile.svg',
]

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let cancelled = false
    Promise.all(criticalAssets.map(async (asset) => {
      const response = await fetch(asset)
      if (!response.ok) throw new Error(`Critical asset unavailable: ${asset}`)
      return response
    })).then(() => {
      if (!cancelled) {
        setProgress(100)
        window.setTimeout(onComplete, 220)
      }
    }).catch(() => {
      if (!cancelled) onComplete()
    })
    return () => { cancelled = true }
  }, [onComplete])
  return (
    <div className="preloader" role="status" aria-label={`Cargando experiencia ${progress}%`}>
      <div className="brand-wordmark">NTT <strong>DATA</strong></div>
      <div className="load-copy"><span>Loading experience</span><span>{String(progress).padStart(2, '0')}%</span></div>
      <div className="load-line"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
    </div>
  )
}
