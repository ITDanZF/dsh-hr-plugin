import type { ToolRunContext } from '@deepseek-ai/dsh-tools'
import { createEmptyResume, type ResumeDocument } from '../../domain/index.js'
import type { ResumeStore } from '../../store/types.js'
import { resumeRevision } from '../../store/revision.js'
import {
  encodeResumeToolResult,
  renderResumeToolResult,
  resumeToolResultSchema,
} from './document-schema.js'
import { requireSessionId } from './session.js'

export const resumeOutput = {
  schema: resumeToolResultSchema,
  render: renderResumeToolResult,
}

export function fail(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return encodeResumeToolResult({ ok: false, error: message })
}

export function okDocument(document: ResumeDocument): string {
  return encodeResumeToolResult({ ok: true, document })
}

export async function loadDocument(store: ResumeStore, exec: ToolRunContext): Promise<{ sessionId: string, document: ResumeDocument }> {
  const sessionId = requireSessionId(exec)
  const document = (await store.get(sessionId)) ?? createEmptyResume()
  return { sessionId, document }
}

export async function saveDocument(store: ResumeStore, sessionId: string, base: ResumeDocument, document: ResumeDocument): Promise<string> {
  const result = await store.compareAndPut(sessionId, resumeRevision(base), document)
  if (!result.ok) throw new Error('resume changed since it was read; read the latest document and retry the edit')
  return okDocument(document)
}

export function definedFields(args: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined))
}
