import { parseResume, type ResumeDocument } from '../domain/index.js'

export type PendingDraft = {
  document: ResumeDocument
  base: ResumeDocument
  revision: string
}
export type OtherPendingDraft = PendingDraft & { storageKey: string }

const PREFIX = 'dsh-hr-plugin:pending:'
const TAB_KEY = 'dsh-hr-plugin:tab-id'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const fallbackTabId = crypto.randomUUID()

function tabId(): string {
  try {
    let id = sessionStorage.getItem(TAB_KEY)
    if (!id) {
      id = fallbackTabId
      sessionStorage.setItem(TAB_KEY, id)
    }
    return id
  } catch {
    return fallbackTabId
  }
}

function key(sessionId: string): string {
  return `${PREFIX}${tabId()}:${sessionId}`
}

function parsePending(raw: string): PendingDraft | undefined {
  const value = JSON.parse(raw) as Partial<PendingDraft> & { updatedAt?: number }
  if (!value.updatedAt || Date.now() - value.updatedAt > MAX_AGE_MS || !value.revision) return undefined
  return {
    document: parseResume(value.document),
    base: parseResume(value.base),
    revision: value.revision,
  }
}

export function readPendingDraft(sessionId: string): PendingDraft | undefined {
  try {
    const raw = localStorage.getItem(key(sessionId))
    if (!raw) return undefined
    const parsed = parsePending(raw)
    if (!parsed) {
      localStorage.removeItem(key(sessionId))
      return undefined
    }
    return parsed
  } catch {
    return undefined
  }
}

export function readOtherPendingDraft(sessionId: string): OtherPendingDraft | undefined {
  try {
    const ownKey = key(sessionId)
    let latest: { draft: OtherPendingDraft; updatedAt: number } | undefined
    for (let index = 0; index < localStorage.length; index += 1) {
      const candidateKey = localStorage.key(index)
      if (!candidateKey?.startsWith(PREFIX) || candidateKey === ownKey || !candidateKey.endsWith(`:${sessionId}`)) continue
      const raw = localStorage.getItem(candidateKey)
      if (!raw) continue
      try {
        const draft = parsePending(raw)
        const updatedAt = (JSON.parse(raw) as { updatedAt: number }).updatedAt
        if (draft && (!latest || updatedAt > latest.updatedAt)) latest = { draft: { ...draft, storageKey: candidateKey }, updatedAt }
      } catch {
        // Ignore damaged drafts from an earlier tab.
      }
    }
    return latest?.draft
  } catch {
    return undefined
  }
}

export function discardOtherPendingDraft(storageKey: string): void {
  if (!storageKey.startsWith(PREFIX)) return
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // Browser storage can be disabled without blocking resume editing.
  }
}

export function writePendingDraft(sessionId: string, pending: PendingDraft): boolean {
  try {
    localStorage.setItem(key(sessionId), JSON.stringify({ ...pending, updatedAt: Date.now() }))
    return true
  } catch {
    return false
  }
}

export function clearPendingDraft(sessionId: string): void {
  try {
    localStorage.removeItem(key(sessionId))
  } catch {
    // Memory-only mode remains usable when browser storage is unavailable.
  }
}

export function clearMatchingPendingDrafts(sessionId: string, document: ResumeDocument): void {
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const candidateKey = localStorage.key(index)
      if (!candidateKey?.startsWith(PREFIX) || !candidateKey.endsWith(`:${sessionId}`)) continue
      const raw = localStorage.getItem(candidateKey)
      if (!raw) continue
      try {
        if (JSON.stringify(parsePending(raw)?.document) === JSON.stringify(document)) localStorage.removeItem(candidateKey)
      } catch {
        // Ignore damaged drafts from an earlier tab.
      }
    }
  } catch {
    // Browser storage can be disabled without blocking resume editing.
  }
}
