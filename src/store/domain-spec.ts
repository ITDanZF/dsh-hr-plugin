import { defineDomain, type DomainSpec } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'
import {
  datePlaces,
  headerAligns,
  headingRules,
  keywordStyles,
  nameRules,
  sheetDensities,
  sheetFonts,
  sheetLayouts,
  sheetScales,
  skillLevels,
  workTypes,
} from '../domain/index.js'

const link = z.object({
  id: z.string(),
  network: z.string(),
  username: z.string(),
  url: z.string(),
})

const experience = z.object({
  id: z.string(),
  organization: z.string(),
  position: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  summary: z.string(),
  url: z.string(),
  highlights: z.array(z.string()),
  keywords: z.array(z.string()),
})

const project = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  entity: z.string(),
  type: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  keywords: z.array(z.string()),
  url: z.string(),
})

const education = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  area: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string(),
  studyMode: z.string(),
  score: z.string(),
  courses: z.array(z.string()),
  exchange: z.string(),
})

const skill = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(skillLevels),
  keywords: z.array(z.string()),
})

const language = z.object({
  id: z.string(),
  language: z.string(),
  fluency: z.string(),
})

const certificate = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  expiryDate: z.string(),
  credentialId: z.string(),
  url: z.string(),
})

const award = z.object({
  id: z.string(),
  title: z.string(),
  awarder: z.string(),
  date: z.string(),
  summary: z.string(),
})

const activity = z.object({
  id: z.string(),
  organization: z.string(),
  position: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  highlights: z.array(z.string()),
})

const publication = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  publisher: z.string(),
  date: z.string(),
  url: z.string(),
})

const reference = z.object({
  id: z.string(),
  name: z.string(),
  relationship: z.string(),
  organization: z.string(),
  phone: z.string(),
  email: z.string(),
})

const appearance = z.object({
  presetId: z.string(),
  layout: z.enum(sheetLayouts),
  accent: z.string(),
  font: z.enum(sheetFonts),
  density: z.enum(sheetDensities),
  scale: z.enum(sheetScales),
  headerAlign: z.enum(headerAligns),
  nameRule: z.enum(nameRules),
  headingRule: z.enum(headingRules),
  keywordStyle: z.enum(keywordStyles),
  datePlace: z.enum(datePlaces),
  showPhoto: z.boolean(),
  paper: z.string(),
  ink: z.string(),
  pageMarginMm: z.number().min(8).max(26).optional(),
  lineHeight: z.number().min(1.2).max(2).optional(),
})

const catalogOption = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
})

const catalogPreset = appearance.extend({
  name: z.string(),
})

export const catalogRecord = z.object({
  workType: z.array(catalogOption),
  skillLevel: z.array(catalogOption),
  layout: z.array(catalogOption),
  font: z.array(catalogOption),
  density: z.array(catalogOption),
  scale: z.array(catalogOption),
  headerAlign: z.array(catalogOption),
  nameRule: z.array(catalogOption),
  headingRule: z.array(catalogOption),
  keywordStyle: z.array(catalogOption),
  datePlace: z.array(catalogOption),
  accent: z.array(catalogOption),
  paper: z.array(catalogOption),
  ink: z.array(catalogOption),
  presets: z.array(catalogPreset),
})

export const resumeRecord = z.object({
  basics: z.object({
    name: z.string(),
    headline: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    photo: z.string(),
    links: z.array(link),
  }),
  intention: z.object({
    role: z.string(),
    industry: z.string(),
    cities: z.string(),
    workType: z.enum(workTypes),
  }),
  summary: z.string(),
  experiences: z.array(experience),
  projects: z.array(project),
  education: z.array(education),
  skills: z.array(skill),
  languages: z.array(language),
  certificates: z.array(certificate),
  awards: z.array(award),
  activities: z.array(activity),
  interests: z.array(z.string()),
  publications: z.array(publication),
  referencesOnRequest: z.boolean(),
  references: z.array(reference),
  appearance,
})

export const resumeDomainSpec = defineDomain({
  name: 'resume',
  version: 2,
  layout: 'per-record',
  tables: {
    documents: {
      valueSchema: resumeRecord,
    },
    catalog: {
      valueSchema: catalogRecord,
    },
  },
} as unknown as DomainSpec)
