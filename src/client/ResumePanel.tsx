import { Segmented } from 'antd'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createEmptyResume, defaultCatalog, type ResumeCatalog } from '../domain/index.js'
import { createSampleDraft, type ResumeDraft } from './draft.js'
import { loadCatalog, loadSessionResume, ResumeConflictError, saveSessionResume, type ResumeSnapshot } from './remote.js'
import { ResumeForm } from './form/ResumeForm.js'
import { HarnessTheme } from './HarnessTheme.js'
import { panelCss } from './panel.css.js'
import { StyleRail } from './templates/StyleRail.js'
import { renderTemplate } from './templates/registry.js'

const STYLE_ID = 'dsh-hr-panel-style'
const SAVE_DELAY_MS = 400
const RETRY_DELAYS_MS = [1500, 3000, 6000]
type SaveStatus = 'preview' | 'loading' | 'saved' | 'editing' | 'saving' | 'error' | 'load-error' | 'conflict'
type PendingDraft = ResumeSnapshot
const pendingDrafts = new Map<string, PendingDraft>()

export type ResumePanelProps = {
  sessionId?: string
  useTabInfo?: () => { tab: { signal: AbortSignal } }
}

function sessionFromPage(explicit?: string): string | undefined {
  if (explicit?.trim()) return explicit.trim()
  const found = document.querySelector('[data-sidebar-right-session]')?.getAttribute('data-sidebar-right-session')?.trim()
  return found || undefined
}

export function ResumePanel(props: ResumePanelProps): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(() => sessionFromPage(props.sessionId))

  useEffect(() => {
    if (props.sessionId?.trim()) {
      setSessionId(props.sessionId.trim())
      return
    }
    const found = rootRef.current?.closest('[data-sidebar-right-session]')?.getAttribute('data-sidebar-right-session')?.trim()
    setSessionId(found || undefined)
  }, [props.sessionId])

  return <SessionPanel key={sessionId ?? 'sample'} sessionId={sessionId} panelRef={rootRef} />
}

function SessionPanel({ sessionId, panelRef }: { sessionId?: string; panelRef: RefObject<HTMLDivElement | null> }): ReactNode {
  const initial = sessionId ? pendingDrafts.get(sessionId) : undefined
  const [view, setView] = useState<'edit' | 'template'>('edit')
  const [catalog, setCatalog] = useState<ResumeCatalog>(() => defaultCatalog())
  const [draft, setDraft] = useState<ResumeDraft>(() => initial?.document ?? (sessionId ? createEmptyResume() : createSampleDraft()))
  const [status, setStatus] = useState<SaveStatus>(() => sessionId ? (initial ? 'editing' : 'loading') : 'preview')
  const [conflict, setConflict] = useState<ResumeSnapshot | null>(null)
  const draftRef = useRef(draft)
  const revisionRef = useRef(initial?.revision)
  const dirtyRef = useRef(Boolean(initial))
  const conflictRef = useRef<ResumeSnapshot | null>(null)
  const savingRef = useRef(false)
  const mountedRef = useRef(true)
  const saveTimerRef = useRef<number | undefined>(undefined)
  const retryCountRef = useRef(0)
  const pullSeqRef = useRef(0)
  const changeSeqRef = useRef(0)
  draftRef.current = draft

  function scheduleSave(delay = SAVE_DELAY_MS): void {
    if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = undefined
      void saveNow()
    }, delay)
  }

  async function saveNow(): Promise<void> {
    if (!sessionId || !dirtyRef.current || !revisionRef.current || conflictRef.current || savingRef.current) return
    savingRef.current = true
    if (mountedRef.current) setStatus('saving')
    const snapshot = draftRef.current
    const expectedRevision = revisionRef.current
    try {
      const revision = await saveSessionResume(sessionId, snapshot, expectedRevision)
      revisionRef.current = revision
      retryCountRef.current = 0
      changeSeqRef.current += 1
      if (draftRef.current === snapshot) {
        dirtyRef.current = false
        pendingDrafts.delete(sessionId)
        if (mountedRef.current) setStatus('saved')
      } else {
        pendingDrafts.set(sessionId, { document: draftRef.current, revision })
        if (mountedRef.current) setStatus('editing')
      }
    } catch (error) {
      if (error instanceof ResumeConflictError) {
        if (JSON.stringify(error.current.document) === JSON.stringify(draftRef.current)) {
          revisionRef.current = error.current.revision
          dirtyRef.current = false
          pendingDrafts.delete(sessionId)
          if (mountedRef.current) setStatus('saved')
        } else {
          conflictRef.current = error.current
          if (mountedRef.current) {
            setConflict(error.current)
            setStatus('conflict')
          }
        }
      } else if (mountedRef.current) {
        setStatus('error')
        if (retryCountRef.current < RETRY_DELAYS_MS.length) {
          scheduleSave(RETRY_DELAYS_MS[retryCountRef.current]!)
          retryCountRef.current += 1
        }
      }
    } finally {
      savingRef.current = false
      if (dirtyRef.current && !conflictRef.current && draftRef.current !== snapshot) {
        if (mountedRef.current) scheduleSave(0)
        else void saveNow()
      }
    }
  }

  function edit(next: ResumeDraft): void {
    draftRef.current = next
    setDraft(next)
    if (!sessionId) return
    dirtyRef.current = true
    changeSeqRef.current += 1
    retryCountRef.current = 0
    if (revisionRef.current) pendingDrafts.set(sessionId, { document: next, revision: revisionRef.current })
    if (!conflictRef.current) {
      setStatus('editing')
      scheduleSave()
    }
  }

  async function pull(): Promise<void> {
    if (!sessionId || dirtyRef.current) return
    const pullSeq = ++pullSeqRef.current
    const changeSeq = changeSeqRef.current
    try {
      const remote = await loadSessionResume(sessionId)
      if (!mountedRef.current || pullSeq !== pullSeqRef.current || changeSeq !== changeSeqRef.current) return
      if (dirtyRef.current) return
      revisionRef.current = remote.revision
      draftRef.current = remote.document
      setDraft(remote.document)
      setStatus('saved')
    } catch {
      if (mountedRef.current && pullSeq === pullSeqRef.current && !dirtyRef.current) setStatus('load-error')
    }
  }

  function reloadRemote(): void {
    const remote = conflictRef.current
    if (!sessionId || !remote) return
    revisionRef.current = remote.revision
    draftRef.current = remote.document
    dirtyRef.current = false
    conflictRef.current = null
    pendingDrafts.delete(sessionId)
    changeSeqRef.current += 1
    setDraft(remote.document)
    setConflict(null)
    setStatus('saved')
  }

  function overwriteRemote(): void {
    const remote = conflictRef.current
    if (!sessionId || !remote) return
    revisionRef.current = remote.revision
    conflictRef.current = null
    pendingDrafts.set(sessionId, { document: draftRef.current, revision: remote.revision })
    changeSeqRef.current += 1
    setConflict(null)
    setStatus('editing')
    scheduleSave(0)
  }

  useEffect(() => {
    mountedRef.current = true
    if (!sessionId) {
      setCatalog(defaultCatalog())
      return
    }
    let active = true
    void loadCatalog().then((next) => {
      if (active) setCatalog(next)
    }).catch(() => {
      if (active) setCatalog(defaultCatalog())
    })
    void pull()
    const timer = window.setInterval(() => { void pull() }, 2000)
    if (initial) scheduleSave()
    return () => {
      active = false
      mountedRef.current = false
      window.clearInterval(timer)
      if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
      if (dirtyRef.current && !savingRef.current && !conflictRef.current) void saveNow()
    }
  }, [sessionId])

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
    panelRef.current?.querySelector('.hr-body')?.scrollTo({ top: 0 })
  }, [view, draft.appearance.presetId])

  const ready = status !== 'loading' && !(status === 'load-error' && !revisionRef.current)
  const statusText: Record<SaveStatus, string> = {
    preview: '示例草稿，不会保存',
    loading: '正在读取会话简历…',
    saved: '已保存到这个会话',
    editing: '等待保存…',
    saving: '正在保存…',
    error: '保存失败，修改仍在本页',
    'load-error': '连接中断，点击重试',
    conflict: '简历在别处有新修改，请选择处理方式',
  }

  return (
    <HarnessTheme>
      <div className="hr-panel" ref={panelRef}>
        <header className="hr-top">
          <div className="hr-brand">
            <strong>简历</strong>
            <span role="status" aria-live="polite">{statusText[status]}</span>
          </div>
          <div className="hr-actions">
            <button type="button" className="export-button" onClick={printSheet} disabled={!ready}>导出</button>
            <Segmented
              value={view}
              options={[{ label: '编辑', value: 'edit' }, { label: '模板', value: 'template' }]}
              onChange={(next) => setView(next as 'edit' | 'template')}
            />
          </div>
        </header>
        {status === 'error' ? (
          <div className="hr-save-alert" role="alert">
            保存未完成。<button type="button" onClick={() => { retryCountRef.current = 0; scheduleSave(0) }}>立即重试</button>
          </div>
        ) : null}
        {status === 'load-error' ? (
          <div className="hr-save-alert" role="alert">
            无法读取最新简历。<button type="button" onClick={() => void pull()}>重新读取</button>
          </div>
        ) : null}
        {conflict ? (
          <div className="hr-save-alert" role="alert">
            本地修改尚未保存。
            <button type="button" onClick={reloadRemote}>放弃本地修改并重新加载</button>
            <button type="button" onClick={overwriteRemote}>用本地修改覆盖</button>
          </div>
        ) : null}
        <div className="print-source" aria-hidden="true">{renderTemplate(draft)}</div>
        <div className="hr-body">
          {!ready ? <div className="hr-loading">正在读取简历，请稍候。</div> : (
            <>
              <div hidden={view !== 'edit'}>
                <ResumeForm draft={draft} catalog={catalog} onChange={edit} />
              </div>
              {view === 'template' ? (
                <div className="template-split">
                  <StyleRail draft={draft} catalog={catalog} onChange={edit} />
                  <div className="stage">{renderTemplate(draft)}</div>
                </div>
              ) : null}
            </>
          )}
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

