import type { CSSProperties, ReactNode } from 'react'
import type { ResumeAppearance, ResumeDraft } from '../draft.js'
import { DraftBlocks, ResumeHeader, type BlockId } from './blocks.js'

const singleOrder: BlockId[] = [
  'summary', 'intention', 'experience', 'projects', 'education', 'skills',
  'certificates', 'awards', 'languages', 'activities', 'interests', 'publications', 'references',
]

const educationFirstOrder: BlockId[] = [
  'intention', 'summary', 'education', 'experience', 'projects', 'skills',
  'awards', 'activities', 'certificates', 'languages', 'interests', 'publications', 'references',
]

const sidebarMainOrder: BlockId[] = [
  'summary', 'intention', 'experience', 'projects', 'education',
  'certificates', 'awards', 'activities', 'publications', 'references',
]

export function renderTemplate(draft: ResumeDraft): ReactNode {
  const appearance = draft.appearance
  const style = {
    '--sheet-accent': appearance.accent,
    '--sheet-paper': appearance.paper,
    '--sheet-ink': appearance.ink,
  } as CSSProperties

  if (appearance.layout === 'sidebar') {
    return (
      <article className={sheetClass(appearance)} style={style}>
        <aside className="sheet-side">
          <ResumeHeader draft={draft} showPhoto={appearance.showPhoto} />
          <DraftBlocks draft={draft} order={['skills', 'languages', 'interests']} />
        </aside>
        <div className="sheet-main">
          <DraftBlocks draft={draft} order={sidebarMainOrder} />
        </div>
      </article>
    )
  }

  const order = appearance.layout === 'educationFirst' ? educationFirstOrder : singleOrder
  return (
    <article className={sheetClass(appearance)} style={style}>
      {appearance.layout === 'educationFirst' ? <div className="graduate-bar" /> : null}
      <ResumeHeader draft={draft} showPhoto={appearance.showPhoto} />
      <DraftBlocks draft={draft} order={order} />
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
