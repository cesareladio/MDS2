/**
 * b2Clips.ts — configuración de clips FBX Mixamo, puerto literal de
 * CFG.clips / CFG.entrance de b2-widget.js (b2-avatar6, SOLO LECTURA).
 *
 * entranceClip = 'walk' — NO female_start_walking (ver README del plan de
 * paridad, sección "DESCUBRIMIENTO IMPORTANTE").
 */

export const CLIP_NAMES = [
  'idle', 'talking', 'greeting', 'pointing', 'thinking', 'shrugging',
  'laughing', 'clapping', 'bashful', 'nod', 'walk',
] as const

export type ClipName = (typeof CLIP_NAMES)[number]

const ANIM_BASE = '/assets/b2/anims'

export const CLIP_URLS: Record<ClipName, string> = {
  idle:      `${ANIM_BASE}/idle.fbx`,
  talking:   `${ANIM_BASE}/talking.fbx`,
  greeting:  `${ANIM_BASE}/greeting.fbx`,
  pointing:  `${ANIM_BASE}/pointing.fbx`,
  thinking:  `${ANIM_BASE}/thinking.fbx`,
  shrugging: `${ANIM_BASE}/shrugging.fbx`,
  laughing:  `${ANIM_BASE}/laughing.fbx`,
  clapping:  `${ANIM_BASE}/clapping.fbx`,
  bashful:   `${ANIM_BASE}/bashful.fbx`,
  nod:       `${ANIM_BASE}/nod.fbx`,
  walk:      `${ANIM_BASE}/walk.fbx`,
}

/** Clips que deben hacer loop (resto = one-shot, LoopOnce + clamp). */
export const LOOP_CLIPS = new Set<ClipName>(['idle', 'talking', 'walk'])

export const ENTRANCE_CLIP: ClipName = 'walk'

export const ENTRANCE_CONFIG = {
  time: 4.5,
  from: { x: +2.6, z: -7 },
  turnMs: 600,
}

export const CROSSFADE_S = 0.35
