import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ResumeDraft } from '../draft.js'
import { renderTemplate } from './registry.js'

type Zoom = 'fit' | 0.75 | 1
const SHEET_WIDTH = 794 // A4 at the browser's 96 CSS pixels per inch.

export function TemplatePreview({ draft, settingsOpen, onToggleSettings }: {
  draft: ResumeDraft
  settingsOpen: boolean
  onToggleSettings: () => void
}): ReactNode {
  const stageRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [zoom, setZoom] = useState<Zoom>('fit')
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(() => setWidth(stage.clientWidth))
    observer.observe(stage)
    setWidth(stage.clientWidth)
    return () => observer.disconnect()
  }, [])
  const scale = zoom === 'fit' ? Math.min(1, Math.max(0.25, (width - 32) / SHEET_WIDTH)) : zoom

  return <div className="template-preview">
    <div className="template-preview-bar">
      <div className="preview-bar-start">
        <button className="preview-settings-toggle" type="button" aria-expanded={settingsOpen} onClick={onToggleSettings}>{settingsOpen ? '专注预览' : '展开设置'}</button>
        <span>A4 实时预览</span>
      </div>
      <div className="preview-zoom" aria-label="预览缩放">
        {([['fit', '适合宽度'], [0.75, '75%'], [1, '100%']] as const).map(([value, label]) => <button key={String(value)} type="button" aria-pressed={zoom === value} onClick={() => setZoom(value)}>{label}</button>)}
      </div>
    </div>
    <div className="stage" ref={stageRef}>
      <div className="preview-page" style={{ zoom: scale }}>{renderTemplate(draft)}</div>
    </div>
  </div>
}
