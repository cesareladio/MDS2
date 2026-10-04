/**
 * b2Types.ts — tipos centrales del sistema B2.
 */

// ─── STATE MACHINE ───────────────────────────────────────────────────────────

export type B2State =
  | 'hidden'
  | 'entering'
  | 'waiting'     // idle ejecutivo: espera click
  | 'listening'   // micrófono activo, escuchando a Bárbara
  | 'thinking'    // procesando, micro-reacción antes de responder
  | 'speaking'    // reproduciendo audio + animación
  | 'exiting'

// ─── POSES ───────────────────────────────────────────────────────────────────
//
// Nombres semánticos — idénticos a CFG.poseClips de b2-widget.js.
// Se resuelven a un clip FBX real vía POSE_TO_CLIP (ver b2Poses.ts).

export type B2Pose =
  | 'executiveIdle'  // alias de idle (postura base)
  | 'idle'
  | 'talking'
  | 'wave'
  | 'bye'
  | 'point'
  | 'shrug'
  | 'think'
  | 'laugh'
  | 'clap'
  | 'shy'
  | 'nod'
  | 'present'
  | 'open'
  | 'chest'
  | 'listen'

// ─── INTENTS ─────────────────────────────────────────────────────────────────

export type B2Intent =
  | 'INTRODUCE_B2'
  | 'ASK_CUTE'
  | 'CONFIRM_DIGITAL'
  | 'ASK_DILEMMA'
  | 'AVOID_CONFLICT'
  | 'WISE_DECISION'
  | 'COMPLEMENTARITY'
  | 'THANKS_AFTER_PISCO'
  | 'TEAM_UPDATE'
  | 'START_RESULTS'
  | 'START_CLOSING'
  | 'DISCONNECT_B2'
  | 'SHINE_TOGETHER'
  | 'FINAL_WARNING'
  | 'END_PRESENTATION'

// ─── SCENE CONTEXT ───────────────────────────────────────────────────────────

export type B2SceneId =
  | 'intro'
  | 'chile-peru'
  | 'one-gdne'
  | 'efficiency'
  | 'value'
  | 'challenges'
  | 'closing'

export interface B2SceneContext {
  scene: B2SceneId
  topic?: string
}

// ─── POSE TIMELINE ───────────────────────────────────────────────────────────

export interface B2PoseKeyframe {
  at: number   // segundos desde inicio del audio
  pose: B2Pose
}

// ─── SCRIPT TURN ─────────────────────────────────────────────────────────────

export interface B2Turn {
  id: number
  intent: B2Intent
  text: string
  audioId: string
  timeline: B2PoseKeyframe[]
  waitPose?: B2Pose
  completed?: boolean
}

// ─── INTENT MATCH RESULT ─────────────────────────────────────────────────────

export interface B2IntentMatch {
  intent: B2Intent
  confidence: number
}

// ─── SCENE REACTION ──────────────────────────────────────────────────────────

export type B2SceneReaction = 'data' | 'comparison' | 'achievement'

// ─── MIC STATE ───────────────────────────────────────────────────────────────

export type MicState = 'off' | 'on' | 'denied' | 'unavailable'
