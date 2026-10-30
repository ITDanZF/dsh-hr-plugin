import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { addSection, createCustomSection, hideSection, removeCustomField, renameCustomSection, reorderSections, setSectionPlacement, upsertCustomField, type ResumeDocument } from '../../domain/index.js'
import type { ResumeStore } from '../../store/types.js'
import { fail, loadDocument, resumeOutput, saveDocument } from '../shared/runtime.js'

export function registerResumeSectionTools(ctx: Context, store: ResumeStore): void {
  const register = (name: string, description: string, parameters: any, change: (document: ResumeDocument, args: any) => ResumeDocument) => {
    ctx.tools.register(defineTool({ name, description, parameters, output: resumeOutput, async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, change(document, args))
      } catch (error) { return fail(error) }
    } }))
  }
  register('resume_add_section', 'Show an existing section in the resume. Hidden content is preserved.',
    { section_id: { type: 'string', required: true } }, (document, args) => addSection(document, args.section_id))
  register('resume_hide_section', 'Hide a section without deleting its content.',
    { section_id: { type: 'string', required: true } }, (document, args) => hideSection(document, args.section_id))
  register('resume_reorder_sections', 'Set final resume order. Include every visible section id exactly once.',
    { ordered_ids: { type: 'array', required: true, items: { type: 'string' } } }, (document, args) => reorderSections(document, args.ordered_ids))
  register('resume_set_section_placement', 'In sidebar layout, place a visible section in main body or sidebar.',
    { section_id: { type: 'string', required: true }, placement: { type: 'string', required: true, enum: ['main', 'side'] } },
    (document, args) => setSectionPlacement(document, args.section_id, args.placement))
  register('resume_create_custom_section', 'Create and show a custom section; read returned document for new section id.',
    { title: { type: 'string', required: true } }, (document, args) => createCustomSection(document, args.title))
  register('resume_rename_custom_section', 'Rename a custom section.',
    { section_id: { type: 'string', required: true }, title: { type: 'string', required: true } },
    (document, args) => renameCustomSection(document, args.section_id, args.title))
  register('resume_upsert_custom_field', 'Create or update a custom field. Include field_id to update. Bullets are newline-separated.',
    { section_id: { type: 'string', required: true }, field_id: { type: 'string' }, label: { type: 'string', required: true },
      field_type: { type: 'string', required: true, enum: ['text', 'longText', 'dateRange', 'link', 'bullets'] }, value: { type: 'string', required: true } },
    (document, args) => upsertCustomField(document, args.section_id, { id: args.field_id, label: args.label, type: args.field_type, value: args.value }))
  register('resume_remove_custom_field', 'Remove one field from a custom section.',
    { section_id: { type: 'string', required: true }, field_id: { type: 'string', required: true } },
    (document, args) => removeCustomField(document, args.section_id, args.field_id))
}
