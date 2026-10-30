import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-skill'

const skillNames = ['resume-plan', 'resume-workflow', 'resume-edit', 'resume-template', 'resume-export']

/** Register the pluggable resume skills. Remove one name to leave the others installed. */
export function registerResumeEditSkill(ctx: Context): void {
  for (const name of skillNames) registerSkill(ctx, name)
}

function registerSkill(ctx: Context, name: string): void {
  const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../skills', name)
  const skillPath = path.join(skillDir, 'SKILL.md')
  const raw = readFileSync(skillPath, 'utf8')
  const { description, body } = parseSkillMarkdown(raw)

  ctx.skills.register({
    name,
    description,
    content: body,
    path: skillPath,
    resourceBase: { kind: 'directory', path: skillDir },
    source: 'bundled',
  })
}

function parseSkillMarkdown(raw: string): { description: string, body: string } {
  if (!raw.startsWith('---')) {
    return {
      description: 'Resume skill.',
      body: raw.trim(),
    }
  }
  const end = raw.indexOf('\n---', 3)
  if (end < 0) {
    return {
      description: 'Resume skill.',
      body: raw.trim(),
    }
  }
  const frontmatter = raw.slice(3, end).trim()
  const body = raw.slice(end + 4).trim()
  const descriptionMatch = /^description:\s*(.+)$/m.exec(frontmatter)
  return {
    description: descriptionMatch?.[1]?.trim() || 'Resume skill.',
    body,
  }
}
