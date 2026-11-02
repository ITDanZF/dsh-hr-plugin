import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { resumeStoragePath } from '../../host/paths.js'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { createEmptyResume } from '../../domain/index.js'
import { renderResumePdf } from '../../pdf/render.js'
import type { ResumeStore } from '../../store/types.js'
import {
  encodeResumeToolResult,
  renderResumeToolResult,
  resumeToolResultSchema,
} from '../shared/document-schema.js'
import { requireSessionId } from '../shared/session.js'

export function registerResumeExportPdfTool(ctx: Context, store: ResumeStore): void {
  ctx.tools.register(defineTool({
    name: 'resume_export_pdf',
    description: 'Export the current session resume to a multipage PDF using the current template layout, including sidebar, top bar, header, dates, and keywords, with Chinese font support. Returns JSON with ok and path, or ok false and error. Does not change the resume.',
    parameters: {},
    output: {
      schema: resumeToolResultSchema,
      render: renderResumeToolResult,
    },
    async execute(_args, exec) {
      try {
        const sessionId = requireSessionId(exec)
        const document = (await store.get(sessionId)) ?? createEmptyResume()
        const outDir = resumeStoragePath('hr-resume', 'exports')
        await mkdir(outDir, { recursive: true })
        const safe = String(sessionId).replaceAll(/[^a-zA-Z0-9._-]/g, '_')
        const outputPath = path.join(outDir, `${safe}.pdf`)
        await renderResumePdf(document, outputPath)
        return encodeResumeToolResult({ ok: true, path: outputPath })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return encodeResumeToolResult({ ok: false, error: message })
      }
    },
  }))
}
