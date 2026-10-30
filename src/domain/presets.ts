import {
  classicAppearance,
  type ResumeAppearance,
  type SheetDensity,
  type SheetScale,
} from './types.js'

export interface StylePreset extends ResumeAppearance {
  name: string
}

const presetSeeds: Array<Omit<StylePreset, 'scale' | 'headerAlign' | 'nameRule' | 'headingRule' | 'keywordStyle' | 'datePlace'>> = [
  { presetId: 'classic-serif', name: '经典衬线', layout: 'single', accent: '#1c1917', font: 'serif', density: 'normal', showPhoto: false, paper: '#ffffff', ink: '#1c1917' },
  { presetId: 'graduate', name: '应届清爽', layout: 'educationFirst', accent: '#1d4e89', font: 'sans', density: 'normal', showPhoto: false, paper: '#f7f9fc', ink: '#1c2430' },
  { presetId: 'sidebar-dark', name: '侧栏深色', layout: 'sidebar', accent: '#243833', font: 'sans', density: 'normal', showPhoto: true, paper: '#f7f6f3', ink: '#1c1917' },
  { presetId: 'mono-ink', name: '极简黑白', layout: 'single', accent: '#111111', font: 'sans', density: 'relaxed', showPhoto: false, paper: '#ffffff', ink: '#111111' },
  { presetId: 'magazine', name: '杂志', layout: 'single', accent: '#7a3040', font: 'serif', density: 'relaxed', showPhoto: false, paper: '#faf6f0', ink: '#2a211c' },
  { presetId: 'tech-mono', name: '技术等宽', layout: 'single', accent: '#2457c5', font: 'mono', density: 'compact', showPhoto: false, paper: '#f4f6f8', ink: '#1a1d24' },
  { presetId: 'product-blue', name: '产品蓝', layout: 'single', accent: '#1d4e89', font: 'sans', density: 'normal', showPhoto: false, paper: '#ffffff', ink: '#172033' },
  { presetId: 'portfolio', name: '作品集', layout: 'sidebar', accent: '#3d348b', font: 'sans', density: 'normal', showPhoto: true, paper: '#fbfbfe', ink: '#1c1730' },
  { presetId: 'business-gray', name: '商务灰', layout: 'single', accent: '#5c6b7a', font: 'sans', density: 'normal', showPhoto: false, paper: '#f3f4f6', ink: '#1f242b' },
  { presetId: 'academic', name: '学术细线', layout: 'educationFirst', accent: '#1c1917', font: 'serif', density: 'compact', showPhoto: false, paper: '#fffefb', ink: '#1c1917' },
  { presetId: 'warm-paper', name: '暖色纸', layout: 'single', accent: '#8a4b2f', font: 'serif', density: 'normal', showPhoto: false, paper: '#f6efe6', ink: '#3a2418' },
  { presetId: 'compact-page', name: '紧凑一页', layout: 'single', accent: '#1c1917', font: 'sans', density: 'compact', showPhoto: false, paper: '#ffffff', ink: '#1c1917' },
]

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
}))

export function appearanceFromPreset(preset: StylePreset): ResumeAppearance {
  const { name: _name, ...appearance } = preset
  return appearance
}

export function classicDocumentAppearance(): ResumeAppearance {
  return { ...classicAppearance }
}
