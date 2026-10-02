import { globalData } from './global'
import { countryIdentity } from './countryIdentity'
import { countryPhotos } from './photos'
import type { PartnerLogo } from './types'
import {
  chileData,
  chileHubs,
  chileHistory,
  chileCertifications,
  chileTalentPyramid,
  chileTalentFamilies,
  chileStudios,
} from './chile'
import {
  peruData,
  peruHubs,
  peruHistory,
  peruTalentPyramid,
  peruTalentFamilies,
  peruStudios,
} from './peru'

/**
 * CHILE · EFFICIENCY PLACEHOLDER
 * ────────────────────────────────────────────────────────────────────────
 * Centralized, single-source placeholder for the Chile side of the
 * Scene 04 (Eficiencia / AI + Automation) comparative story.
 *
 * Chile does NOT yet have validated stakeholder data equivalent to Peru's
 * for this chapter. Every value below is illustrative / demo content for
 * layout purposes only (status: 'pending', isDemo: true) and MUST render
 * with a visible "POR VALIDAR" marker — see EfficiencyFlow.tsx.
 *
 * When validated Chile data arrives: replace the values in this object
 * only. No other file should contain Chile placeholder numbers.
 */
export const chileEfficiencyPlaceholder = {
  status: 'pending' as const,
  isDemo: true as const,
  tag: 'CHILE · DATA POR VALIDAR',
  adoption: {
    onboarded: { value: 'XXXX', label: 'Usuarios onboarded' },
    active: { value: 'XXXX', label: 'Usuarios activos' },
    onboardingRate: { value: 'XX,X%', label: 'Onboarding' },
    activeRate: { value: 'XX,X%', label: 'Active users' },
  },
  aiEvolution: {
    stages: [
      { id: 'etapa-01', label: 'ETAPA 01' },
      { id: 'etapa-02', label: 'ETAPA 02' },
      { id: 'etapa-03', label: 'ETAPA 03' },
      { id: 'etapa-04', label: 'ETAPA 04' },
    ],
  },
  initiatives: {
    primary: { value: 'XX', label: 'Iniciativas' },
    explorations: { value: 'XX', label: 'Exploraciones' },
    fronts: [
      { id: 'frente-01', label: 'FRENTE 01' },
      { id: 'frente-02', label: 'FRENTE 02' },
      { id: 'frente-03', label: 'FRENTE 03' },
      { id: 'frente-04', label: 'FRENTE 04' },
    ],
  },
  capabilities: {
    aiBuildTeam: [
      { code: 'AI-901', value: 'XX%' },
      { code: 'GH-300', value: 'XX%' },
      { code: 'AI-103', value: 'XX%' },
    ],
    groups: [
      { category: 'Capacidades', value: 'POR VALIDAR' },
      { category: 'IA Generativa', value: 'POR VALIDAR' },
      { category: 'Frameworks', value: 'POR VALIDAR' },
    ],
  },
  upskilling: {
    items: [
      { code: 'AI-901', percent: 'XX%', certified: 'XXX' },
      { code: 'GH-300', percent: 'XX%', certified: 'XXX' },
      { code: 'AI-103', percent: 'XX%', certified: 'XXX' },
    ],
    openAI: { certifications: 'XXX', fte: 'XXX' },
  },
  results: {
    kpis: [
      { id: 'rentabilidad', value: 'XX,X%', label: 'Rentabilidad' },
      { id: 'cumplimiento', value: 'XX,X%', label: 'Cumplimiento YTD' },
      { id: 'avance', value: 'XX,X%', label: 'Avance anual' },
      { id: 'cierre', value: 'XX,X%', label: 'Cierre previsto' },
    ],
    economicLabel: 'DATA FINANCIERA',
  },
}

export const presentationData = {
  peru: {
    identity: countryIdentity.peru, hc: peruData.hc, hubs: peruHubs, history: peruHistory,
    territory: peruData.territoryDistribution, deliveryModel: peruData.deliveryModel,
    talent: { pyramid: peruTalentPyramid, families: peruTalentFamilies }, studios: peruStudios,
    certifications: peruData.certifications, photos: countryPhotos.peru,
  },
  chile: {
    identity: countryIdentity.chile, hc: chileData.gdneHC, peopleUnderManagement: chileData.peopleUnderManagement,
    hubs: chileHubs, history: chileHistory, territory: chileData.territoryDistribution,
    deliveryModel: {
      local: { percent: chileData.delivery[0].percent, hc: chileData.delivery[0].hc },
      nearshore: { percent: chileData.delivery[1].percent, hc: chileData.delivery[1].hc },
      offshore: { percent: chileData.delivery[2].percent, hc: chileData.delivery[2].hc },
    },
    talent: { pyramid: chileTalentPyramid, families: chileTalentFamilies }, studios: chileStudios,
    certifications: chileCertifications,
    certificationFocus: { areas: ['AI', 'Data', 'Automation', 'Cloud', 'QA'], status: 'pending_validation' as const },
    photos: countryPhotos.chile,
  },
  story: { combinedHC: globalData.combinedHC, combinedHCStatus: globalData.combinedHCStatus },
  oneGdne: {
    overview: {
      headlineHC: { value: '+2.000', status: 'pending_validation' as const },
      combinedHC: { value: 2017, status: 'pending_validation' as const },
      peruHC: { value: 1434, status: 'pending_validation' as const },
      chileHC: { value: 605, status: 'pending_validation' as const },
    },
    talentCombined: { value: 2017, status: 'pending_validation' as const },
    history: {
      chile: [
        { year: '2007', title: 'Nace el primer hub de América', detail: 'Nace el CAR en Temuco en alianza con la Universidad de La Frontera. Conectamos talento regional con proyectos tecnológicos reales y capacidades offshore.' },
        { year: '2009', title: 'Comienza la consolidación', detail: 'Nace el primer centro en América. El modelo evoluciona hacia un centro tecnológico desde Temuco.' },
        { year: '2015', title: '+250 profesionales', detail: 'Temuco se convierte en Hub Digital. Alianza con CORFO y academia impulsa escala, innovación y especialización.' },
        { year: 'HOY', title: '605 personas', detail: 'Una capacidad madura y especializada.' },
      ],
      peru: [
        { year: '2016', title: 'Nace CAR Trujillo', detail: 'Primera sede regional de Perú. Inicia operaciones con 50 colaboradores apostando por talento tecnológico del norte.' },
        { year: '2020', title: 'Consolidamos nuestra escala', detail: 'El crecimiento impulsa el traslado a Expomall. La operación supera los 500 colaboradores.' },
        { year: '2023', title: 'Expandimos nuestra presencia al sur', detail: 'Nace Arequipa como segundo hub de Perú.' },
        { year: 'HOY', title: '1.434 personas', detail: 'Gran escala y creciente especialización.' },
      ],
    },
    territory: {
      chile: { total: { value: 609, status: 'pending_validation' as const }, principalShare: { value: 72, status: 'pending_validation' as const }, locations: ['Temuco / Araucanía', 'Concepción / Biobío'], regions: [{ name: 'Araucanía', value: 281, percent: 55, status: 'validated' as const }, { name: 'Biobío', value: 97, percent: 17, status: 'validated' as const }, { name: 'Chile y Otras Zonas', value: 231, percent: 28, status: 'validated' as const }], message: 'Una capacidad tecnológica fuertemente conectada con el sur de Chile.' },
      peru: { total: { value: 1434, status: 'pending_validation' as const }, principalShare: { value: 51, status: 'pending_validation' as const }, locations: ['La Libertad / Trujillo', 'Arequipa'], regions: [{ name: 'La Libertad (Trujillo)', value: 511, percent: 36, status: 'validated' as const }, { name: 'Arequipa', value: 214, percent: 15, status: 'validated' as const }, { name: 'Lima', value: 189, percent: 13, status: 'validated' as const }, { name: 'Resto Perú', value: 520, percent: 36, status: 'validated' as const }], message: 'Una capacidad distribuida que amplía el acceso al talento más allá de las capitales.' },
    },
    talent: {
      peru: { total: { value: 1434, status: 'pending_validation' as const }, femaleRepresentation: { value: '22%', status: 'validated' as const }, families: [{ name: 'Engineer', value: 958, percent: 67, status: 'pending_validation' as const }, { name: 'Enterprise Solutions Engineering', value: 187, percent: 13, status: 'pending_validation' as const }, { name: 'Quality Assurance', value: 119, percent: 8, status: 'pending_validation' as const }, { name: 'Enterprise Solutions Functional A.', value: 102, percent: 7, status: 'pending_validation' as const }], pyramid: [{ name: 'Executive', value: 9, percent: 1, status: 'validated' as const }, { name: 'Leaders', value: 108, percent: 7, status: 'validated' as const }, { name: 'Contributor', value: 1317, percent: 92, status: 'validated' as const }] },
      chile: { total: { value: 605, status: 'pending_validation' as const }, femaleRepresentation: { value: '15,9%', status: 'validated' as const }, families: [{ name: 'Engineer', value: 363, percent: 75, status: 'validated' as const }, { name: 'Enterprise Solutions Eng.', value: 44, percent: 9, status: 'validated' as const }, { name: 'Quality Assurance', value: 34, percent: 7, status: 'validated' as const }, { name: 'Otros', value: 41, percent: 9, status: 'validated' as const }], pyramid: [{ name: 'Executive', value: 6, percent: 1, status: 'validated' as const }, { name: 'Leaders', value: 43, percent: 8, status: 'validated' as const }, { name: 'Contributor', value: 457, percent: 91, status: 'validated' as const }] },
    },
    studios: {
      peru: peruStudios,
      chile: chileStudios,
      editorialLine: 'La escala importa. La especialización nos diferencia.',
    },
    capabilities: {
      funnel: ['Certificación', 'Especialización', 'Despliegue', 'Oferta de valor'] as const,
      peru: {
        certifications: { value: '+2.100', status: 'validated' as const, label: 'certificaciones obtenidas' },
        hc: { value: 1434, status: 'pending_validation' as const },
        currentRate: { value: '57%', status: 'validated' as const },
        objective: { value: '70%', status: 'pending_validation' as const },
        highlights: ['+1.300 certificaciones OpenAI, acelerando capacidades en IA.', '878 certificaciones técnicas vigentes registradas.'],
        partners: [
          { name: 'AWS', logo: '/partners/aws.png' },
          { name: 'Microsoft', logo: '/partners/microsoft.png' },
          { name: 'Google Cloud', logo: '/partners/google-cloud.png' },
          { name: 'ISTQB', logo: '/partners/istqb.png' },
          { name: 'SAP', logo: '/partners/sap.png' },
          { name: 'OpenAI', logo: '/partners/openai.png' },
        ] as PartnerLogo[],
        strategicFocus: ['Cloud', 'AI', 'Data', 'QA'],
        ecosystems: 'AWS · Microsoft · Google · ISTQB · SAP · entre otras',
        progression: 'Fundamentals → Associate → Expert',
      },
      chile: {
        certifiedPeople: { value: '+700', status: 'pending_validation' as const },
        currentRate: { value: '82%', status: 'validated' as const },
        objective: { value: '>85%', status: 'pending_validation' as const },
        highlights: ['GDN-e Chile, mayor tasa de profesionales certificados FY25 en IBIOL.', '+517 certificaciones OpenAI, acelerando capacidades en IA.', '206 certificaciones técnicas vigentes registradas.'],
        partners: [
          { name: 'AWS', logo: '/partners/aws.png' },
          { name: 'Microsoft', logo: '/partners/microsoft.png' },
          { name: 'Google Cloud', logo: '/partners/google-cloud.png' },
          { name: 'ISTQB', logo: '/partners/istqb.png' },
          { name: 'OpenAI', logo: '/partners/openai.png' },
        ] as PartnerLogo[],
        strategicFocus: ['Cloud', 'AI / Automation', 'Data', 'QA'],
        ecosystems: 'AWS · Microsoft · Google · ISTQB · entre otras',
        progression: 'Fundamentals → Associate → Expert',
      },
    },
  },
  efficiency: {
    concept: 'AI + Automation',
    peru: {
      adoption: {
        onboarded: { value: 1353, percentOfPeru: 23.4, sourceTotal: 5774 },
        active: { value: 1118, percentOfPeru: 24.7, sourceTotal: 4525 },
        onboardingRate: { percent: 99.19, deltaPp: 2.51 },
        activeRate: { percent: 81.96, deltaPp: 6.19 },
        insight: 'GDN-e concentra cerca de una cuarta parte de la adopción nacional y supera el promedio Perú en actividad.',
      } as PeruAdoption,
      aiEvolution: {
        stages: [
          { id: 'inicio', label: 'INICIO: ACTIVOS AXET', items: ['Flows', 'Maia', 'Talk', 'Code', 'Plugin', 'Oasis'] },
          { id: 'eficiencia', label: 'EFICIENCIA INTERNA', detail: 'Plugin acelera el trabajo del equipo' },
          { id: 'productividad', label: 'PRODUCTIVIDAD TÉCNICA', detail: 'Mayor foco en Axet Code' },
          { id: 'ecosistema', label: 'ECOSISTEMA AMPLIADO', items: ['ChatGPT', 'Codex', 'Axet Code', 'Copilot'], detail: 'según caso de uso' },
        ],
      } as AiEvolution,
      initiatives: {
        implementedOrProduction: 27,
        activeExplorations: 4,
        collaborationUnits: ['BPS', 'AS', 'BSA'],
        groups: [
          { id: 'ibiol', name: 'IBIOL / Cross', count: 4, countLabel: 'iniciativas implementadas', items: ['Talent Up', 'Team Core', 'Fluxmind', 'Nexus'] },
          { id: 'finanzas', name: 'Finanzas', count: 8, countLabel: 'iniciativas en producción', period: 'FY26', items: ['Carta Fianza', 'Solicitud de Facturación', 'LBs'] },
          { id: 'people', name: 'People', count: 10, countLabel: 'iniciativas en producción', period: 'FY26', items: ['Annual Go', 'Recompensa Total', 'Vacaciones'] },
          { id: 'legal', name: 'Legal', count: 3, countLabel: 'iniciativas en producción', period: 'FY26', items: ['Contratación de proveedores', 'Propuestas comerciales', 'Regalos e invitaciones'] },
        ] as PeruInitiativeGroup[],
        bps: {
          exploration: { count: 4, items: [{ name: 'Pacífico Seguros', value: 3 }, { name: 'Entel', value: 1 }] },
          production: { count: 2, items: [{ name: 'Pacífico Seguros', value: 2 }] },
        } as PeruBps,
        conclusion: {
          title: 'DE PERÚ PARA EL MUNDO',
          levelLabel: 'Nivel IBIOL / País',
          count: 4,
          countLabel: 'iniciativas presentadas o implementadas',
          items: ['Talent Up', 'Team Core', 'Fluxmind', 'Nexus'],
        },
      } as PeruInitiatives,
      capabilities: {
        aiBuildTeam: [
          { code: 'AI-901', percent: 100 },
          { code: 'GH-300', percent: 100 },
          { code: 'AI-103', percent: 8 },
        ] as PeruAiBuildTeamRow[],
        supporting: [
          { category: 'Avanzado', items: ['Axet', 'Power Automate'] },
          { category: 'IA Generativa', items: ['OpenAI / ChatGPT', 'Gemini'] },
          { category: 'Frameworks IA', items: ['LangChain', 'LangGraph'] },
          { category: 'Datos', items: ['Relacionales intermedio / avanzado', 'No relacionales intermedio'] },
          { category: 'Full Stack', items: ['React', 'Express', 'NestJS'] },
        ],
      } as PeruCapabilities,
      upskilling: {
        items: [
          { code: 'AI-901', percent: 49, certified: 194 },
          { code: 'GH-300', percent: 62, certified: 520 },
          { code: 'AI-103', percent: 9, certified: 30 },
        ] as PeruUpskillingItem[],
        openAI: { certifications: '1.303', fte: 492 } as PeruOpenAI,
        aiBuildTeamSummary: '100% AI-901 · 100% GH-300 · 8% AI-103',
      } as PeruUpskilling,
      results: {
        kpis: [
          { id: 'rentabilidad', value: '22,4%', label: 'Rentabilidad', detail: 'Abr–Sep 2026' },
          { id: 'cumplimiento', value: '100,5%', label: 'Cumplimiento YTD', detail: 'vs presupuesto acumulado' },
          { id: 'avance', value: '65,2%', label: 'Avance anual', detail: 'ingreso real Abr–Sep' },
          { id: 'cierre', value: '127,4%', label: 'Cierre previsto', detail: 'proyección FY26' },
        ],
        budget: {
          annualBudget: 'S/ 1.145.974',
          annualProjectedRevenue: 'S/ 1.460.095,95',
          overperformance: { value: 'S/ 314.121,95', percent: '+27,4%' },
        },
        detail: {
          accumulatedBudget: 'S/ 743.475',
          actualRevenue: 'S/ 746.948',
          costs: 'S/ 579.312',
          margin: 'S/ 167.636',
          projection: 'S/ 713.147,95',
        },
      } as PeruResults,
      message: 'Capacidad madura de construcción de soluciones y automatización (principalmente local).',
      adoptionTag: { label: '', status: 'pending_validation' as const },
    },
    chile: {
      initiatives: [
        { id: 'dispatcher', name: 'AXET.Dispatcher (ES)', clients: ['ANASAC', 'COPEC', 'RedSalud', 'Metrogas', 'Clínica Alemana'], detail: 'Evaluación en USA (CTS)' },
        { id: 'migracion-ia', name: 'Migración con IA (DA)', detail: 'Cliente: AFP Capital' },
        { id: 'propuestas', name: 'Propuestas (BPS)', detail: '3 propuestas: Banco Estado · 1 propuesta: GCR' },
        { id: 'poc-agentica', name: 'PoC Agéntica (AS)', detail: 'CTS · Cintra Tools Services' },
        { id: 'seguimientos', name: 'Seguimientos semanales', detail: 'BPS – IS – IS2' },
      ],
      maturityTracker: {
        title: 'Catastro y madurez IA',
        subtitle: 'AI Maturity Tracker',
        servicesEvaluated: { value: 117, label: 'Servicios evaluados (proyectos)' },
        peopleEvaluated: { value: 504, label: 'Personas evaluadas' },
      },
      message: 'Capacidad técnica en crecimiento, con participación en requerimientos de clientes y oportunidades de mayor escalamiento.',
      adoption: { label: '', status: 'pending_validation' as const },
    },
    chilePlaceholder: chileEfficiencyPlaceholder,
  },
  value: {
    headline: { line1: 'Dónde creamos valor', line2: 'y hacia dónde crecemos' },
    peru: {
      local: peruData.deliveryModel.local.percent,
      offshore: peruData.deliveryModel.offshore.percent,
      nearshore: peruData.deliveryModel.nearshore.percent,
      strength: 'Alta participación en proyectos del mercado local.',
      clients: [
        { id: 'bcp', name: 'BCP', logo: '/clients/peru/bcp.png' },
        { id: 'scotiabank', name: 'Scotiabank', logo: '/clients/peru/scotiabank.png' },
        { id: 'interbank', name: 'Interbank', logo: '/clients/peru/interbank.png' },
        { id: 'caser', name: 'Caser', logo: '/clients/peru/caser.png' },
      ] as PeruClient[],
      clientsStatus: 'validated' as const,
    },
    chile: {
      local: 51,
      offshore: 49,
      nearshore: 0,
      strength: 'Mix entre capacidad local y participación internacional (offshore).',
      clients: [
        { id: 'caser', name: 'Caser', country: 'España', logo: '/clients/chile/caser.png' },
        { id: 'clinica-alemana', name: 'Clínica Alemana', country: 'Chile', logo: '/clients/chile/clinica-alemana.png' },
        { id: 'world-bank', name: 'Banco Mundial', country: 'USA', logo: '/clients/chile/world-bank.png' },
      ] as ChileClient[],
      clientsStatus: 'validated' as const,
    },
    network: { core: 'One GDN-e', target: 'Clientes / Mercados' },
  },
  futureChallenges: {
    headline: 'Una red conectada para los desafíos del futuro',
    core: { title: 'Chile + Perú', subtitle: 'One capability' },
    themes: [
      { id: 'complement', number: '01', title: 'Complementar capacidades', body: 'Conectar especializaciones de Chile y Perú para responder como una capacidad integrada.', status: 'stakeholder_draft' as const },
      { id: 'accelerate', number: '02', title: 'Acelerar AI & Automation', body: 'Transformar capacidades emergentes y experiencias existentes en soluciones escalables.', status: 'stakeholder_draft' as const },
      { id: 'mobilize', number: '03', title: 'Movilizar el talento', body: 'Facilitar colaboración, formación, certificación y participación cross-country / cross-project.', status: 'stakeholder_draft' as const },
      { id: 'scale', number: '04', title: 'Escalar nuestro impacto', body: 'Aumentar nuestra capacidad de responder ante oportunidades locales, offshore y globales.', status: 'stakeholder_draft' as const },
    ],
    closing: '',
  },
}

export interface ValueClient {
  id: string
  name: string
  logo: string
}

export interface ChileClient {
  id: string
  name: string
  country: string
  logo: string | null
}

export interface PeruClient {
  id: string
  name: string
  logo: string
}

export interface PeruInitiativeGroup {
  id: string
  name: string
  count: number
  countLabel: string
  period?: string
  items: string[]
}

export interface PeruBpsEntry {
  name: string
  value: number
}

export interface PeruBps {
  exploration: { count: number; items: PeruBpsEntry[] }
  production: { count: number; items: PeruBpsEntry[] }
}

export interface PeruUpskillingItem {
  code: string
  percent: number
  certified: number
}

export interface PeruAiBuildTeamRow {
  code: string
  percent: number
}

export interface PeruOpenAI {
  certifications: string
  fte: number
}

export interface PeruAdoption {
  onboarded: { value: number; percentOfPeru: number; sourceTotal: number }
  active: { value: number; percentOfPeru: number; sourceTotal: number }
  onboardingRate: { percent: number; deltaPp: number }
  activeRate: { percent: number; deltaPp: number }
  insight: string
}

export interface AiEvolutionStage {
  id: string
  label: string
  items?: string[]
  detail?: string
}

export interface AiEvolution {
  stages: AiEvolutionStage[]
}

export interface PeruInitiativesConclusion {
  title: string
  levelLabel: string
  count: number
  countLabel: string
  items: string[]
}

export interface PeruInitiatives {
  implementedOrProduction: number
  activeExplorations: number
  collaborationUnits: string[]
  groups: PeruInitiativeGroup[]
  bps: PeruBps
  conclusion: PeruInitiativesConclusion
}

export interface PeruCapabilitySupportGroup {
  category: string
  items: string[]
}

export interface PeruCapabilities {
  aiBuildTeam: PeruAiBuildTeamRow[]
  supporting: PeruCapabilitySupportGroup[]
}

export interface PeruUpskilling {
  items: PeruUpskillingItem[]
  openAI: PeruOpenAI
  aiBuildTeamSummary: string
}

export interface PeruResultKpi {
  id: string
  value: string
  label: string
  detail: string
}

export interface PeruResults {
  kpis: PeruResultKpi[]
  budget: {
    annualBudget: string
    annualProjectedRevenue: string
    overperformance: { value: string; percent: string }
  }
  detail: {
    accumulatedBudget: string
    actualRevenue: string
    costs: string
    margin: string
    projection: string
  }
}

export type ChileEfficiencyPlaceholder = typeof chileEfficiencyPlaceholder
