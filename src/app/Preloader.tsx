import { useEffect, useState } from 'react'

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const started = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started
      const next = Math.min(100, Math.round((elapsed / 1450) * 100))
      setProgress(next)
      if (next >= 100) {
        window.clearInterval(timer)
        window.setTimeout(onComplete, 220)
      }
    }, 35)
    return () => window.clearInterval(timer)
  }, [onComplete])
  return (
    <div className="preloader" role="status" aria-label={`Cargando experiencia ${progress}%`}>
      <div className="brand-wordmark">NTT <strong>DATA</strong></div>
      <div className="load-copy"><span>Loading experience</span><span>{String(progress).padStart(2, '0')}%</span></div>
      <div className="load-line"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
    </div>
  )
}
