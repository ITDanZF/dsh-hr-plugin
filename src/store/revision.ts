import { createHash } from 'node:crypto'
import type { ResumeDocument } from '../domain/index.js'

/** A content revision shared by the panel API and tool writes. */
export function resumeRevision(document: ResumeDocument): string {
  return `"${createHash('sha256').update(JSON.stringify(document)).digest('hex')}"`
}
