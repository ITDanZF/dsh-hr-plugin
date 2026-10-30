import { appearanceFromPreset, stylePresets, type StylePreset } from './presets.js'
import {
  accentValues,
  datePlaces,
  headerAligns,
  headingRules,
  inkValues,
  keywordStyles,
  nameRules,
  paperValues,
  ResumeDomainError,
  sheetDensities,
  sheetFonts,
  sheetLayouts,
  sheetScales,
  skillLevels,
  workTypes,
  type ResumeDocument,
} from './types.js'

export interface CatalogOption {
  id: string
  value: string
  label: string
}

export interface ResumeCatalog {
  workType: CatalogOption[]
  skillLevel: CatalogOption[]
  layout: CatalogOption[]
  font: CatalogOption[]
  density: CatalogOption[]
  scale: CatalogOption[]
  headerAlign: CatalogOption[]
  nameRule: CatalogOption[]
  headingRule: CatalogOption[]
  keywordStyle: CatalogOption[]
  datePlace: CatalogOption[]
  accent: CatalogOption[]
  paper: CatalogOption[]
  ink: CatalogOption[]
  presets: StylePreset[]
}

const workTypeOptions = [
  { id: 'unset', value: workTypes[0], label: '未选' },
  { id: 'fulltime', value: workTypes[1], label: '全职' },
  { id: 'parttime', value: workTypes[2], label: '兼职' },
  { id: 'intern', value: workTypes[3], label: '实习' },
] as const

const skillLevelOptions = [
  { id: 'unset', value: skillLevels[0], label: '未选' },
  { id: 'expert', value: skillLevels[1], label: '精通' },
  { id: 'proficient', value: skillLevels[2], label: '熟练' },
  { id: 'familiar', value: skillLevels[3], label: '了解' },
] as const

const layoutOptions = [
  { id: 'single', value: sheetLayouts[0], label: '单栏' },
  { id: 'educationFirst', value: sheetLayouts[1], label: '教育优先' },
  { id: 'sidebar', value: sheetLayouts[2], label: '侧栏' },
] as const

const fontOptions = [
  { id: 'serif', value: sheetFonts[0], label: '衬线' },
  { id: 'sans', value: sheetFonts[1], label: '黑体' },
  { id: 'mono', value: sheetFonts[2], label: '等宽' },
] as const

const densityOptions = [
  { id: 'compact', value: sheetDensities[0], label: '紧凑' },
  { id: 'normal', value: sheetDensities[1], label: '标准' },
  { id: 'relaxed', value: sheetDensities[2], label: '舒展' },
] as const

const scaleOptions = [
  { id: 'small', value: sheetScales[0], label: '小' },
  { id: 'medium', value: sheetScales[1], label: '中' },
  { id: 'large', value: sheetScales[2], label: '大' },
] as const

const alignOptions = [
  { id: 'left', value: headerAligns[0], label: '靠左' },
  { id: 'center', value: headerAligns[1], label: '居中' },
] as const

const nameRuleOptions = [
  { id: 'short', value: nameRules[0], label: '短线' },
  { id: 'none', value: nameRules[1], label: '不显示' },
] as const

const headingRuleOptions = [
  { id: 'hairline', value: headingRules[0], label: '发丝线' },
  { id: 'accent', value: headingRules[1], label: '强调色' },
  { id: 'none', value: headingRules[2], label: '无' },
] as const

const keywordOptions = [
  { id: 'chips', value: keywordStyles[0], label: '小标签' },
  { id: 'text', value: keywordStyles[1], label: '一行文字' },
] as const

const dateOptions = [
  { id: 'end', value: datePlaces[0], label: '靠右' },
  { id: 'below', value: datePlaces[1], label: '标题下方' },
] as const

const accentOptions = [
  { id: 'ink', value: accentValues[0], label: '墨色' },
  { id: 'blue', value: accentValues[1], label: '蓝色' },
  { id: 'green', value: accentValues[2], label: '绿色' },
  { id: 'warm', value: accentValues[3], label: '暖棕' },
  { id: 'slate', value: accentValues[4], label: '灰蓝' },
  { id: 'violet', value: accentValues[5], label: '紫色' },
] as const

const paperOptions = [
  { id: 'white', value: paperValues[0], label: '白' },
  { id: 'cool', value: paperValues[1], label: '冷灰' },
  { id: 'cream', value: paperValues[2], label: '浅米' },
  { id: 'warm', value: paperValues[3], label: '暖米' },
  { id: 'mist', value: paperValues[4], label: '雾蓝' },
] as const

const inkOptions = [
  { id: 'ink', value: inkValues[0], label: '墨' },
  { id: 'char', value: inkValues[1], label: '炭' },
  { id: 'brown', value: inkValues[2], label: '棕' },
  { id: 'navy', value: inkValues[3], label: '蓝灰' },
] as const

function listed(options: readonly CatalogOption[]): CatalogOption[] {
  return options.map((item) => ({ id: item.id, value: item.value, label: item.label }))
}

export function defaultCatalog(): ResumeCatalog {
  return {
    workType: listed(workTypeOptions),
    skillLevel: listed(skillLevelOptions),
    layout: listed(layoutOptions),
    font: listed(fontOptions),
    density: listed(densityOptions),
    scale: listed(scaleOptions),
    headerAlign: listed(alignOptions),
    nameRule: listed(nameRuleOptions),
    headingRule: listed(headingRuleOptions),
    keywordStyle: listed(keywordOptions),
    datePlace: listed(dateOptions),
    accent: listed(accentOptions),
    paper: listed(paperOptions),
    ink: listed(inkOptions),
    presets: structuredClone(stylePresets),
  }
}

let active = defaultCatalog()

export function installCatalog(catalog: ResumeCatalog): void {
  active = catalog
}

export function activeCatalog(): ResumeCatalog {
  return active
}

export function catalogValues(group: Exclude<keyof ResumeCatalog, 'presets'>): string[] {
  return active[group].map((item) => item.value)
}

export function applyPreset(document: ResumeDocument, presetId: string): ResumeDocument {
  const preset = active.presets.find((item) => item.presetId === presetId)
  if (!preset) throw new ResumeDomainError(`unknown preset: ${presetId}`)
  const next = structuredClone(document)
  next.appearance = appearanceFromPreset(preset)
  return next
}
