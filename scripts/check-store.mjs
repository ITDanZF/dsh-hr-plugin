import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createEmptyResume, defaultCatalog } from '../dist/domain/index.js'
import { createFileResumeStore, migrateLegacyResumeStore } from '../dist/store/file.js'
import { resumeRevision } from '../dist/store/revision.js'

const root = await mkdtemp(path.join(os.tmpdir(), 'dsh-hr-store-check-'))
assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep))
process.env.DSH_HOME = root
try {
  const storage = path.join(root, 'storages')
  await mkdir(storage, { recursive: true })
  const db = new DatabaseSync(path.join(storage, 'hr-plugin.sqlite'))
  db.exec('CREATE TABLE u_resume_documents (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  db.exec('CREATE TABLE u_resume_catalog (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  const legacy = createEmptyResume()
  legacy.summary = 'SQLite 中的最新内容'
  db.prepare('INSERT INTO u_resume_documents VALUES (?, ?)').run('session-test', JSON.stringify(legacy))
  db.prepare('INSERT INTO u_resume_catalog VALUES (?, ?)').run('default', JSON.stringify(defaultCatalog()))
  db.close()

  const mirrorDir = path.join(storage, 'hr-resume')
  await mkdir(mirrorDir)
  const stale = createEmptyResume()
  stale.summary = '旧镜像'
  await writeFile(path.join(mirrorDir, 'session-test.json'), JSON.stringify(stale))

  await migrateLegacyResumeStore()
  const store = createFileResumeStore()
  assert.equal((await store.get('session-test'))?.summary, legacy.summary)
  assert.ok(await store.getCatalog())
  const changed = { ...legacy, summary: '迁移后的新内容' }
  assert.equal((await store.compareAndPut('session-test', resumeRevision(legacy), changed)).ok, true)
  assert.equal((await store.compareAndPut('session-test', resumeRevision(legacy), legacy)).ok, false)
  await migrateLegacyResumeStore()
  assert.equal((await store.get('session-test'))?.summary, changed.summary)
  assert.equal(JSON.parse(await readFile(path.join(mirrorDir, 'session-test.json'), 'utf8')).summary, changed.summary)
  console.log('file store and one-time SQLite migration check passed')
} finally {
  await rm(root, { recursive: true, force: true })
}
