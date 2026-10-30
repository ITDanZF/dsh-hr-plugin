import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ResumeStore } from '../../store/types.js'
import { encodeResumeToolResult, renderResumeToolResult, resumeToolResultSchema } from '../shared/document-schema.js'

const output = {
  schema: resumeToolResultSchema,
  render: renderResumeToolResult,
}

function packageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
}

function skillBody(raw: string): string {
  if (!raw.startsWith('---')) return raw.trim()
  const end = raw.indexOf('\n---', 3)
  if (end < 0) return raw.trim()
  return raw.slice(end + 4).trim()
}

function fail(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return encodeResumeToolResult({ ok: false, error: message })
}

/** Registers the two document readers. Does not import edit, template, or export tools. */
export function registerResumeGuideTools(ctx: Context, _store: ResumeStore): void {
  ctx.tools.register(defineTool({
    name: 'resume_read_manual',
    description: '处理简历前优先调用。返回插件说明书。同一轮已经拿到说明书后不必重复调用。不修改简历。',
    parameters: {},
    output,
    async execute() {
      try {
        const manual = readFileSync(path.join(packageRoot(), 'src/tools/guide/manual.md'), 'utf8').trim()
        return encodeResumeToolResult({ ok: true, manual })
      } catch (error) {
        return fail(error)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'resume_read_workflow',
    description: '在 resume_read_manual 之后调用。返回简历工作流技能正文。同一轮已经拿到工作流后不必重复调用。不修改简历。',
    parameters: {},
    output,
    async execute() {
      try {
        const raw = readFileSync(path.join(packageRoot(), 'skills/resume-workflow/SKILL.md'), 'utf8')
        return encodeResumeToolResult({ ok: true, workflow: skillBody(raw) })
      } catch (error) {
        return fail(error)
      }
    },
  }))
}
