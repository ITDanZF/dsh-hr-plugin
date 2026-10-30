import type { ResumeDocument } from '../domain/index.js'

export type MergeConflict = { path: string; local: unknown; remote: unknown }
export type MergeChoices = Record<string, 'local' | 'remote'>

function equal(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isIdList(value: unknown[]): boolean {
  return value.every((item) => isObject(item) && typeof item.id === 'string')
}

export function mergeResume(
  base: ResumeDocument,
  local: ResumeDocument,
  remote: ResumeDocument,
  choices: MergeChoices = {},
): { document: ResumeDocument; conflicts: MergeConflict[] } {
  const conflicts: MergeConflict[] = []

  function merge(path: string, oldValue: unknown, localValue: unknown, remoteValue: unknown): unknown {
    if (equal(localValue, oldValue)) return remoteValue
    if (equal(remoteValue, oldValue) || equal(localValue, remoteValue)) return localValue

    if (isObject(oldValue) && isObject(localValue) && isObject(remoteValue)) {
      const result: Record<string, unknown> = {}
      const keys = new Set([...Object.keys(oldValue), ...Object.keys(localValue), ...Object.keys(remoteValue)])
      for (const key of keys) {
        const value = merge(path ? `${path}.${key}` : key, oldValue[key], localValue[key], remoteValue[key])
        if (value !== undefined) result[key] = value
      }
      return result
    }

    if (Array.isArray(oldValue) && Array.isArray(localValue) && Array.isArray(remoteValue)
      && isIdList(oldValue) && isIdList(localValue) && isIdList(remoteValue)) {
      const oldItems = new Map(oldValue.map((item) => [(item as { id: string }).id, item]))
      const localItems = new Map(localValue.map((item) => [(item as { id: string }).id, item]))
      const remoteItems = new Map(remoteValue.map((item) => [(item as { id: string }).id, item]))
      const ids = new Set([...remoteItems.keys(), ...localItems.keys()])
      const result: unknown[] = []
      for (const id of ids) {
        const value = merge(`${path}[${id}]`, oldItems.get(id), localItems.get(id), remoteItems.get(id))
        if (value !== undefined) result.push(value)
      }
      return result
    }

    conflicts.push({ path, local: localValue, remote: remoteValue })
    return choices[path] === 'local' ? localValue : remoteValue
  }

  return { document: merge('', base, local, remote) as ResumeDocument, conflicts }
}

/** Keep the later local edit on overlapping fields while retaining unrelated remote edits. */
export function mergeResumePreferLocal(base: ResumeDocument, local: ResumeDocument, remote: ResumeDocument): ResumeDocument {
  const preview = mergeResume(base, local, remote)
  if (preview.conflicts.length === 0) return preview.document
  const choices = Object.fromEntries(preview.conflicts.map(({ path }) => [path, 'local' as const]))
  return mergeResume(base, local, remote, choices).document
}

const LABELS: Record<string, string> = {
  basics: '基本信息', name: '姓名', headline: '头衔', phone: '手机', email: '邮箱', location: '城市',
  photo: '照片', links: '个人链接', summary: '职业摘要', intention: '求职意向',
  experiences: '工作与实习', projects: '项目', education: '教育', skills: '技能',
  languages: '语言', certificates: '证书', awards: '荣誉', activities: '校园与志愿',
  interests: '兴趣', publications: '发表与专利', references: '推荐人', appearance: '模板样式',
  organization: '机构', position: '职位', highlights: '成果要点', keywords: '关键词',
  startDate: '开始日期', endDate: '结束日期', presetId: '预设', layout: '布局',
}

export function mergePathLabel(path: string): string {
  return path.split('.').map((segment) => {
    const match = /^(.*)\[([^\]]+)\]$/.exec(segment)
    return match ? `${LABELS[match[1]!] ?? match[1]}（${match[2]}）` : LABELS[segment] ?? segment
  }).join(' / ')
}

export function mergeValueLabel(value: unknown): string {
  if (value === undefined) return '已删除'
  if (value === '') return '空白'
  if (typeof value === 'string') return value.length > 100 ? `${value.slice(0, 100)}…` : value
  const text = JSON.stringify(value)
  return text.length > 100 ? `${text.slice(0, 100)}…` : text
}
