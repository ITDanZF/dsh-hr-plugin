import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { parseResume } from '../domain/index.js'
import { resumeRevision } from '../store/revision.js'
import type { ResumeStore } from '../store/types.js'

const PREVIEW_PORT = 3091
const MAX_BODY_BYTES = 2_000_000
const DEFAULT_ORIGINS = [
  'http://127.0.0.1:3080',
  'http://localhost:3080',
  'http://127.0.0.1:5174',
  'http://localhost:5174',
]

/** Serve session resume mirrors for the right-hand panel over loopback HTTP. */
export function startResumePreviewServer(ctx: Context, store: ResumeStore): void {
  ctx.effect(() => {
    const server = createResumePreviewServer(store)
    server.on('error', (error) => console.error('[dsh-hr-plugin] preview server failed:', error))
    server.listen(PREVIEW_PORT, '127.0.0.1', () => {
      console.log(`[dsh-hr-plugin] resume preview http://127.0.0.1:${PREVIEW_PORT}`)
    })
    return () => {
      server.close()
    }
  }, 'hr-plugin.preview-server')
}

export function createResumePreviewServer(store: ResumeStore, allowedOrigins = configuredOrigins()): Server {
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Vary', 'Origin')
    const origin = req.headers.origin
    const host = req.headers.host?.split(':')[0]
    if (!origin || !allowedOrigins.has(origin) || (host !== '127.0.0.1' && host !== 'localhost')) {
      sendJson(res, 403, { error: 'origin not allowed' })
      return
    }
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-Match')
    res.setHeader('Access-Control-Expose-Headers', 'ETag')
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }
    try {
      const url = new URL(req.url || '/', `http://127.0.0.1:${PREVIEW_PORT}`)
      if (url.pathname === '/hr-catalog' && req.method === 'GET') {
        const catalog = await store.getCatalog()
        if (!catalog) {
          sendJson(res, 404, { error: 'catalog is not initialized' })
          return
        }
        sendJson(res, 200, catalog)
        return
      }
      const match = /^\/hr-resume\/([^/]+)$/.exec(url.pathname)
      if (!match || !req.method) {
        sendJson(res, 404, { error: 'not found' })
        return
      }

      const sessionId = decodeURIComponent(match[1]!)
      if (req.method === 'PUT') {
        await saveResume(req, res, store, sessionId)
        return
      }
      if (req.method === 'GET') {
        const document = await store.get(sessionId)
        if (!document) {
          sendJson(res, 404, { error: 'resume not found' })
          return
        }
        res.setHeader('ETag', resumeRevision(document))
        sendJson(res, 200, document)
        return
      }
      sendJson(res, 405, { error: 'method not allowed' })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      sendJson(res, 500, { error: message })
    }
  })
}

function configuredOrigins(): Set<string> {
  const extra = process.env.DSH_HR_ALLOWED_ORIGINS?.split(',').map((value) => value.trim()).filter(Boolean) ?? []
  return new Set([...DEFAULT_ORIGINS, ...extra])
}

async function saveResume(req: IncomingMessage, res: ServerResponse, store: ResumeStore, sessionId: string): Promise<void> {
  try {
    const expectedRevision = req.headers['if-match']
    if (typeof expectedRevision !== 'string') {
      sendJson(res, 428, { error: 'If-Match is required; read the resume before saving' })
      return
    }
    const text = await readBody(req)
    const document = parseResume(JSON.parse(text))
    const result = await store.compareAndPut(sessionId, expectedRevision, document)
    res.setHeader('ETag', result.revision)
    if (!result.ok) {
      sendJson(res, 409, { error: 'resume changed since it was read', document: result.document })
      return
    }
    res.writeHead(204)
    res.end()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    sendJson(res, 400, { error: message })
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('resume body is too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

export { PREVIEW_PORT }
