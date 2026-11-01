import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { inflateSync } from 'node:zlib'
import { applyPreset, createEmptyResume } from '../dist/domain/index.js'
import { layoutResumePdf, pdfFontCandidates, renderResumePdfBuffer, resolvePdfFont } from '../dist/pdf/render.js'

const MM = 72 / 25.4
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function measure() {
  return {
    widthOf(text, size) {
      return Math.max(size, [...text].length * size * 0.5)
    },
    heightOf(text, size, width, lineGap) {
      const textWidth = Math.max(size, [...text].length * size * 0.5)
      const lines = Math.max(1, Math.ceil(textWidth / Math.max(width, 1)))
      return lines * (size + lineGap)
    },
  }
}

function resume(presetId, patch = {}) {
  const document = applyPreset(createEmptyResume(), presetId)
  document.basics.name = '陈予安'
  document.basics.headline = '产品经理'
  document.summary = '摘要内容'
  document.sectionOrder = ['summary', 'experience', 'skills', 'activities', 'interests']
  document.experiences = [{
    id: 'e1',
    organization: '星澜科技',
    position: '产品经理',
    location: '杭州',
    startDate: '2022-03',
    endDate: '',
    summary: '',
    url: '',
    highlights: ['把审批时长从 2.4 天降到 1.1 天'],
    keywords: ['Figma', 'SQL'],
  }]
  document.skills = [{ id: 's1', name: '产品工具', level: '熟练', keywords: ['Figma'] }]
  document.activities = [{
    id: 'a1',
    organization: '志愿者协会',
    position: '干事',
    location: '',
    startDate: '',
    endDate: '',
    highlights: [],
  }]
  document.interests = ['阅读', '徒步']
  return Object.assign(document, patch)
}

function layout(document) {
  return layoutResumePdf(document, measure())
}

function findRole(marks, role, includes) {
  return marks.find((mark) => mark.role === role && (includes ? mark.text.includes(includes) : true))
}

const classic = layout(resume('classic-serif'))
const graduate = layout(resume('graduate'))
const sidebar = layout(resume('sidebar-dark'))
assert.equal(classic.marks.some((mark) => mark.role === 'graduate-bar'), false)
const bar = graduate.marks.find((mark) => mark.role === 'graduate-bar')
assert.equal(bar?.page, 1)
assert.ok(bar.y < 1)
assert.ok(bar.width > graduate.pageWidth * 0.95)
assert.equal(bar.color.toLowerCase(), '#1d4e89')
assert.equal(bar.height, 8)

const sideFill = sidebar.marks.find((mark) => mark.role === 'sidebar')
assert.equal(sideFill.x, 0)
assert.ok(Math.abs(sideFill.width - 68 * MM) < 0.01)
assert.equal(sideFill.color.toLowerCase(), '#243833')
const skill = findRole(sidebar.marks, 'body', '产品工具')
const job = findRole(sidebar.marks, 'title', '产品经理')
assert.ok(skill.x < sidebar.sidebarWidth, 'skills stay in the left column')
assert.ok(job.x >= sidebar.sidebarWidth, 'experience stays in the right column')

const moved = resume('sidebar-dark')
moved.sectionPlacement = { skills: 'main' }
const movedLayout = layout(moved)
assert.ok(findRole(movedLayout.marks, 'body', '产品工具').x >= movedLayout.sidebarWidth)

assert.ok(classic.marks.some((mark) => mark.role === 'name-rule' && mark.width === 36))
const noRule = resume('classic-serif')
noRule.appearance = { ...noRule.appearance, nameRule: 'none' }
assert.equal(layout(noRule).marks.some((mark) => mark.role === 'name-rule'), false)

const centered = resume('classic-serif')
centered.appearance = { ...centered.appearance, headerAlign: 'center' }
const centeredLayout = layout(centered)
const centeredName = findRole(centeredLayout.marks, 'name')
const centeredRule = centeredLayout.marks.find((mark) => mark.role === 'name-rule')
assert.equal(centeredName.align, 'center')
assert.ok(centeredRule.x > centeredName.x)

const title = findRole(classic.marks, 'title', '星澜科技')
const date = findRole(classic.marks, 'date', '2022.03')
assert.equal(date.y, title.y)
assert.ok(date.x > title.x)
const below = resume('classic-serif')
below.appearance = { ...below.appearance, datePlace: 'below' }
const belowLayout = layout(below)
const belowTitle = findRole(belowLayout.marks, 'title', '星澜科技')
const belowDate = findRole(belowLayout.marks, 'date', '2022.03')
assert.ok(belowDate.y > belowTitle.y)

assert.ok(classic.marks.some((mark) => mark.kind === 'chip' && mark.text === 'Figma'))
const asText = resume('classic-serif')
asText.appearance = { ...asText.appearance, keywordStyle: 'text' }
const textLayout = layout(asText)
assert.equal(textLayout.marks.some((mark) => mark.kind === 'chip'), false)
assert.ok(textLayout.marks.some((mark) => mark.role === 'keyword' && mark.text.includes('Figma、SQL')))

assert.ok(classic.marks.some((mark) => mark.role === 'section' && mark.text === '校园、社团与志愿'))
assert.ok(classic.marks.some((mark) => mark.role === 'body' && mark.text === '阅读；徒步'))

const long = resume('sidebar-dark')
long.experiences[0].highlights = Array.from({ length: 80 }, (_, index) => `补充说明 ${index}：把审批时长从 2.4 天降到 1.1 天`)
const longLayout = layout(long)
assert.ok(longLayout.pageCount >= 2)
assert.ok(longLayout.marks.some((mark) => mark.role === 'sidebar' && mark.page === 2))

const serif = pdfFontCandidates('serif')
const sans = pdfFontCandidates('sans')
const mono = pdfFontCandidates('mono')
assert.notEqual(serif[0], sans[0])
assert.notEqual(sans[0], mono[0])
const present = new Set([serif[0], sans[0]])
const exists = (file) => present.has(file)
assert.notEqual(resolvePdfFont('serif', exists), resolvePdfFont('sans', exists))
assert.ok(existsSync(resolvePdfFont('serif')))
assert.ok(existsSync(resolvePdfFont('sans')))
assert.ok(existsSync(resolvePdfFont('mono')))
process.env.DSH_HR_PDF_FONT = '/tmp/missing-dsh-hr-font.ttf'
assert.throws(() => resolvePdfFont('sans'), /PDF font not found/)
delete process.env.DSH_HR_PDF_FONT

function colorOp(hex) {
  const value = Number.parseInt(hex.slice(1), 16)
  const parts = [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
  return `${parts.join(' ')} scn`
}

function pdfStreams(buffer) {
  const latin = buffer.toString('latin1')
  const parts = []
  const pattern = /stream\r?\n/g
  for (const match of latin.matchAll(pattern)) {
    const start = match.index + match[0].length
    const end = latin.indexOf('endstream', start)
    if (end < 0) continue
    let slice = buffer.subarray(start, end)
    if (slice[slice.length - 1] === 0x0a) slice = slice.subarray(0, -1)
    if (slice[slice.length - 1] === 0x0d) slice = slice.subarray(0, -1)
    try {
      parts.push(inflateSync(slice).toString('latin1'))
    } catch {
      parts.push(slice.toString('latin1'))
    }
  }
  return parts.join('\n')
}

const classicPdf = await renderResumePdfBuffer(resume('classic-serif'))
const graduatePdf = await renderResumePdfBuffer(resume('graduate'))
const sidebarPdf = await renderResumePdfBuffer(resume('sidebar-dark'))
const longPdf = await renderResumePdfBuffer(long)
for (const buffer of [classicPdf, graduatePdf, sidebarPdf, longPdf]) {
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-')
}
assert.ok(pdfStreams(graduatePdf).includes(colorOp('#1d4e89')))
const sidebarStream = pdfStreams(longPdf)
const sidebarColor = colorOp('#243833')
assert.ok(sidebarStream.includes(sidebarColor))
assert.ok(sidebarStream.split(sidebarColor).length - 1 >= 2)
assert.ok((longPdf.toString('latin1').match(/\/Type \/Page(?!s)/g) ?? []).length >= 2)

const withPhoto = resume('classic-serif')
withPhoto.appearance = { ...withPhoto.appearance, showPhoto: true }
withPhoto.basics.photo = png
const photoPdf = await renderResumePdfBuffer(withPhoto)
assert.ok(photoPdf.toString('latin1').includes('/Subtype /Image') || photoPdf.toString('latin1').includes('/Image'))

const badPhoto = resume('classic-serif')
badPhoto.appearance = { ...badPhoto.appearance, showPhoto: true }
badPhoto.basics.photo = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
await assert.rejects(() => renderResumePdfBuffer(badPhoto), /PNG or JPEG/)

const monoResume = resume('tech-mono')
assert.equal((await renderResumePdfBuffer(monoResume)).subarray(0, 5).toString(), '%PDF-')

const directory = process.env.DSH_HR_PDF_OUT
if (directory) {
  await writeFile(path.join(directory, 'classic.pdf'), classicPdf)
  await writeFile(path.join(directory, 'graduate.pdf'), graduatePdf)
  await writeFile(path.join(directory, 'sidebar.pdf'), sidebarPdf)
  console.log(`pdf layout check passed\n${directory}`)
} else {
  console.log('pdf layout check passed')
}
