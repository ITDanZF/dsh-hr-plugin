import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { ResumePanel } from './ResumePanel.js'

export const name = 'dsh-hr-plugin-client'
export const inject = ['sidebarRightTabs', 'slots']

const TAB_ID = 'dsh-hr-plugin/resume'

type ResumeBodyProps = {
  sessionId?: string
  useTabInfo: () => { tab: { signal: AbortSignal } }
}

function ResumeBody(props: ResumeBodyProps) {
  return <ResumePanel sessionId={props.sessionId} useTabInfo={props.useTabInfo} />
}

type SlotsContext = Context & {
  slots: {
    inject: (name: string, factory: () => unknown) => () => void
    register: (options: { name: string; key: string }, component: unknown) => () => void
  }
}

export function apply(ctx: Context): void {
  const clientCtx = ctx as SlotsContext

  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: TAB_ID,
    kind: 'resume',
    title: () => '简历',
    guide: [{
      id: 'resume',
      order: 25,
      title: () => '简历',
      description: () => '查看和修改当前会话的简历',
    }],
  }), 'hr-plugin.resume-tab')

  ctx.effect(() => clientCtx.slots.inject('sidebar.right.pane.tab', () => clientCtx.slots.register(
    { name: 'sidebar.right.pane.tab', key: TAB_ID },
    ResumeBody,
  )), 'hr-plugin.resume-body')
}
