import type { Context } from '@deepseek-ai/cordis'
import type { ResumeStore } from '../store/types.js'
import { registerResumeEditTools } from './edit/index.js'
import { registerResumeExportPdfTool } from './export/index.js'
import { registerResumeGuideTools } from './guide/index.js'
import { registerResumeTemplateTools } from './template/index.js'

const toolModules = [
  registerResumeGuideTools,
  registerResumeEditTools,
  registerResumeTemplateTools,
  registerResumeExportPdfTool,
]

/** Mount the pluggable resume tool modules. Remove one entry to drop that category. */
export function registerResumeTools(ctx: Context, store: ResumeStore): void {
  for (const register of toolModules) register(ctx, store)
}
