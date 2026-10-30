import { createEmptyResume, type ResumeCatalog, type ResumeDocument } from '../domain/index.js'
import { resumeRevision } from './revision.js'
import type { ResumeStore } from './types.js'

/** In-process store with the same catalog and first-read behavior as SQLite. */
export function createMemoryResumeStore(): ResumeStore {
  const documents = new Map<string, ResumeDocument>()
  let catalog: ResumeCatalog | undefined

  return {
    async get(sessionId) {
      const found = documents.get(sessionId)
      if (found) return found
      const created = createEmptyResume()
      documents.set(sessionId, created)
      return created
    },
    async put(sessionId, document) {
      documents.set(sessionId, document)
    },
    async compareAndPut(sessionId, expectedRevision, document) {
      const current = documents.get(sessionId) ?? createEmptyResume()
      const revision = resumeRevision(current)
      if (revision !== expectedRevision) return { ok: false, revision, document: current }
      documents.set(sessionId, document)
      return { ok: true, revision: resumeRevision(document) }
    },
    async getCatalog() {
      return catalog
    },
    async putCatalog(value) {
      catalog = value
    },
  }
}
