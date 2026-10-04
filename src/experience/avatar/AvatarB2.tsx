import { Suspense } from 'react'
import { AvatarErrorBoundary } from './AvatarErrorBoundary'
import { AvatarB2Model } from './AvatarB2Model'
import { AvatarB2Placeholder } from './AvatarB2Placeholder'

/**
 * AvatarB2 — punto único de entrada al avatar 3D.
 * Encapsula la resiliencia: sin avatar.glb (o con error) se degrada al
 * placeholder low-poly sin romper el widget ni el resto de la experiencia.
 */
export function AvatarB2() {
  return (
    <AvatarErrorBoundary fallback={<AvatarB2Placeholder />}>
      <Suspense fallback={<AvatarB2Placeholder />}>
        <AvatarB2Model />
      </Suspense>
    </AvatarErrorBoundary>
  )
}
