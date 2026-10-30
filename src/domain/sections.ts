import { createEntryId, defaultSectionOrder, sectionIds, type CustomField, type CustomFieldType, type CustomSection, type ResumeDocument } from './types.js'

export const sectionLabels: Record<string, string> = {
  intention: '求职意向', summary: '摘要', experience: '工作与实习', projects: '项目', education: '教育', skills: '技能',
  languages: '语言', certificates: '证书', awards: '荣誉', activities: '校园志愿', interests: '兴趣',
  publications: '发表与专利', references: '推荐人',
}

export function isKnownSection(id: string, document: ResumeDocument): boolean {
  return (sectionIds as readonly string[]).includes(id) || document.customSections.some((item) => item.id === id)
}

export function sectionHasContent(document: ResumeDocument, id: string): boolean {
  switch (id) {
    case 'intention': return Object.values(document.intention).some((value) => value.trim())
    case 'summary': return Boolean(document.summary.trim())
    case 'experience': return hasContent(document.experiences)
    case 'projects': return hasContent(document.projects)
    case 'education': return hasContent(document.education)
    case 'skills': return hasContent(document.skills)
    case 'languages': return hasContent(document.languages)
    case 'certificates': return hasContent(document.certificates)
    case 'awards': return hasContent(document.awards)
    case 'activities': return hasContent(document.activities)
    case 'interests': return document.interests.some((value) => value.trim())
    case 'publications': return hasContent(document.publications)
    case 'references': return document.referencesOnRequest || hasContent(document.references)
    default: return Boolean(document.customSections.find((item) => item.id === id)?.fields.some((field) => field.value.trim()))
  }
}

function hasContent(value: unknown): boolean {
  if (typeof value === 'string') return Boolean(value.trim())
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.some(hasContent)
  if (value && typeof value === 'object') return Object.entries(value).some(([key, item]) => key !== 'id' && hasContent(item))
  return false
}

export function legacySectionOrder(document: ResumeDocument): string[] {
  return [...defaultSectionOrder, ...sectionIds.filter((id) => !defaultSectionOrder.includes(id) && sectionHasContent(document, id))]
}

export function addSection(document: ResumeDocument, id: string): ResumeDocument {
  if (!isKnownSection(id, document)) throw new Error(`unknown section: ${id}`)
  if (document.sectionOrder.includes(id)) return document
  return { ...document, sectionOrder: [...document.sectionOrder, id] }
}

export function hideSection(document: ResumeDocument, id: string): ResumeDocument {
  if (!isKnownSection(id, document)) throw new Error(`unknown section: ${id}`)
  return { ...document, sectionOrder: document.sectionOrder.filter((value) => value !== id) }
}

export function reorderSections(document: ResumeDocument, order: string[]): ResumeDocument {
  if (order.length !== document.sectionOrder.length || new Set(order).size !== order.length || order.some((id) => !document.sectionOrder.includes(id))) {
    throw new Error('section order must include every visible section exactly once')
  }
  return { ...document, sectionOrder: [...order] }
}

export function moveSection(document: ResumeDocument, id: string, beforeId?: string): ResumeDocument {
  if (!document.sectionOrder.includes(id) || (beforeId && !document.sectionOrder.includes(beforeId))) throw new Error('section is not visible')
  const order = document.sectionOrder.filter((value) => value !== id)
  const index = beforeId ? order.indexOf(beforeId) : order.length
  order.splice(index < 0 ? order.length : index, 0, id)
  return reorderSections(document, order)
}

export function setSectionPlacement(document: ResumeDocument, id: string, placement: 'main' | 'side'): ResumeDocument {
  if (!document.sectionOrder.includes(id)) throw new Error('section is not visible')
  return { ...document, sectionPlacement: { ...document.sectionPlacement, [id]: placement } }
}

export function createCustomSection(document: ResumeDocument, title: string): ResumeDocument {
  if (!title.trim()) throw new Error('section title is required')
  const section: CustomSection = { id: createEntryId('sec'), title: title.trim(), fields: [] }
  return { ...document, customSections: [...document.customSections, section], sectionOrder: [...document.sectionOrder, section.id] }
}

export function renameCustomSection(document: ResumeDocument, id: string, title: string): ResumeDocument {
  if (!title.trim() || !document.customSections.some((item) => item.id === id)) throw new Error('invalid custom section')
  return { ...document, customSections: document.customSections.map((item) => item.id === id ? { ...item, title: title.trim() } : item) }
}

export function upsertCustomField(document: ResumeDocument, sectionId: string, input: { id?: string; label: string; type: CustomFieldType; value: string }): ResumeDocument {
  if (!input.label.trim() || !['text', 'longText', 'dateRange', 'link', 'bullets'].includes(input.type)) throw new Error('invalid custom field')
  const section = document.customSections.find((item) => item.id === sectionId)
  if (!section) throw new Error('custom section not found')
  if (input.id && !section.fields.some((item) => item.id === input.id)) throw new Error('custom field not found')
  const field: CustomField = { id: input.id || createEntryId('fld'), label: input.label, type: input.type, value: input.value }
  const fields = input.id && section.fields.some((item) => item.id === input.id)
    ? section.fields.map((item) => item.id === input.id ? field : item)
    : [...section.fields, field]
  return { ...document, customSections: document.customSections.map((item) => item.id === sectionId ? { ...item, fields } : item) }
}

export function removeCustomField(document: ResumeDocument, sectionId: string, fieldId: string): ResumeDocument {
  if (!document.customSections.some((item) => item.id === sectionId && item.fields.some((field) => field.id === fieldId))) throw new Error('custom field not found')
  return { ...document, customSections: document.customSections.map((item) => item.id === sectionId ? { ...item, fields: item.fields.filter((field) => field.id !== fieldId) } : item) }
}
