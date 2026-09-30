import type { Hub, TimelineEvent, Studios } from './types'

export const peruData = {
  hc: 1408,
  territoryDistribution: {
    total: 1408,
    regions: [
      { name: 'La Libertad', hc: 509, percentage: 36.2 },
      { name: 'Arequipa', hc: 210, percentage: 14.9 },
      { name: 'Lambayeque', hc: 103, percentage: 7.3 },
      { name: 'Piura', hc: 91, percentage: 6.5 },
      { name: 'Ica', hc: 62, percentage: 4.4 },
      { name: 'Otros', hc: 433, percentage: 30.7 },
    ],
  },
  talent: {
    totalHC: 1408,
    totalLabel: 'Personas',
    femalePercentage: 22,
  },
  gender: { malePercent: 78, femalePercent: 22, maleHC: 1099, femaleHC: 309 },
  deliveryModel: {
    local: { percent: 63, hc: 894 },
    offshore: { percent: 28, hc: 399 },
    nearshore: { percent: 8, hc: 115 },
  },
  capabilities: [
    { name: 'BACK-END', hc: 365, percent: 26 },
    { name: 'TESTING & QA', hc: 276, percent: 20 },
    { name: 'SAP', hc: 230, percent: 16 },
    { name: 'MICROSOFT', hc: 116, percent: 8 },
    { name: 'MOBILE', hc: 78, percent: 6 },
    { name: 'FRONT-END', hc: 77, percent: 5 },
  ],
  capabilitiesSummary: { hc: 1142, percent: 81 },
  certifications: [
    { value: 860, label: 'Certificaciones', status: 'current' as const },
    { value: 150, label: 'Plan estratégico FY26', status: 'program' as const },
    { value: 1500, label: 'Proyección al cierre de Q3', status: 'target' as const },
  ],
}

export const peruTalentPyramid = {
  contributor: { status: 'pending_validation' as const },
  lead: { status: 'pending_validation' as const },
  executive: { status: 'pending_validation' as const },
}

export const peruTalentFamilies = [
  { name: 'Engineering', hc: 365 + 77 + 78, percent: 26 + 5 + 6, status: 'current' as const },
  { name: 'Quality Assurance', hc: 276, percent: 20, status: 'current' as const },
  { name: 'Enterprise Solutions Engineering', hc: 230 + 116, percent: 16 + 8, status: 'current' as const },
]

export const peruStudios: Studios = {
  status: 'validated',
  totalTalent: 1049,
  focusCount: 3,
  groups: [
    {
      id: 'software-engineering',
      name: 'Software Engineering',
      totalHc: 531,
      percent: 38,
      subgroups: [
        { name: 'Backend',  hc: 343, percent: 25 },
        { name: 'Frontend', hc: 188, percent: 13 },
      ],
    },
    {
      id: 'quality-engineering',
      name: 'Quality Engineering',
      totalHc: 286,
      percent: 20,
    },
    {
      id: 'enterprise-platform',
      name: 'Enterprise Platform',
      totalHc: 232,
      percent: 17,
    },
  ],
}

export const peruHubs: Hub[] = [
  { id: 'trujillo', name: 'Trujillo', lat: -8.11, lon: -79.03, hc: null, note: 'Primera oficina de GDN-e Perú · 2016' },
  { id: 'arequipa', name: 'Arequipa', lat: -16.4, lon: -71.54, hc: null, note: 'Segundo hub de Perú · 2023' },
]

export const peruHistory: TimelineEvent[] = [
  { year: '2016', title: 'Trujillo', detail: 'Primera oficina, sede Orbegoso · 50 colaboradores' },
  { year: '2020', title: 'Expomall', detail: 'La operación supera los 500 colaboradores' },
  { year: '2021', title: 'Testing & SAP', detail: 'Crecimiento de las líneas de Testing y SAP' },
  { year: '2022', title: 'Re-Image Woman Tech', detail: 'Nace la iniciativa en GDN-e, enfocada en SAP y Testing' },
  { year: '2023', title: 'Tech Girl Power', detail: 'El programa es adoptado por Oficina Lima y se traslada a todo Perú' },
  { year: '2023', title: 'Arequipa', detail: 'Inauguración del segundo hub de Perú' },
]

export const peruDiversity: TimelineEvent[] = [
  { year: '2022', title: 'Re-Image Woman Tech', detail: 'Nace la iniciativa en GDN-e, enfocada en SAP y Testing' },
  { year: '2023', title: 'Tech Girl Power', detail: 'El programa es adoptado por Oficina Lima y se traslada a todo Perú' },
  { year: 'FY25', title: '19 incorporaciones', detail: 'Talento formado en SAP, Java y Data' },
  { year: 'CURRENT', title: '22% HC femenino', detail: 'Participación femenina actual', status: 'current' },
]
