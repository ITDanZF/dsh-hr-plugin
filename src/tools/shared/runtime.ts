import type { ToolRunContext } from '@deepseek-ai/dsh-tools'
import { createEmptyResume, type ResumeDocument } from '../../domain/index.js'
import type { ResumeStore } from '../../store/types.js'
import { resumeRevision } from '../../store/revision.js'
import { mergeResumePreferLocal } from '../../client/merge.js'
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
  let currentBase = base
  let next = document
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = await store.compareAndPut(sessionId, resumeRevision(currentBase), next)
    if (result.ok) return okDocument(next)
    next = mergeResumePreferLocal(currentBase, next, result.document)
    currentBase = result.document
  }
  throw new Error('resume changed repeatedly while saving; retry the edit')
}

export function definedFields(args: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined))
}
