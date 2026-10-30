import type { Context } from '@deepseek-ai/cordis'
import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import {
  applyPreset,
  datePlaces,
  headerAligns,
  headingRules,
  keywordStyles,
  nameRules,
  setAppearance,
  sheetDensities,
  sheetFonts,
  sheetLayouts,
  sheetScales,
  type ResumeAppearance,
} from '../../domain/index.js'
import type { ResumeStore } from '../../store/types.js'
import { fail, loadDocument, resumeOutput, saveDocument } from '../shared/runtime.js'

const changesPaper = 'Changes only the appearance of the current session resume. Returns JSON with ok and document, or ok false and error.'

/** Registers the template-category resume tools. Does not import edit or export tools. */
export function registerResumeTemplateTools(ctx: Context, store: ResumeStore): void {
  const apply = async (exec: ToolRunContext, patch: Partial<ResumeAppearance>) => {
    const { sessionId, document } = await loadDocument(store, exec)
    return saveDocument(store, sessionId, document, setAppearance(document, patch))
  }

  ctx.tools.register(defineTool({
    name: 'resume_apply_preset',
    description: `Apply one catalog preset id to the whole appearance. ${changesPaper}`,
    parameters: {
      presetId: { type: 'string', required: true, description: 'Preset id from the catalog, such as classic-serif or magazine' },
    },
    output: resumeOutput,
    async execute(args, exec) {
      try {
        const { sessionId, document } = await loadDocument(store, exec)
        return saveDocument(store, sessionId, document, applyPreset(document, args.presetId))
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_layout',
    description: `Set the page layout. Marks the preset as custom. ${changesPaper}`,
    parameters: { layout: { type: 'string', required: true, enum: [...sheetLayouts], description: 'single, educationFirst, or sidebar' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { layout: args.layout }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_font',
    description: `Set the typeface. Marks the preset as custom. ${changesPaper}`,
    parameters: { font: { type: 'string', required: true, enum: [...sheetFonts], description: 'serif, sans, or mono' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { font: args.font }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_density',
    description: `Set the spacing. Marks the preset as custom. ${changesPaper}`,
    parameters: { density: { type: 'string', required: true, enum: [...sheetDensities], description: 'compact, normal, or relaxed' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { density: args.density }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_scale',
    description: `Set the type size. Marks the preset as custom. ${changesPaper}`,
    parameters: { scale: { type: 'string', required: true, enum: [...sheetScales], description: 'small, medium, or large' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { scale: args.scale }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_header_align',
    description: `Set the name alignment. Marks the preset as custom. ${changesPaper}`,
    parameters: { headerAlign: { type: 'string', required: true, enum: [...headerAligns], description: 'left or center' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { headerAlign: args.headerAlign }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_name_rule',
    description: `Set the line under the name. Marks the preset as custom. ${changesPaper}`,
    parameters: { nameRule: { type: 'string', required: true, enum: [...nameRules], description: 'short or none' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { nameRule: args.nameRule }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_heading_rule',
    description: `Set the section heading rule. Marks the preset as custom. ${changesPaper}`,
    parameters: { headingRule: { type: 'string', required: true, enum: [...headingRules], description: 'hairline, accent, or none' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { headingRule: args.headingRule }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_keyword_style',
    description: `Set how keywords are shown. Marks the preset as custom. ${changesPaper}`,
    parameters: { keywordStyle: { type: 'string', required: true, enum: [...keywordStyles], description: 'chips or text' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { keywordStyle: args.keywordStyle }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_date_place',
    description: `Set where dates sit. Marks the preset as custom. ${changesPaper}`,
    parameters: { datePlace: { type: 'string', required: true, enum: [...datePlaces], description: 'end or below' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { datePlace: args.datePlace }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_show_photo',
    description: `Set whether the photo is shown. Marks the preset as custom. ${changesPaper}`,
    parameters: { showPhoto: { type: 'boolean', required: true, description: 'Whether to show the photo' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { showPhoto: args.showPhoto }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_paper',
    description: `Set the paper color from the catalog. Marks the preset as custom. ${changesPaper}`,
    parameters: { paper: { type: 'string', required: true, description: 'Paper color from the catalog' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { paper: args.paper }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_ink',
    description: `Set the ink color from the catalog. Marks the preset as custom. ${changesPaper}`,
    parameters: { ink: { type: 'string', required: true, description: 'Ink color from the catalog' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { ink: args.ink }) } catch (error) { return fail(error) }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_set_accent',
    description: `Set the accent color from the catalog. Marks the preset as custom. ${changesPaper}`,
    parameters: { accent: { type: 'string', required: true, description: 'Accent color from the catalog' } },
    output: resumeOutput,
    async execute(args, exec) {
      try { return await apply(exec, { accent: args.accent }) } catch (error) { return fail(error) }
    },
  }))
}
