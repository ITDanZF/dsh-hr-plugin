import assert from 'node:assert/strict'
import { readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const installRoot = process.argv[2]
assert.ok(installRoot, 'usage: node scripts/check-packed.mjs <fresh-install-directory>')
const pluginRoot = path.resolve(installRoot, 'node_modules', 'dsh-hr-plugin')
const load = (relativePath) => import(pathToFileURL(path.join(pluginRoot, relativePath)).href)
const { createEmptyResume } = await load('dist/domain/index.js')
const { renderResumePdf } = await load('dist/pdf/render.js')
const outputPath = path.join(path.resolve(installRoot), 'packed-smoke.pdf')
const document = createEmptyResume()
document.basics.name = '打包安装测试'

try {
  await renderResumePdf(document, outputPath)
  const bytes = await readFile(outputPath)
  assert.equal(bytes.toString('ascii', 0, 4), '%PDF')
  console.log('packed installation PDF smoke check passed')
} finally {
  await rm(outputPath, { force: true })
}
