import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const requiredFiles = ['dist', 'cordis.patch.yml', 'skills', 'src/tools/guide/manual.md']

assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
assert.equal(manifest.engines?.dsh, '*', 'the plugin must not pin a Harness runtime version')
assert.equal(manifest.dependencies?.['@deepseek-ai/dsh-storage-sqlite'], undefined)
assert.equal(manifest.peerDependencies?.['@deepseek-ai/dsh-storage-sqlite'], undefined)
assert.equal(manifest.peerDependencies?.['@deepseek-ai/dsh-storage-domain'], undefined)
assert.equal(manifest.peerDependencies?.['@deepseek-ai/dsh-home-paths'], undefined)
const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
assert.ok(!patch.includes('storage-sqlite'), 'the plugin must not install a versioned Harness storage service')
for (const entry of requiredFiles) {
  assert.ok(manifest.files?.includes(entry), `files must include ${entry}`)
}
assert.equal(manifest.dependencies?.['@betteroffice/fonts-cjk'], '0.4.2', 'CJK fonts must be installed with the plugin')

console.log('package manifest check passed')
