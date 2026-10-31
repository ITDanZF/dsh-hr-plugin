import { applyPreset, catalogValues } from './catalog.js'
import { addSection, isKnownSection, legacySectionOrder, sectionHasContent } from './sections.js'
import {
  createEmptyResume,
  createEntryId,
  datePlaces,
  entryCollections,
  headerAligns,
  headingRules,
  keywordStyles,
  nameRules,
  ResumeDomainError,
  sheetDensities,
  sheetFonts,
  sheetLayouts,
  sheetScales,
  skillLevels,
  workTypes,
  type ActivityItem,
  type AwardItem,
  type CertificateItem,
  type EducationItem,
  type EntryCollection,
  type ExperienceItem,
  type LanguageItem,
  type ProjectItem,
  type PublicationItem,
  type ReferenceItem,
  type ResumeAppearance,
  type ResumeDocument,
  type CustomSection,
  type ResumeLink,
  type SkillGroup,
  type SkillLevel,
  type WorkType,
} from './types.js'

export interface ProfilePatch {
  name?: string
  headline?: string
  email?: string
  phone?: string
  location?: string
  photo?: string
  links?: unknown
  role?: string
  industry?: string
  cities?: string
  workType?: WorkType
  summary?: string
  referencesOnRequest?: boolean
}

const collectionPrefix: Record<EntryCollection, string> = {
  experiences: 'exp',
  projects: 'prj',
  education: 'edu',
  skills: 'skl',
  languages: 'lng',
  certificates: 'crt',
  awards: 'awd',
  activities: 'act',
  publications: 'pub',
  references: 'ref',
}

export function setProfile(document: ResumeDocument, patch: ProfilePatch): ResumeDocument {
  const next = structuredClone(document)
  if (patch.name !== undefined) next.basics.name = requireString(patch.name, 'name')
  if (patch.headline !== undefined) next.basics.headline = requireString(patch.headline, 'headline')
  if (patch.email !== undefined) next.basics.email = requireString(patch.email, 'email')
  if (patch.phone !== undefined) next.basics.phone = requireString(patch.phone, 'phone')
  if (patch.location !== undefined) next.basics.location = requireString(patch.location, 'location')
  if (patch.photo !== undefined) next.basics.photo = requireString(patch.photo, 'photo')
  if (patch.links !== undefined) next.basics.links = normalizeLinks(patch.links)
  if (patch.role !== undefined) next.intention.role = requireString(patch.role, 'role')
  if (patch.industry !== undefined) next.intention.industry = requireString(patch.industry, 'industry')
  if (patch.cities !== undefined) next.intention.cities = requireString(patch.cities, 'cities')
  if (patch.workType !== undefined) next.intention.workType = requireListed(patch.workType, workTypes, 'workType', 'workType')
  if (patch.summary !== undefined) next.summary = requireString(patch.summary, 'summary')
  if (patch.referencesOnRequest !== undefined) {
    if (typeof patch.referencesOnRequest !== 'boolean') {
      throw new ResumeDomainError('referencesOnRequest must be a boolean')
    }
    next.referencesOnRequest = patch.referencesOnRequest
  }
  let result = next
  if ((patch.role !== undefined || patch.industry !== undefined || patch.cities !== undefined || patch.workType !== undefined)
    && sectionHasContent(result, 'intention')) result = addSection(result, 'intention')
  if (patch.summary !== undefined && sectionHasContent(result, 'summary')) result = addSection(result, 'summary')
  if (patch.referencesOnRequest !== undefined && sectionHasContent(result, 'references')) result = addSection(result, 'references')
  return result
}

export function upsertEntry(document: ResumeDocument, collection: string, raw: unknown): ResumeDocument {
  const name = requireCollection(collection)
  const record = requireRecord(raw, 'item')
  const next = structuredClone(document)
  const items = next[name] as Array<{ id: string }>
  const requested = typeof record.id === 'string' ? record.id.trim() : ''
  const index = requested ? items.findIndex((item) => item.id === requested) : -1
  const base = index >= 0 ? items[index] : undefined
  const id = requested || createEntryId(collectionPrefix[name])
  const item = normalizeEntry(name, { ...asRecord(base), ...record, id })
  if (index >= 0) items[index] = item
  else items.push(item)
  const sectionId = name === 'experiences' ? 'experience' : name
  return addSection(next, sectionId)
}

export function removeEntry(document: ResumeDocument, collection: string, id: string): ResumeDocument {
  const name = requireCollection(collection)
  if (!id.trim()) throw new ResumeDomainError('entry id is required')
  const next = structuredClone(document)
  const items = next[name] as Array<{ id: string }>
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) throw new ResumeDomainError(`entry not found: ${id}`)
  items.splice(index, 1)
  return next
}

export function reorderEntries(document: ResumeDocument, collection: string, orderedIds: string[]): ResumeDocument {
  const name = requireCollection(collection)
  const next = structuredClone(document)
  const items = next[name] as Array<{ id: string }>
  if (orderedIds.length !== items.length) {
    throw new ResumeDomainError('orderedIds must include every entry exactly once')
  }
  const byId = new Map(items.map((item) => [item.id, item]))
  const seen = new Set<string>()
  const reordered: Array<{ id: string }> = []
  for (const id of orderedIds) {
    if (seen.has(id)) throw new ResumeDomainError(`duplicate entry id in orderedIds: ${id}`)
    const item = byId.get(id)
    if (!item) throw new ResumeDomainError(`unknown entry id in orderedIds: ${id}`)
    seen.add(id)
    reordered.push(item)
  }
  ;(next as Record<EntryCollection, Array<{ id: string }>>)[name] = reordered
  return next
}

export function setInterests(document: ResumeDocument, interests: unknown): ResumeDocument {
  const next = structuredClone(document)
  next.interests = requireStringArray(interests, 'interests')
  return sectionHasContent(next, 'interests') ? addSection(next, 'interests') : next
}

export function setAppearance(document: ResumeDocument, patch: Partial<ResumeAppearance>): ResumeDocument {
  const keys = Object.keys(patch).filter((key) => patch[key as keyof ResumeAppearance] !== undefined)
  if (keys.length === 0) return structuredClone(document)
  if (keys.length === 1 && keys[0] === 'presetId') {
    return applyPreset(document, requireString(patch.presetId, 'presetId'))
  }
  let next = structuredClone(document)
  if (patch.presetId !== undefined && keys.length > 1) {
    next = applyPreset(next, requireString(patch.presetId, 'presetId'))
  }
  const appearance = next.appearance
  if (patch.layout !== undefined) appearance.layout = requireListed(patch.layout, sheetLayouts, 'layout', 'layout')
  if (patch.font !== undefined) appearance.font = requireListed(patch.font, sheetFonts, 'font', 'font')
  if (patch.density !== undefined) {
    appearance.density = requireListed(patch.density, sheetDensities, 'density', 'density')
    if (patch.pageMarginMm === undefined) appearance.pageMarginMm = appearance.density === 'compact' ? 12 : appearance.density === 'relaxed' ? 18 : 16
    if (patch.lineHeight === undefined) appearance.lineHeight = appearance.density === 'compact' ? 1.4 : appearance.density === 'relaxed' ? 1.7 : 1.55
  }
  if (patch.scale !== undefined) appearance.scale = requireListed(patch.scale, sheetScales, 'scale', 'scale')
  if (patch.headerAlign !== undefined) appearance.headerAlign = requireListed(patch.headerAlign, headerAligns, 'headerAlign', 'headerAlign')
  if (patch.nameRule !== undefined) appearance.nameRule = requireListed(patch.nameRule, nameRules, 'nameRule', 'nameRule')
  if (patch.headingRule !== undefined) appearance.headingRule = requireListed(patch.headingRule, headingRules, 'headingRule', 'headingRule')
  if (patch.keywordStyle !== undefined) appearance.keywordStyle = requireListed(patch.keywordStyle, keywordStyles, 'keywordStyle', 'keywordStyle')
  if (patch.datePlace !== undefined) appearance.datePlace = requireListed(patch.datePlace, datePlaces, 'datePlace', 'datePlace')
  if (patch.showPhoto !== undefined) {
    if (typeof patch.showPhoto !== 'boolean') throw new ResumeDomainError('showPhoto must be a boolean')
    appearance.showPhoto = patch.showPhoto
  }
  if (patch.accent !== undefined) appearance.accent = requireHexColor(patch.accent, 'accent')
  if (patch.paper !== undefined) appearance.paper = requireHexColor(patch.paper, 'paper')
  if (patch.ink !== undefined) appearance.ink = requireHexColor(patch.ink, 'ink')
  if (patch.pageMarginMm !== undefined) appearance.pageMarginMm = requireNumber(patch.pageMarginMm, 8, 26, 'pageMarginMm')
  if (patch.lineHeight !== undefined) appearance.lineHeight = requireNumber(patch.lineHeight, 1.2, 2, 'lineHeight')
  appearance.presetId = 'custom'
  return next
}

export function parseResume(input: unknown): ResumeDocument {
  const record = requireRecord(input, 'resume')
  const empty = createEmptyResume()
  const basics = requireRecord(record.basics, 'basics')
  const intention = requireRecord(record.intention, 'intention')
  const appearance = requireRecord(record.appearance, 'appearance')
  const customSections = record.customSections === undefined ? [] : readCustomSections(record.customSections)
  const parsed: ResumeDocument = {
    basics: {
      name: requireString(basics.name, 'basics.name'),
      headline: requireString(basics.headline, 'basics.headline'),
      email: requireString(basics.email, 'basics.email'),
      phone: requireString(basics.phone, 'basics.phone'),
      location: requireString(basics.location, 'basics.location'),
      photo: requireString(basics.photo, 'basics.photo'),
      links: normalizeLinks(basics.links),
    },
    intention: {
      role: requireString(intention.role, 'intention.role'),
      industry: requireString(intention.industry, 'intention.industry'),
      cities: requireString(intention.cities, 'intention.cities'),
      workType: requireEnum(intention.workType, workTypes, 'intention.workType'),
    },
    summary: requireString(record.summary, 'summary'),
    experiences: readEntries('experiences', record.experiences),
    projects: readEntries('projects', record.projects),
    education: readEntries('education', record.education),
    skills: readEntries('skills', record.skills),
    languages: readEntries('languages', record.languages),
    certificates: readEntries('certificates', record.certificates),
    awards: readEntries('awards', record.awards),
    activities: readEntries('activities', record.activities),
    interests: requireStringArray(record.interests, 'interests'),
    publications: readEntries('publications', record.publications),
    referencesOnRequest: requireBoolean(record.referencesOnRequest, 'referencesOnRequest'),
    references: readEntries('references', record.references),
    appearance: readAppearance(appearance, empty.appearance.presetId),
    sectionOrder: [],
    sectionPlacement: {},
    customSections,
  }
  const order = record.sectionOrder === undefined ? legacySectionOrder(parsed) : requireStringArray(record.sectionOrder, 'sectionOrder')
  if (new Set(order).size !== order.length || order.some((id) => !isKnownSection(id, parsed))) throw new ResumeDomainError('invalid sectionOrder')
  parsed.sectionOrder = order
  if (record.sectionPlacement !== undefined) {
    const placement = requireRecord(record.sectionPlacement, 'sectionPlacement')
    for (const [id, value] of Object.entries(placement)) {
      if (!isKnownSection(id, parsed) || (value !== 'main' && value !== 'side')) throw new ResumeDomainError('invalid sectionPlacement')
      parsed.sectionPlacement[id] = value
    }
  }
  return parsed
}

function readCustomSections(value: unknown): CustomSection[] {
  if (!Array.isArray(value)) throw new ResumeDomainError('customSections must be an array')
  const ids = new Set<string>()
  return value.map((raw, index) => {
    const section = requireRecord(raw, `customSections[${index}]`)
    const id = requireString(section.id, 'custom section id')
    const title = requireString(section.title, 'custom section title')
    if (!id.startsWith('sec_') || ids.has(id) || !title.trim() || !Array.isArray(section.fields)) throw new ResumeDomainError('invalid custom section')
    ids.add(id)
    const fieldIds = new Set<string>()
    const fields = section.fields.map((rawField) => {
      const field = requireRecord(rawField, 'custom field')
      const fieldId = requireString(field.id, 'custom field id')
      const label = requireString(field.label, 'custom field label')
      const type = requireString(field.type, 'custom field type')
      if (!fieldId || fieldIds.has(fieldId) || !label.trim() || !['text', 'longText', 'dateRange', 'link', 'bullets'].includes(type)) throw new ResumeDomainError('invalid custom field')
      fieldIds.add(fieldId)
      return { id: fieldId, label, type: type as 'text' | 'longText' | 'dateRange' | 'link' | 'bullets', value: requireString(field.value, 'custom field value') }
    })
    return { id, title, fields }
  })
}

function readEntries<C extends EntryCollection>(collection: C, value: unknown): ResumeDocument[C] {
  if (!Array.isArray(value)) throw new ResumeDomainError(`${collection} must be an array`)
  return value.map((item, index) => normalizeEntry(collection, requireRecord(item, `${collection}[${index}]`))) as ResumeDocument[C]
}

function readAppearance(record: Record<string, unknown>, fallbackPreset: string): ResumeAppearance {
  const density = requireEnum(record.density, sheetDensities, 'appearance.density')
  return {
    presetId: typeof record.presetId === 'string' && record.presetId.trim() ? record.presetId : fallbackPreset,
    layout: requireEnum(record.layout, sheetLayouts, 'appearance.layout'),
    accent: requireHexColor(record.accent, 'appearance.accent'),
    font: requireEnum(record.font, sheetFonts, 'appearance.font'),
    density,
    scale: requireEnum(record.scale, sheetScales, 'appearance.scale'),
    headerAlign: requireEnum(record.headerAlign, headerAligns, 'appearance.headerAlign'),
    nameRule: requireEnum(record.nameRule, nameRules, 'appearance.nameRule'),
    headingRule: requireEnum(record.headingRule, headingRules, 'appearance.headingRule'),
    keywordStyle: requireEnum(record.keywordStyle, keywordStyles, 'appearance.keywordStyle'),
    datePlace: requireEnum(record.datePlace, datePlaces, 'appearance.datePlace'),
    showPhoto: requireBoolean(record.showPhoto, 'appearance.showPhoto'),
    paper: requireHexColor(record.paper, 'appearance.paper'),
    ink: requireHexColor(record.ink, 'appearance.ink'),
    pageMarginMm: record.pageMarginMm === undefined ? density === 'compact' ? 12 : density === 'relaxed' ? 18 : 16 : requireNumber(record.pageMarginMm, 8, 26, 'appearance.pageMarginMm'),
    lineHeight: record.lineHeight === undefined ? density === 'compact' ? 1.4 : density === 'relaxed' ? 1.7 : 1.55 : requireNumber(record.lineHeight, 1.2, 2, 'appearance.lineHeight'),
  }
}

function normalizeEntry(collection: EntryCollection, record: Record<string, unknown>): ResumeDocument[EntryCollection][number] {
  const id = requireString(record.id, `${collection}.id`).trim()
  if (!id) throw new ResumeDomainError(`${collection}.id is required`)
  switch (collection) {
    case 'experiences':
      return {
        id,
        organization: text(record.organization),
        position: text(record.position),
        location: text(record.location),
        startDate: text(record.startDate),
        endDate: text(record.endDate),
        summary: text(record.summary),
        url: text(record.url),
        highlights: stringList(record.highlights),
        keywords: stringList(record.keywords),
      } satisfies ExperienceItem
    case 'projects':
      return {
        id,
        name: text(record.name),
        role: text(record.role),
        entity: text(record.entity),
        type: text(record.type),
        startDate: text(record.startDate),
        endDate: text(record.endDate),
        summary: text(record.summary),
        highlights: stringList(record.highlights),
        keywords: stringList(record.keywords),
        url: text(record.url),
      } satisfies ProjectItem
    case 'education':
      return {
        id,
        school: text(record.school),
        degree: text(record.degree),
        area: text(record.area),
        startDate: text(record.startDate),
        endDate: text(record.endDate),
        location: text(record.location),
        studyMode: text(record.studyMode),
        score: text(record.score),
        courses: stringList(record.courses),
        exchange: text(record.exchange),
      } satisfies EducationItem
    case 'skills':
      return {
        id,
        name: text(record.name),
        level: record.level === undefined ? '' : requireListed(record.level, skillLevels, 'skillLevel', 'skills.level'),
        keywords: stringList(record.keywords),
      } satisfies SkillGroup
    case 'languages':
      return { id, language: text(record.language), fluency: text(record.fluency) } satisfies LanguageItem
    case 'certificates':
      return {
        id,
        name: text(record.name),
        issuer: text(record.issuer),
        date: text(record.date),
        expiryDate: text(record.expiryDate),
        credentialId: text(record.credentialId),
        url: text(record.url),
      } satisfies CertificateItem
    case 'awards':
      return {
        id,
        title: text(record.title),
        awarder: text(record.awarder),
        date: text(record.date),
        summary: text(record.summary),
      } satisfies AwardItem
    case 'activities':
      return {
        id,
        organization: text(record.organization),
        position: text(record.position),
        location: text(record.location),
        startDate: text(record.startDate),
        endDate: text(record.endDate),
        highlights: stringList(record.highlights),
      } satisfies ActivityItem
    case 'publications':
      return {
        id,
        name: text(record.name),
        type: text(record.type),
        publisher: text(record.publisher),
        date: text(record.date),
        url: text(record.url),
      } satisfies PublicationItem
    case 'references':
      return {
        id,
        name: text(record.name),
        relationship: text(record.relationship),
        organization: text(record.organization),
        phone: text(record.phone),
        email: text(record.email),
      } satisfies ReferenceItem
  }
}

function normalizeLinks(value: unknown): ResumeLink[] {
  if (!Array.isArray(value)) throw new ResumeDomainError('links must be an array')
  return value.map((item, index) => {
    const record = requireRecord(item, `links[${index}]`)
    const id = typeof record.id === 'string' && record.id.trim() ? record.id.trim() : createEntryId('lnk')
    return {
      id,
      network: text(record.network),
      username: text(record.username),
      url: text(record.url),
    }
  })
}

function requireCollection(value: string): EntryCollection {
  if ((entryCollections as readonly string[]).includes(value)) return value as EntryCollection
  throw new ResumeDomainError(`unknown collection: ${value}`)
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ResumeDomainError(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new ResumeDomainError(`${label} must be a string`)
  return value
}

function requireBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw new ResumeDomainError(`${label} must be a boolean`)
  return value
}

function requireStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ResumeDomainError(`${label} must be an array of strings`)
  }
  return [...value]
}

function requireListed<T extends string>(
  value: unknown,
  allowed: readonly T[],
  group: 'workType' | 'skillLevel' | 'layout' | 'font' | 'density' | 'scale' | 'headerAlign' | 'nameRule' | 'headingRule' | 'keywordStyle' | 'datePlace',
  label: string,
): T {
  const picked = requireEnum(value, allowed, label)
  if (!catalogValues(group).includes(picked)) throw new ResumeDomainError(`${label} is not in the catalog`)
  return picked
}

function requireEnum<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T
  throw new ResumeDomainError(`${label} must be one of: ${allowed.join(', ')}`)
}

function requireHexColor(value: unknown, label: string): string {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) throw new ResumeDomainError(`${label} must be a six-digit hex color`)
  return value.toLowerCase()
}

function requireNumber(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new ResumeDomainError(`${label} must be between ${min} and ${max}`)
  }
  return value
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function stringList(value: unknown): string[] {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ResumeDomainError('list fields must be arrays of strings')
  }
  return [...value]
}
