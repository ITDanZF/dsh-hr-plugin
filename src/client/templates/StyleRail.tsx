import { Select, Switch } from 'antd'
import type { ReactNode } from 'react'
import type { ResumeCatalog } from '../../domain/index.js'
import type {
  DatePlace,
  HeaderAlign,
  HeadingRule,
  KeywordStyle,
  NameRule,
  ResumeAppearance,
  ResumeDraft,
  SheetDensity,
  SheetFont,
  SheetLayout,
  SheetScale,
} from '../draft.js'
import { applyPreset, customizeAppearance } from './appearance.js'

export function StyleRail({
  draft,
  catalog,
  onChange,
}: {
  draft: ResumeDraft
  catalog: ResumeCatalog
  onChange: (draft: ResumeDraft) => void
}): ReactNode {
  const look = draft.appearance
  const set = (patch: Partial<Omit<ResumeAppearance, 'presetId'>>) => onChange(customizeAppearance(draft, patch))
  return (
    <aside className="template-rail">
      <section className="rail-group">
        <p className="rail-label">预设</p>
        <Select
          value={look.presetId}
          options={[
            ...catalog.presets.map((preset) => ({ value: preset.presetId, label: preset.name })),
            ...(look.presetId === 'custom' ? [{ value: 'custom', label: '自定义' }] : []),
          ]}
          onChange={(presetId) => {
            if (presetId !== 'custom') onChange(applyPreset(draft, presetId))
          }}
        />
      </section>
      <section className="rail-group">
        <p className="rail-label">版式</p>
        <div className="layout-pick">
          {catalog.layout.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className={look.layout === choice.value ? 'is-selected' : undefined}
              onClick={() => set({ layout: choice.value as SheetLayout })}
            >
              <span className={`layout-glyph layout-${choice.value}`} />
              {choice.label}
            </button>
          ))}
        </div>
        <Field label="姓名对齐">
          <Choices value={look.headerAlign} options={catalog.headerAlign} onChange={(headerAlign) => set({ headerAlign: headerAlign as HeaderAlign })} />
        </Field>
      </section>
      <section className="rail-group">
        <p className="rail-label">颜色</p>
        <Field label="纸色">
          <Swatches value={look.paper} options={catalog.paper} onChange={(paper) => set({ paper })} />
        </Field>
        <Field label="墨色">
          <Swatches value={look.ink} options={catalog.ink} onChange={(ink) => set({ ink })} />
        </Field>
        <Field label="强调色">
          <Swatches value={look.accent} options={catalog.accent} onChange={(accent) => set({ accent })} />
        </Field>
      </section>
      <section className="rail-group">
        <p className="rail-label">文字</p>
        <Field label="字体">
          <div className="choice-row">
            {catalog.font.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={look.font === choice.value ? `face-${choice.value} is-selected` : `face-${choice.value}`}
                onClick={() => set({ font: choice.value as SheetFont })}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="字号">
          <Choices value={look.scale} options={catalog.scale} onChange={(scale) => set({ scale: scale as SheetScale })} />
        </Field>
      </section>
      <section className="rail-group">
        <p className="rail-label">页面</p>
        <Field label="疏密">
          <Choices value={look.density} options={catalog.density} onChange={(density) => set({ density: density as SheetDensity })} />
        </Field>
        <label className="photo-switch">
          照片
          <Switch size="small" checked={look.showPhoto} onChange={(showPhoto) => set({ showPhoto })} />
        </label>
      </section>
      <section className="rail-group">
        <p className="rail-label">细节</p>
        <Field label="姓名线">
          <Choices value={look.nameRule} options={catalog.nameRule} onChange={(nameRule) => set({ nameRule: nameRule as NameRule })} />
        </Field>
        <Field label="节标题">
          <Choices value={look.headingRule} options={catalog.headingRule} onChange={(headingRule) => set({ headingRule: headingRule as HeadingRule })} />
        </Field>
        <Field label="关键词">
          <Choices value={look.keywordStyle} options={catalog.keywordStyle} onChange={(keywordStyle) => set({ keywordStyle: keywordStyle as KeywordStyle })} />
        </Field>
        <Field label="日期">
          <Choices value={look.datePlace} options={catalog.datePlace} onChange={(datePlace) => set({ datePlace: datePlace as DatePlace })} />
        </Field>
      </section>
    </aside>
  )
}

function Field({ label, children }: { label: string, children: ReactNode }): ReactNode {
  return (
    <div className="rail-field">
      <span>{label}</span>
      {children}
    </div>
  )
}

function Choices({
  value,
  options,
  onChange,
}: {
  value: string
  options: readonly { value: string, label: string }[]
  onChange: (id: string) => void
}): ReactNode {
  return (
    <div className="choice-row">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? 'is-selected' : undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Swatches({
  value,
  options,
  onChange,
}: {
  value: string
  options: readonly { id: string, label: string, value: string }[]
  onChange: (value: string) => void
}): ReactNode {
  return (
    <span className="swatch-row">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-label={option.label}
          className={value.toLowerCase() === option.value.toLowerCase() ? 'swatch is-selected' : 'swatch'}
          style={{ background: option.value }}
          onClick={() => onChange(option.value)}
        />
      ))}
    </span>
  )
}
