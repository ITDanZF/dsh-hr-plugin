import type { ResumeCatalog, ResumeDocument } from '../domain/index.js'

/** Session-scoped resume persistence plus the shared option catalog. */
export interface ResumeStore {
  get(sessionId: string): Promise<ResumeDocument | undefined>
  put(sessionId: string, document: ResumeDocument): Promise<void>
  compareAndPut(sessionId: string, expectedRevision: string, document: ResumeDocument): Promise<
    | { ok: true; revision: string }
    | { ok: false; revision: string; document: ResumeDocument }
  >
  getCatalog(): Promise<ResumeCatalog | undefined>
  putCatalog(catalog: ResumeCatalog): Promise<void>
  subscribe?(sessionId: string, listener: () => void): () => void
}

export const CATALOG_KEY = 'default'
