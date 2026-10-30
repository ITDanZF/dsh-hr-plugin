import { Button, Input, Select } from 'antd'
import { useEffect, useState, type PointerEvent, type ReactNode } from 'react'
import { addSection, createCustomSection, hideSection, removeCustomField, sectionIds, sectionLabels, setSectionPlacement, upsertCustomField, type CustomFieldType, type ResumeDocument } from '../../domain/index.js'

export function SectionControls({ draft, id, onChange, onMove, onPointerStart, onPointerMove, onPointerEnd, onPointerCancel }: {
  draft: ResumeDocument
  id: string
  onChange: (next: ResumeDocument) => void
  onMove: (id: string, beforeId?: string) => void
  onPointerStart: (id: string, event: PointerEvent<HTMLElement>) => void
  onPointerMove: (event: PointerEvent<HTMLElement>) => void
  onPointerEnd: (event: PointerEvent<HTMLElement>) => void
  onPointerCancel: () => void
}): { label: ReactNode; extra: ReactNode } {
  const index = draft.sectionOrder.indexOf(id)
  const label = sectionLabels[id] ?? draft.customSections.find((item) => item.id === id)?.title ?? id
  const stop = (event: { stopPropagation(): void }) => event.stopPropagation()
  return {
    label: <span className="section-drag" role="button" tabIndex={0} aria-label={`拖动${label}排序，方向键调整顺序`}
      title="按住拖动排序，也可用方向键调整" onClick={stop}
      onPointerDown={(event) => onPointerStart(id, event)} onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd} onPointerCancel={onPointerCancel} onKeyDown={(event) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
        event.preventDefault()
        event.stopPropagation()
        if (event.key === 'ArrowUp' && index > 0) onMove(id, draft.sectionOrder[index - 1])
        if (event.key === 'ArrowDown' && index < draft.sectionOrder.length - 1) onMove(id, draft.sectionOrder[index + 2])
      }}><span aria-hidden="true" className="section-grip">⠿</span>{label}</span>,
    extra: <span className="section-actions" onClick={stop} onKeyDown={stop}>
      {draft.appearance.layout === 'sidebar' ? <Button size="small" type="text" onClick={() => onChange(setSectionPlacement(draft, id, (draft.sectionPlacement[id] ?? (['skills', 'languages', 'interests'].includes(id) ? 'side' : 'main')) === 'side' ? 'main' : 'side'))}>{(draft.sectionPlacement[id] ?? (['skills', 'languages', 'interests'].includes(id) ? 'side' : 'main')) === 'side' ? '侧栏' : '正文'}</Button> : null}
      <Button size="small" type="text" danger className="section-remove" aria-label={`移除${label}`} onClick={() => onChange(hideSection(draft, id))}>移除</Button>
    </span>,
  }
}

export function AddSectionPanel({ draft, onChange }: { draft: ResumeDocument; onChange: (next: ResumeDocument) => void }): ReactNode {
  const [title, setTitle] = useState('')
  const available = sectionIds.filter((id) => !draft.sectionOrder.includes(id))
  const hiddenCustom = draft.customSections.filter((item) => !draft.sectionOrder.includes(item.id))
  return <details className="section-add-panel">
    <summary>＋ 添加模块</summary>
    <div className="section-add-options">
      {[...available.map((id) => ({ id, title: sectionLabels[id] })), ...hiddenCustom.map((item) => ({ id: item.id, title: item.title }))].map((item) => (
        <Button key={item.id} onClick={() => onChange(addSection(draft, item.id))}>{item.title}</Button>
      ))}
      <div className="section-create">
        <Input aria-label="自定义模块名称" placeholder="自定义模块名称" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={50} />
        <Button disabled={!title.trim()} onClick={() => { onChange(createCustomSection(draft, title)); setTitle('') }}>创建自定义模块</Button>
      </div>
    </div>
  </details>
}

export function CustomSectionBody({ draft, id, onChange }: { draft: ResumeDocument; id: string; onChange: (next: ResumeDocument) => void }): ReactNode {
  const section = draft.customSections.find((item) => item.id === id)
  if (!section) return null
  return <section className="section-body custom-section-body">
    <label>模块标题<EditableName value={section.title} ariaLabel="模块标题" onCommit={(title) => onChange({
      ...draft, customSections: draft.customSections.map((item) => item.id === id ? { ...item, title } : item),
    })} /></label>
    {section.fields.map((field) => <div className="custom-field-editor" key={field.id}>
      <EditableName value={field.label} ariaLabel="字段名称" onCommit={(label) => onChange(upsertCustomField(draft, id, { ...field, label }))} />
      <Select aria-label="字段类型" value={field.type} options={[
        { value: 'text', label: '短文本' }, { value: 'longText', label: '长文本' }, { value: 'dateRange', label: '日期区间' },
        { value: 'link', label: '链接' }, { value: 'bullets', label: '要点列表' },
      ]} onChange={(type: CustomFieldType) => onChange(upsertCustomField(draft, id, { ...field, type }))} />
      <Input.TextArea aria-label={`${field.label}内容`} value={field.value} autoSize={{ minRows: 1, maxRows: 6 }} onChange={(event) => onChange(upsertCustomField(draft, id, { ...field, value: event.target.value }))} />
      <Button type="text" danger onClick={() => onChange(removeCustomField(draft, id, field.id))}>删除字段</Button>
    </div>)}
    <Button onClick={() => onChange(upsertCustomField(draft, id, { label: '新字段', type: 'text', value: '' }))}>添加字段</Button>
  </section>
}

function EditableName({ value, ariaLabel, onCommit }: { value: string; ariaLabel: string; onCommit: (value: string) => void }): ReactNode {
  const [input, setInput] = useState(value)
  useEffect(() => setInput(value), [value])
  return <Input aria-label={ariaLabel} value={input} maxLength={50} onChange={(event) => {
    const next = event.target.value
    setInput(next)
    if (next.trim()) onCommit(next)
  }} onBlur={() => { if (!input.trim()) setInput(value) }} />
}
