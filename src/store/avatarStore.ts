/**
 * avatarStore.ts — store central de B2 (Zustand).
 */

import { create } from 'zustand'
import type { B2State, B2Pose, B2SceneContext, B2SceneReaction, MicState } from '../data/b2Types'
import type { AvatarState } from '../data/b2AvatarStates'
import type { IntentCandidate } from '../data/b2IntentMatcher'

export interface AvatarFrame {
  targetX: number
  targetY: number
  targetZ: number
  distance: number
  fov: number
}

export interface B2MatchInfo {
  label: string
  confidence: number
}

export interface B2DebugInfo {
  state: B2State
  turn: number
  mic: MicState
  transcript: string
  match: B2MatchInfo | null
  audioId: string
  pose: string
}

export interface DebugAngles {
  rArmDeg:      number
  headDeg:      number
  breathDeg?:   number
  worldDirStr?: string
  poseTime?:    number
  hy?:          number
  hx?:          number
  s?:           number
  c?:           number
}

interface AvatarStoreState {
  b2State:           B2State
  pose:              B2Pose
  /** Estado del nuevo motor de animación (avatar_web.glb). */
  avatarState:       AvatarState
  audioEnergy:       number
  micState:          MicState
  currentTurnIndex:  number
  currentText:       string
  transcript:        string
  audioUnlocked:     boolean
  frame:             AvatarFrame
  sceneContext:      B2SceneContext | null
  debugInfo:         B2DebugInfo | null
  isHovered:         boolean
  /** Contador de frames R3F — confirma que useFrame corre */
  frameCount:        number
  /** Deltas de bones para overlay de diagnóstico */
  debugAngles:       DebugAngles
  /** Últimos candidatos del intent matcher (para overlay) */
  matchCandidates:   IntentCandidate[]
  /** Entrada de B2 completada (no repetir entre slides) */
  hasAvatarEntered:  boolean

  setB2State:            (s: B2State) => void
  setPose:               (p: B2Pose) => void
  setAvatarState:        (s: AvatarState) => void
  setAudioEnergy:        (e: number) => void
  setMicState:           (m: MicState) => void
  setCurrentTurnIndex:   (i: number) => void
  setCurrentText:        (t: string) => void
  setTranscript:         (t: string) => void
  setAudioUnlocked:      (v: boolean) => void
  setFrame:              (f: AvatarFrame) => void
  setSceneContext:       (ctx: B2SceneContext) => void
  reactToScene:          (reaction: B2SceneReaction) => void
  setDebugInfo:          (d: B2DebugInfo | null) => void
  setHovered:            (v: boolean) => void
  setFrameCount:         (n: number) => void
  setDebugAngles:        (a: DebugAngles) => void
  setMatchCandidates:    (c: IntentCandidate[]) => void
  setHasAvatarEntered:   (v: boolean) => void
}

const DEFAULT_FRAME: AvatarFrame = {
  targetX: 0, targetY: 1.3, targetZ: 0, distance: 2.3, fov: 28,
}

export const useAvatarStore = create<AvatarStoreState>((set) => ({
  b2State:          'hidden',
  pose:             'executiveIdle',
  avatarState:      'executiveIdle',
  audioEnergy:      0,
  micState:         'off',
  currentTurnIndex: -1,
  currentText:      '',
  transcript:       '',
  audioUnlocked:    false,
  frame:            DEFAULT_FRAME,
  sceneContext:     null,
  debugInfo:        null,
  isHovered:        false,
  frameCount:       0,
  debugAngles:      { rArmDeg: 0, headDeg: 0 },
  matchCandidates:  [],
  hasAvatarEntered: false,

  setB2State:           (b2State)          => set({ b2State }),
  setPose:              (pose)             => set({ pose }),
  setAvatarState:       (avatarState)      => set({ avatarState }),
  setAudioEnergy:       (audioEnergy)      => set({ audioEnergy }),
  setMicState:          (micState)         => set({ micState }),
  setCurrentTurnIndex:  (currentTurnIndex) => set({ currentTurnIndex }),
  setCurrentText:       (currentText)      => set({ currentText }),
  setTranscript:        (transcript)       => set({ transcript }),
  setAudioUnlocked:     (audioUnlocked)    => set({ audioUnlocked }),
  setFrame:             (frame)            => set({ frame }),
  setSceneContext:      (sceneContext)      => set({ sceneContext }),
  reactToScene: (reaction) => {
    const poseMap: Record<string, B2Pose> = {
      data:        'point',
      comparison:  'present',
      achievement: 'open',
    }
    const pose = (poseMap[reaction] ?? 'listen') as B2Pose
    set({ pose })
  },
  setDebugInfo:    (debugInfo)    => set({ debugInfo }),
  setHovered:      (isHovered)   => set({ isHovered }),
  setFrameCount:   (frameCount)  => set({ frameCount }),
  setDebugAngles:      (debugAngles)     => set({ debugAngles }),
  setMatchCandidates:  (matchCandidates) => set({ matchCandidates }),
  setHasAvatarEntered: (hasAvatarEntered) => set({ hasAvatarEntered }),
}))
