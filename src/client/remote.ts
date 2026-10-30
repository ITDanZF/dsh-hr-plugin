import { parseResume, type ResumeCatalog, type ResumeDocument } from '../domain/index.js'

const PREVIEW_ORIGIN = 'http://127.0.0.1:3091'

export type ResumeSnapshot = { document: ResumeDocument; revision: string }

export class ResumeConflictError extends Error {
  constructor(readonly current: ResumeSnapshot) {
    super('简历已被其他操作修改')
  }
}

export async function loadCatalog(): Promise<ResumeCatalog> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-catalog`)
  if (!response.ok) throw new Error('catalog load failed')
  return response.json() as Promise<ResumeCatalog>
}

export async function loadSessionResume(sessionId: string, knownRevision?: string): Promise<ResumeSnapshot | null> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-resume/${encodeURIComponent(sessionId)}`, {
    headers: knownRevision ? { 'If-None-Match': knownRevision } : undefined,
  })
  if (response.status === 304) return null
  if (!response.ok) throw new Error('resume load failed')
  const revision = response.headers.get('ETag')
  if (!revision) throw new Error('resume revision missing')
  return { document: parseResume(await response.json()), revision }
}

export function watchSessionResume(sessionId: string, onChange: () => void): () => void {
  const events = new EventSource(`${PREVIEW_ORIGIN}/hr-resume/${encodeURIComponent(sessionId)}/events`)
  events.onopen = onChange
  events.onmessage = onChange
  return () => events.close()
}

export async function downloadSessionResumePdf(sessionId: string): Promise<void> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-resume/${encodeURIComponent(sessionId)}/pdf`)
  if (!response.ok) throw new Error('PDF download failed')
  const url = URL.createObjectURL(await response.blob())
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = '简历.pdf'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function saveSessionResume(sessionId: string, document: ResumeDocument, revision: string): Promise<string> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-resume/${encodeURIComponent(sessionId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'If-Match': revision },
    body: JSON.stringify(document),
  })
  if (response.status === 409) {
    const currentRevision = response.headers.get('ETag')
    const body = await response.json() as { document: unknown }
    if (!currentRevision) throw new Error('resume conflict revision missing')
    throw new ResumeConflictError({ document: parseResume(body.document), revision: currentRevision })
  }
  if (!response.ok) throw new Error('resume save failed')
  const nextRevision = response.headers.get('ETag')
  if (!nextRevision) throw new Error('resume save revision missing')
  return nextRevision
}
