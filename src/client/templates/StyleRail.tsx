import { Switch } from 'antd'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { sectionLabels, setSectionPlacement, type ResumeCatalog } from '../../domain/index.js'
import type {
  DatePlace, HeaderAlign, HeadingRule, KeywordStyle, NameRule, ResumeAppearance,
  ResumeDraft, SheetDensity, SheetFont, SheetLayout, SheetScale,
} from '../draft.js'
import { applyPreset, customizeAppearance } from './appearance.js'

type Group = 'presets' | 'layout' | 'colors' | 'type' | 'details'
const groups: { id: Group; label: string }[] = [
  { id: 'presets', label: '预设' }, { id: 'layout', label: '版式' },
  { id: 'colors', label: '配色' }, { id: 'type', label: '排版' }, { id: 'details', label: '细节' },
]

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
          <div className="preset-grid">
            {catalog.presets.map((preset) => <button key={preset.presetId} type="button" className={look.presetId === preset.presetId ? 'preset-card is-selected' : 'preset-card'} aria-pressed={look.presetId === preset.presetId} onClick={() => onChange(applyPreset(draft, preset.presetId))}>
              <span className="preset-page" style={{ background: preset.paper, color: preset.accent }}><i /><i /><i /></span>
              <span>{preset.name}</span>
            </button>)}
          </div>
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
