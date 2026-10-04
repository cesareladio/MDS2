/**
 * b2Script.ts — guion oficial portado de guion.js (fuente de verdad).
 *
 * Estructura idéntica al ZIP:
 *   - cue:   texto de Bárbara (para debug overlay)
 *   - heard: variantes que el matcher debe reconocer
 *   - pre:   parte que B2 escucha/espera antes de responder (opcional)
 *   - parts: fragmentos de B2 con id de audio y pose
 *
 * Audio mapping correcto (del ZIP):
 *   Turn 1: hola + s01b (dos partes del mismo turno)
 *   Turn 2: s02
 *   ...
 *   Turn 14: s14
 */

export interface B2Part {
  id: string          // audioId (sin .mp3)
  t: string           // texto visible
  pose: string        // nombre de pose
  noTTS?: number      // si 1, no usar TTS como fallback
}

export interface B2Step {
  cue: string         // texto de Bárbara (para debug)
  heard: string[]     // frases que activan este turno
  pre?: B2Part        // parte previa (intro modo demo)
  parts: B2Part[]     // partes de B2
}

export const AUDIO_BASE = '/assets/b2/audio'

export function audioUrl(id: string): string {
  return `${AUDIO_BASE}/${id}.mp3`
}

/**
 * B2_STEPS — portado literalmente de guion.js (window.B2_GUION).
 */
export const B2_STEPS: B2Step[] = [
  {
    cue: 'Intro',
    heard: [
      'Les quiero presentar a alguien que sabe bastante de Chile bastante de Perú y peligrosamente también bastante de mí B2 te presento al equipo ejecutivo de GDN-e IBIOL',
      'Saluda al equipo ejecutivo',
    ],
    pre: {
      id: 'intro',
      t: 'Bárbara: «Les quiero presentar a alguien que sabe bastante de Chile y de Perú… B2, te presento al equipo ejecutivo de GDN-e IBIOL.»',
      pose: 'listen',
      noTTS: 1,
    },
    parts: [
      { id: 'hola',  t: '¡Hola equipo! Soy B2, el alter ego digital de Bárbara.', pose: 'wave'    },
      { id: 's01b',  t: 'Conocemos el negocio, compartimos los mismos desafíos, perseguimos los mismos resultados... pero yo soy un poquito más cute.', pose: 'present' },
    ],
  },
  {
    cue: 'Bárbara: «A qué te refieres»',
    heard: ['A qué te refieres'],
    parts: [
      { id: 's02', t: 'Además, yo sonrío y cuento hasta diez cuando me muestran un Excel.', pose: 'chest' },
    ],
  },
  {
    cue: 'Bárbara: «Esto confirma absolutamente que eres digital»',
    heard: ['Esto confirma absolutamente que eres digital'],
    parts: [
      { id: 's03', t: 'Estoy feliz de estar acá. Porque Bárbara me contó que hablaremos sobre GDN-e Chile y Perú. Aunque tengo un pequeño dilema...', pose: 'present' },
    ],
  },
  {
    cue: 'Bárbara: «Qué hiciste ahora»',
    heard: ['Qué hiciste ahora'],
    parts: [
      { id: 's04', t: 'Manejo información que me dificulta tomar partido por La Roja o la Bicolor. Así que necesito que este equipo me ayude a resolverlo. ¿El pisco es chileno o peruano?', pose: 'point' },
    ],
  },
  {
    cue: 'Bárbara: «No entremos en conflicto por favor»',
    heard: ['No entremos en conflicto por favor'],
    parts: [
      { id: 's05', t: '¡Perdón! No quiero generar mi primer conflicto internacional a los dos minutos de haber nacido.', pose: 'chest' },
    ],
  },
  {
    cue: 'Bárbara: «Me parece una sabia decisión»',
    heard: ['Me parece una sabia decisión'],
    parts: [
      { id: 's06', t: 'Hay algo en que sí estaremos de acuerdo. Tenemos culturas, historias y fortalezas distintas. Pero cuando hablamos de nuestro trabajo, somos un solo equipo. Un solo GDN-e.', pose: 'open' },
    ],
  },
  {
    cue: 'Bárbara: «Exactamente Uno no es mejor que el otro sino qué podemos construir aprovechando lo mejor de ambos países»',
    heard: ['Exactamente Uno no es mejor que el otro sino qué podemos construir aprovechando lo mejor de ambos países'],
    parts: [
      { id: 's07', t: 'Entendido, prometo no volver a preguntar por el pisco.', pose: 'chest' },
    ],
  },
  {
    cue: 'Bárbara: «Gracias»',
    heard: ['Gracias'],
    parts: [
      { id: 's08', t: 'Aunque estoy casi segura de que el pisco sour es chileno.', pose: 'shrug' },
    ],
  },
  {
    cue: 'Bárbara: «Bueno B2 Ya que dices conocernos tanto entréganos un update de nuestros equipos»',
    heard: ['Bueno B2 Ya que dices conocernos tanto entréganos un update de nuestros equipos'],
    parts: [
      { id: 's09', t: '¡Ahora vienen los números! Sé que te me pones ansiosa, así que preparé un completo detalle.', pose: 'present' },
    ],
  },
  {
    cue: 'Bárbara: «Vamos con eso»',
    heard: ['Vamos con eso'],
    parts: [
      { id: 's10', t: 'Adelante entonces. Yo estaré aquí por si necesitas algún dato o quieres retomar el debate sobre el origen del pisco.', pose: 'point' },
    ],
  },
  {
    cue: 'Bárbara: «Creo que es todo …»',
    heard: ['Creo que es todo Espero que hayamos dejado claro que pese a nuestras distintas capacidades y experiencia GDN-e Chile y Perú son un solo equipo con un enorme talento'],
    parts: [
      { id: 's11', t: 'Eso es complementariedad: conectar capacidades y convertirlas en oportunidades y resultados. Me gustó tu presentación. ¡Nunca cambies, Bárbara!', pose: 'open' },
    ],
  },
  {
    cue: 'Bárbara: «Gracias Oye que hago ahora Te desconecto…»',
    heard: ['Gracias Oye que hago ahora Te desconecto Porque viene más gente a presentar'],
    parts: [
      { id: 's12', t: '¡Ay humanos! Ya no te librarás de mí.', pose: 'shrug' },
    ],
  },
  {
    cue: 'Bárbara: «Creo que ambas podemos brillar juntas»',
    heard: ['Creo que ambas podemos brillar juntas'],
    parts: [
      { id: 's13', t: 'Hasta conseguí que me felicitaras. Start recording…', pose: 'chest' },
    ],
  },
  {
    cue: 'Bárbara: «No abuses de mi simpatía»',
    heard: ['No abuses de mi simpatía'],
    parts: [
      { id: 's14', t: '¡Hasta luego amigos! Bárbara, sobre el misterio ancestral del pisco, ¿te parece que en el próximo retiro hagamos una cata y definimos cuál es el mejor?', pose: 'bye' },
    ],
  },
]
