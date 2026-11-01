import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const requiredFiles = ['dist', 'cordis.patch.yml', 'skills', 'src/tools/guide/manual.md']

assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
assert.ok(manifest.engines?.dsh, 'engines.dsh is required')
for (const entry of requiredFiles) {
  assert.ok(manifest.files?.includes(entry), `files must include ${entry}`)
}

console.log('package manifest check passed')
