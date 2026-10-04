import { Suspense } from 'react'
import { AvatarErrorBoundary } from './AvatarErrorBoundary'
import { AvatarB2Model } from './AvatarB2Model'
import { AvatarB2Placeholder } from './AvatarB2Placeholder'

/**
 * AvatarB2 — punto único de entrada al avatar 3D.
 * El Suspense fallback es null: no mostrar placeholder mientras carga.
 * El placeholder low-poly solo aparece si el GLB falla (ErrorBoundary).
 */
export function AvatarB2() {
  return (
    <AvatarErrorBoundary fallback={<AvatarB2Placeholder />}>
      <Suspense fallback={null}>
        <AvatarB2Model />
      </Suspense>
    </AvatarErrorBoundary>
  )
}
