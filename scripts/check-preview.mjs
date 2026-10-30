import assert from 'node:assert/strict'
import { once } from 'node:events'
import { request } from 'node:http'
import { createResumePreviewServer } from '../dist/host/preview-server.js'
import { createMemoryResumeStore } from '../dist/store/memory.js'

const allowedOrigin = 'http://127.0.0.1:5174'
const server = createResumePreviewServer(createMemoryResumeStore(), new Set([allowedOrigin]))
server.listen(0, '127.0.0.1')
await once(server, 'listening')
const address = server.address()
assert.ok(address && typeof address !== 'string')
const url = `http://127.0.0.1:${address.port}/hr-resume/test-session`

try {
  const denied = await fetch(url)
  assert.equal(denied.status, 403)
  const evil = await fetch(url, { headers: { Origin: 'https://evil.example' } })
  assert.equal(evil.status, 403)
  const response = await fetch(url, { headers: { Origin: allowedOrigin } })
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), allowedOrigin)
  const revision = response.headers.get('ETag')
  assert.ok(revision)
  const document = await response.json()
  document.basics.name = 'Updated'
  const noPrecondition = await fetch(url, {
    method: 'PUT', headers: { Origin: allowedOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  })
  assert.equal(noPrecondition.status, 428)
  const saved = await fetch(url, {
    method: 'PUT', headers: { Origin: allowedOrigin, 'Content-Type': 'application/json', 'If-Match': revision },
    body: JSON.stringify(document),
  })
  assert.equal(saved.status, 204)
  assert.notEqual(saved.headers.get('ETag'), revision)
  const stale = await fetch(url, {
    method: 'PUT', headers: { Origin: allowedOrigin, 'Content-Type': 'application/json', 'If-Match': revision },
    body: JSON.stringify({ ...document, summary: 'stale edit' }),
  })
  assert.equal(stale.status, 409)
  assert.equal((await stale.json()).document.basics.name, 'Updated')
  const spoofedStatus = await new Promise((resolve, reject) => {
    const req = request(url, { headers: { Origin: allowedOrigin, Host: 'evil.example' } }, (res) => {
      res.resume()
      resolve(res.statusCode)
    })
    req.on('error', reject)
    req.end()
  })
  assert.equal(spoofedStatus, 403)
  console.log('preview API checks passed')
} finally {
  server.close()
}

