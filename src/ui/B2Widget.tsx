/**
 * B2Widget.tsx — widget flotante de B2.
 *
 * El avatar ES el botón: click directo sobre él activa el micrófono.
 * Sin botones visibles, sin bubble, sin controles de UI.
 *
 * Arquitectura de pointer-events:
 *   .b2-widget          → pointer-events: none  (no bloquea presentación)
 *   .b2-widget__stage   → pointer-events: auto  (clickeable)
 *   Canvas (R3F)        → pointer-events: none  (sin orbit/controls)
 */

import { Suspense } from 'react'
import { AvatarB2Scene } from '../experience/avatar/AvatarB2Scene'
import { useB2Controller } from '../hooks/useB2Controller'
import { useAvatarStore } from '../store/avatarStore'
import { B2DebugOverlay } from './B2DebugOverlay'

export function B2Widget() {
  const { handleAvatarClick } = useB2Controller()

  const b2State   = useAvatarStore((s) => s.b2State)
  const currentText = useAvatarStore((s) => s.currentText)

  const isClickable = b2State === 'waiting' || b2State === 'listening'
  const isSpeaking  = b2State === 'speaking'
  const isListening = b2State === 'listening'

  return (
    <>
      <div className={[
        'b2-widget',
        isSpeaking  ? 'is-speaking'  : '',
        isListening ? 'is-listening' : '',
      ].filter(Boolean).join(' ')}>
        <div
          className={`b2-widget__stage${isClickable ? ' is-clickable' : ''}`}
          onClick={handleAvatarClick}
          role="button"
          aria-label={isListening ? 'B2 escuchando — click para cancelar' : 'Activar B2'}
          aria-pressed={isListening}
          tabIndex={isClickable ? 0 : -1}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAvatarClick() }}
        >
          <Suspense fallback={null}>
            <AvatarB2Scene />
          </Suspense>
        </div>
        <span className="b2-widget__sr-only" role="status" aria-live="polite">
          {currentText}
        </span>
      </div>
      <B2DebugOverlay />
    </>
  )
}
