import { applyPreset as applyPresetDocument, setAppearance } from '../../domain/index.js'
import type { ResumeAppearance, ResumeDraft } from '../draft.js'

export function applyPreset(draft: ResumeDraft, presetId: string): ResumeDraft {
  return applyPresetDocument(draft, presetId)
}

export function customizeAppearance(
  draft: ResumeDraft,
  patch: Partial<Omit<ResumeAppearance, 'presetId'>>,
): ResumeDraft {
  return setAppearance(draft, patch)
}
