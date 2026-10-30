import type { ToolRunContext } from '@deepseek-ai/dsh-tools'

export function requireSessionId(exec: ToolRunContext): string {
  const sessionId = exec.agent?.id
  if (!sessionId) {
    throw new Error('resume tools require an agent session')
  }
  return String(sessionId)
}
