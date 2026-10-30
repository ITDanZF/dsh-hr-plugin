import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import {
  entryCollections,
  removeEntry,
  reorderEntries,
  setInterests,
  setProfile,
  skillLevels,
  upsertEntry,
  workTypes,
} from '../../domain/index.js'
import type { ResumeStore } from '../../store/types.js'
import { definedFields, fail, loadDocument, okDocument, resumeOutput, saveDocument } from '../shared/runtime.js'

const editsCurrentResume = 'Edits the resume shown for the current session. Returns JSON with ok and document, or ok false and error.'

/** Registers the edit-category resume tools. Does not import template or export tools. */
export function registerResumeEditTools(ctx: Context, store: ResumeStore): void {
  ctx.tools.register(defineTool({
    name: 'resume_read',
    description: 'Read the resume shown for the current session. Returns JSON with ok and document, or ok false and error.',
    parameters: {},
    output: resumeOutput,
    async execute(_args, exec) {
      try {
        const { document } = await loadDocument(store, exec)
        return okDocument(document)
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_basics',
    description: `Set name, headline, email, phone, location, or photo. Omitted fields stay unchanged. ${editsCurrentResume}`,
    parameters: {
      name: { type: 'string', description: 'Full name' },
      headline: { type: 'string', description: 'One-line headline' },
      email: { type: 'string', description: 'Email address' },
      phone: { type: 'string', description: 'Phone number' },
      location: { type: 'string', description: 'City' },
      photo: { type: 'string', description: 'Photo data URL, or empty to clear' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, setProfile(document, args))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_links',
    description: `Replace the link list. Each item may include id, network, username, and url. ${editsCurrentResume}`,
    parameters: {
      links: {
        type: 'array',
        required: true,
        items: { type: 'object', additionalProperties: true },
        description: 'Replacement links',
      },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, setProfile(document, { links: args.links }))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_intention',
    description: `Set target role, industry, cities, or work type. Work type must be a catalog value. ${editsCurrentResume}`,
    parameters: {
      role: { type: 'string', description: 'Target role' },
      industry: { type: 'string', description: 'Target industry' },
      cities: { type: 'string', description: 'Target cities' },
      workType: { type: 'string', enum: [...workTypes], description: '全职, 兼职, 实习, or empty' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, setProfile(document, args))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_summary',
    description: `Replace the professional summary. ${editsCurrentResume}`,
    parameters: {
      summary: { type: 'string', required: true, description: 'Summary text' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, setProfile(document, { summary: args.summary }))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_references_flag',
    description: `Set whether references are available on request. ${editsCurrentResume}`,
    parameters: {
      referencesOnRequest: { type: 'boolean', required: true, description: 'True when references can be provided on request' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, setProfile(document, { referencesOnRequest: args.referencesOnRequest }))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  registerUpsert(ctx, store, 'resume_upsert_experience', 'experiences', 'Create or update one experience: organization, position, location, startDate, endDate, summary, url, highlights, keywords.')
  registerUpsert(ctx, store, 'resume_upsert_project', 'projects', 'Create or update one project: name, role, entity, type, startDate, endDate, summary, highlights, keywords, url.')
  registerUpsert(ctx, store, 'resume_upsert_education', 'education', 'Create or update one education item: school, degree, area, startDate, endDate, location, studyMode, score, courses, exchange.')
  registerUpsert(ctx, store, 'resume_upsert_skill', 'skills', 'Create or update one skill group: name, level, keywords. Level must be a catalog value.')
  registerUpsert(ctx, store, 'resume_upsert_language', 'languages', 'Create or update one language: language, fluency.')
  registerUpsert(ctx, store, 'resume_upsert_certificate', 'certificates', 'Create or update one certificate: name, issuer, date, expiryDate, credentialId, url.')
  registerUpsert(ctx, store, 'resume_upsert_award', 'awards', 'Create or update one award: title, awarder, date, summary.')
  registerUpsert(ctx, store, 'resume_upsert_activity', 'activities', 'Create or update one activity: organization, position, location, startDate, endDate, highlights.')
  registerUpsert(ctx, store, 'resume_upsert_publication', 'publications', 'Create or update one publication: name, type, publisher, date, url.')
  registerUpsert(ctx, store, 'resume_upsert_reference', 'references', 'Create or update one reference: name, relationship, organization, phone, email.')

  ctx.tools.register(defineTool({
    name: 'resume_remove_entry',
    description: `Remove one entry by collection and id. ${editsCurrentResume}`,
    parameters: {
      collection: { type: 'string', required: true, enum: [...entryCollections], description: 'Entry collection' },
      id: { type: 'string', required: true, description: 'Entry id to remove' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, removeEntry(document, args.collection, args.id))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_reorder_entries',
    description: `Replace the order of one collection. ordered_ids must list every current id exactly once. ${editsCurrentResume}`,
    parameters: {
      collection: { type: 'string', required: true, enum: [...entryCollections], description: 'Entry collection' },
      ordered_ids: { type: 'array', required: true, items: { type: 'string' }, description: 'Entry ids in the desired order' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, reorderEntries(document, args.collection, args.ordered_ids))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_interests',
    description: `Replace the interest list. ${editsCurrentResume}`,
    parameters: {
      interests: { type: 'array', required: true, items: { type: 'string' }, description: 'Interest lines' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, setInterests(document, args.interests))
      } catch (error) {
        return fail(error)
      }
    },
  }))
}

function registerUpsert(ctx: Context, store: ResumeStore, name: string, collection: string, description: string): void {
  ctx.tools.register(defineTool({
    name,
    description: `${description} Include id to update an existing entry. Omitted fields stay unchanged. ${editsCurrentResume}`,
    parameters: {
      id: { type: 'string', description: 'Existing entry id. Omit to create.' },
      organization: { type: 'string', description: 'Organization' },
      position: { type: 'string', description: 'Position' },
      location: { type: 'string', description: 'Location' },
      startDate: { type: 'string', description: 'Start date' },
      endDate: { type: 'string', description: 'End date' },
      summary: { type: 'string', description: 'Summary' },
      url: { type: 'string', description: 'URL' },
      highlights: { type: 'array', items: { type: 'string' }, description: 'Highlight lines' },
      keywords: { type: 'array', items: { type: 'string' }, description: 'Keywords' },
      name: { type: 'string', description: 'Name' },
      role: { type: 'string', description: 'Role' },
      entity: { type: 'string', description: 'Entity' },
      type: { type: 'string', description: 'Type' },
      school: { type: 'string', description: 'School' },
      degree: { type: 'string', description: 'Degree' },
      area: { type: 'string', description: 'Field of study' },
      studyMode: { type: 'string', description: 'Study mode' },
      score: { type: 'string', description: 'Score' },
      courses: { type: 'array', items: { type: 'string' }, description: 'Courses' },
      exchange: { type: 'string', description: 'Exchange' },
      level: { type: 'string', enum: [...skillLevels], description: 'Skill level' },
      language: { type: 'string', description: 'Language' },
      fluency: { type: 'string', description: 'Fluency' },
      issuer: { type: 'string', description: 'Issuer' },
      date: { type: 'string', description: 'Date' },
      expiryDate: { type: 'string', description: 'Expiry date' },
      credentialId: { type: 'string', description: 'Credential id' },
      title: { type: 'string', description: 'Title' },
      awarder: { type: 'string', description: 'Awarder' },
      publisher: { type: 'string', description: 'Publisher' },
      relationship: { type: 'string', description: 'Relationship' },
      phone: { type: 'string', description: 'Phone' },
      email: { type: 'string', description: 'Email' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, upsertEntry(document, collection, definedFields(args)))
      } catch (error) {
        return fail(error)
      }
    },
  }))
}
