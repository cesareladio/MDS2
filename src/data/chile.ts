import type { Hub, TimelineEvent } from './types'

export const chileData = {
  gdneHC: 510,
  subco: 99,
  peopleUnderManagement: 609,
  femaleHC: 81,
  femalePercent: 15.9,
  inclusionRate: 2,
  executiveTeam: { total: 6, women: 2, men: 4, femalePercent: 33 },
  capabilities: [
    { name: 'Backend', hc: 227, percent: 44.5 },
    { name: 'Data', hc: 66, percent: null },
    { name: 'Quality', hc: 53, percent: null },
    { name: 'Frontend', hc: 47, percent: null },
  ],
  delivery: [
    { name: 'Local', hc: 272, percent: 47 },
    { name: 'Nearshore', hc: 49, percent: 9 },
    { name: 'Offshore', hc: 252, percent: 44 },
  ],
  regions: [
    { region: 'La Araucanía', hc: 281, percent: 55 },
    { region: 'Biobío', hc: 87, percent: 17 },
    { region: 'Metropolitana', hc: 33, percent: 6 },
    { region: 'Maule', hc: 29, percent: 6 },
    { region: 'Los Ríos', hc: 20, percent: 4 },
  ],
}

export const chileHubs: Hub[] = [
  { id: 'santiago', name: 'Santiago', lat: -33.45, lon: -70.67, hc: 33, note: 'Región Metropolitana · dato regional aproximado' },
  { id: 'talca', name: 'Talca', lat: -35.43, lon: -71.66, hc: 29, note: 'Región del Maule · dato regional aproximado' },
  { id: 'concepcion', name: 'Concepción', lat: -36.83, lon: -73.05, hc: 87, note: 'Región del Biobío · dato regional aproximado' },
  { id: 'temuco', name: 'Temuco', lat: -38.74, lon: -72.59, hc: 281, note: 'La Araucanía · principal concentración regional' },
  { id: 'valdivia', name: 'Valdivia', lat: -39.82, lon: -73.25, hc: 20, note: 'Región de Los Ríos · dato regional aproximado' },
]

export const chileHistory: TimelineEvent[] = [
  { year: '2007', title: 'Presencia en Temuco', detail: 'Apuesta por desarrollar una fábrica de software desde regiones' },
  { year: '2015', title: '+250 profesionales', detail: 'Cerca del 70% de la demanda de programación provenía de Europa' },
  { year: '2015', title: 'Hub Digital', detail: 'Nueva etapa de crecimiento para la operación regional' },
  { year: '2016', title: 'Hub operativo', detail: 'Puesta en marcha del proyecto en Temuco' },
]

export const chileCertifications: TimelineEvent[] = [
  { year: '2024', title: '25 personas', detail: 'Base inicial certificada', status: 'current' },
  { year: 'FY25', title: '+112 personas', detail: '82% de aprobación', status: 'current' },
  { year: 'FY26 CURRENT', title: '206 personas', detail: '100% de aprobación a la fecha', status: 'current' },
  { year: 'FY26 AMBITION', title: '332 personas', detail: 'Meta de aprobación igual o superior a 85%', status: 'target' },
]
