import { Segmented } from 'antd'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createEmptyResume, defaultCatalog, type ResumeCatalog } from '../domain/index.js'
import { createSampleDraft, type ResumeDraft } from './draft.js'
import { clearMatchingPendingDrafts, clearPendingDraft, discardOtherPendingDraft, readOtherPendingDraft, readPendingDraft, writePendingDraft, type PendingDraft } from './draft-recovery.js'
import { mergeResumePreferLocal } from './merge.js'
import { downloadSessionResumePdf, loadCatalog, loadSessionResume, ResumeConflictError, saveSessionResume, watchSessionResume } from './remote.js'
import { ResumeForm } from './form/ResumeForm.js'
import { HarnessTheme } from './HarnessTheme.js'
import { panelCss } from './panel.css.js'
import { StyleRail } from './templates/StyleRail.js'
import { TemplatePreview } from './templates/TemplatePreview.js'
import { renderTemplate } from './templates/registry.js'

const STYLE_ID = 'dsh-hr-panel-style'
const SAVE_DELAY_MS = 400
const MAX_RETRY_DELAY_MS = 30_000
type SaveStatus = 'preview' | 'loading' | 'saved' | 'editing' | 'saving' | 'error' | 'load-error'
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
  const [initial] = useState(() => sessionId ? pendingDrafts.get(sessionId) ?? readPendingDraft(sessionId) : undefined)
  const [otherPending, setOtherPending] = useState(() => sessionId && !initial ? readOtherPendingDraft(sessionId) : undefined)
  const [view, setView] = useState<'edit' | 'template'>('edit')
  const [templateSettingsOpen, setTemplateSettingsOpen] = useState(true)
  const [catalog, setCatalog] = useState<ResumeCatalog>(() => defaultCatalog())
  const [draft, setDraft] = useState<ResumeDraft>(() => initial?.document ?? (sessionId ? createEmptyResume() : createSampleDraft()))
  const [status, setStatus] = useState<SaveStatus>(() => sessionId ? (initial ? 'editing' : 'loading') : 'preview')
  const [backupUnavailable, setBackupUnavailable] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)
  const draftRef = useRef(draft)
  const revisionRef = useRef(initial?.revision)
  const baseRef = useRef(initial?.base)
  const dirtyRef = useRef(Boolean(initial))
  const savingRef = useRef(false)
  const mountedRef = useRef(true)
  const saveTimerRef = useRef<number | undefined>(undefined)
  const retryCountRef = useRef(0)
  const pullInFlightRef = useRef(false)
  const changeSeqRef = useRef(0)
  draftRef.current = draft

  function remember(next: ResumeDraft, base = baseRef.current, revision = revisionRef.current): void {
    if (!sessionId || !base || !revision) return
    const pending = { document: next, base, revision }
    pendingDrafts.set(sessionId, pending)
    if (!writePendingDraft(sessionId, pending) && mountedRef.current) setBackupUnavailable(true)
  }

  function forget(): void {
    if (!sessionId) return
    pendingDrafts.delete(sessionId)
    clearPendingDraft(sessionId)
    clearMatchingPendingDrafts(sessionId, draftRef.current)
    if (mountedRef.current) setBackupUnavailable(false)
  }

  function restoreOtherPending(): void {
    if (!sessionId || !otherPending) return
    draftRef.current = otherPending.document
    baseRef.current = otherPending.base
    revisionRef.current = otherPending.revision
    dirtyRef.current = true
    changeSeqRef.current += 1
    setDraft(otherPending.document)
    setOtherPending(undefined)
    remember(otherPending.document, otherPending.base, otherPending.revision)
    setStatus('editing')
    scheduleSave(0)
  }

  function scheduleSave(delay = SAVE_DELAY_MS): void {
    if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = undefined
      void saveNow()
    }, delay)
  }

  async function saveNow(): Promise<void> {
    if (!sessionId || !dirtyRef.current || !revisionRef.current || savingRef.current) return
    savingRef.current = true
    if (mountedRef.current) setStatus('saving')
    const snapshot = draftRef.current
    const expectedRevision = revisionRef.current
    try {
      const revision = await saveSessionResume(sessionId, snapshot, expectedRevision)
      revisionRef.current = revision
      baseRef.current = snapshot
      retryCountRef.current = 0
      changeSeqRef.current += 1
      if (draftRef.current === snapshot) {
        dirtyRef.current = false
        forget()
        if (mountedRef.current) setStatus('saved')
      } else {
        remember(draftRef.current, snapshot, revision)
        if (mountedRef.current) setStatus('editing')
      }
    } catch (error) {
      if (error instanceof ResumeConflictError) {
        if (JSON.stringify(error.current.document) === JSON.stringify(draftRef.current)) {
          revisionRef.current = error.current.revision
          baseRef.current = error.current.document
          dirtyRef.current = false
          forget()
          if (mountedRef.current) setStatus('saved')
        } else {
          const merged = mergeResumePreferLocal(baseRef.current ?? snapshot, draftRef.current, error.current.document)
          revisionRef.current = error.current.revision
          baseRef.current = error.current.document
          draftRef.current = merged
          changeSeqRef.current += 1
          if (mountedRef.current) setDraft(merged)
          if (JSON.stringify(merged) === JSON.stringify(error.current.document)) {
            dirtyRef.current = false
            forget()
            if (mountedRef.current) setStatus('saved')
          } else {
            remember(merged, error.current.document, error.current.revision)
            if (mountedRef.current) {
              setStatus('editing')
              scheduleSave(0)
            }
          }
        }
      } else if (mountedRef.current) {
        setStatus('error')
        scheduleSave(Math.min(1500 * 2 ** retryCountRef.current, MAX_RETRY_DELAY_MS))
        retryCountRef.current = Math.min(retryCountRef.current + 1, 5)
      }
    } finally {
      savingRef.current = false
      if (dirtyRef.current && draftRef.current !== snapshot) {
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
    remember(next)
    setStatus('editing')
    scheduleSave()
  }

  async function pull(): Promise<void> {
    if (!sessionId || dirtyRef.current || pullInFlightRef.current || (document.hidden && revisionRef.current)) return
    pullInFlightRef.current = true
    const changeSeq = changeSeqRef.current
    try {
      const remote = await loadSessionResume(sessionId, revisionRef.current)
      if (!mountedRef.current || changeSeq !== changeSeqRef.current) return
      if (dirtyRef.current) return
      if (!remote) {
        setStatus('saved')
        return
      }
      revisionRef.current = remote.revision
      baseRef.current = remote.document
      draftRef.current = remote.document
      clearMatchingPendingDrafts(sessionId, remote.document)
      setOtherPending((pending) => pending && JSON.stringify(pending.document) === JSON.stringify(remote.document) ? undefined : pending)
      setDraft(remote.document)
      setStatus('saved')
    } catch {
      if (mountedRef.current && !dirtyRef.current) setStatus('load-error')
    } finally {
      pullInFlightRef.current = false
    }
  }

  async function downloadPdf(): Promise<void> {
    if (!sessionId || status !== 'saved') return
    setExportError(false)
    setExporting(true)
    try {
      await downloadSessionResumePdf(sessionId)
    } catch {
      setExportError(true)
    } finally {
      setExporting(false)
    }
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
    const stopWatching = watchSessionResume(sessionId, () => { void pull() })
    const timer = window.setInterval(() => { void pull() }, 2000)
    const onVisible = () => { if (!document.hidden) void pull() }
    const onOnline = () => { if (dirtyRef.current) scheduleSave(0); else void pull() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    if (initial) scheduleSave()
    return () => {
      active = false
      mountedRef.current = false
      stopWatching()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      if (saveTimerRef.current !== undefined) window.clearTimeout(saveTimerRef.current)
      if (dirtyRef.current && !savingRef.current) void saveNow()
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
  }, [view])

  const ready = status !== 'loading' && !(status === 'load-error' && !revisionRef.current)
  const statusText: Record<SaveStatus, string> = {
    preview: '示例草稿，不会保存',
    loading: '正在读取会话简历…',
    saved: '已自动同步最新内容',
    editing: '自动同步中…',
    saving: '自动同步中…',
    error: backupUnavailable ? '同步中断，修改仍在本页；将自动重试' : '同步中断，草稿已暂存；将自动重试',
    'load-error': '连接中断，正在自动重连…',
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
            <button type="button" className="export-button" onClick={() => void downloadPdf()} disabled={!sessionId || status !== 'saved' || exporting}>
              {exporting ? '生成中…' : '下载 PDF'}
            </button>
            <button type="button" className="export-button" onClick={printSheet} disabled={!ready}>打印当前样式</button>
            <Segmented
              value={view}
              options={[{ label: '编辑', value: 'edit' }, { label: '模板', value: 'template' }]}
              onChange={(next) => setView(next as 'edit' | 'template')}
            />
          </div>
        </header>
        {otherPending ? (
          <div className="hr-save-alert" role="alert">
            检测到另一个标签页的未保存草稿。
            <button type="button" onClick={restoreOtherPending}>恢复草稿</button>
            <button type="button" onClick={() => setOtherPending(undefined)}>暂不恢复</button>
            <button type="button" onClick={() => { discardOtherPendingDraft(otherPending.storageKey); setOtherPending(undefined) }}>丢弃草稿</button>
          </div>
        ) : null}
        {backupUnavailable ? <div className="hr-save-alert" role="alert">浏览器无法暂存草稿；请保持页面打开，直到保存成功。</div> : null}
        {exportError ? <div className="hr-save-alert" role="alert">PDF 下载失败，请重试或检查中文字体配置。</div> : null}
        {status === 'error' ? (
          <div className="hr-save-alert" role="alert">
            暂时无法同步，恢复连接后会自动保存最新修改。
          </div>
        ) : null}
        {status === 'load-error' ? (
          <div className="hr-save-alert" role="alert">
            暂时无法读取简历，正在自动重连。
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
                  <StyleRail draft={draft} catalog={catalog} onChange={edit} autoSave={Boolean(sessionId)} hidden={!templateSettingsOpen} onCollapse={() => setTemplateSettingsOpen(false)} />
                  <TemplatePreview draft={draft} settingsOpen={templateSettingsOpen} onToggleSettings={() => setTemplateSettingsOpen((open) => !open)} />
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

