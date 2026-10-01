import { globalData } from './global'
import { countryIdentity } from './countryIdentity'
import { countryPhotos } from './photos'
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
      chile: { total: { value: 609, status: 'pending_validation' as const }, principalShare: { value: 72, status: 'pending_validation' as const }, locations: ['Temuco / Araucanía', 'Concepción / Biobío'], regions: [{ name: 'Araucanía', value: 48, status: 'pending_validation' as const }, { name: 'Biobío', value: 24, status: 'pending_validation' as const }, { name: 'Resto Chile', value: null, status: 'pending_validation' as const }], message: 'Una capacidad tecnológica fuertemente conectada con el sur de Chile.' },
      peru: { total: { value: 1434, status: 'pending_validation' as const }, principalShare: { value: 51, status: 'pending_validation' as const }, locations: ['La Libertad / Trujillo', 'Arequipa'], regions: [{ name: 'La Libertad (Trujillo)', value: 511, percent: 36, status: 'validated' as const }, { name: 'Arequipa', value: 214, percent: 15, status: 'validated' as const }, { name: 'Lima', value: 189, percent: 13, status: 'validated' as const }, { name: 'Resto Perú', value: 520, percent: 36, status: 'validated' as const }], message: 'Una capacidad distribuida que amplía el acceso al talento más allá de las capitales.' },
    },
    talent: {
      peru: { total: { value: 1434, status: 'pending_validation' as const }, femaleRepresentation: { value: '22%', status: 'validated' as const }, families: [{ name: 'Engineer', value: 958, percent: 67, status: 'pending_validation' as const }, { name: 'Enterprise Solutions Engineering', value: 187, percent: 13, status: 'pending_validation' as const }, { name: 'Quality Assurance', value: 119, percent: 8, status: 'pending_validation' as const }, { name: 'Enterprise Solutions Functional A.', value: 102, percent: 7, status: 'pending_validation' as const }] },
      chile: { total: { value: 605, status: 'pending_validation' as const }, femaleRepresentation: { value: '15,9%', status: 'validated' as const }, families: [{ name: 'Engineer', value: 363, percent: 75, status: 'validated' as const }, { name: 'Enterprise Solutions Eng.', value: 44, percent: 9, status: 'validated' as const }, { name: 'Quality Assurance', value: 34, percent: 7, status: 'validated' as const }, { name: 'Otros', value: 41, percent: 9, status: 'validated' as const }], pyramid: [{ name: 'Executive', value: 6, percent: 1, status: 'validated' as const }, { name: 'Leaders', value: 43, percent: 8, status: 'validated' as const }, { name: 'Contributor', value: 457, percent: 91, status: 'validated' as const }] },
    },
    studios: {
      peru: {
        status: 'validated' as const,
        totalTalent: 1049,
        focusCount: 3,
        groups: [{ id: 'backend', name: 'Backend', totalHc: 343, percent: 25 }, { id: 'quality', name: 'Quality', totalHc: 286, percent: 20 }, { id: 'enterprise-platform', name: 'Enterprise Platform', totalHc: 232, percent: 17 }, { id: 'frontend', name: 'Frontend', totalHc: 188, percent: 13 }],
        highlights: { title: 'HIGHLIGHTS', items: [] },
      },
      chile: { ...chileStudios, highlights: { title: 'HIGHLIGHTS', items: [] } },
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
        partners: [],
        strategicFocus: ['Cloud', 'AI', 'Data', 'QA'],
        ecosystems: 'AWS · Microsoft · Google · ISTQB · SAP · entre otras',
        progression: 'Fundamentals → Associate → Expert',
      },
      chile: {
        certifiedPeople: { value: '+700', status: 'pending_validation' as const },
        currentRate: { value: '82%', status: 'validated' as const },
        objective: { value: '>85%', status: 'pending_validation' as const },
        highlights: ['GDN-e Chile, mayor tasa de profesionales certificados FY25 en IBIOL.', '+517 certificaciones OpenAI, acelerando capacidades en IA.', '206 certificaciones técnicas vigentes registradas.'],
        partners: [],
        strategicFocus: ['Cloud', 'AI / Automation', 'Data', 'QA'],
        ecosystems: 'AWS · Microsoft · Google · ISTQB · entre otras',
        progression: 'Fundamentals → Associate → Expert',
      },
    },
  },
  efficiency: {
    headline: 'Del talento tecnológico a soluciones de impacto',
    concept: 'AI + Automation',
    status: 'pending_validation' as const,
    cases: {
      peru: { country: 'Perú', client: null, project: null, logo: null, challenge: null, solution: null, impactValue: null, impactUnit: '%', impactLabel: 'mejora / ahorro / eficiencia', status: 'pending_validation' as const },
      chile: { country: 'Chile', client: null, project: null, logo: null, challenge: null, solution: null, impactValue: null, impactUnit: '%', impactLabel: 'mejora / ahorro / eficiencia', status: 'pending_validation' as const },
    },
    adoption: {
      peru: { label: 'Adopción AI', value: null, status: 'pending_validation' as const, supporting: 'Capacidad madura de construcción de soluciones y automatización (principalmente local).' },
      chile: { label: 'Adopción AI', value: null, status: 'pending_validation' as const, supporting: 'Capacidad aplicada de AI + Automation por validar.' },
    },
    closing: 'No solo desarrollamos capacidades. Las convertimos en soluciones.',
  },
  value: {
    headline: { line1: 'Dónde creamos valor', line2: 'y hacia dónde crecemos' },
    peru: {
      local: peruData.deliveryModel.local.percent,
      offshore: peruData.deliveryModel.offshore.percent,
      nearshore: peruData.deliveryModel.nearshore.percent,
      strength: 'Alta participación en proyectos del mercado local.',
      clients: [] as ValueClient[],
      clientsStatus: 'pending_validation' as const,
    },
    chile: {
      local: chileData.delivery[0].percent,
      offshore: chileData.delivery[2].percent,
      nearshore: chileData.delivery[1].percent,
      strength: 'Mix entre capacidad local y participación internacional (offshore).',
      clients: [] as ValueClient[],
      clientsStatus: 'pending_validation' as const,
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
    closing: 'El próximo salto no depende solo de nuestro talento, sino de cómo conectamos nuestras capacidades.',
  },
}

export interface ValueClient {
  id: string
  name: string
  logo: string
}

export interface EfficiencyCase {
  country: 'Perú' | 'Chile'
  client: string | null
  project: string | null
  logo: string | null
  challenge: string | null
  solution: string | null
  impactValue: number | null
  impactUnit: string
  impactLabel: string
  status: 'pending_validation'
}

export interface EfficiencyInitiative { id: string; initiative: string; challenge: string; solution: string; impact: string; kpi?: string }
