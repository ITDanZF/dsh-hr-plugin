import { createWriteStream, existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, rmdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js'
import type { ResumeDocument } from '../domain/index.js'

type Pdf = InstanceType<typeof PDFDocument>
type Entry = { title: string; meta?: string; summary?: string; bullets?: string[]; keywords?: string[]; url?: string }

function findFont(): string {
  const configured = process.env.DSH_HR_PDF_FONT
  if (configured) {
    if (!existsSync(configured)) throw new Error(`PDF font not found: ${configured}`)
    return configured
  }
  const candidates = process.platform === 'win32'
    ? ['C:/Windows/Fonts/simhei.ttf', 'C:/Windows/Fonts/simsunb.ttf']
    : process.platform === 'darwin'
      ? ['/System/Library/Fonts/Supplemental/Arial Unicode.ttf']
      : ['/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttf', '/usr/share/fonts/truetype/arphic/ukai.ttf']
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) {
    throw new Error('No Unicode PDF font found. Set DSH_HR_PDF_FONT to a Chinese-capable .ttf or .otf file.')
  }
  return found
}

export async function renderResumePdf(document: ResumeDocument, outputPath: string): Promise<string> {
  const font = findFont()
  const { appearance } = document
  const scale = appearance.scale === 'large' ? 1.1 : appearance.scale === 'small' ? 0.92 : 1
  const gap = appearance.density === 'relaxed' ? 0.85 : appearance.density === 'compact' ? 0.4 : 0.6
  const margin = appearance.pageMarginMm * 72 / 25.4
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: margin, right: margin, bottom: margin, left: margin },
    autoFirstPage: true,
    bufferPages: false,
    compress: true,
  })
  const stream = createWriteStream(outputPath)
  const finished = new Promise<void>((resolve, reject) => {
    stream.once('finish', resolve)
    stream.once('error', reject)
    doc.once('error', reject)
  })
  doc.pipe(stream)
  const ink = appearance.ink || '#1c1917'
  const accent = appearance.accent || ink
  const paper = appearance.paper || '#ffffff'
  function paintPage(): void {
    if (paper.toLowerCase() === '#ffffff') return
    doc.save().rect(0, 0, doc.page.width, doc.page.height).fill(paper).restore()
  }
  doc.on('pageAdded', paintPage)
  paintPage()

  function text(value: string, size = 10, color = ink): void {
    if (!value.trim()) return
    doc.fontSize(size * scale).fillColor(color).text(value.trim(), { lineGap: Math.max(0, 2 + (appearance.lineHeight - 1.55) * size) })
  }
  function section(title: string): void {
    if (doc.y > doc.page.height - 110) doc.addPage()
    doc.moveDown(gap + 0.35)
    text(title, 12, accent)
    if (appearance.headingRule !== 'none') {
      const y = doc.y + 2
      doc.save().strokeColor(appearance.headingRule === 'accent' ? accent : '#d6d3d1')
        .lineWidth(0.6).moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke().restore()
      doc.y = y + 5
    }
  }
  function entry(item: Entry): void {
    if (![item.title, item.meta, item.summary, item.url, ...(item.bullets ?? []), ...(item.keywords ?? [])].some((value) => value?.trim())) return
    if (doc.y > doc.page.height - 90) doc.addPage()
    doc.moveDown(gap * 0.55)
    text(item.title, 10.5)
    if (item.meta) text(item.meta, 9, '#57534e')
    if (item.summary) text(item.summary)
    for (const bullet of item.bullets ?? []) {
      if (bullet.trim()) text(`- ${bullet}`, 9.5)
    }
    if (item.keywords?.some(Boolean)) text(item.keywords.filter(Boolean).join(' · '), 9, '#57534e')
    if (item.url) text(item.url, 9, accent)
  }
  function sectionEntries(title: string, items: Entry[]): void {
    const visible = items.filter((item) => [item.title, item.meta, item.summary, item.url, ...(item.bullets ?? []), ...(item.keywords ?? [])].some((value) => value?.trim()))
    if (!visible.length) return
    section(title)
    for (const item of visible) entry(item)
  }
  function period(start: string, end: string): string {
    return [start, end || (start ? '至今' : '')].filter(Boolean).join(' — ')
  }

  try {
    doc.font(await readFile(font))
    if (appearance.showPhoto && document.basics.photo && !/^data:image\/(png|jpe?g);base64,/i.test(document.basics.photo)) {
      throw new Error('PDF photos must be PNG or JPEG. Please upload a supported photo.')
    }
    if (appearance.showPhoto && document.basics.photo) {
      const encoded = document.basics.photo.slice(document.basics.photo.indexOf(',') + 1)
      const photo = Buffer.from(encoded, 'base64')
      doc.image(photo, doc.page.width - margin - 72, margin, { fit: [72, 96] })
      doc.page.margins.right = margin + 86
    }
    text(document.basics.name || '未命名简历', 21)
    text(document.basics.headline, 11, accent)
    text([document.basics.phone, document.basics.email, document.basics.location].filter(Boolean).join(' · '), 9)
    for (const link of document.basics.links) text([link.network, link.url || link.username].filter(Boolean).join('：'), 8.5)
    if (doc.page.margins.right === margin + 86) {
      doc.y = Math.max(doc.y, margin + 106)
      doc.page.margins.right = margin
    }
    const experiences = document.experiences.map((item) => ({
      title: [item.position, item.organization].filter(Boolean).join(' · '),
      meta: [period(item.startDate, item.endDate), item.location].filter(Boolean).join('  |  '),
      summary: item.summary,
      bullets: item.highlights,
      keywords: item.keywords,
      url: item.url,
    }))
    const projects = document.projects.map((item) => ({
      title: item.name,
      meta: [item.role, item.entity, item.type, period(item.startDate, item.endDate)].filter(Boolean).join('  |  '),
      summary: item.summary,
      bullets: item.highlights,
      keywords: item.keywords,
      url: item.url,
    }))
    const education = document.education.map((item) => ({
      title: [item.school, item.degree, item.area].filter(Boolean).join(' · '),
      meta: [period(item.startDate, item.endDate), item.location, item.studyMode, item.score].filter(Boolean).join('  |  '),
      summary: item.exchange,
      bullets: item.courses,
    }))
    for (const id of document.sectionOrder) {
      if (id === 'intention') {
        const parts = [document.intention.role, document.intention.industry, document.intention.cities, document.intention.workType].filter(Boolean)
        if (parts.length) text(`求职意向：${parts.join(' · ')}`, 9)
      } else if (id === 'summary') {
        if (document.summary.trim()) { section('职业摘要'); text(document.summary) }
      } else if (id === 'experience') sectionEntries('工作与实习经历', experiences)
      else if (id === 'projects') sectionEntries('项目经历', projects)
      else if (id === 'education') sectionEntries('教育背景', education)
      else if (id === 'skills') sectionEntries('技能', document.skills.map((item) => ({
      title: item.name,
      meta: item.level,
      keywords: item.keywords,
      })))
      else if (id === 'languages') sectionEntries('语言', document.languages.map((item) => ({
      title: item.language,
      meta: item.fluency,
      })))
      else if (id === 'certificates') sectionEntries('证书', document.certificates.map((item) => ({
      title: item.name,
      meta: [item.issuer, item.date, item.expiryDate && `有效期至 ${item.expiryDate}`, item.credentialId].filter(Boolean).join('  |  '),
      url: item.url,
      })))
      else if (id === 'awards') sectionEntries('荣誉', document.awards.map((item) => ({
      title: item.title,
      meta: [item.awarder, item.date].filter(Boolean).join('  |  '),
      summary: item.summary,
      })))
      else if (id === 'activities') sectionEntries('校园与志愿', document.activities.map((item) => ({
      title: [item.position, item.organization].filter(Boolean).join(' · '),
      meta: [period(item.startDate, item.endDate), item.location].filter(Boolean).join('  |  '),
      bullets: item.highlights,
      })))
      else if (id === 'publications') sectionEntries('发表与专利', document.publications.map((item) => ({
      title: item.name,
      meta: [item.type, item.publisher, item.date].filter(Boolean).join('  |  '),
      url: item.url,
      })))
      else if (id === 'interests' && document.interests.some((item) => item.trim())) { section('兴趣'); text(document.interests.join(' · ')) }
      else if (id === 'references' && (document.referencesOnRequest || document.references.length)) {
        section('推荐人')
        if (document.referencesOnRequest && !document.references.length) text('如需要可提供')
        for (const item of document.references) entry({ title: item.name, meta: [item.relationship, item.organization, item.phone, item.email].filter(Boolean).join('  |  ') })
      } else {
        const custom = document.customSections.find((item) => item.id === id)
        const fields = custom?.fields.filter((field) => field.value.trim()) ?? []
        if (custom && fields.length) {
          section(custom.title)
          for (const field of fields) {
            text(`${field.label}：`, 10, accent)
            if (field.type === 'bullets') {
              for (const line of field.value.split(/\r?\n/)) text(`- ${line}`, 9.5)
            } else {
              text(field.value)
            }
          }
        }
      }
    }
    doc.end()
    await finished
    return outputPath
  } catch (error) {
    stream.destroy()
    await rm(outputPath, { force: true })
    throw error
  }
}

export async function renderResumePdfBuffer(document: ResumeDocument): Promise<Buffer> {
  const directory = await mkdtemp(path.join(tmpdir(), 'dsh-hr-pdf-'))
  const outputPath = path.join(directory, 'resume.pdf')
  try {
    await renderResumePdf(document, outputPath)
    return await readFile(outputPath)
  } finally {
    await rm(outputPath, { force: true })
    await rmdir(directory)
  }
}

