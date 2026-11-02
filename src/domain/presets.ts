import {
  classicAppearance,
  type ResumeAppearance,
  type SheetDensity,
  type SheetScale,
} from './types.js'

export interface StylePreset extends ResumeAppearance {
  name: string
}

const presetSeeds: Array<Omit<StylePreset, 'scale' | 'headerAlign' | 'nameRule' | 'headingRule' | 'keywordStyle' | 'datePlace' | 'pageMarginMm' | 'lineHeight'>> = [
  { presetId: 'ats-simple', name: '网申单栏', layout: 'single', accent: '#20282d', font: 'sans', density: 'normal', showPhoto: false, paper: '#ffffff', ink: '#20282d' },
  { presetId: 'classic-serif', name: '经典衬线', layout: 'single', accent: '#40524b', font: 'serif', density: 'normal', showPhoto: false, paper: '#fffefa', ink: '#26332f' },
  { presetId: 'graduate', name: '应届清爽', layout: 'educationFirst', accent: '#285e89', font: 'sans', density: 'normal', showPhoto: false, paper: '#ffffff', ink: '#203142' },
  { presetId: 'sidebar-dark', name: '侧栏深色', layout: 'sidebar', accent: '#24433f', font: 'sans', density: 'normal', showPhoto: true, paper: '#fffefa', ink: '#23322f' },
  { presetId: 'mono-ink', name: '极简黑白', layout: 'single', accent: '#30383d', font: 'sans', density: 'relaxed', showPhoto: false, paper: '#ffffff', ink: '#20282d' },
  { presetId: 'magazine', name: '杂志', layout: 'single', accent: '#914d48', font: 'serif', density: 'relaxed', showPhoto: false, paper: '#fffcf7', ink: '#342824' },
  { presetId: 'tech-mono', name: '技术等宽', layout: 'single', accent: '#2d657a', font: 'mono', density: 'compact', showPhoto: false, paper: '#f9fbfb', ink: '#23343d' },
  { presetId: 'product-blue', name: '产品蓝', layout: 'single', accent: '#295d91', font: 'sans', density: 'normal', showPhoto: false, paper: '#ffffff', ink: '#1d3044' },
  { presetId: 'portfolio', name: '作品集', layout: 'sidebar', accent: '#444766', font: 'sans', density: 'normal', showPhoto: true, paper: '#fcfbff', ink: '#292d44' },
  { presetId: 'business-gray', name: '商务灰', layout: 'single', accent: '#566973', font: 'sans', density: 'normal', showPhoto: false, paper: '#ffffff', ink: '#29343b' },
  { presetId: 'academic', name: '研究简历', layout: 'educationFirst', accent: '#4d5a60', font: 'serif', density: 'compact', showPhoto: false, paper: '#fffefa', ink: '#293238' },
  { presetId: 'warm-paper', name: '暖色纸', layout: 'single', accent: '#9a5a3f', font: 'serif', density: 'normal', showPhoto: false, paper: '#fffbf4', ink: '#382c25' },
  { presetId: 'compact-page', name: '高密度', layout: 'single', accent: '#35424a', font: 'sans', density: 'compact', showPhoto: false, paper: '#ffffff', ink: '#273239' },
]

const presetDetails: Record<string, Partial<ResumeAppearance>> = {
  'ats-simple': { nameRule: 'none', headingRule: 'none', keywordStyle: 'text', pageMarginMm: 16, lineHeight: 1.55 },
  'classic-serif': { headingRule: 'none', keywordStyle: 'text', pageMarginMm: 17, lineHeight: 1.58 },
  graduate: { headingRule: 'accent', pageMarginMm: 15, lineHeight: 1.55 },
  'sidebar-dark': { headingRule: 'hairline', pageMarginMm: 16, lineHeight: 1.55 },
  'mono-ink': { nameRule: 'none', keywordStyle: 'text', pageMarginMm: 18, lineHeight: 1.7 },
  magazine: { scale: 'large', headerAlign: 'center', headingRule: 'none', keywordStyle: 'text', pageMarginMm: 19, lineHeight: 1.7 },
  'tech-mono': { nameRule: 'none', headingRule: 'accent', keywordStyle: 'text', pageMarginMm: 14, lineHeight: 1.5 },
  'product-blue': { headingRule: 'accent', pageMarginMm: 16, lineHeight: 1.55 },
  portfolio: { nameRule: 'none', headingRule: 'none', pageMarginMm: 16, lineHeight: 1.55 },
  'business-gray': { keywordStyle: 'text', pageMarginMm: 17, lineHeight: 1.58 },
  academic: { nameRule: 'none', keywordStyle: 'text', pageMarginMm: 16, lineHeight: 1.55 },
  'warm-paper': { headingRule: 'none', keywordStyle: 'text', pageMarginMm: 18, lineHeight: 1.62 },
  'compact-page': { nameRule: 'none', keywordStyle: 'text', pageMarginMm: 12, lineHeight: 1.45 },
}

function scaleFor(density: SheetDensity): SheetScale {
  if (density === 'compact') return 'small'
  if (density === 'relaxed') return 'large'
  return 'medium'
}

export const stylePresets: StylePreset[] = presetSeeds.map((preset) => ({
  ...preset,
  scale: scaleFor(preset.density),
  headerAlign: 'left',
  nameRule: 'short',
  headingRule: 'hairline',
  keywordStyle: 'chips',
  datePlace: 'end',
  pageMarginMm: preset.density === 'compact' ? 12 : preset.density === 'relaxed' ? 18 : 16,
  lineHeight: preset.density === 'compact' ? 1.4 : preset.density === 'relaxed' ? 1.7 : 1.55,
  ...presetDetails[preset.presetId],
}))

export function appearanceFromPreset(preset: StylePreset): ResumeAppearance {
  const { name: _name, ...appearance } = preset
  return appearance
}

export function classicDocumentAppearance(): ResumeAppearance {
  return { ...classicAppearance }
}
