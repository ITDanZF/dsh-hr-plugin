import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-skill'
import type {} from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-tools'
import { defaultCatalog, installCatalog } from '../domain/index.js'
import { resumeDomainSpec } from '../store/domain-spec.js'
import { createSqliteResumeStore } from '../store/sqlite.js'
import { registerResumeTools } from '../tools/index.js'
import { withResumeMirror } from './mirror.js'
import { startResumePreviewServer } from './preview-server.js'
import { registerResumeEditSkill } from './skill.js'

export const name = 'dsh-hr-plugin'
export const inject = ['tools', 'storageDomain', 'skills']

export async function apply(ctx: Context): Promise<void> {
  console.log('[dsh-hr-plugin] loaded')

  const domain = await ctx.storageDomain.open(resumeDomainSpec)
  ctx.effect(() => () => {
    void domain.close()
  }, 'hr-plugin.domain')

  const store = withResumeMirror(createSqliteResumeStore(domain))
  if (!await store.getCatalog()) await store.putCatalog(defaultCatalog())
  const catalog = await store.getCatalog()
  if (catalog) installCatalog(catalog)
  registerResumeTools(ctx, store)
  registerResumeEditSkill(ctx)
  startResumePreviewServer(ctx, store)
}
