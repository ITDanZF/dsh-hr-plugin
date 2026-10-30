import assert from 'node:assert/strict'
import { once } from 'node:events'
import { request } from 'node:http'
import { createResumePreviewServer } from '../dist/host/preview-server.js'
import { createMemoryResumeStore } from '../dist/store/memory.js'

const allowedOrigin = 'http://127.0.0.1:5174'
const memory = createMemoryResumeStore()
const eventListeners = new Set()
const store = {
  ...memory,
  async compareAndPut(...args) {
    const result = await memory.compareAndPut(...args)
    if (result.ok) for (const listener of eventListeners) listener()
    return result
  },
  subscribe(_sessionId, listener) {
    eventListeners.add(listener)
    return () => eventListeners.delete(listener)
  },
}
const server = createResumePreviewServer(store, new Set([allowedOrigin]))
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
  const unchanged = await fetch(url, { headers: { Origin: allowedOrigin, 'If-None-Match': revision } })
  assert.equal(unchanged.status, 304)
  assert.equal(unchanged.headers.get('ETag'), revision)
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
  const events = await fetch(`${url}/events`, { headers: { Origin: allowedOrigin } })
  assert.equal(events.status, 200)
  assert.match(events.headers.get('Content-Type') ?? '', /^text\/event-stream/)
  const reader = events.body.getReader()
  try {
    await reader.read()
    document.summary = 'event tested'
    const updated = await fetch(url, {
      method: 'PUT', headers: { Origin: allowedOrigin, 'Content-Type': 'application/json', 'If-Match': saved.headers.get('ETag') },
      body: JSON.stringify(document),
    })
    assert.equal(updated.status, 204)
    const notification = await reader.read()
    assert.match(new TextDecoder().decode(notification.value), /data: changed/)
  } finally {
    await reader.cancel()
  }
  const pdf = await fetch(`${url}/pdf`, { headers: { Origin: allowedOrigin } })
  assert.equal(pdf.status, 200)
  assert.match(pdf.headers.get('Content-Type') ?? '', /^application\/pdf/)
  assert.equal(Buffer.from(await pdf.arrayBuffer()).toString('ascii', 0, 4), '%PDF')
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

