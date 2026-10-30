/** Resume document owned by the domain. No Harness and no panel imports. */

export type WorkType = '' | '全职' | '兼职' | '实习'
export type SkillLevel = '' | '精通' | '熟练' | '了解'

export const workTypes = ['', '全职', '兼职', '实习'] as const
export const skillLevels = ['', '精通', '熟练', '了解'] as const
export const sheetLayouts = ['single', 'educationFirst', 'sidebar'] as const
export const sheetFonts = ['serif', 'sans', 'mono'] as const
export const sheetDensities = ['compact', 'normal', 'relaxed'] as const
export const sheetScales = ['small', 'medium', 'large'] as const
export const headerAligns = ['left', 'center'] as const
export const nameRules = ['short', 'none'] as const
export const headingRules = ['hairline', 'accent', 'none'] as const
export const keywordStyles = ['chips', 'text'] as const
export const datePlaces = ['end', 'below'] as const
export const entryCollections = [
  'experiences',
  'projects',
  'education',
  'skills',
  'languages',
  'certificates',
  'awards',
  'activities',
  'publications',
  'references',
] as const

export const sectionIds = ['intention', 'summary', 'experience', 'projects', 'education', 'skills', 'languages', 'certificates', 'awards', 'activities', 'interests', 'publications', 'references'] as const
export const defaultSectionOrder: string[] = ['summary', 'experience', 'projects', 'education', 'skills']
export type CustomFieldType = 'text' | 'longText' | 'dateRange' | 'link' | 'bullets'
export interface CustomField { id: string; label: string; type: CustomFieldType; value: string }
export interface CustomSection { id: string; title: string; fields: CustomField[] }

export const accentValues = ['#1c1917', '#1d4e89', '#1e3330', '#8a4b2f', '#3f4a57', '#3d348b'] as const
export const paperValues = ['#ffffff', '#f4f6f8', '#faf6f0', '#f6efe6', '#f7f9fc'] as const
export const inkValues = ['#1c1917', '#111111', '#3a2418', '#1c2430'] as const

export interface ResumeLink {
  id: string
  network: string
  username: string
  url: string
}

export interface ExperienceItem {
  id: string
  organization: string
  position: string
  location: string
  startDate: string
  endDate: string
  summary: string
  url: string
  highlights: string[]
  keywords: string[]
}

export interface ProjectItem {
  id: string
  name: string
  role: string
  entity: string
  type: string
  startDate: string
  endDate: string
  summary: string
  highlights: string[]
  keywords: string[]
  url: string
}

export interface EducationItem {
  id: string
  school: string
  degree: string
  area: string
  startDate: string
  endDate: string
  location: string
  studyMode: string
  score: string
  courses: string[]
  exchange: string
}

export interface SkillGroup {
  id: string
  name: string
  level: SkillLevel
  keywords: string[]
}

export interface LanguageItem {
  id: string
  language: string
  fluency: string
}

export interface CertificateItem {
  id: string
  name: string
  issuer: string
  date: string
  expiryDate: string
  credentialId: string
  url: string
}

export interface AwardItem {
  id: string
  title: string
  awarder: string
  date: string
  summary: string
}

export interface ActivityItem {
  id: string
  organization: string
  position: string
  location: string
  startDate: string
  endDate: string
  highlights: string[]
}

export interface PublicationItem {
  id: string
  name: string
  type: string
  publisher: string
  date: string
  url: string
}

export interface ReferenceItem {
  id: string
  name: string
  relationship: string
  organization: string
  phone: string
  email: string
}

export type SheetLayout = (typeof sheetLayouts)[number]
export type SheetFont = (typeof sheetFonts)[number]
export type SheetDensity = (typeof sheetDensities)[number]
export type SheetScale = (typeof sheetScales)[number]
export type HeaderAlign = (typeof headerAligns)[number]
export type NameRule = (typeof nameRules)[number]
export type HeadingRule = (typeof headingRules)[number]
export type KeywordStyle = (typeof keywordStyles)[number]
export type DatePlace = (typeof datePlaces)[number]
export type EntryCollection = (typeof entryCollections)[number]

export interface ResumeAppearance {
  presetId: string
  layout: SheetLayout
  accent: string
  font: SheetFont
  density: SheetDensity
  scale: SheetScale
  headerAlign: HeaderAlign
  nameRule: NameRule
  headingRule: HeadingRule
  keywordStyle: KeywordStyle
  datePlace: DatePlace
  showPhoto: boolean
  paper: string
  ink: string
}

export interface ResumeBasics {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  photo: string
  links: ResumeLink[]
}

export interface ResumeIntention {
  role: string
  industry: string
  cities: string
  workType: WorkType
}

export interface ResumeDocument {
  basics: ResumeBasics
  intention: ResumeIntention
  summary: string
  experiences: ExperienceItem[]
  projects: ProjectItem[]
  education: EducationItem[]
  skills: SkillGroup[]
  languages: LanguageItem[]
  certificates: CertificateItem[]
  awards: AwardItem[]
  activities: ActivityItem[]
  interests: string[]
  publications: PublicationItem[]
  referencesOnRequest: boolean
  references: ReferenceItem[]
  appearance: ResumeAppearance
  sectionOrder: string[]
  sectionPlacement: Record<string, 'main' | 'side'>
  customSections: CustomSection[]
}

export type EntryItem = ResumeDocument[EntryCollection][number]

export class ResumeDomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResumeDomainError'
  }
}

export const classicAppearance: ResumeAppearance = {
  presetId: 'classic-serif',
  layout: 'single',
  accent: '#1c1917',
  font: 'serif',
  density: 'normal',
  scale: 'medium',
  headerAlign: 'left',
  nameRule: 'short',
  headingRule: 'hairline',
  keywordStyle: 'chips',
  datePlace: 'end',
  showPhoto: false,
  paper: '#ffffff',
  ink: '#1c1917',
}

export function createEmptyResume(): ResumeDocument {
  return {
    basics: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      photo: '',
      links: [],
    },
    intention: { role: '', industry: '', cities: '', workType: '' },
    summary: '',
    experiences: [],
    projects: [],
    education: [],
    skills: [],
    languages: [],
    certificates: [],
    awards: [],
    activities: [],
    interests: [],
    publications: [],
    referencesOnRequest: false,
    references: [],
    appearance: { ...classicAppearance },
    sectionOrder: [...defaultSectionOrder],
    sectionPlacement: {},
    customSections: [],
  }
}

export function createEntryId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`
}
