import type { Domain } from '@deepseek-ai/dsh-storage-domain'
import type { ResumeCatalog, ResumeDocument } from '../domain/index.js'
import type { resumeDomainSpec } from './domain-spec.js'
import { CATALOG_KEY, type ResumeStore } from './types.js'
import { resumeRevision } from './revision.js'

type ResumeDomain = Domain<typeof resumeDomainSpec>

/** ResumeStore backed by an already-opened `resume` storage domain. */
export function createSqliteResumeStore(domain: ResumeDomain): ResumeStore {
  const documents = domain.table('documents')
  const catalog = domain.table('catalog')

  return {
    async get(sessionId) {
      return documents.get(sessionId) as ResumeDocument | undefined
    },
    async put(sessionId, document) {
      await documents.put(sessionId, document)
    },
    async compareAndPut(sessionId, expectedRevision, document) {
      const current = await documents.get(sessionId) as ResumeDocument | undefined
      if (!current) throw new Error('resume must be read before it is saved')
      const revision = resumeRevision(current)
      if (revision !== expectedRevision) return { ok: false, revision, document: current }
      await documents.put(sessionId, document)
      return { ok: true, revision: resumeRevision(document) }
    },
    async getCatalog() {
      return catalog.get(CATALOG_KEY) as ResumeCatalog | undefined
    },
    async putCatalog(value) {
      await catalog.put(CATALOG_KEY, value)
    },
  }
}
