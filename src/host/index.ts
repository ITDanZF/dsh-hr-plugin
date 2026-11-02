import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-skill'
import type {} from '@deepseek-ai/dsh-tools'
import { defaultCatalog, installCatalog } from '../domain/index.js'
import { createFileResumeStore, migrateLegacyResumeStore } from '../store/file.js'
import { registerResumeTools } from '../tools/index.js'
import { startResumePreviewServer } from './preview-server.js'
import { registerResumeEditSkill } from './skill.js'

export const name = 'dsh-hr-plugin'
export const inject = ['tools', 'skills']

export async function apply(ctx: Context): Promise<void> {
  console.log('[dsh-hr-plugin] loaded')

  await migrateLegacyResumeStore()
  const store = createFileResumeStore()
  if (!await store.getCatalog()) await store.putCatalog(defaultCatalog())
  const catalog = await store.getCatalog()
  if (catalog) installCatalog(catalog)
  registerResumeTools(ctx, store)
  registerResumeEditSkill(ctx)
  startResumePreviewServer(ctx, store)
}
