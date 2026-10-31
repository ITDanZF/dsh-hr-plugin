import type { CSSProperties, ReactNode } from 'react'
import type { ResumeAppearance, ResumeDraft } from '../draft.js'
import { DraftBlocks, ResumeHeader } from './blocks.js'

export function renderTemplate(draft: ResumeDraft): ReactNode {
  const appearance = draft.appearance
  const style = {
    '--sheet-accent': appearance.accent,
    '--sheet-paper': appearance.paper,
    '--sheet-ink': appearance.ink,
    '--sheet-pad': `${appearance.pageMarginMm}mm`,
    '--sheet-line-height': appearance.lineHeight,
  } as CSSProperties

  if (appearance.layout === 'sidebar') {
    const side = draft.sectionOrder.filter((id) => (draft.sectionPlacement[id] ?? (['skills', 'languages', 'interests'].includes(id) ? 'side' : 'main')) === 'side')
    const main = draft.sectionOrder.filter((id) => !side.includes(id))
    return (
      <article className={sheetClass(appearance)} style={style}>
        <aside className="sheet-side">
          <ResumeHeader draft={draft} showPhoto={appearance.showPhoto} />
          <DraftBlocks draft={draft} order={side} />
        </aside>
        <div className="sheet-main">
          <DraftBlocks draft={draft} order={main} />
        </div>
      </article>
    )
  }

  return (
    <article className={sheetClass(appearance)} style={style}>
      {appearance.layout === 'educationFirst' ? <div className="graduate-bar" /> : null}
      <ResumeHeader draft={draft} showPhoto={appearance.showPhoto} />
      <DraftBlocks draft={draft} order={draft.sectionOrder} />
    </article>
  )
}

function sheetClass(appearance: ResumeAppearance): string {
  return [
    'sheet',
    `sheet-${appearance.layout}`,
    `font-${appearance.font}`,
    `density-${appearance.density}`,
    `scale-${appearance.scale}`,
    `align-${appearance.headerAlign}`,
    `name-${appearance.nameRule}`,
    `heading-${appearance.headingRule}`,
    `date-${appearance.datePlace}`,
  ].join(' ')
}
