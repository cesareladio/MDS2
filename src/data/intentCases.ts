/**
 * intentCases.ts — corpus de test del router semántico.
 *
 * Cada caso declara:
 *   transcript: frase natural (como llegaría del SpeechRecognition)
 *   intent:     B2Intent esperado
 *   label:      descripción del tipo de variación
 *
 * Ejecutar con: window.__B2.testIntents() en consola DEV.
 * Objetivo: >= 95% accuracy.
 */

import type { B2Intent } from './b2Types'

export interface IntentCase {
  transcript: string
  intent: B2Intent
  label: string
  previousIntent?: B2Intent
}

export const INTENT_CASES: IntentCase[] = [

  // ── INTRODUCE_B2 ──────────────────────────────────────────────────────────
  { transcript: 'B2 saluda al equipo',                              intent: 'INTRODUCE_B2', label: 'guion literal' },
  { transcript: 'saluda al equipo ejecutivo',                       intent: 'INTRODUCE_B2', label: 'guion literal' },
  { transcript: 'preséntate',                                       intent: 'INTRODUCE_B2', label: 'imperativo corto' },
  { transcript: 'adelante B2',                                      intent: 'INTRODUCE_B2', label: 'informal corto' },
  { transcript: 'te toca preséntate',                               intent: 'INTRODUCE_B2', label: 'paráfrasis guion' },
  { transcript: 'cuéntales quién eres',                             intent: 'INTRODUCE_B2', label: 'paráfrasis sin B2' },
  { transcript: 'diles quién eres',                                 intent: 'INTRODUCE_B2', label: 'paráfrasis corta' },
  { transcript: 'quiero presentarles a B2',                         intent: 'INTRODUCE_B2', label: 'primera persona' },
  { transcript: 'conozcan a B2',                                    intent: 'INTRODUCE_B2', label: 'imperativo plural' },
  { transcript: 'vamos con B2',                                     intent: 'INTRODUCE_B2', label: 'informal' },
  { transcript: 'saluda a todos',                                   intent: 'INTRODUCE_B2', label: 'sin ejecutivo' },
  { transcript: 'traje refuerzos',                                  intent: 'INTRODUCE_B2', label: 'humor sin B2' },
  { transcript: 'te presento al equipo',                            intent: 'INTRODUCE_B2', label: 'guion variante' },
  { transcript: 'ahora quiero que conozcan a nuestra invitada',     intent: 'INTRODUCE_B2', label: 'frase larga natural' },
  { transcript: 'B2 adelante',                                      intent: 'INTRODUCE_B2', label: 'mínimo' },
  { transcript: 'bueno ahora te toca a ti',                         intent: 'INTRODUCE_B2', label: 'olvido palabras clave' },
  { transcript: 'es tu turno',                                      intent: 'INTRODUCE_B2', label: 'paráfrasis turno' },
  { transcript: 'puedes comenzar',                                  intent: 'INTRODUCE_B2', label: 'paráfrasis comienzo' },

  // ── ASK_CUTE ──────────────────────────────────────────────────────────────
  { transcript: 'a qué te refieres',                                intent: 'ASK_CUTE',     label: 'guion literal' },
  { transcript: 'qué quieres decir',                                intent: 'ASK_CUTE',     label: 'guion variante' },
  { transcript: 'explícate',                                        intent: 'ASK_CUTE',     label: 'imperativo' },
  { transcript: 'cómo así',                                         intent: 'ASK_CUTE',     label: 'coloquial corto' },
  { transcript: 'explícate un poco',                                intent: 'ASK_CUTE',     label: 'suavizado' },
  { transcript: 'qué quisiste decir',                               intent: 'ASK_CUTE',     label: 'pasado' },
  { transcript: 'qué significa eso',                                intent: 'ASK_CUTE',     label: 'sinónimo' },
  { transcript: 'por qué cute',                                     intent: 'ASK_CUTE',     label: 'fragmento' },
  { transcript: 'cómo que más cute',                                intent: 'ASK_CUTE',     label: 'repetición coloquial' },
  { transcript: 'aclárame eso',                                     intent: 'ASK_CUTE',     label: 'paráfrasis aclaración' },
  { transcript: 'cómo así',                                         intent: 'ASK_CUTE',     label: 'omisión + contexto', previousIntent: 'INTRODUCE_B2' },

  // ── CONFIRM_DIGITAL ───────────────────────────────────────────────────────
  { transcript: 'eso confirma que eres digital',                    intent: 'CONFIRM_DIGITAL', label: 'guion paráfrasis' },
  { transcript: 'definitivamente eres digital',                     intent: 'CONFIRM_DIGITAL', label: 'guion literal' },
  { transcript: 'queda claro que eres digital',                     intent: 'CONFIRM_DIGITAL', label: 'equivalente' },
  { transcript: 'muy digital de tu parte',                          intent: 'CONFIRM_DIGITAL', label: 'humor' },
  { transcript: 'eso explica que seas digital',                     intent: 'CONFIRM_DIGITAL', label: 'causal' },
  { transcript: 'esto confirma absolutamente que eres digital',     intent: 'CONFIRM_DIGITAL', label: 'guion exacto largo' },
  { transcript: 'no hay duda de que eres digital',                  intent: 'CONFIRM_DIGITAL', label: 'paráfrasis' },

  // ── ASK_DILEMMA ───────────────────────────────────────────────────────────
  { transcript: 'qué hiciste ahora',                                intent: 'ASK_DILEMMA',  label: 'guion literal' },
  { transcript: 'cuál es el dilema',                                intent: 'ASK_DILEMMA',  label: 'guion variante' },
  { transcript: 'qué problema tienes',                              intent: 'ASK_DILEMMA',  label: 'sinónimo' },
  { transcript: 'qué pasó',                                         intent: 'ASK_DILEMMA',  label: 'corto natural' },
  { transcript: 'y ahora qué pasó',                                 intent: 'ASK_DILEMMA',  label: 'coloquial' },
  { transcript: 'cuéntame cuál es el problema',                     intent: 'ASK_DILEMMA',  label: 'paráfrasis' },
  { transcript: 'qué hiciste B2',                                   intent: 'ASK_DILEMMA',  label: 'con nombre' },
  { transcript: 'cuál es tu dilema',                                intent: 'ASK_DILEMMA',  label: 'guion variante' },
  { transcript: 'y ahora qué',                                      intent: 'ASK_DILEMMA',  label: 'omisión + contexto', previousIntent: 'CONFIRM_DIGITAL' },

  // ── AVOID_CONFLICT ────────────────────────────────────────────────────────
  { transcript: 'no entremos en conflicto',                         intent: 'AVOID_CONFLICT', label: 'guion literal' },
  { transcript: 'mejor no discutamos por eso',                      intent: 'AVOID_CONFLICT', label: 'paráfrasis' },
  { transcript: 'dejemos ese tema quieto',                          intent: 'AVOID_CONFLICT', label: 'sinónimo' },
  { transcript: 'no peleemos por eso',                              intent: 'AVOID_CONFLICT', label: 'variante' },
  { transcript: 'dejemos el pisco tranquilo',                       intent: 'AVOID_CONFLICT', label: 'guion literal' },
  { transcript: 'no generemos conflicto',                           intent: 'AVOID_CONFLICT', label: 'variante' },
  { transcript: 'no quiero conflictos',                             intent: 'AVOID_CONFLICT', label: 'primera persona' },
  { transcript: 'evitemos problemas',                               intent: 'AVOID_CONFLICT', label: 'sinónimo' },
  { transcript: 'mejor no hablemos de eso',                         intent: 'AVOID_CONFLICT', label: 'paráfrasis' },
  { transcript: 'mejor no',                                         intent: 'AVOID_CONFLICT', label: 'omisión + contexto', previousIntent: 'ASK_DILEMMA' },

  // ── WISE_DECISION ─────────────────────────────────────────────────────────
  { transcript: 'me parece una sabia decisión',                     intent: 'WISE_DECISION', label: 'guion literal' },
  { transcript: 'buena decisión',                                   intent: 'WISE_DECISION', label: 'corto' },
  { transcript: 'me parece bien',                                   intent: 'WISE_DECISION', label: 'genérico con contexto' },
  { transcript: 'estoy de acuerdo',                                 intent: 'WISE_DECISION', label: 'sinónimo' },
  { transcript: 'correcto',                                         intent: 'WISE_DECISION', label: 'mínimo' },
  { transcript: 'así está mejor',                                   intent: 'WISE_DECISION', label: 'variante' },
  { transcript: 'perfecto entonces',                                intent: 'WISE_DECISION', label: 'coloquial' },
  { transcript: 'mejor así',                                        intent: 'WISE_DECISION', label: 'omisión + contexto', previousIntent: 'AVOID_CONFLICT' },

  // ── COMPLEMENTARITY ───────────────────────────────────────────────────────
  { transcript: 'somos un solo equipo',                             intent: 'COMPLEMENTARITY', label: 'guion literal' },
  { transcript: 'somos complementarios',                            intent: 'COMPLEMENTARITY', label: 'guion variante' },
  { transcript: 'lo mejor de ambos países',                         intent: 'COMPLEMENTARITY', label: 'guion literal' },
  { transcript: 'Chile y Perú juntos',                              intent: 'COMPLEMENTARITY', label: 'resumen' },
  { transcript: 'uno complementa al otro',                          intent: 'COMPLEMENTARITY', label: 'paráfrasis' },
  { transcript: 'aprovechemos lo mejor de ambos',                   intent: 'COMPLEMENTARITY', label: 'variante' },
  { transcript: 'exactamente uno no es mejor que el otro',          intent: 'COMPLEMENTARITY', label: 'guion largo' },
  { transcript: 'nos complementamos',                               intent: 'COMPLEMENTARITY', label: 'sinónimo' },
  { transcript: 'construimos juntos',                               intent: 'COMPLEMENTARITY', label: 'paráfrasis' },

  // ── THANKS_AFTER_PISCO ────────────────────────────────────────────────────
  { transcript: 'muchas gracias',                                   intent: 'THANKS_AFTER_PISCO', label: 'con contexto' },
  { transcript: 'gracias B2',                                       intent: 'THANKS_AFTER_PISCO', label: 'con nombre' },
  { transcript: 'te agradezco',                                     intent: 'THANKS_AFTER_PISCO', label: 'sinónimo' },
  { transcript: 'gracias',                                          intent: 'THANKS_AFTER_PISCO', label: 'genérico + contexto', previousIntent: 'COMPLEMENTARITY' },
  { transcript: 'te agradezco',                                     intent: 'THANKS_AFTER_PISCO', label: 'sinónimo + contexto', previousIntent: 'COMPLEMENTARITY' },

  // ── TEAM_UPDATE ───────────────────────────────────────────────────────────
  { transcript: 'danos un update',                                  intent: 'TEAM_UPDATE', label: 'guion literal' },
  { transcript: 'cómo están nuestros equipos',                      intent: 'TEAM_UPDATE', label: 'guion variante' },
  { transcript: 'cuéntanos de los equipos',                         intent: 'TEAM_UPDATE', label: 'guion variante' },
  { transcript: 'vamos a revisar a la gente',                       intent: 'TEAM_UPDATE', label: 'paráfrasis informal' },
  { transcript: 'danos los números',                                intent: 'TEAM_UPDATE', label: 'sinónimo' },
  { transcript: 'danos una actualización',                          intent: 'TEAM_UPDATE', label: 'sinónimo update' },
  { transcript: 'cómo estamos en Chile y Perú',                     intent: 'TEAM_UPDATE', label: 'con países' },
  { transcript: 'cuéntanos cómo estamos',                           intent: 'TEAM_UPDATE', label: 'corto natural' },
  { transcript: 'veamos a la gente',                                intent: 'TEAM_UPDATE', label: 'sinónimo' },
  { transcript: 'cómo está nuestra gente',                          intent: 'TEAM_UPDATE', label: 'paráfrasis' },
  { transcript: 'muéstranos los equipos',                           intent: 'TEAM_UPDATE', label: 'variante' },

  // ── START_RESULTS ─────────────────────────────────────────────────────────
  { transcript: 'vamos con eso',                                    intent: 'START_RESULTS', label: 'guion literal' },
  { transcript: 'sigamos adelante',                                 intent: 'START_RESULTS', label: 'variante' },
  { transcript: 'veamos los números',                               intent: 'START_RESULTS', label: 'con objeto' },
  { transcript: 'vamos a los resultados',                           intent: 'START_RESULTS', label: 'explícito' },
  { transcript: 'vamos con los números',                            intent: 'START_RESULTS', label: 'variante' },
  { transcript: 'vamos',                                            intent: 'START_RESULTS', label: 'omisión + contexto', previousIntent: 'TEAM_UPDATE' },

  // ── START_CLOSING ─────────────────────────────────────────────────────────
  { transcript: 'creo que es todo',                                 intent: 'START_CLOSING', label: 'guion literal' },
  { transcript: 'para cerrar',                                      intent: 'START_CLOSING', label: 'guion corto' },
  { transcript: 'vamos cerrando',                                   intent: 'START_CLOSING', label: 'variante' },
  { transcript: 'en conclusión',                                    intent: 'START_CLOSING', label: 'sinónimo' },
  { transcript: 'creo que quedó claro',                             intent: 'START_CLOSING', label: 'paráfrasis' },
  { transcript: 'con esto terminamos',                              intent: 'START_CLOSING', label: 'variante' },
  { transcript: 'vamos al cierre',                                  intent: 'START_CLOSING', label: 'coloquial' },
  { transcript: 'Creo que es todo espero que hayamos dejado claro que GDN-e Chile y Perú son un solo equipo', intent: 'START_CLOSING', label: 'guion completo' },
  { transcript: 'eso sería todo',                                   intent: 'START_CLOSING', label: 'variante' },

  // ── DISCONNECT_B2 ─────────────────────────────────────────────────────────
  { transcript: 'te desconecto',                                    intent: 'DISCONNECT_B2', label: 'guion literal' },
  { transcript: 'te voy a desconectar',                             intent: 'DISCONNECT_B2', label: 'futuro' },
  { transcript: 'ya puedes irte',                                   intent: 'DISCONNECT_B2', label: 'eufemismo' },
  { transcript: 'viene más gente',                                  intent: 'DISCONNECT_B2', label: 'guion literal' },
  { transcript: 'ahora vienen otros',                               intent: 'DISCONNECT_B2', label: 'variante' },
  { transcript: 'qué hago contigo ahora',                           intent: 'DISCONNECT_B2', label: 'guion variante' },
  { transcript: 'vienen más presentadores',                         intent: 'DISCONNECT_B2', label: 'variante' },
  { transcript: 'ya terminaste',                                    intent: 'DISCONNECT_B2', label: 'coloquial' },

  // ── SHINE_TOGETHER ────────────────────────────────────────────────────────
  { transcript: 'podemos brillar juntas',                           intent: 'SHINE_TOGETHER', label: 'guion literal' },
  { transcript: 'las dos podemos brillar',                          intent: 'SHINE_TOGETHER', label: 'guion variante' },
  { transcript: 'hacemos buen equipo',                              intent: 'SHINE_TOGETHER', label: 'sinónimo' },
  { transcript: 'juntas brillamos',                                 intent: 'SHINE_TOGETHER', label: 'corto' },
  { transcript: 'creo que ambas podemos brillar juntas',            intent: 'SHINE_TOGETHER', label: 'guion largo' },
  { transcript: 'podemos complementarnos',                          intent: 'SHINE_TOGETHER', label: 'sinónimo' },
  { transcript: 'hay espacio para las dos',                         intent: 'SHINE_TOGETHER', label: 'paráfrasis' },

  // ── FINAL_WARNING ─────────────────────────────────────────────────────────
  { transcript: 'no abuses de mi simpatía',                         intent: 'FINAL_WARNING', label: 'guion literal' },
  { transcript: 'no abuses',                                        intent: 'FINAL_WARNING', label: 'corto' },
  { transcript: 'no te pases',                                      intent: 'FINAL_WARNING', label: 'guion variante' },
  { transcript: 'compórtate',                                       intent: 'FINAL_WARNING', label: 'imperativo' },
  { transcript: 'no exageres',                                      intent: 'FINAL_WARNING', label: 'sinónimo' },
  { transcript: 'ya suficiente',                                    intent: 'FINAL_WARNING', label: 'coloquial' },
  { transcript: 'no abuses de mi simpatia',                         intent: 'FINAL_WARNING', label: 'sin acento' },
  { transcript: 'ya basta',                                         intent: 'FINAL_WARNING', label: 'coloquial' },
  { transcript: 'ya te estás pasando',                              intent: 'FINAL_WARNING', label: 'variante' },
]

/** Frases que NO deben producir respuesta sin contexto favorable. */
export const FALSE_POSITIVE_CASES: { transcript: string; label: string }[] = [
  { transcript: 'gracias',             label: 'genérico sin contexto' },
  { transcript: 'vamos',              label: 'genérico sin contexto' },
  { transcript: 'bien',               label: 'demasiado corto' },
  { transcript: 'adelante',           label: 'genérico sin contexto' },
  { transcript: 'exactamente',        label: 'genérico sin contexto' },
  { transcript: 'dale',               label: 'genérico sin contexto' },
  { transcript: 'perfecto',           label: 'genérico sin contexto' },
]
