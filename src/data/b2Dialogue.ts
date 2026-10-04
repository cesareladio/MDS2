/**
 * b2Dialogue.ts — registro central de respuestas de B2.
 *
 * Paridad sección 31: UN gesto semántico por audio (no timelines de
 * múltiples cues — ver sección 14, "NO HACER TIMELINES COMPLEJOS TODAVÍA").
 * El gesto es un B2Pose (alias semántico) que se resuelve a un clip FBX real
 * vía POSE_TO_CLIP (b2Poses.ts). Si el gesto es one-shot y termina mientras
 * el audio sigue sonando, el motor (AvatarB2Model) cae a 'talking'
 * automáticamente (evento `finished` del mixer, sección 13).
 */

import type { B2Intent, B2Pose } from './b2Types'

export interface B2AudioPart {
  id: string
  pose: B2Pose
}

export interface B2Response {
  intent: B2Intent
  audios: B2AudioPart[]
}

export const B2_RESPONSES: Record<B2Intent, B2Response> = {
  INTRODUCE_B2: {
    intent: 'INTRODUCE_B2',
    audios: [
      { id: 'hola', pose: 'wave' },
      { id: 's01b', pose: 'talking' },
    ],
  },
  ASK_CUTE: {
    intent: 'ASK_CUTE',
    audios: [{ id: 's02', pose: 'laugh' }],
  },
  CONFIRM_DIGITAL: {
    intent: 'CONFIRM_DIGITAL',
    audios: [{ id: 's03', pose: 'talking' }],
  },
  ASK_DILEMMA: {
    intent: 'ASK_DILEMMA',
    audios: [{ id: 's04', pose: 'point' }],
  },
  AVOID_CONFLICT: {
    intent: 'AVOID_CONFLICT',
    audios: [{ id: 's05', pose: 'shy' }],
  },
  WISE_DECISION: {
    intent: 'WISE_DECISION',
    audios: [{ id: 's06', pose: 'talking' }],
  },
  COMPLEMENTARITY: {
    intent: 'COMPLEMENTARITY',
    audios: [{ id: 's07', pose: 'nod' }],
  },
  THANKS_AFTER_PISCO: {
    intent: 'THANKS_AFTER_PISCO',
    audios: [{ id: 's08', pose: 'shrug' }],
  },
  TEAM_UPDATE: {
    intent: 'TEAM_UPDATE',
    audios: [{ id: 's09', pose: 'talking' }],
  },
  START_RESULTS: {
    intent: 'START_RESULTS',
    audios: [{ id: 's10', pose: 'point' }],
  },
  START_CLOSING: {
    intent: 'START_CLOSING',
    audios: [{ id: 's11', pose: 'clap' }],
  },
  DISCONNECT_B2: {
    intent: 'DISCONNECT_B2',
    audios: [{ id: 's12', pose: 'laugh' }],
  },
  SHINE_TOGETHER: {
    intent: 'SHINE_TOGETHER',
    audios: [{ id: 's13', pose: 'shy' }],
  },
  FINAL_WARNING: {
    intent: 'FINAL_WARNING',
    audios: [{ id: 's14', pose: 'bye' }],
  },
  END_PRESENTATION: {
    intent: 'END_PRESENTATION',
    audios: [{ id: 's14', pose: 'bye' }],
  },
}

export const audioPath = (id: string) => `/assets/b2/audio/${id}.mp3`
