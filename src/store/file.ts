import { randomUUID } from 'node:crypto'
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createEmptyResume, parseResume, type ResumeCatalog, type ResumeDocument } from '../domain/index.js'
import { resumeMirrorPath, resumeMirrorRoot } from '../host/mirror.js'
import { resumeRevision } from './revision.js'
import { CATALOG_KEY, type ResumeStore } from './types.js'

/** Import the old domain database once, before the file store starts serving requests. */
export async function migrateLegacyResumeStore(): Promise<void> {
  const root = resumeMirrorRoot()
  const marker = path.join(root, '.file-store-v1')
  const legacy = path.join(path.dirname(root), 'hr-plugin.sqlite')
  if (await exists(marker) || !await exists(legacy)) return

  const { DatabaseSync } = await import('node:sqlite')
  const db = new DatabaseSync(legacy, { readOnly: true })
  try {
    const documents = db.prepare('SELECT key, value FROM u_resume_documents').all() as { key: string, value: string }[]
    const catalogs = db.prepare('SELECT key, value FROM u_resume_catalog').all() as { key: string, value: string }[]
    for (const row of documents) await writeJson(resumeMirrorPath(row.key), parseResume(JSON.parse(row.value)))
    const catalog = catalogs.find((row) => row.key === CATALOG_KEY)
    if (catalog) await writeJson(path.join(root, 'meta', 'catalog.json'), JSON.parse(catalog.value))
    await writeJson(marker, { migratedAt: new Date().toISOString(), documents: documents.length })
  } finally {
    db.close()
  }
}

/** Plugin-owned storage. Existing session mirrors are read in place. */
export function createFileResumeStore(): ResumeStore {
  const locks = new Map<string, Promise<void>>()
  const listeners = new Map<string, Set<() => void>>()
  const catalogPath = path.join(resumeMirrorRoot(), 'meta', 'catalog.json')
  const previousCatalogPath = path.join(resumeMirrorRoot(), 'catalog.json')

  function locked<T>(key: string, action: () => Promise<T>): Promise<T> {
    const previous = locks.get(key) ?? Promise.resolve()
    const task = previous.then(action)
    const tail = task.then(() => {}, () => {})
    locks.set(key, tail)
    void tail.then(() => { if (locks.get(key) === tail) locks.delete(key) })
    return task
  }

  async function readDocument(sessionId: string): Promise<ResumeDocument | undefined> {
    const saved = await readJson<ResumeDocument>(resumeMirrorPath(sessionId))
    return saved ? parseResume(saved) : undefined
  }

  async function persist(sessionId: string, document: ResumeDocument): Promise<void> {
    await writeJson(resumeMirrorPath(sessionId), document)
    for (const listener of listeners.get(sessionId) ?? []) {
      try { listener() } catch (error) { console.error('[dsh-hr-plugin] resume listener failed:', error) }
    }
  }

  return {
    get(sessionId) {
      return locked(sessionId, async () => {
        const found = await readDocument(sessionId)
        if (found) return found
        const created = createEmptyResume()
        await persist(sessionId, created)
        return created
      })
    },
    put(sessionId, document) {
      return locked(sessionId, () => persist(sessionId, document))
    },
    compareAndPut(sessionId, expectedRevision, document) {
      return locked(sessionId, async () => {
        const current = await readDocument(sessionId) ?? createEmptyResume()
        const revision = resumeRevision(current)
        if (revision !== expectedRevision) return { ok: false as const, revision, document: current }
        await persist(sessionId, document)
        return { ok: true as const, revision: resumeRevision(document) }
      })
    },
    getCatalog() {
      return locked('catalog', async () => await readJson<ResumeCatalog>(catalogPath) ?? await readJson<ResumeCatalog>(previousCatalogPath))
    },
    putCatalog(catalog) {
      return locked('catalog', () => writeJson(catalogPath, catalog))
    },
    subscribe(sessionId, listener) {
      const group = listeners.get(sessionId) ?? new Set<() => void>()
      group.add(listener)
      listeners.set(sessionId, group)
      return () => { group.delete(listener); if (!group.size) listeners.delete(sessionId) }
    },
  }
}

async function readJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

async function exists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  const temporary = `${filePath}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, JSON.stringify(value, null, 2), 'utf8')
    await rename(temporary, filePath)
  } finally {
    await rm(temporary, { force: true })
  }
}
