/**
 * b2IntentMatcher.ts — router semántico global de intents.
 *
 * ARQUITECTURA:
 *   transcript
 *     → normalizeText()      (lowercase, sin acentos, aliases B2, contraction pa')
 *     → stemToken()          (familias léxicas del dominio)
 *     → scoreFour()          example + concept + anchor + context
 *     → threshold 0.30
 *     → MatchResult con breakdown por componente
 *
 * NO hay currentTurn obligatorio.
 * El contexto (previousIntent) sólo da bonuses — nunca bloquea.
 * requiresContext protege únicamente frases de 1 token sin ningún concepto.
 *
 * PESOS base:
 *   exampleSim   0.40  (similitud Jaccard con ejemplos)
 *   conceptScore 0.35  (concept groups del dominio)
 *   anchorScore  0.15  (tokens ancla de alta especificidad)
 *   contextScore 0.10  (bonus previousIntent / sceneContext)
 */

import type { B2Intent } from './b2Types'

// ─── INTERFACES PÚBLICAS ─────────────────────────────────────────────────────

export interface IntentMatch {
  intent: B2Intent
  score: number
  reason: string
}

export interface IntentCandidate {
  intent: B2Intent
  score: number
  breakdown?: ScoreBreakdown
}

export interface ScoreBreakdown {
  example: number
  concept: number
  anchor: number
  context: number
}

export interface MatchContext {
  previousIntent?: B2Intent | null
  sceneContext?: string | null
}

export interface MatchResult {
  best: IntentMatch
  normalized: string
  candidates: IntentCandidate[]
  ambiguous: boolean
  accepted: boolean
}

// ─── NORMALIZACIÓN ───────────────────────────────────────────────────────────

/** Aliases de "B2" → canonical "b2" */
const B2_ALIASES = /\bb\s?2\b|b\s?dos|be\s?dos|ve\s?dos|bedos/gi

export function normalizeText(raw: string): string {
  return raw
    .replace(B2_ALIASES, 'b2')
    .replace(/\bpa'/g, 'para')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── STEMMER LÉXICO DEL DOMINIO ──────────────────────────────────────────────
// Familias de palabras específicas del guion. No NLP pesado — sólo raíces
// controladas para los verbos clave que más varían en conjugación/modo.

const STEM_MAP: [RegExp, string][] = [
  [/\bpresent(a|ate|as|an|ando|arme|arse|arse|ado|ar|o)\b/g,     'present'],
  [/\bsalud(a|as|an|ando|ar|ad|o)\b/g,                            'salud'],
  [/\bdesconect(a|as|an|ando|ar|o|ate)\b/g,                       'desconect'],
  [/\bdiscut(a|as|an|ir|amos|amos|iendo)\b/g,                     'discut'],
  [/\bcomplementa(n|r|mos|r)?\b/g,                                'complement'],
  [/\bcomplementari(o|a|os|as)?\b/g,                              'complement'],
  [/\bactuali(za|zanos|zar|zas|z)\b/g,                            'actualiz'],
  [/\bconflict(o|os|o)?\b/g,                                      'conflict'],
  [/\bequip(o|os|a|as)\b/g,                                       'equip'],
  [/\bdilem(a|as)\b/g,                                            'dilem'],
  [/\bproble(ma|mas)\b/g,                                         'problem'],
  [/\bdigital(es)?\b/g,                                           'digital'],
  [/\bbrill(ar|a|amos|as|ando)\b/g,                               'brill'],
  [/\btermin(a|amos|ar|o|ando)\b/g,                               'termin'],
  [/\bcer(rar|ramos|ro|rando|rad)\b/g,                            'cerr'],
  [/\binvit(ad|amos|ar|a|o|ando)\b/g,                             'invit'],
  [/\bconoc(en|er|es|e|amos)\b/g,                                 'conoc'],
  [/\bgracias\b/g,                                                 'graci'],
]

export function stemText(normalized: string): string {
  let s = normalized
  for (const [rx, stem] of STEM_MAP) s = s.replace(rx, stem)
  return s
}

// ─── TOKENIZACIÓN ────────────────────────────────────────────────────────────

const STOP = new Set([
  'que', 'los', 'las', 'del', 'por', 'con', 'una', 'uno', 'para', 'como',
  'pero', 'mas', 'eso', 'esto', 'muy', 'sus', 'sin', 'hay', 'son', 'les',
  'nos', 'mis', 'tus', 'ya', 'yo', 'me', 'se', 'al', 'la', 'el', 'en',
  'un', 'es', 'de', 'no', 'si', 'mi', 'tu', 'su', 'te', 'ahora', 'bien',
  'ah', 'eh', 'ok', 'bueno', 'pues',
])

function tokenize(s: string): Set<string> {
  return new Set(s.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let i = 0; a.forEach((w) => { if (b.has(w)) i++ })
  return (2 * i) / (a.size + b.size)
}

// ─── MODELO DE INTENT ────────────────────────────────────────────────────────

interface IntentDef {
  intent: B2Intent
  /** Descripción humana de la intención */
  meaning: string
  /** Sugerencias de contexto en que aplica (palabras, situaciones) */
  contextHints?: string[]
  /** Sugerencias de contexto claramente negativo o contradictorio  */
  negativeHints?: string[]
  /** Variantes naturales con y sin paráfrasis */
  examples: string[]
  /** Grupos de conceptos: basta 1 match en cualquier miembro */
  concepts: string[][]
  /** Tokens de alta especificidad (ponderan fuerte en anchorScore) */
  anchors: string[]
  /** Intents que dan context bonus cuando son previousIntent */
  contextFrom?: B2Intent[]
  /**
   * Si true, una sola frase genérica (1-2 tokens, sin concepts ni anchors)
   * necesita previousIntent para activarse.
   */
  requiresContext?: boolean
  sceneKeywords?: string[]
}

const DEFS: IntentDef[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'INTRODUCE_B2',
    meaning: 'Bárbara está presentando a B2, dándole la palabra, pidiéndole que se presente o salude al equipo.',
    contextHints: ['inicio', 'presentar', 'nuevo turno', 'saludo grupal', 'referencia a refuerzos', 'expectativa de presentación'],
    negativeHints: ['agradecimiento', 'despedida', 'final', 'resultado', 'números', 'cierre'],
    examples: [
      'b2 saluda al equipo',
      'saluda al equipo',
      'saluda a todos',
      'presentate',
      'b2 presentate',
      'te presento al equipo',
      'saluda al equipo ejecutivo',
      'ahora te toca b2',
      'b2 te presento al equipo',
      'te presento al equipo ejecutivo',
      'b2 conoce al equipo',
      'con nosotros esta b2',
      'traje refuerzos b2',
      'presentate al equipo',
      'b2 adelante',
      'adelante b2',
      'cuéntales quien eres',
      'diles quien eres',
      'quiero presentarles a b2',
      'conozcan a b2',
      'vamos con b2',
      'cuéntanos un poco de ti',
      'tenemos refuerzos',
      'ahora quiero que conozcan a nuestra invitada',
      'te toca preséntate',
      'b2 te toca',
      'ella es b2',
      'les quiero present b2',
      'b2 cuéntales',
      'b2 saluda a todos',
      'saluda a los ejecutivos',
      'presenta b2',
    ],
    concepts: [
      ['present', 'salud', 'conoc', 'invit'],
      ['equip', 'ejecutiv', 'ejecutivo', 'equipo', 'todos', 'gente', 'team'],
      ['b2'],
      ['refuerz', 'refuerzo', 'refuerzos'],
    ],
    anchors: ['present', 'salud', 'b2', 'equip', 'ejecutiv', 'refuerz', 'invit'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'ASK_CUTE',
    meaning: 'Bárbara pregunta qué quiere decir B2 con ser más cute, le pide explicarse o aclarar un término.',
    examples: [
      'a que te refieres',
      'que quieres decir',
      'explicate',
      'como asi',
      'por que dices eso',
      'como que mas cute',
      'que tiene de cute',
      'que significa eso',
      'que quisiste decir',
      'explicate un poco',
      'como que eso',
      'no entendi',
      'que quieres decir con eso',
      'por que cute',
      'que quieres decir con cute',
    ],
    concepts: [
      ['refier', 'decir', 'signific', 'quisist'],
      ['explica', 'explicate', 'explicar'],
      ['cute'],
    ],
    anchors: ['refier', 'explica', 'cute', 'signific', 'quisist'],
    contextFrom: ['INTRODUCE_B2'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'CONFIRM_DIGITAL',
    meaning: 'Bárbara comenta o confirma humorísticamente que B2 claramente es digital.',
    examples: [
      'eres digital',
      'definitivamente eres digital',
      'confirmas que eres digital',
      'ya veo que eres digital',
      'eso confirma que eres digital',
      'queda claro que eres digital',
      'con eso ya se que eres digital',
      'ahora si confirmo que eres digital',
      'muy digital de tu parte',
      'eso explica que seas digital',
      'claramente eres digital',
      'tipico de alguien digital',
    ],
    concepts: [
      ['digital'],
      ['confirm', 'claro', 'veo', 'explica', 'tipico'],
    ],
    anchors: ['digital', 'confirm'],
    contextFrom: ['INTRODUCE_B2', 'ASK_CUTE'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'ASK_DILEMMA',
    meaning: 'Bárbara pregunta qué ocurrió, qué problema tiene B2, qué hizo o cuál es su dilema.',
    examples: [
      'que hiciste ahora',
      'cual es el dilem',
      'que problem tienes',
      'que paso ahora',
      'que hiciste b2',
      'que paso',
      'que sucede',
      'que ocurrio',
      'cuentame',
      'ahora que',
      'que hiciste',
      'que problema hay',
      'cuéntame cual es el problem',
      'y ahora que paso',
      'cuéntame que sucede',
    ],
    concepts: [
      ['dilem', 'problem'],
      ['hicist', 'paso', 'sucede', 'ocurri'],
    ],
    anchors: ['dilem', 'problem', 'hicist'],
    contextFrom: ['CONFIRM_DIGITAL'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'AVOID_CONFLICT',
    meaning: 'Bárbara intenta evitar o desescalar la discusión sobre Chile/Perú, pisco, o minimizar cualquier potencial conflicto.',
    examples: [
      'no entremos en conflict',
      'no discut',
      'no generes conflict',
      'dejemos el pisco tranquilo',
      'mejor no peleemos',
      'no quiero conflict',
      'mejor cambiemos de tema',
      'no vayamos por ahi',
      'mejor no discut por eso',
      'dejemos ese tema quieto',
      'no empecemos',
      'no pelees',
      'tranquila con eso',
      'no generemos problem',
      'no con el pisco',
    ],
    concepts: [
      ['conflict', 'discut', 'pele'],
      ['pisco', 'tranquil', 'quieto', 'tema'],
      ['mejor', 'cambiem'],
    ],
    anchors: ['conflict', 'discut', 'pisco', 'pele'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'WISE_DECISION',
    meaning: 'Bárbara aprueba, valida o acepta una decisión prudente tomada en la conversación.',
    examples: [
      'sabia decision',
      'buena decision',
      'me parece bien',
      'mejor asi',
      'buena idea',
      'me parece una sabia decision',
      'correcto',
      'estoy de acuerdo',
      'esa es una buena idea',
      'bien pensado',
      'muy bien',
      'parece bien',
      'me parece correcto',
      'asi esta mejor',
    ],
    concepts: [
      ['sabia', 'buena', 'buen', 'correct', 'acuerd'],
      ['decision', 'idea', 'pensad'],
    ],
    anchors: ['sabia', 'decision', 'acuerd', 'correct'],
    contextFrom: ['AVOID_CONFLICT'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'COMPLEMENTARITY',
    meaning: 'Bárbara enfatiza que Chile y Perú se complementan y construyen juntos, sin declarar un país mejor.',
    examples: [
      'somos un solo equip',
      'somos complement',
      'chile y peru se complement',
      'lo mejor de ambos paises',
      'podemos construir juntos',
      'exactamente',
      'eso es lo importante',
      'uno complement al otro',
      'no se trata de quien es mejor',
      'aprovechemos lo mejor de ambos',
      'trabajamos como un solo equip',
      'chile y peru juntos',
      'eso queremos mostrar',
      'trabajar juntos',
      'somos uno',
      'trabajamos juntos',
      'ambos paises',
      'los dos juntos',
    ],
    concepts: [
      ['complement'],
      ['juntos', 'ambos', 'solo', 'uno'],
      ['chile', 'peru', 'paises', 'pais'],
      ['equip'],
    ],
    anchors: ['complement', 'chile', 'peru', 'ambos', 'juntos'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'THANKS_AFTER_PISCO',
    meaning: 'Bárbara agradece tras resolver la sección pisco/Chile/Perú, o tras un segmento conflictivo.',
    examples: [
      'graci',
      'muchas graci',
      'perfecto graci',
      'te agradezco',
      'bien graci',
      'graci b2',
      'gracias barbara',
    ],
    concepts: [
      ['graci'],
    ],
    anchors: ['graci'],
    contextFrom: ['COMPLEMENTARITY', 'AVOID_CONFLICT', 'WISE_DECISION'],
    requiresContext: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'TEAM_UPDATE',
    meaning: 'Bárbara pide un update o información de los equipos, Chile y Perú, o pregunta por el estado actual del grupo.',
    examples: [
      'danos un update',
      'update de los equip',
      'como estan nuestros equip',
      'cuéntanos de los equip',
      'muestranos los numeros',
      'actualiz los datos',
      'como vamos con los equip',
      'cuéntanos como estamos',
      'como esta chile y peru',
      'danos los numeros',
      'vamos a revisar los equip',
      'muéstranos el equip',
      'qué tenemos en los equip',
      'cómo está la gente',
      'update del equip',
      'cuéntanos un poco del equip',
    ],
    concepts: [
      ['update', 'actualiz'],
      ['equip'],
      ['numero', 'datos', 'cifras'],
      ['chile', 'peru'],
    ],
    anchors: ['update', 'actualiz', 'equip', 'numero', 'cifras'],
    sceneKeywords: ['equipos', 'chile', 'peru', 'one-gdne'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'START_RESULTS',
    meaning: 'Bárbara da la orden de empezar o mostrar resultados, números o siguiente sección numérica.',
    examples: [
      'vamos con eso',
      'adelante',
      'comencemos',
      'veamoslo',
      'muestranos',
      'vamos',
      'dale',
      'sigamos',
      'continuemos',
      'vamos a los resultados',
      'empecemos',
      'veamos los numeros',
      'listo vamos',
    ],
    concepts: [
      ['vamos', 'sigamos', 'continuemos', 'empecemos', 'comencemos'],
      ['resultado', 'numeros', 'cifras'],
    ],
    anchors: ['resultado', 'numero', 'cifra'],
    contextFrom: ['TEAM_UPDATE'],
    requiresContext: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'START_CLOSING',
    meaning: 'Bárbara inicia o resume el cierre, conclusión, o etapa final de la presentación.',
    examples: [
      'creo que es todo',
      'para cerr',
      'podemos cerr',
      'llegamos al final',
      'en resumen somos un equip',
      'vamos cerrando',
      'para termin',
      'en conclusion',
      'creo que quedo claro',
      'con esto termin',
      'ultimo mensaje',
      'vamos al cierre',
      'ya para cerr',
      'esto fue todo',
      'bueno creo que es todo',
    ],
    concepts: [
      ['cerr', 'termin', 'final', 'cierre', 'conclusion'],
      ['todo', 'resumen', 'claro', 'mensaje'],
    ],
    anchors: ['cerr', 'termin', 'cierre', 'conclusion', 'final'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'DISCONNECT_B2',
    meaning: 'Bárbara despide a B2, lo desconecta, o indica que ahora viene otra persona o segmento.',
    examples: [
      'te desconect',
      'que hago contigo',
      'ya termin b2',
      'viene mas gente',
      'ahora te apagamos',
      'te voy a desconect',
      'ya puedes irte',
      'ahora vienen otros',
      'qué hago contigo ahora',
      'te apago',
      'te dejo aqui',
      'ahora hay otros presentadores',
      'viene otra presentacion',
    ],
    concepts: [
      ['desconect', 'apag'],
      ['gente', 'otros', 'presentacion', 'presentadores'],
    ],
    anchors: ['desconect', 'apag'],
    contextFrom: ['START_CLOSING'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'SHINE_TOGETHER',
    meaning: 'Bárbara hace énfasis en que tanto ella como B2 pueden brillar o tener su momento, demostrando trabajo en equipo.',
    examples: [
      'podemos brill juntas',
      'las dos podemos brill',
      'hacemos buen equip',
      'podemos trabajar juntas',
      'creo que funcionamos bien juntas',
      'podemos complement',
      'las dos tenemos nuestro momento',
      'podemos brill las dos',
      'juntas brillamos',
    ],
    concepts: [
      ['brill'],
      ['juntas', 'dos', 'ambas'],
      ['equip', 'trabajar', 'complement'],
    ],
    anchors: ['brill', 'juntas', 'dos'],
    contextFrom: ['DISCONNECT_B2'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'FINAL_WARNING',
    meaning: 'Bárbara le pide a B2 que no exagere, que se controle o reacciona a un comentario final provocador.',
    examples: [
      'no abuses',
      'no abuses de mi simpatia',
      'compórtate',
      'no te pases',
      'cuidado b2',
      'ya estas abusando',
      'hasta ahi',
      'controlate',
      'no exageres',
      'ya suficiente',
      'tranquila b2',
      'no tanto b2',
      'para b2',
      'cuidate',
    ],
    concepts: [
      ['abuses', 'abusando', 'exager', 'pases'],
      ['simpatia', 'controlat', 'suficient'],
    ],
    anchors: ['abuses', 'simpatia', 'exager', 'pases', 'suficient'],
    contextFrom: ['SHINE_TOGETHER'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    intent: 'END_PRESENTATION',
    meaning: 'Final absoluto: despedida o cierre formal de la participación de B2.',
    examples: [
      'graci b2 muy bien',
      'eso es todo muchas graci',
      'hasta luego b2',
      'adios b2',
      'hasta pronto b2',
    ],
    concepts: [
      ['hasta', 'adios'],
      ['b2'],
    ],
    anchors: ['hasta', 'adios', 'b2'],
    requiresContext: true,
    contextFrom: ['FINAL_WARNING', 'START_CLOSING'],
  },
]

// ─── SCORING POR COMPONENTE ──────────────────────────────────────────────────

/** Mejor similitud Jaccard contra todos los ejemplos (con stems). */
function exampleScore(stemmedToks: Set<string>, examples: string[]): number {
  let best = 0
  for (const ex of examples) {
    const exStemmed = stemText(normalizeText(ex))
    const exToks    = tokenize(exStemmed)
    // substring exacto sobre texto stemmed
    const j = jaccard(stemmedToks, exToks)
    if (j > best) best = j
  }
  return best
}

/** Cuántos concept-groups tienen al menos un token match. */
function conceptScore(stemmedToks: Set<string>, concepts: string[][]): number {
  if (!concepts.length) return 0
  let hits = 0
  for (const group of concepts) {
    if (group.some((c) => stemmedToks.has(c) || [...stemmedToks].some((t) => t.startsWith(c) || c.startsWith(t.slice(0, Math.max(4, t.length - 1)))))) {
      hits++
    }
  }
  return hits / concepts.length
}

/** Fracción de anchor tokens presentes en el transcript. */
function anchorScore(stemmedToks: Set<string>, anchors: string[]): number {
  if (!anchors.length) return 0
  const hits = anchors.filter((a) =>
    stemmedToks.has(a) ||
    [...stemmedToks].some((t) => t.startsWith(a.slice(0, Math.max(4, a.length - 1))))
  ).length
  return Math.min(1, hits / Math.max(1, Math.min(anchors.length, 3)))
}

function contextBonus(def: IntentDef, ctx: MatchContext): number {
  let bonus = 0
  if (def.contextFrom && ctx.previousIntent && def.contextFrom.includes(ctx.previousIntent)) {
    bonus += 0.15
  }
  if (def.sceneKeywords && ctx.sceneContext) {
    const sc = ctx.sceneContext.toLowerCase()
    if (def.sceneKeywords.some((sk) => sc.includes(sk))) bonus += 0.05
  }
  return Math.min(bonus, 0.20)
}

const WEIGHTS = { example: 0.40, concept: 0.35, anchor: 0.15, context: 0.10 }

function computeBreakdown(
  stemmedNorm: string,
  stemmedToks: Set<string>,
  def: IntentDef,
  ctx: MatchContext,
): ScoreBreakdown {
  const example = exampleScore(stemmedToks, def.examples)
  const concept = conceptScore(stemmedToks, def.concepts)
  const anchor  = anchorScore(stemmedToks, def.anchors)
  const context = contextBonus(def, ctx)

  // Substring exacto de algún ejemplo → fuerte señal
  const normFull = stemmedNorm
  let exSubstr = 0
  for (const ex of def.examples) {
    const exN = stemText(normalizeText(ex))
    if (normFull === exN) { exSubstr = 1.0; break }
    if (normFull.includes(exN) && exN.length > 8) { exSubstr = Math.max(exSubstr, 0.90) }
    if (exN.includes(normFull) && normFull.length > 8) { exSubstr = Math.max(exSubstr, 0.85) }
  }

  return {
    example: Math.max(example, exSubstr),
    concept,
    anchor,
    context,
  }
}

function totalScore(bd: ScoreBreakdown): number {
  return (
    bd.example * WEIGHTS.example +
    bd.concept * WEIGHTS.concept +
    bd.anchor  * WEIGHTS.anchor  +
    bd.context * WEIGHTS.context
  )
}

// ─── THRESHOLD ───────────────────────────────────────────────────────────────

export const B2_INTENT_THRESHOLD = 0.30

// ─── UTTERANCES GENÉRICAS ────────────────────────────────────────────────────
// Palabras sueltas demasiado ambiguas para disparar un intent por sí solas.
// Solo bloquea cuando el transcript ES EXACTAMENTE una de estas palabras
// (normalizado), no cuando forman parte de una frase más rica.
// El contexto (previousIntent) puede desambiguar: si aporta context bonus,
// la utterance deja de considerarse "aislada".

const GENERIC_UTTERANCES = new Set([
  'gracias', 'vamos', 'adelante', 'exactamente', 'bien', 'perfecto', 'dale', 'ok',
])

// ─── MATCHER GLOBAL ──────────────────────────────────────────────────────────

export function matchIntent(
  transcript: string,
  ctx: MatchContext = {},
): MatchResult {
  const normalized   = normalizeText(transcript)
  const stemmedNorm  = stemText(normalized)
  const stemmedToks  = tokenize(stemmedNorm)

  const all: IntentCandidate[] = DEFS.map((def) => {
    const bd    = computeBreakdown(stemmedNorm, stemmedToks, def, ctx)
    const score = totalScore(bd)
    return { intent: def.intent, score, breakdown: bd }
  })

  all.sort((a, b) => b.score - a.score)

  const best = all[0]
  const def  = DEFS.find((d) => d.intent === best.intent)!

  let accepted = false
  let reason   = 'no match'

  if (best.score >= B2_INTENT_THRESHOLD) {
    const isGenericAlone = GENERIC_UTTERANCES.has(normalized)
    const hasContextBoost = (best.breakdown?.context ?? 0) > 0
    // requiresContext: solo bloquear si no hay ningún anchor Y no hay previousIntent
    const hasAnchor  = (best.breakdown?.anchor ?? 0) > 0
    const hasConcept = (best.breakdown?.concept ?? 0) > 0.2
    if (isGenericAlone && !hasContextBoost) {
      reason = `generic utterance "${normalized}" without context — forced NO_MATCH (score ${best.score.toFixed(2)})`
    } else if (def.requiresContext && !hasAnchor && !hasConcept && !ctx.previousIntent) {
      reason = `requires context — no anchor/concept (score ${best.score.toFixed(2)})`
    } else {
      accepted = true
      reason   = `score ${best.score.toFixed(2)} >= ${B2_INTENT_THRESHOLD}`
    }
  } else {
    reason = `below threshold (${best.score.toFixed(2)} < ${B2_INTENT_THRESHOLD})`
  }

  return {
    best: { intent: best.intent, score: best.score, reason },
    normalized,
    candidates: all.slice(0, 6),
    ambiguous: false,
    accepted,
  }
}
