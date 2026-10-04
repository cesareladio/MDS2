/**
 * B2DebugOverlay.tsx — overlay de diagnóstico con top matches.
 * Mostrar/ocultar con Alt+D.
 */

import { useEffect, useState } from 'react'
import { useAvatarStore } from '../store/avatarStore'

const IS_DEV = import.meta.env.DEV

export function B2DebugOverlay() {
  const [visible, setVisible] = useState(IS_DEV)

  const b2State         = useAvatarStore((s) => s.b2State)
  const pose            = useAvatarStore((s) => s.pose)
  const micState        = useAvatarStore((s) => s.micState)
  const frameCount      = useAvatarStore((s) => s.frameCount)
  const debugAngles     = useAvatarStore((s) => s.debugAngles)
  const debugInfo       = useAvatarStore((s) => s.debugInfo)
  const transcript      = useAvatarStore((s) => s.transcript)
  const matchCandidates = useAvatarStore((s) => s.matchCandidates)
  const hasEntered      = useAvatarStore((s) => s.hasAvatarEntered)

  useEffect(() => {
    if (!IS_DEV) return
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') setVisible((v) => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!IS_DEV || !visible) return null

  const frameOk = frameCount > 0

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      zIndex: 9999,
      background: 'rgba(0,0,0,.96)',
      color: '#7ef',
      fontFamily: 'monospace',
      fontSize: '10px',
      padding: '10px 14px',
      borderRadius: '6px',
      pointerEvents: 'none',
      lineHeight: 1.7,
      maxWidth: '460px',
      wordBreak: 'break-all',
      border: '1px solid rgba(120,200,255,.25)',
    }}>
      <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '3px', borderBottom: '1px solid #333', paddingBottom: '3px' }}>
        B2 SEMANTIC ROUTER <span style={{ color: '#555', fontSize: '9px' }}>Alt+D</span>
      </div>

      {/* Estado */}
      <div>FRAME: <b style={{ color: frameOk ? '#0f0' : '#f44' }}>{frameCount}</b>  MODEL VISIBLE: <b style={{ color: '#8ef' }}>check console</b></div>
      <div>STATE: <b style={{ color: b2State === 'entering' ? '#fa0' : b2State === 'speaking' ? '#afa' : b2State === 'listening' ? '#aaf' : b2State === 'hidden' ? '#f44' : '#0f0' }}>{b2State}</b>  MIC: <b style={{ color: micState === 'on' ? '#0f0' : '#888' }}>{micState}</b></div>
      <div>POSE: <b style={{ color: '#8ef' }}>{pose}</b>  ENTERED: <b style={{ color: hasEntered ? '#0f0' : '#fa0' }}>{hasEntered ? 'yes' : 'no'}</b></div>
      <div style={{ fontSize: '9px', color: '#666' }}>
        INTRO: {hasEntered ? 'done' : b2State === 'entering' ? 'running…' : 'armed — B key / __B2.introduce()'}
      </div>

      {/* Audio */}
      {debugInfo?.audioId && (
        <div>AUDIO: <b style={{ color: '#afa' }}>{debugInfo.audioId}.mp3</b></div>
      )}

      {/* Transcript */}
      {transcript && (
        <div style={{ marginTop: '3px', borderTop: '1px solid #333', paddingTop: '3px', color: '#aaf' }}>
          <span style={{ color: '#555' }}>TRANSCRIPT: </span>{transcript.substring(0, 70)}{transcript.length > 70 ? '…' : ''}
        </div>
      )}

      {/* Top matches */}
      {matchCandidates.length > 0 && (
        <div style={{ marginTop: '3px', borderTop: '1px solid #333', paddingTop: '3px' }}>
          <div style={{ color: '#888', fontSize: '9px', marginBottom: '2px' }}>TOP MATCHES:</div>
          {matchCandidates.slice(0, 4).map((c, i) => {
            const pct = (c.score * 100).toFixed(0)
            const accepted = debugInfo?.match?.label === c.intent
            const color = i === 0 ? (accepted ? '#afa' : '#fa8') : '#666'
            return (
              <div key={c.intent} style={{ color }}>
                {(c.intent + ' ').padEnd(24, '·')} <b>{pct}%</b>
                {accepted && i === 0 && <span style={{ color: '#0f0' }}> ✓ SELECTED</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Pose timing */}
      {debugAngles.poseTime !== undefined && (
        <div style={{ marginTop: '3px', borderTop: '1px solid #333', paddingTop: '3px', fontSize: '9px', color: '#666' }}>
          TIME: {debugAngles.poseTime.toFixed(2)}s
          {debugAngles.hy !== undefined && <span>  HY: {(debugAngles.hy * 1000).toFixed(0)}</span>}
          {debugAngles.s !== undefined && <span>  S: {debugAngles.s.toFixed(2)}</span>}
        </div>
      )}

      <div style={{ color: '#444', marginTop: '4px', fontSize: '8px', borderTop: '1px solid #222', paddingTop: '3px' }}>
        1-0=clips | E=replay | B=intro/next | __B2.introduce() | __B2.respond("INTENT") | Alt+D=toggle
      </div>
    </div>
  )
}
