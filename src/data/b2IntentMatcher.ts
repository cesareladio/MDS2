/**
 * b2IntentMatcher.ts — router semántico global de intents.
 *
 * Arquitectura:
 *   transcript → normalize → score all intents globally → context bonuses
 *   → ambiguity check → threshold → IntentMatch
 *
 * NO hay currentTurn como bloqueo.
 * El contexto reciente (previousIntent, lastResponse) solo da bonuses
 * o protege contra false positives en frases genéricas.
 *
 * Thresholds:
 *   >= 0.65  → aceptar directamente
 *   0.52–0.64 → aceptar si variant/keyword strong ó context ayuda
 *   < 0.52   → no ejecutar
 *   gap topScore - secondScore >= 0.08 exigido en franja 0.52–0.64
 *
 * Frases genéricas (THANKS_AFTER_PISCO, START_RESULTS) requieren
 * contexto conversacional para activarse solas.
 */

import type { B2Intent } from './b2Types'

// ─── INTERFACES ────────────────────────────────────────────────────────────

export interface IntentMatch {
  intent: B2Intent
  score: number
  reason: string
}

export interface IntentCandidate {
  intent: B2Intent
  score: number
}

export interface MatchContext {
  /** Intent respondido más recientemente */
  previousIntent?: B2Intent | null
  /** Escena activa (puede aportar pequeño boost) */
  sceneContext?: string | null
}

export interface MatchResult {
  best: IntentMatch
  candidates: IntentCandidate[]
  ambiguous: boolean
  accepted: boolean
}

// ─── DEFINICIÓN DE INTENTS ────────────────────────────────────────────────

interface IntentDefinition {
  intent: B2Intent
  variants: string[]
  keywords: string[]
  /** Intents anteriores que activan un bonus de contexto */
  contextFrom?: B2Intent[]
  /** Si true, requiere contexto conversacional para activarse con frases cortas */
  requiresContext?: boolean
  /** Boost de escena: si la escena contiene esta keyword, dar bonus */
  sceneKeywords?: string[]
}

const INTENT_DEFS: IntentDefinition[] = [
  {
    intent: 'INTRODUCE_B2',
    variants: [
      'saluda al equipo',
      'saluda a todos',
      'presentate',
      'b2 presentate',
      'te presento al equipo',
      'saluda al equipo ejecutivo',
      'ahora te toca b2',
      'b2 saluda al equipo',
      'b2 te presento al equipo',
      'te presento al equipo ejecutivo',
      'b2 conoce al equipo',
      'con nosotros esta b2',
      'traje refuerzos b2',
      'saluda a todos b2',
      'b2 saluda a todos',
      'presentate b2',
      'b2 aca estas',
    ],
    keywords: ['saluda', 'presentate', 'equipo', 'ejecutivo', 'presento', 'toca', 'refuerzos', 'conoce', 'traje'],
  },
  {
    intent: 'ASK_CUTE',
    variants: [
      'a que te refieres',
      'que quieres decir',
      'explicate',
      'como asi',
      'por que dices eso',
    ],
    keywords: ['refieres', 'quieres', 'decir', 'explicate', 'dices', 'como', 'asi'],
    contextFrom: ['INTRODUCE_B2'],
  },
  {
    intent: 'CONFIRM_DIGITAL',
    variants: [
      'eres digital',
      'definitivamente eres digital',
      'confirmas que eres digital',
      'ya veo que eres digital',
    ],
    keywords: ['digital', 'confirma', 'confirmas', 'eres'],
    contextFrom: ['INTRODUCE_B2', 'ASK_CUTE'],
  },
  {
    intent: 'ASK_DILEMMA',
    variants: [
      'que hiciste ahora',
      'cual es el dilema',
      'que problema tienes',
      'que paso ahora',
      'que hiciste b2',
    ],
    keywords: ['dilema', 'problema', 'hiciste', 'ahora', 'paso', 'que'],
    contextFrom: ['CONFIRM_DIGITAL'],
  },
  {
    intent: 'AVOID_CONFLICT',
    variants: [
      'no entremos en conflicto',
      'no discutamos',
      'no generemos conflicto',
      'dejemos el pisco tranquilo',
      'mejor no peleemos',
    ],
    keywords: ['conflicto', 'discutamos', 'peleemos', 'tranquilo', 'pisco', 'no'],
  },
  {
    intent: 'WISE_DECISION',
    variants: [
      'sabia decision',
      'buena decision',
      'me parece bien',
      'mejor asi',
      'buena idea',
    ],
    keywords: ['sabia', 'buena', 'decision', 'idea', 'acuerdo', 'parece'],
    contextFrom: ['AVOID_CONFLICT'],
  },
  {
    intent: 'COMPLEMENTARITY',
    variants: [
      'somos un solo equipo',
      'somos complementarios',
      'chile y peru se complementan',
      'lo mejor de ambos paises',
      'podemos construir juntos',
    ],
    keywords: ['complementario', 'complementarios', 'equipo', 'chile', 'peru', 'juntos', 'ambos', 'paises'],
  },
  {
    intent: 'THANKS_AFTER_PISCO',
    variants: [
      'gracias',
      'muchas gracias',
      'perfecto gracias',
    ],
    keywords: ['gracias', 'perfecto'],
    contextFrom: ['COMPLEMENTARITY', 'AVOID_CONFLICT', 'WISE_DECISION'],
    requiresContext: true,
  },
  {
    intent: 'TEAM_UPDATE',
    variants: [
      'danos un update',
      'update de los equipos',
      'como estan nuestros equipos',
      'cuentanos de los equipos',
      'muestranos los numeros',
      'actualizanos los datos',
      'como vamos con los equipos',
    ],
    keywords: ['update', 'equipo', 'equipos', 'numeros', 'datos', 'gente'],
    sceneKeywords: ['equipos', 'chile', 'peru', 'one-gdne'],
  },
  {
    intent: 'START_RESULTS',
    variants: [
      'vamos con eso',
      'adelante',
      'comencemos',
      'veamoslo',
      'muestranos',
      'vamos',
    ],
    keywords: ['vamos', 'adelante', 'comencemos', 'muestranos', 'veamoslo'],
    contextFrom: ['TEAM_UPDATE'],
    requiresContext: true,
  },
  {
    intent: 'START_CLOSING',
    variants: [
      'creo que es todo',
      'para cerrar',
      'podemos cerrar',
      'llegamos al final',
      'en resumen somos un equipo',
    ],
    keywords: ['cerrar', 'terminar', 'final', 'todo', 'equipo', 'claro', 'resumen'],
  },
  {
    intent: 'DISCONNECT_B2',
    variants: [
      'te desconecto',
      'que hago contigo',
      'ya terminamos b2',
      'viene mas gente',
      'ahora te apagamos',
    ],
    keywords: ['desconecto', 'apagamos', 'terminamos', 'contigo', 'gente', 'desconectamos'],
  },
  {
    intent: 'SHINE_TOGETHER',
    variants: [
      'podemos brillar juntas',
      'las dos podemos brillar',
      'hacemos buen equipo',
      'podemos trabajar juntas',
    ],
    keywords: ['brillar', 'equipo', 'juntas', 'trabajar', 'buen'],
    contextFrom: ['DISCONNECT_B2'],
  },
  {
    intent: 'FINAL_WARNING',
    variants: [
      'no abuses',
      'no abuses de mi simpatia',
      'ya suficiente',
      'no te pases',
      'tranquila b2',
    ],
    keywords: ['abuses', 'simpatia', 'suficiente', 'pases', 'tranquila'],
    contextFrom: ['SHINE_TOGETHER'],
  },
  {
    intent: 'END_PRESENTATION',
    variants: [
      'gracias b2 muy bien',
      'eso es todo muchas gracias',
      'hasta luego b2',
    ],
    keywords: ['hasta', 'luego', 'bien', 'todo'],
    requiresContext: true,
    contextFrom: ['FINAL_WARNING', 'START_CLOSING'],
  },
]

// ─── NORMALIZACIÓN ────────────────────────────────────────────────────────

// Normaliza aliases de "B2" antes de procesar (sección 14)
// No modifica el transcript visible — solo el normalizado para matching.
const B2_ALIASES = /\bb\s?2\b|b\s?dos|be\s?dos|ve\s?dos|bedos/gi

export function normalizeText(text: string): string {
  return text
    .replace(B2_ALIASES, 'b2')   // canonicalizar aliases
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── SIMILITUD JACCARD (tokens) ────────────────────────────────────────────

const STOP_WORDS = new Set([
  'que', 'los', 'las', 'del', 'por', 'con', 'una', 'uno', 'para', 'como',
  'pero', 'mas', 'eso', 'esto', 'muy', 'sus', 'sin', 'hay', 'son', 'les',
  'nos', 'mis', 'tus', 'ya', 'yo', 'me', 'se', 'al', 'la', 'el', 'en',
  'un', 'es', 'de', 'no', 'si', 'mi', 'tu', 'su', 'te',
])

function tokenize(normalized: string): Set<string> {
  return new Set(
    normalized.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  )
}

function jaccardSimilarity(tokensA: Set<string>, tokensB: Set<string>): number {
  if (!tokensA.size || !tokensB.size) return 0
  let inter = 0
  tokensA.forEach((w) => { if (tokensB.has(w)) inter++ })
  return (2 * inter) / (tokensA.size + tokensB.size)
}

// ─── BEST VARIANT MATCH ───────────────────────────────────────────────────

function bestVariantScore(normalized: string, normTokens: Set<string>, variants: string[]): number {
  let best = 0
  for (const v of variants) {
    const normV = normalizeText(v)
    // Exact / substring match
    if (normalized === normV) return 1.0
    if (normalized.includes(normV)) return 0.95
    if (normV.includes(normalized) && normalized.length > 6) return 0.90
    // Jaccard token similarity
    const vTokens = tokenize(normV)
    const j = jaccardSimilarity(normTokens, vTokens)
    if (j > best) best = j
  }
  return best
}

// ─── KEYWORD COVERAGE ─────────────────────────────────────────────────────

function keywordScore(normalized: string, keywords: string[]): number {
  if (!keywords.length) return 0
  const matched = keywords.filter((k) => normalized.includes(k))
  return matched.length / keywords.length
}

// ─── SCORE ÚNICO POR INTENT ───────────────────────────────────────────────

function computeScore(
  normalized: string,
  normTokens: Set<string>,
  def: IntentDefinition,
  ctx: MatchContext,
): number {
  const varSim = bestVariantScore(normalized, normTokens, def.variants)

  // Cortocircuito: variant exacta
  if (varSim >= 0.95) return varSim

  const kwCov = keywordScore(normalized, def.keywords)

  // Pesos: 45% variant similarity + 30% keyword coverage (calc raw)
  let score = varSim * 0.45 + kwCov * 0.45

  // Context bonus (max +0.12): previousIntent es uno de contextFrom
  if (def.contextFrom && ctx.previousIntent && def.contextFrom.includes(ctx.previousIntent)) {
    score = Math.min(score + 0.12, 1.0)
  }

  // Scene keyword bonus (max +0.05)
  if (def.sceneKeywords && ctx.sceneContext) {
    const normScene = ctx.sceneContext.toLowerCase()
    if (def.sceneKeywords.some((sk) => normScene.includes(sk))) {
      score = Math.min(score + 0.05, 1.0)
    }
  }

  return score
}

// ─── THRESHOLD ─────────────────────────────────────────────────────────────
//
// Activación click-to-talk: el usuario hizo un gesto explícito para hablar.
// Por tanto preferir siempre responder al best intent si supera el mínimo.
// No se bloquea por ambigüedad entre candidatos — el contexto (previousIntent)
// resuelve ambigüedades de forma aditiva (bonus de score), no restrictiva.

export const B2_INTENT_THRESHOLD = 0.30

// ─── MATCHER GLOBAL ────────────────────────────────────────────────────────

/**
 * matchIntent — evalúa todos los intents globalmente.
 * No hay bloqueo por turno. No hay bloqueo por ambigüedad.
 * Acepta si bestScore >= 0.30.
 * requiresContext sólo aplica como soft-guard para frases de 1 token
 * sin ninguna keyword (score basal < 0.15).
 */
export function matchIntent(
  transcript: string,
  ctx: MatchContext = {},
): MatchResult {
  const normalized = normalizeText(transcript)
  const normTokens = tokenize(normalized)

  const all: IntentCandidate[] = INTENT_DEFS.map((def) => ({
    intent: def.intent,
    score: computeScore(normalized, normTokens, def, ctx),
  }))

  all.sort((a, b) => b.score - a.score)

  const best   = all[0]
  const def    = INTENT_DEFS.find((d) => d.intent === best.intent)!
  const ambiguous = false  // ya no bloqueamos por ambigüedad

  let accepted = false
  let reason   = 'no match'

  if (best.score >= B2_INTENT_THRESHOLD) {
    // Intents requiresContext solo se bloquean si score es puramente basal
    // (sin keywords, sin variante parcial) Y no hay previousIntent
    const isBasalScore = best.score < 0.40 && normTokens.size <= 1
    if (def.requiresContext && isBasalScore && !ctx.previousIntent) {
      reason = `requires context, score too low (${best.score.toFixed(2)})`
    } else {
      accepted = true
      reason   = `score ${best.score.toFixed(2)} >= threshold ${B2_INTENT_THRESHOLD}`
    }
  } else {
    reason = `below threshold (${best.score.toFixed(2)} < ${B2_INTENT_THRESHOLD})`
  }

  return {
    best: { intent: best.intent, score: best.score, reason },
    candidates: all.slice(0, 5),
    ambiguous,
    accepted,
  }
}
