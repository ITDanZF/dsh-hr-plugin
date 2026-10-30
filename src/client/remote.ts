import { parseResume, type ResumeCatalog, type ResumeDocument } from '../domain/index.js'

const PREVIEW_ORIGIN = 'http://127.0.0.1:3091'

export async function loadCatalog(): Promise<ResumeCatalog> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-catalog`)
  if (!response.ok) throw new Error('catalog load failed')
  return response.json() as Promise<ResumeCatalog>
}

export async function loadSessionResume(sessionId: string): Promise<ResumeDocument> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-resume/${encodeURIComponent(sessionId)}`)
  if (!response.ok) throw new Error('resume load failed')
  return parseResume(await response.json())
}

export async function saveSessionResume(sessionId: string, document: ResumeDocument): Promise<void> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-resume/${encodeURIComponent(sessionId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  })
  if (!response.ok) throw new Error('resume save failed')
}
