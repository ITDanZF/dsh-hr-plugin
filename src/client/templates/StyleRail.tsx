import { Switch } from 'antd'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { appearanceFromPreset, sectionLabels, setSectionPlacement, type ResumeCatalog } from '../../domain/index.js'
import type {
  DatePlace, HeaderAlign, HeadingRule, KeywordStyle, NameRule, ResumeAppearance,
  ResumeDraft, SheetDensity, SheetFont, SheetLayout, SheetScale,
} from '../draft.js'
import { applyPreset, customizeAppearance } from './appearance.js'
import { createSampleDraft } from '../draft.js'
import { renderTemplate } from './registry.js'

type Group = 'presets' | 'layout' | 'colors' | 'type' | 'details'
const groups: { id: Group; label: string }[] = [
  { id: 'presets', label: '预设' }, { id: 'layout', label: '版式' },
  { id: 'colors', label: '配色' }, { id: 'type', label: '排版' }, { id: 'details', label: '细节' },
]

const presetFamilies = [
  { title: '网申单栏', ids: ['ats-simple', 'mono-ink', 'compact-page'], use: '在线申请 · 清晰易读' },
  { title: '现代专业', ids: ['graduate', 'product-blue', 'business-gray', 'tech-mono'], use: '产品 · 技术 · 商务' },
  { title: '经典衬线', ids: ['classic-serif', 'academic'], use: '传统行业 · 研究岗位' },
  { title: '编辑排版', ids: ['magazine', 'warm-paper'], use: '内容 · 品牌 · 策略' },
  { title: '侧栏作品集', ids: ['sidebar-dark', 'portfolio'], use: '直接分享 · 面试展示' },
]

const thumbnailSource = (() => {
  const sample = createSampleDraft()
  sample.sectionOrder = ['summary', 'experience', 'projects', 'skills']
  sample.experiences[0]!.highlights = sample.experiences[0]!.highlights.slice(0, 1)
  sample.projects[0]!.highlights = []
  return sample
})()

function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string): number => {
    const channel = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    return channel[0]! * 0.2126 + channel[1]! * 0.7152 + channel[2]! * 0.0722
  }
  if (!/^#[0-9a-f]{6}$/i.test(first) || !/^#[0-9a-f]{6}$/i.test(second)) return 0
  const values = [luminance(first), luminance(second)]
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05)
}

export function StyleRail({ draft, catalog, onChange, autoSave, hidden, onCollapse }: {
  draft: ResumeDraft
  catalog: ResumeCatalog
  onChange: (draft: ResumeDraft) => void
  autoSave: boolean
  hidden: boolean
  onCollapse: () => void
}): ReactNode {
  const [group, setGroup] = useState<Group>('presets')
  const controlsRef = useRef<HTMLDivElement>(null)
  useEffect(() => { controlsRef.current?.scrollTo({ top: 0 }) }, [group])
  const look = draft.appearance
  const set = (patch: Partial<Omit<ResumeAppearance, 'presetId'>>) => {
    if (Object.entries(patch).every(([key, value]) => look[key as keyof ResumeAppearance] === value)) return
    onChange(customizeAppearance(draft, patch))
  }
  const chosen = catalog.presets.find((item) => item.presetId === look.presetId)
  const groupedIds = new Set(presetFamilies.flatMap((family) => family.ids))
  const otherIds = catalog.presets.filter((preset) => !groupedIds.has(preset.presetId)).map((preset) => preset.presetId)
  const displayedFamilies = otherIds.length ? [...presetFamilies, { title: '其他样式', ids: otherIds, use: '更多预设' }] : presetFamilies
  const contrastWarnings = [
    contrastRatio(look.ink, look.paper) < 4.5 ? '正文和纸色对比不足' : '',
    contrastRatio(look.accent, look.paper) < 4.5 ? '标题和纸色对比不足' : '',
    look.layout === 'sidebar' && contrastRatio('#ffffff', look.accent) < 4.5 ? '侧栏白字对比不足' : '',
  ].filter(Boolean)

  return (
    <aside className="template-rail" aria-label="模板设置" hidden={hidden}>
      <div className="template-rail-head">
        <div><strong>模板工作台</strong><span>{chosen ? chosen.name : '自定义样式'} · {autoSave ? '修改后自动保存' : '示例预览，不会保存'}</span></div>
        <button className="rail-collapse" type="button" onClick={onCollapse} aria-label="收起模板设置" title="收起模板设置">‹</button>
      </div>
      <div className="template-tabs" role="tablist" aria-label="模板设置分类" onKeyDown={(event) => {
        const current = groups.findIndex((item) => item.id === group)
        const next = event.key === 'ArrowRight' ? (current + 1) % groups.length
          : event.key === 'ArrowLeft' ? (current - 1 + groups.length) % groups.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? groups.length - 1 : -1
        if (next < 0) return
        event.preventDefault()
        setGroup(groups[next]!.id)
        event.currentTarget.querySelectorAll('button')[next]?.focus()
      }}>
        {groups.map((item) => <button key={item.id} id={`template-tab-${item.id}`} type="button" role="tab" tabIndex={group === item.id ? 0 : -1} aria-controls="template-controls" aria-selected={group === item.id} onClick={() => setGroup(item.id)}>{item.label}</button>)}
      </div>
      <div id="template-controls" className="template-controls" role="tabpanel" aria-labelledby={`template-tab-${group}`} ref={controlsRef}>
        {group === 'presets' ? <>
          <p className="template-help">选择预设会替换当前纸面样式，简历内容和模块顺序会保留。</p>
          {displayedFamilies.map((family) => <div className="preset-family" key={family.title}>
            <div className="preset-family-head"><strong>{family.title}</strong><span>{family.use}</span></div>
            <div className="preset-grid">
              {family.ids.map((id) => catalog.presets.find((preset) => preset.presetId === id)).filter((preset) => preset !== undefined).map((preset) => <button key={preset.presetId} type="button" className={look.presetId === preset.presetId ? 'preset-card is-selected' : 'preset-card'} aria-pressed={look.presetId === preset.presetId} onClick={() => onChange(applyPreset(draft, preset.presetId))}>
                <span className="preset-thumbnail" aria-hidden="true"><span className="preset-thumbnail-sheet">{renderTemplate({ ...thumbnailSource, appearance: appearanceFromPreset(preset) })}</span></span>
                <span className="preset-card-copy"><strong>{preset.name}</strong><small>{preset.layout === 'sidebar' ? '双栏 · 彩色侧栏' : preset.font === 'serif' ? '单栏 · 衬线字体' : preset.density === 'compact' ? '单栏 · 紧凑排版' : '单栏 · 清晰排版'}</small></span>
              </button>)}
            </div>
          </div>)}
        </> : null}
        {group === 'layout' ? <>
          <Field label="页面结构"><div className="layout-pick">{catalog.layout.map((choice) => <button key={choice.id} type="button" className={look.layout === choice.value ? 'is-selected' : undefined} aria-pressed={look.layout === choice.value} onClick={() => set({ layout: choice.value as SheetLayout })}><span className={`layout-glyph layout-${choice.value}`} />{choice.label}</button>)}</div></Field>
          <Field label="姓名对齐"><Choices value={look.headerAlign} options={catalog.headerAlign} onChange={(headerAlign) => set({ headerAlign: headerAlign as HeaderAlign })} /></Field>
          {look.layout === 'sidebar' ? <Field label="模块所在栏"><div className="placement-list">{draft.sectionOrder.map((id) => {
            const place = draft.sectionPlacement[id] ?? (['skills', 'languages', 'interests'].includes(id) ? 'side' : 'main')
            return <div key={id}><span>{sectionLabels[id] ?? draft.customSections.find((item) => item.id === id)?.title ?? id}</span><button type="button" aria-label={`${sectionLabels[id] ?? id}放在${place === 'side' ? '正文' : '侧栏'}`} onClick={() => onChange(setSectionPlacement(draft, id, place === 'side' ? 'main' : 'side'))}>{place === 'side' ? '侧栏' : '正文'}</button></div>
          })}</div></Field> : null}
        </> : null}
        {group === 'colors' ? <>
          <p className="template-help">可选推荐颜色，也可点击色块自定颜色。</p>
          <Field label="纸色"><Colors value={look.paper} options={catalog.paper} onChange={(paper) => set({ paper })} /></Field>
          <Field label="文字颜色"><Colors value={look.ink} options={catalog.ink} onChange={(ink) => set({ ink })} /></Field>
          <Field label="强调色"><Colors value={look.accent} options={catalog.accent} onChange={(accent) => set({ accent })} /></Field>
          {contrastWarnings.length ? <p className="rail-contrast-warning" role="status">{contrastWarnings.join('；')}。建议调整到至少 4.5:1。</p> : null}
        </> : null}
        {group === 'type' ? <>
          <Field label="字体"><Choices value={look.font} options={catalog.font} onChange={(font) => set({ font: font as SheetFont })} /></Field>
          <Field label="字号"><Choices value={look.scale} options={catalog.scale} onChange={(scale) => set({ scale: scale as SheetScale })} /></Field>
          <Field label="疏密"><Choices value={look.density} options={catalog.density} onChange={(density) => set({ density: density as SheetDensity })} /></Field>
          <Range label="页边距" value={look.pageMarginMm} min={8} max={26} step={1} unit="mm" onChange={(pageMarginMm) => set({ pageMarginMm })} />
          <Range label="正文行高" value={look.lineHeight} min={1.2} max={2} step={0.05} unit="×" onChange={(lineHeight) => set({ lineHeight })} />
        </> : null}
        {group === 'details' ? <>
          <label className="photo-switch">显示照片<Switch size="small" checked={look.showPhoto} onChange={(showPhoto) => set({ showPhoto })} /></label>
          <Field label="姓名下划线"><Choices value={look.nameRule} options={catalog.nameRule} onChange={(nameRule) => set({ nameRule: nameRule as NameRule })} /></Field>
          <Field label="模块标题线"><Choices value={look.headingRule} options={catalog.headingRule} onChange={(headingRule) => set({ headingRule: headingRule as HeadingRule })} /></Field>
          <Field label="关键词"><Choices value={look.keywordStyle} options={catalog.keywordStyle} onChange={(keywordStyle) => set({ keywordStyle: keywordStyle as KeywordStyle })} /></Field>
          <Field label="日期位置"><Choices value={look.datePlace} options={catalog.datePlace} onChange={(datePlace) => set({ datePlace: datePlace as DatePlace })} /></Field>
        </> : null}
      </div>
    </aside>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }): ReactNode {
  return <div className="rail-field"><span>{label}</span>{children}</div>
}

function Choices({ value, options, onChange }: {
  value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void
}): ReactNode {
  return <div className="choice-row">{options.map((option) => <button key={option.value} type="button" className={value === option.value ? 'is-selected' : undefined} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>
}

function Colors({ value, options, onChange }: {
  value: string; options: readonly { id: string; label: string; value: string }[]; onChange: (value: string) => void
}): ReactNode {
  return <div className="color-control"><div className="swatch-row">{options.map((option) => <button key={option.id} type="button" aria-label={option.label} aria-pressed={value.toLowerCase() === option.value.toLowerCase()} className={value.toLowerCase() === option.value.toLowerCase() ? 'swatch is-selected' : 'swatch'} style={{ background: option.value }} onClick={() => onChange(option.value)} />)}</div><label className="custom-color"><input type="color" value={value} aria-label="自定义颜色" onInput={(event) => onChange(event.currentTarget.value)} /><span>{value.toUpperCase()}</span></label></div>
}

function Range({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void
}): ReactNode {
  return <label className="rail-range"><span>{label}<strong>{value}{unit}</strong></span><input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></label>
}
