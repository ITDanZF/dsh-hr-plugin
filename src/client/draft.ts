/** Form helpers for the resume document owned by the domain. */

export type { ResumeDocument as ResumeDraft } from '../domain/index.js'
export type {
  ActivityItem,
  AwardItem,
  CertificateItem,
  DatePlace,
  EducationItem,
  ExperienceItem,
  HeaderAlign,
  HeadingRule,
  KeywordStyle,
  LanguageItem,
  NameRule,
  ProjectItem,
  PublicationItem,
  ReferenceItem,
  ResumeAppearance,
  ResumeLink,
  SheetDensity,
  SheetFont,
  SheetLayout,
  SheetScale,
  SkillGroup,
  SkillLevel,
  WorkType,
} from '../domain/index.js'

import type { ResumeDocument as ResumeDraft } from '../domain/index.js'
import type {
  ActivityItem,
  AwardItem,
  CertificateItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  PublicationItem,
  ReferenceItem,
  ResumeDocument,
  ResumeLink,
  SkillGroup,
  SkillLevel,
  WorkType,
} from '../domain/index.js'

let idSerial = 0

export function newId(prefix: string): string {
  idSerial += 1
  return `${prefix}_${idSerial.toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function updateById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id)
}

export function textToTokens(text: string): string[] {
  if (!text) return []
  return text.split(/[、,，]/).map((part) => part.trim())
}

export function tokensToText(tokens: string[]): string {
  return tokens.join('、')
}

export function visibleTokens(tokens: string[]): string[] {
  return tokens.map((token) => token.trim()).filter(Boolean)
}

export function linesToList(text: string): string[] {
  if (!text) return []
  return text.replace(/\r\n/g, '\n').split('\n')
}

export function listToLines(lines: string[]): string {
  return lines.join('\n')
}

export function visibleLines(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter(Boolean)
}

export function showDate(value: string): string {
  return value.trim().replaceAll('-', '.')
}

export function period(startDate: string, endDate: string): string {
  const start = showDate(startDate)
  const end = showDate(endDate)
  if (!start && !end) return ''
  if (start && !end) return `${start} – 至今`
  if (!start) return end
  return `${start} – ${end}`
}

export function filled(...values: Array<string | undefined>): boolean {
  return values.some((value) => Boolean(value?.trim()))
}

export function emptyLink(): ResumeLink {
  return { id: newId('link'), network: '', username: '', url: '' }
}

export function emptyExperience(): ExperienceItem {
  return {
    id: newId('exp'),
    organization: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    summary: '',
    url: '',
    highlights: [],
    keywords: [],
  }
}

export function emptyProject(): ProjectItem {
  return {
    id: newId('proj'),
    name: '',
    role: '',
    entity: '',
    type: '',
    startDate: '',
    endDate: '',
    summary: '',
    highlights: [],
    keywords: [],
    url: '',
  }
}

export function emptyEducation(): EducationItem {
  return {
    id: newId('edu'),
    school: '',
    degree: '',
    area: '',
    startDate: '',
    endDate: '',
    location: '',
    studyMode: '',
    score: '',
    courses: [],
    exchange: '',
  }
}

export function emptySkill(): SkillGroup {
  return { id: newId('skill'), name: '', level: '', keywords: [] }
}

export function emptyLanguage(): LanguageItem {
  return { id: newId('lang'), language: '', fluency: '' }
}

export function emptyCertificate(): CertificateItem {
  return { id: newId('cert'), name: '', issuer: '', date: '', expiryDate: '', credentialId: '', url: '' }
}

export function emptyAward(): AwardItem {
  return { id: newId('award'), title: '', awarder: '', date: '', summary: '' }
}

export function emptyActivity(): ActivityItem {
  return {
    id: newId('act'),
    organization: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    highlights: [],
  }
}

export function emptyPublication(): PublicationItem {
  return { id: newId('pub'), name: '', type: '', publisher: '', date: '', url: '' }
}

export function emptyReference(): ReferenceItem {
  return { id: newId('ref'), name: '', relationship: '', organization: '', phone: '', email: '' }
}

export function createSampleDraft(): ResumeDraft {
  return {
    basics: {
      name: '陈予安',
      headline: '产品经理',
      email: 'chenyuan@example.com',
      phone: '13800001234',
      location: '杭州',
      photo: '',
      links: [
        { id: 'link_site', network: '作品集', username: 'chenyuan', url: 'https://example.com/chenyuan' },
        { id: 'link_github', network: 'GitHub', username: 'chenyuan', url: 'https://github.com/chenyuan' },
      ],
    },
    intention: {
      role: '产品经理',
      industry: '互联网',
      cities: '杭州、上海',
      workType: '全职',
    },
    summary: '4 年 B 端产品经验，负责过审批与数据看板。擅长把一线操作步骤收成可上线的流程，并用上线后的完成率验证改动。',
    experiences: [
      {
        id: 'exp_1',
        organization: '星澜科技',
        position: '产品经理',
        location: '杭州',
        startDate: '2022-03',
        endDate: '',
        summary: '负责企业内部审批与报表产品。',
        url: '',
        highlights: [
          '重做采购审批，把平均处理时长从 2.4 天降到 1.1 天',
          '为 6 个业务线统一看板口径，月活审核人提升 18%',
        ],
        keywords: ['B 端', '审批', '数据看板'],
      },
    ],
    projects: [
      {
        id: 'proj_1',
        name: '审批流改版',
        role: '产品负责人',
        entity: '星澜科技',
        type: '商业项目',
        startDate: '2023-06',
        endDate: '2024-01',
        summary: '替换旧的邮件审批，让移动端可以补件和转签。',
        highlights: ['访谈 14 名审批人，把 9 步流程收成 4 步', '上线后补件往返次数下降 37%'],
        keywords: ['流程', '移动端'],
        url: '',
      },
    ],
    education: [
      {
        id: 'edu_1',
        school: '浙江大学',
        degree: '本科',
        area: '工业设计',
        startDate: '2016-09',
        endDate: '2020-06',
        location: '杭州',
        studyMode: '全日制',
        score: '',
        courses: [],
        exchange: '',
      },
    ],
    skills: [
      { id: 'skill_1', name: '产品工具', level: '熟练', keywords: ['Figma', 'Axure', '流程绘图'] },
      { id: 'skill_2', name: '数据分析', level: '了解', keywords: ['SQL', '指标口径'] },
    ],
    languages: [{ id: 'lang_1', language: '英语', fluency: '雅思 7.0' }],
    certificates: [
      { id: 'cert_1', name: 'PMP', issuer: 'PMI', date: '2023-05', expiryDate: '2026-05', credentialId: '', url: '' },
    ],
    awards: [
      { id: 'award_1', title: '年度项目奖', awarder: '星澜科技', date: '2024-12', summary: '审批流改版，部门 2 个名额' },
    ],
    activities: [
      {
        id: 'act_1',
        organization: '浙江大学工业设计系学生会',
        position: '活动负责人',
        location: '杭州',
        startDate: '2018-09',
        endDate: '2019-06',
        highlights: ['组织 3 场专业展，单场到场约 200 人'],
      },
    ],
    interests: ['持续拆解 B 端后台的任务流'],
    publications: [],
    referencesOnRequest: true,
    references: [],
    sectionOrder: ['summary', 'intention', 'experience', 'projects', 'education', 'skills', 'languages', 'certificates', 'awards', 'activities', 'interests', 'references'],
    sectionPlacement: {},
    customSections: [],
    appearance: {
      presetId: 'classic-serif',
      layout: 'single',
      accent: '#1c1917',
      font: 'serif',
      density: 'normal',
      scale: 'medium',
      headerAlign: 'left',
      nameRule: 'short',
      headingRule: 'hairline',
      keywordStyle: 'chips',
      datePlace: 'end',
      showPhoto: false,
      paper: '#ffffff',
      ink: '#1c1917',
      pageMarginMm: 16,
      lineHeight: 1.55,
    },
  }
}
