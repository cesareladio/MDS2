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

/**
 * presentationData — single source of truth for the final-story restructure.
 *
 * Every field that has not been explicitly validated by stakeholders carries
 * `status: 'pending_validation'`. Components must render those fields as
 * "pending" (never invent a number) — see individual scene components for
 * the rendering convention.
 */
export const presentationData = {
  peru: {
    identity: countryIdentity.peru,
    hc: peruData.hc,
    hubs: peruHubs,
    history: peruHistory,
    territory: peruData.territoryDistribution,
    deliveryModel: peruData.deliveryModel,
    talent: {
      pyramid: peruTalentPyramid,
      families: peruTalentFamilies,
    },
    studios: peruStudios,
    certifications: peruData.certifications,
    photos: countryPhotos.peru,
  },
  chile: {
    identity: countryIdentity.chile,
    hc: chileData.gdneHC,
    peopleUnderManagement: chileData.peopleUnderManagement,
    hubs: chileHubs,
    history: chileHistory,
    territory: chileData.territoryDistribution,
    deliveryModel: {
      local: { percent: chileData.delivery[0].percent, hc: chileData.delivery[0].hc },
      nearshore: { percent: chileData.delivery[1].percent, hc: chileData.delivery[1].hc },
      offshore: { percent: chileData.delivery[2].percent, hc: chileData.delivery[2].hc },
    },
    talent: {
      pyramid: chileTalentPyramid,
      families: chileTalentFamilies,
    },
    studios: chileStudios,
    certifications: chileCertifications,
    certificationFocus: {
      areas: ['AI', 'Data', 'Automation', 'Cloud', 'QA'],
      status: 'pending_validation' as const,
    },
    photos: countryPhotos.chile,
  },
  story: {
    combinedHC: globalData.combinedHC,
    combinedHCStatus: globalData.combinedHCStatus,
  },
  history: {
    closingLine: 'Dos historias que hoy convergen\nen una misma capacidad.',
  },
  territory: {
    maxPrimaryLabelsPerCountry: 3,
  },
  talent: {
    pyramidLevels: ['executive', 'lead', 'contributor'] as const,
  },
  studios: {
    kicker: 'Dónde se concentra nuestra capacidad tecnológica.',
  },
  capabilities: {
    funnel: ['Certificación', 'Especialización', 'Despliegue', 'Oferta de valor'] as const,
  },
  efficiency: {
    concept: 'AI & Automation',
    status: 'pending_validation' as const,
    peru: [] as EfficiencyInitiative[],
    chile: [] as EfficiencyInitiative[],
  },
  challenges: {
    peru: {
      local: peruData.deliveryModel.local.percent,
      offshore: peruData.deliveryModel.offshore.percent,
      nearshore: peruData.deliveryModel.nearshore.percent,
      projects: [] as ChallengeProject[],
    },
    chile: {
      local: chileData.delivery[0].percent,
      offshore: chileData.delivery[2].percent,
      nearshore: chileData.delivery[1].percent,
      projects: [] as ChallengeProject[],
    },
  },
}

export interface EfficiencyInitiative {
  id: string
  initiative: string
  challenge: string
  solution: string
  impact: string
  kpi?: string
}

export interface ChallengeProject {
  id: string
  name: string
  logo: string
}
