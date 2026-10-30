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

export async function loadSessionResume(sessionId: string): Promise<ResumeSnapshot> {
  const response = await fetch(`${PREVIEW_ORIGIN}/hr-resume/${encodeURIComponent(sessionId)}`)
  if (!response.ok) throw new Error('resume load failed')
  const revision = response.headers.get('ETag')
  if (!revision) throw new Error('resume revision missing')
  return { document: parseResume(await response.json()), revision }
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
