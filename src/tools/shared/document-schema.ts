/** Shared string output for resume tool results. */

export const resumeToolResultSchema = {
  type: 'string' as const,
}

export function renderResumeToolResult(_args: unknown, value: string) {
  return [{ type: 'text' as const, text: value }]
}

export function encodeResumeToolResult(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
