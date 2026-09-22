import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useExperienceStore } from '../../store/experienceStore'

/**
 * Scene 08 — IBIOL Value Scene (clean composition)
 *
 * After removing the floating IBIOL target system, this component renders
 * only the four value spatial labels that appear progressively as the user
 * scrolls through Scene 08.
 *
 * Earth is the visual anchor. The DOM headline communicates IBIOL.
 * These labels emerge in the negative space around the Earth as subtle
 * scroll-driven reveals.
 *
 * Progress windows (local p = scroll 0.80 → 0.95):
 *   0.30–0.55  TALENTO reveals
 *   0.40–0.65  CAPACIDADES reveals
 *   0.50–0.75  INNOVACIÓN reveals
 *   0.60–0.85  IMPACTO reveals
 *   0.85–1.00  full composition holds
 */

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)) }

const VALUE_PILLARS = [
  { id: 'talento',     label: '+ TALENTO',     startP: 0.30, pos: new THREE.Vector3(-1.05,  0.55, 0.04) },
  { id: 'capacidades', label: '+ CAPACIDADES', startP: 0.40, pos: new THREE.Vector3( 1.08,  0.55, 0.04) },
  { id: 'innovacion',  label: '+ INNOVACIÓN',  startP: 0.50, pos: new THREE.Vector3(-1.05, -0.72, 0.04) },
  { id: 'impacto',     label: '+ IMPACTO',     startP: 0.60, pos: new THREE.Vector3( 1.08, -0.72, 0.04) },
] as const

export function IbiolValueScene({ active }: { active: boolean }) {
  const scroll = useExperienceStore((s) => s.scrollProgress)

  const p = clamp((scroll - 0.80) / 0.15, 0, 1)

  const pillarOpacities = useMemo(
    () => VALUE_PILLARS.map((pillar) =>
      active ? clamp((p - pillar.startP) / 0.22, 0, 1) : 0
    ),
    [p, active],
  )

  const anyVisible = pillarOpacities.some((op) => op > 0.01)
  if (!active && !anyVisible) return null

  return (
    <group position={[1.20, 0.22, 2.7]} scale={0.74}>
      {VALUE_PILLARS.map((pillar, i) => {
        const op = pillarOpacities[i]
        if (op < 0.01) return null
        return (
          <group key={pillar.id} position={pillar.pos}>
            <Html center>
              <div className="ibiol-pillar-label" style={{ opacity: op }}>
                {pillar.label}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
