import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { createEmptyResume, type ResumeCatalog, type ResumeDocument } from '../domain/index.js'
import { resumeRevision } from '../store/revision.js'
import type { ResumeStore } from '../store/types.js'

/** Directory of session-scoped JSON mirrors for the right-hand preview. */
export function resumeMirrorRoot(): string {
  return dshHomePath('storages', 'hr-resume')
}

export function resumeMirrorPath(sessionId: string): string {
  const safe = sessionId.replaceAll(/[^a-zA-Z0-9._-]/g, '_')
  return path.join(resumeMirrorRoot(), `${safe}.json`)
}

/** Wrap a store so the first read creates an empty resume, and every save writes a JSON mirror. */
export function withResumeMirror(store: ResumeStore): ResumeStore {
  const locks = new Map<string, Promise<void>>()
  function locked<T>(sessionId: string, action: () => Promise<T>): Promise<T> {
    const previous = locks.get(sessionId) ?? Promise.resolve()
    const task = previous.then(action)
    const tail = task.then(() => {}, () => {})
    locks.set(sessionId, tail)
    void tail.then(() => {
      if (locks.get(sessionId) === tail) locks.delete(sessionId)
    })
    return task
  }
  async function persist(sessionId: string, document: ResumeDocument): Promise<void> {
    await store.put(sessionId, document)
    try {
      await writeMirror(sessionId, document)
    } catch (error) {
      console.error('[dsh-hr-plugin] resume mirror write failed:', error)
    }
  }
  return {
    async get(sessionId) {
      return locked(sessionId, async () => {
        const found = await store.get(sessionId)
        if (found) return found
        const created = createEmptyResume()
        await persist(sessionId, created)
        return created
      })
    },
    async put(sessionId, document: ResumeDocument) {
      await locked(sessionId, () => persist(sessionId, document))
    },
    async compareAndPut(sessionId, expectedRevision, document) {
      return locked(sessionId, async () => {
        const current = (await store.get(sessionId)) ?? createEmptyResume()
        const revision = resumeRevision(current)
        if (revision !== expectedRevision) return { ok: false, revision, document: current }
        await persist(sessionId, document)
        return { ok: true, revision: resumeRevision(document) }
      })
    },
    getCatalog() {
      return store.getCatalog()
    },
    putCatalog(catalog: ResumeCatalog) {
      return store.putCatalog(catalog)
    },
  }
}

async function writeMirror(sessionId: string, document: ResumeDocument): Promise<void> {
  const filePath = resumeMirrorPath(sessionId)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(document, null, 2), 'utf8')
}
