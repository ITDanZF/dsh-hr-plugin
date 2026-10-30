import { Segmented } from 'antd'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createEmptyResume, defaultCatalog, type ResumeCatalog } from '../domain/index.js'
import { createSampleDraft, type ResumeDraft } from './draft.js'
import { loadCatalog, loadSessionResume, saveSessionResume } from './remote.js'
import { ResumeForm } from './form/ResumeForm.js'
import { HarnessTheme } from './HarnessTheme.js'
import { panelCss } from './panel.css.js'
import { StyleRail } from './templates/StyleRail.js'
import { renderTemplate } from './templates/registry.js'

const STYLE_ID = 'dsh-hr-panel-style'

export type ResumePanelProps = {
  sessionId?: string
  useTabInfo?: () => {
    tab: { signal: AbortSignal }
  }
}

function sessionFromPage(explicit?: string): string | undefined {
  if (explicit?.trim()) return explicit.trim()
  const found = document.querySelector('[data-sidebar-right-session]')?.getAttribute('data-sidebar-right-session')?.trim()
  return found || undefined
}

export function ResumePanel(props: ResumePanelProps): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(() => sessionFromPage(props.sessionId))
  const [view, setView] = useState<'edit' | 'template'>('edit')
  const [catalog, setCatalog] = useState<ResumeCatalog>(() => defaultCatalog())
  const [draft, setDraft] = useState<ResumeDraft>(() => sessionId ? createEmptyResume() : createSampleDraft())
  const dirty = useRef(false)
  const draftRef = useRef(draft)
  draftRef.current = draft

  function edit(next: ResumeDraft) {
    dirty.current = true
    setDraft(next)
  }

  useEffect(() => {
    if (props.sessionId?.trim()) {
      setSessionId(props.sessionId.trim())
      return
    }
    const found = rootRef.current?.closest('[data-sidebar-right-session]')?.getAttribute('data-sidebar-right-session')?.trim()
    if (found) setSessionId(found)
  }, [props.sessionId])

  useEffect(() => {
    if (!sessionId) {
      setCatalog(defaultCatalog())
      return
    }
    let cancelled = false
    void loadCatalog().then((next) => {
      if (!cancelled) setCatalog(next)
    }).catch(() => {
      if (!cancelled) setCatalog(defaultCatalog())
    })
    return () => {
      cancelled = true
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    const pull = async () => {
      try {
        const remote = await loadSessionResume(sessionId)
        if (cancelled || dirty.current) return
        setDraft(remote)
      } catch {
        // Keep the draft on screen when the preview server is unreachable.
      }
    }
    void pull()
    const timer = window.setInterval(() => { void pull() }, 2000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId || !dirty.current) return
    const snapshot = draft
    const timer = window.setTimeout(() => {
      void saveSessionResume(sessionId, snapshot).then(() => {
        if (draftRef.current === snapshot) dirty.current = false
      }).catch(() => {
        dirty.current = true
      })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [draft, sessionId])

  useEffect(() => {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = panelCss
  }, [])

  useEffect(() => {
    document.querySelector('.hr-body')?.scrollTo({ top: 0 })
  }, [view, draft.appearance.presetId])

  return (
    <HarnessTheme>
      <div className="hr-panel" ref={rootRef}>
        <header className="hr-top">
          <div className="hr-brand">
            <strong>简历</strong>
            <span>{sessionId ? '改动记在这个会话里' : '草稿只在这个页面里，还不会保存'}</span>
          </div>
          <div className="hr-actions">
          <button type="button" className="export-button" onClick={printSheet}>导出</button>
          <Segmented
            value={view}
            options={[
              { label: '编辑', value: 'edit' },
              { label: '模板', value: 'template' },
            ]}
            onChange={(next) => setView(next as 'edit' | 'template')}
          />
          </div>
        </header>
        <div className="print-source" aria-hidden="true">{renderTemplate(draft)}</div>
        <div className="hr-body">
          <div hidden={view !== 'edit'}>
            <ResumeForm draft={draft} catalog={catalog} onChange={edit} />
          </div>
          {view === 'template' ? (
            <div className="template-split">
              <StyleRail draft={draft} catalog={catalog} onChange={edit} />
              <div className="stage">{renderTemplate(draft)}</div>
            </div>
          ) : null}
        </div>
      </div>
    </HarnessTheme>
  )
}

function printSheet(): void {
  document.body.classList.add('hr-printing')
  const finish = () => {
    document.body.classList.remove('hr-printing')
    window.removeEventListener('afterprint', finish)
  }
  window.addEventListener('afterprint', finish)
  window.print()
}
