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

import { Suspense, useEffect } from 'react'
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
  // Stage visible en cuanto el engine inicia la entrada (b2State != 'hidden')
  const isStageVisible = b2State !== 'hidden'

  // Ocultar stage de B2 sincrónicamente durante page reload/navigation.
  // Evita que Chrome conserve un frame congelado de B2 visible al recargar.
  // NO llama hideB2() — no modifica state, mixer ni entrada.
  useEffect(() => {
    const hide = () => document.documentElement.classList.add('b2-page-unloading')
    const show = () => document.documentElement.classList.remove('b2-page-unloading')
    window.addEventListener('beforeunload', hide)
    window.addEventListener('pagehide',     hide)
    window.addEventListener('pageshow',     show)
    return () => {
      window.removeEventListener('beforeunload', hide)
      window.removeEventListener('pagehide',     hide)
      window.removeEventListener('pageshow',     show)
    }
  }, [])

  return (
    <>
      <div className={[
        'b2-widget',
        isSpeaking  ? 'is-speaking'  : '',
        isListening ? 'is-listening' : '',
      ].filter(Boolean).join(' ')}>
        <div
          className={[
            'b2-widget__stage',
            isClickable    ? 'is-clickable' : '',
            isStageVisible ? 'b2-stage-visible' : '',
          ].filter(Boolean).join(' ')}
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
