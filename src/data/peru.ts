import type { Hub, TimelineEvent } from './types'

export const peruData = {
  hc: 1408,
  gender: { malePercent: 78, femalePercent: 22, maleHC: 1099, femaleHC: 309 },
  deliveryModel: {
    local: { percent: 63, hc: 894 },
    offshore: { percent: 28, hc: 399 },
    nearshore: { percent: 8, hc: 115 },
  },
  roles: [
    { role: 'Rising Software Engineer', hc: 358, percent: 25 },
    { role: 'Software Engineer', hc: 297, percent: 21 },
    { role: 'Senior Software Engineer', hc: 243, percent: 17 },
  ],
  certifications: [
    { value: 860, label: 'Certificaciones', status: 'current' as const },
    { value: 150, label: 'Plan estratégico FY26', status: 'program' as const },
    { value: 1500, label: 'Proyección al cierre de Q3', status: 'target' as const },
  ],
}

export const peruHubs: Hub[] = [
  { id: 'trujillo', name: 'Trujillo', lat: -8.11, lon: -79.03, hc: null, note: 'Primera oficina de GDN-e Perú · 2016' },
  { id: 'lima', name: 'Lima', lat: -12.05, lon: -77.04, hc: null, note: 'Sede principal · HC por ciudad pendiente' },
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
