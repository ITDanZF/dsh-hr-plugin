import { createWriteStream, existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, rmdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js'
import type { ResumeDocument, SheetFont } from '../domain/index.js'

type Pdf = InstanceType<typeof PDFDocument>
type Align = 'left' | 'center' | 'right'

export interface PdfMeasure {
  widthOf(text: string, fontSize: number): number
  heightOf(text: string, fontSize: number, width: number, lineGap: number): number
}

export interface PdfMark {
  kind: 'fill' | 'text' | 'rule' | 'chip' | 'image'
  role: string
  page: number
  x: number
  y: number
  width: number
  height: number
  color: string
  text: string
  align: Align
  fontSize: number
  lineGap: number
}

export interface PdfLayout {
  marks: PdfMark[]
  pageCount: number
  pageWidth: number
  pageHeight: number
  sidebarWidth: number
}

const MM = 72 / 25.4
const SIDEBAR_MM = 68
const SIDE_SECTIONS = new Set(['skills', 'languages', 'interests'])

const fontCandidates: Record<SheetFont, Record<'darwin' | 'win32' | 'linux', string[]>> = {
  serif: {
    darwin: ['/System/Library/Fonts/Supplemental/Songti.ttc', '/Library/Fonts/Songti.ttc'],
    win32: ['C:/Windows/Fonts/simsun.ttc', 'C:/Windows/Fonts/simsunb.ttf', 'C:/Windows/Fonts/simfang.ttf'],
    linux: ['/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', '/usr/share/fonts/truetype/noto/NotoSerifCJK-Regular.ttf', '/usr/share/fonts/truetype/arphic/ukai.ttf'],
  },
  sans: {
    darwin: ['/System/Library/Fonts/Hiragino Sans GB.ttc', '/System/Library/Fonts/STHeiti Light.ttc'],
    win32: ['C:/Windows/Fonts/msyh.ttc', 'C:/Windows/Fonts/msyh.ttf', 'C:/Windows/Fonts/simhei.ttf'],
    linux: ['/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttf'],
  },
  mono: {
    darwin: ['/Library/Fonts/SarasaMonoSC-Regular.ttf', '/System/Library/Fonts/Supplemental/SarasaMonoSC-Regular.ttf'],
    win32: ['C:/Windows/Fonts/sarasa-mono-sc-regular.ttf', 'C:/Windows/Fonts/simhei.ttf'],
    linux: ['/usr/share/fonts/truetype/noto/NotoSansMonoCJK-Regular.ttf', '/usr/share/fonts/opentype/noto/NotoSansMonoCJK-Regular.otf'],
  },
}

function platformKey(): 'darwin' | 'win32' | 'linux' {
  if (process.platform === 'win32') return 'win32'
  if (process.platform === 'darwin') return 'darwin'
  return 'linux'
}

function genericFonts(): string[] {
  const platform = platformKey()
  if (platform === 'win32') return ['C:/Windows/Fonts/simhei.ttf', 'C:/Windows/Fonts/simsunb.ttf']
  if (platform === 'darwin') return ['/System/Library/Fonts/Supplemental/Arial Unicode.ttf']
  return ['/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttf', '/usr/share/fonts/truetype/arphic/ukai.ttf']
}

export function pdfFontCandidates(family: SheetFont): string[] {
  return [...fontCandidates[family][platformKey()], ...genericFonts()]
}

export function resolvePdfFont(family: SheetFont, exists: (file: string) => boolean = existsSync): string {
  const configured = process.env.DSH_HR_PDF_FONT
  if (configured) {
    if (!exists(configured)) throw new Error(`PDF font not found: ${configured}`)
    return configured
  }
  const found = pdfFontCandidates(family).find((candidate) => exists(candidate))
  if (!found) throw new Error('No Unicode PDF font found. Set DSH_HR_PDF_FONT to a Chinese-capable .ttf or .otf file.')
  return found
}

function fontEmbeds(bytes: Buffer): boolean {
  const doc = new PDFDocument({ autoFirstPage: false })
  doc.on('data', () => {})
  try {
    doc.font(bytes)
    doc.addPage()
    doc.fontSize(12).text('中')
    doc.end()
    return true
  } catch {
    try { doc.end() } catch { /* The failed font never opened a page. */ }
    return false
  }
}

const embeddedFonts = new Map<string, Buffer>()

async function loadPdfFont(family: SheetFont): Promise<Buffer> {
  const configured = process.env.DSH_HR_PDF_FONT
  const cacheKey = `${configured ?? ''}:${family}`
  const cached = embeddedFonts.get(cacheKey)
  if (cached) return cached
  if (configured) {
    if (!existsSync(configured)) throw new Error(`PDF font not found: ${configured}`)
    const bytes = await readFile(configured)
    if (!fontEmbeds(bytes)) throw new Error(`PDF font not found: ${configured}`)
    embeddedFonts.set(cacheKey, bytes)
    return bytes
  }
  for (const candidate of pdfFontCandidates(family)) {
    if (/\.(ttc|otc)$/i.test(candidate) || !existsSync(candidate)) continue
    const bytes = await readFile(candidate)
    if (!fontEmbeds(bytes)) continue
    embeddedFonts.set(cacheKey, bytes)
    return bytes
  }
  throw new Error('No Unicode PDF font found. Set DSH_HR_PDF_FONT to a Chinese-capable .ttf or .otf file.')
}

function readPhoto(document: ResumeDocument): Buffer | undefined {
  if (!document.appearance.showPhoto || !document.basics.photo) return undefined
  if (!/^data:image\/(png|jpe?g);base64,/i.test(document.basics.photo)) {
    throw new Error('PDF photos must be PNG or JPEG. Please upload a supported photo.')
  }
  const encoded = document.basics.photo.slice(document.basics.photo.indexOf(',') + 1)
  return Buffer.from(encoded, 'base64')
}

function showDate(value: string): string {
  return value.trim().replaceAll('-', '.')
}

function period(startDate: string, endDate: string): string {
  const start = showDate(startDate)
  const end = showDate(endDate)
  if (!start && !end) return ''
  if (start && !end) return `${start} – 至今`
  if (!start) return end
  return `${start} – ${end}`
}

function joinParts(parts: Array<string | undefined>, separator: string): string {
  return parts.map((part) => part?.trim() ?? '').filter(Boolean).join(separator)
}

function tokens(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean)
}

interface Frame {
  x: number
  width: number
  top: number
  bottom: number
  page: number
  y: number
  ink: string
  muted: string
  rule: string
  chip: string
}

interface EntryBlock {
  title: string
  date: string
  lines: string[]
  bullets: string[]
  keywords: string[]
  url: string
}

export function layoutResumePdf(
  document: ResumeDocument,
  measure: PdfMeasure,
  page: { width: number, height: number } = { width: 595.28, height: 841.89 },
): PdfLayout {
  readPhoto(document)
  const { appearance } = document
  const scale = appearance.scale === 'large' ? 1.1 : appearance.scale === 'small' ? 0.92 : 1
  const blockGap = appearance.density === 'relaxed' ? 16 : appearance.density === 'compact' ? 8 : 12
  const entryGap = appearance.density === 'relaxed' ? 10 : appearance.density === 'compact' ? 6 : 8
  const margin = appearance.pageMarginMm * MM
  const sidebarWidth = SIDEBAR_MM * MM
  const ink = appearance.ink || '#1c1917'
  const accent = appearance.accent || ink
  const paper = appearance.paper || '#ffffff'
  const sidebar = appearance.layout === 'sidebar'
  const content: PdfMark[] = []
  let pageCount = 1

  function lineGapFor(fontSize: number): number {
    return Math.max(0, 2 + (appearance.lineHeight - 1.55) * fontSize)
  }

  function openFrame(x: number, width: number, textInk: string, muted: string, rule: string, chip: string): Frame {
    return { x, width, top: margin, bottom: page.height - margin, page: 1, y: margin, ink: textInk, muted, rule, chip }
  }

  const main = sidebar
    ? openFrame(sidebarWidth + margin * 0.8, page.width - sidebarWidth - margin * 1.6, ink, '#57534e', appearance.headingRule === 'accent' ? accent : '#d6d3d1', '#efeae4')
    : openFrame(margin, page.width - margin * 2, ink, '#57534e', appearance.headingRule === 'accent' ? accent : '#d6d3d1', '#efeae4')
  const side = openFrame(
    margin * 0.55,
    sidebarWidth - margin * 1.1,
    paper,
    paper,
    paper,
    '#d5dbd8',
  )
  const headerFrame = sidebar ? side : main

  function advance(frame: Frame, height: number): { page: number, y: number } {
    if (frame.y > frame.top + 0.5 && frame.y + height > frame.bottom) {
      frame.page += 1
      frame.y = frame.top
      pageCount = Math.max(pageCount, frame.page)
    }
    const at = { page: frame.page, y: frame.y }
    frame.y += height
    pageCount = Math.max(pageCount, frame.page)
    return at
  }

  function writeText(frame: Frame, value: string, fontSize: number, color: string, role: string, align: Align = 'left'): void {
    const text = value.trim()
    if (!text) return
    const lineGap = lineGapFor(fontSize)
    const height = measure.heightOf(text, fontSize, frame.width, lineGap)
    const at = advance(frame, height)
    content.push({ kind: 'text', role, page: at.page, x: frame.x, y: at.y, width: frame.width, height, color, text, align, fontSize, lineGap })
  }

  function writeRule(frame: Frame, width: number, color: string, role: string, align: Align): void {
    const at = advance(frame, 8)
    const x = align === 'center' ? frame.x + (frame.width - width) / 2 : frame.x
    content.push({ kind: 'rule', role, page: at.page, x, y: at.y + 4, width, height: 2, color, text: '', align, fontSize: 0, lineGap: 0 })
  }

  function writeSection(frame: Frame, title: string): void {
    if (frame.y > frame.top) advance(frame, blockGap)
    writeText(frame, title, 12 * scale, frame.ink, 'section')
    if (appearance.headingRule === 'none') return
    const at = advance(frame, 7)
    content.push({
      kind: 'rule',
      role: 'heading-rule',
      page: at.page,
      x: frame.x,
      y: at.y + 2,
      width: frame.width,
      height: 0.8,
      color: frame.rule,
      text: '',
      align: 'left',
      fontSize: 0,
      lineGap: 0,
    })
  }

  function writeDateTitle(frame: Frame, title: string, date: string): void {
    const titleSize = 10.5 * scale
    const dateSize = 9 * scale
    if (appearance.datePlace === 'end' && date.trim()) {
      const lineGap = lineGapFor(titleSize)
      const dateWidth = Math.min(frame.width * 0.46, Math.max(dateSize, measure.widthOf(date, dateSize)))
      const titleWidth = Math.max(frame.width - dateWidth - 8, frame.width * 0.4)
      const height = Math.max(
        measure.heightOf(title, titleSize, titleWidth, lineGap),
        measure.heightOf(date, dateSize, dateWidth, 0),
      )
      const at = advance(frame, height)
      content.push({ kind: 'text', role: 'title', page: at.page, x: frame.x, y: at.y, width: titleWidth, height, color: frame.ink, text: title, align: 'left', fontSize: titleSize, lineGap })
      content.push({ kind: 'text', role: 'date', page: at.page, x: frame.x + frame.width - dateWidth, y: at.y, width: dateWidth, height, color: frame.muted, text: date, align: 'right', fontSize: dateSize, lineGap: 0 })
      return
    }
    writeText(frame, title, titleSize, frame.ink, 'title')
    if (date.trim()) writeText(frame, date, dateSize, frame.muted, 'date')
  }

  function writeKeywords(frame: Frame, keywords: string[]): void {
    const visible = tokens(keywords)
    if (!visible.length) return
    const fontSize = 9 * scale
    if (appearance.keywordStyle === 'text') {
      writeText(frame, visible.join('、'), fontSize, frame.muted, 'keyword')
      return
    }
    const lineGap = 4
    let cursor = frame.x
    const rows: PdfMark[][] = [[]]
    let row = rows[0]
    for (const token of visible) {
      const textWidth = measure.widthOf(token, fontSize)
      const width = textWidth + 8
      const height = fontSize + 6
      if (cursor > frame.x && cursor + width > frame.x + frame.width) {
        cursor = frame.x
        row = []
        rows.push(row)
      }
      row.push({ kind: 'chip', role: 'keyword', page: 0, x: cursor, y: 0, width, height, color: frame.chip, text: token, align: 'left', fontSize, lineGap: 0 })
      cursor += width + lineGap
    }
    for (const chips of rows) {
      const height = Math.max(...chips.map((chip) => chip.height))
      const at = advance(frame, height + 3)
      for (const chip of chips) {
        content.push({ ...chip, page: at.page, y: at.y })
        content.push({
          kind: 'text',
          role: 'keyword',
          page: at.page,
          x: chip.x + 4,
          y: at.y + 2,
          width: chip.width - 8,
          height: chip.height,
          color: frame.ink,
          text: chip.text,
          align: 'left',
          fontSize,
          lineGap: 0,
        })
      }
    }
  }

  function writeEntry(frame: Frame, entry: EntryBlock): void {
    const visible = [entry.title, entry.date, entry.url, ...entry.lines, ...entry.bullets, ...entry.keywords].some((value) => value.trim())
    if (!visible) return
    if (frame.y > frame.top) advance(frame, entryGap * 0.45)
    if (entry.title || entry.date) writeDateTitle(frame, entry.title || '未命名', entry.date)
    for (const line of entry.lines) writeText(frame, line, 10 * scale, frame.muted, 'body')
    if (entry.url.trim()) writeText(frame, entry.url, 9 * scale, frame.ink, 'body')
    for (const bullet of entry.bullets) {
      if (bullet.trim()) writeText(frame, `- ${bullet.trim()}`, 9.5 * scale, frame.ink, 'body')
    }
    writeKeywords(frame, entry.keywords)
  }

  function writeEntries(frame: Frame, title: string, entries: EntryBlock[]): void {
    const visible = entries.filter((entry) => [entry.title, entry.date, entry.url, ...entry.lines, ...entry.bullets, ...entry.keywords].some((value) => value.trim()))
    if (!visible.length) return
    writeSection(frame, title)
    for (const entry of visible) writeEntry(frame, entry)
  }

  function columnFor(id: string): Frame {
    if (!sidebar) return main
    const placed = document.sectionPlacement[id]
    const sideColumn = placed === 'side' || (placed !== 'main' && SIDE_SECTIONS.has(id))
    return sideColumn ? side : main
  }

  const experiences: EntryBlock[] = document.experiences.map((item) => ({
    title: joinParts([item.position, item.organization], ' · '),
    date: period(item.startDate, item.endDate),
    lines: [joinParts([item.location, item.summary], ' · ')].filter(Boolean),
    bullets: item.highlights,
    keywords: item.keywords,
    url: item.url,
  }))
  const projects: EntryBlock[] = document.projects.map((item) => ({
    title: item.name,
    date: period(item.startDate, item.endDate),
    lines: [joinParts([item.role, item.entity, item.type], ' · '), item.summary].filter((line) => line.trim()),
    bullets: item.highlights,
    keywords: item.keywords,
    url: item.url,
  }))
  const education: EntryBlock[] = document.education.map((item) => ({
    title: joinParts([item.school, item.degree, item.area], ' · '),
    date: period(item.startDate, item.endDate),
    lines: [
      joinParts([item.location, item.studyMode, item.score], ' · '),
      tokens(item.courses).length ? `相关课程：${tokens(item.courses).join('、')}` : '',
      item.exchange.trim() ? `交换或游学：${item.exchange.trim()}` : '',
    ].filter(Boolean),
    bullets: [],
    keywords: [],
    url: '',
  }))

  if (appearance.showPhoto && document.basics.photo) {
    const photoWidth = 28 * MM
    const photoHeight = 36 * MM
    const at = advance(headerFrame, photoHeight + 8)
    const x = appearance.headerAlign === 'center' ? headerFrame.x + (headerFrame.width - photoWidth) / 2 : headerFrame.x
    content.push({ kind: 'image', role: 'photo', page: at.page, x, y: at.y, width: photoWidth, height: photoHeight, color: '', text: '', align: appearance.headerAlign, fontSize: 0, lineGap: 0 })
  }
  writeText(headerFrame, document.basics.name.trim() || '未命名', 21 * scale, headerFrame.ink, 'name', appearance.headerAlign)
  if (appearance.nameRule === 'short') writeRule(headerFrame, 36, sidebar ? paper : accent, 'name-rule', appearance.headerAlign)
  writeText(headerFrame, document.basics.headline, 11 * scale, headerFrame.muted, 'body', appearance.headerAlign)
  writeText(headerFrame, joinParts([document.basics.phone, document.basics.email, document.basics.location], ' · '), 9 * scale, headerFrame.muted, 'body', appearance.headerAlign)
  const links = document.basics.links
    .filter((link) => joinParts([link.network, link.username, link.url], ''))
    .map((link) => link.url.trim() ? (link.network.trim() || link.url.trim()) : (link.network.trim() || link.username.trim()))
  writeText(headerFrame, links.join(' · '), 9 * scale, headerFrame.muted, 'body', appearance.headerAlign)

  for (const id of document.sectionOrder) {
    const frame = columnFor(id)
    if (id === 'intention') {
      const parts = joinParts([document.intention.role, document.intention.industry, document.intention.cities, document.intention.workType], ' · ')
      if (parts) writeText(frame, `求职意向：${parts}`, 9 * scale, frame.muted, 'body')
    } else if (id === 'summary') {
      if (document.summary.trim()) {
        writeSection(frame, '职业摘要')
        writeText(frame, document.summary, 10 * scale, frame.ink, 'body')
      }
    } else if (id === 'experience') writeEntries(frame, '工作与实习经历', experiences)
    else if (id === 'projects') writeEntries(frame, '项目经历', projects)
    else if (id === 'education') writeEntries(frame, '教育背景', education)
    else if (id === 'skills') {
      const groups = document.skills.filter((group) => joinParts([group.name, group.level, ...group.keywords], ''))
      if (!groups.length) continue
      writeSection(frame, '技能')
      for (const group of groups) {
        const label = joinParts([group.name, group.level], ' · ')
        const words = tokens(group.keywords)
        writeText(frame, `${label}${words.length ? `：${words.join('、')}` : ''}`, 10 * scale, frame.ink, 'body')
      }
    } else if (id === 'languages') {
      const items = document.languages.filter((item) => joinParts([item.language, item.fluency], ''))
      if (!items.length) continue
      writeSection(frame, '语言')
      for (const item of items) writeText(frame, joinParts([item.language, item.fluency], ' · '), 10 * scale, frame.ink, 'body')
    } else if (id === 'certificates') writeEntries(frame, '证书', document.certificates.map((item) => ({
      title: item.name,
      date: showDate(item.date),
      lines: [joinParts([item.issuer, item.expiryDate ? `有效期至 ${showDate(item.expiryDate)}` : '', item.credentialId], ' · ')].filter(Boolean),
      bullets: [],
      keywords: [],
      url: item.url,
    })))
    else if (id === 'awards') writeEntries(frame, '荣誉', document.awards.map((item) => ({
      title: item.title,
      date: showDate(item.date),
      lines: [joinParts([item.awarder, item.summary], ' · ')].filter(Boolean),
      bullets: [],
      keywords: [],
      url: '',
    })))
    else if (id === 'activities') writeEntries(frame, '校园、社团与志愿', document.activities.map((item) => ({
      title: joinParts([item.position, item.organization], ' · '),
      date: period(item.startDate, item.endDate),
      lines: [item.location].filter((line) => line.trim()),
      bullets: item.highlights,
      keywords: [],
      url: '',
    })))
    else if (id === 'publications') writeEntries(frame, '发表与专利', document.publications.map((item) => ({
      title: item.name,
      date: showDate(item.date),
      lines: [joinParts([item.type, item.publisher], ' · ')].filter(Boolean),
      bullets: [],
      keywords: [],
      url: item.url,
    })))
    else if (id === 'interests') {
      const items = document.interests.map((item) => item.trim()).filter(Boolean)
      if (!items.length) continue
      writeSection(frame, '兴趣')
      writeText(frame, items.join('；'), 10 * scale, frame.ink, 'body')
    } else if (id === 'references' && (document.referencesOnRequest || document.references.length)) {
      const people = document.references.filter((item) => joinParts([item.name, item.relationship, item.organization, item.phone, item.email], ''))
      if (!people.length && !document.referencesOnRequest) continue
      writeSection(frame, '推荐人')
      if (!people.length) writeText(frame, '如需要可提供', 10 * scale, frame.ink, 'body')
      for (const item of people) writeEntry(frame, {
        title: item.name,
        date: '',
        lines: [joinParts([item.relationship, item.organization, item.phone, item.email], ' · ')].filter(Boolean),
        bullets: [],
        keywords: [],
        url: '',
      })
    } else {
      const custom = document.customSections.find((item) => item.id === id)
      const fields = custom?.fields.filter((field) => field.value.trim()) ?? []
      if (!custom || !fields.length) continue
      writeSection(frame, custom.title)
      for (const field of fields) {
        writeText(frame, `${field.label}：`, 10 * scale, frame.ink, 'body')
        if (field.type === 'bullets') {
          for (const line of field.value.split(/\r?\n/)) writeText(frame, `- ${line}`, 9.5 * scale, frame.ink, 'body')
        } else {
          writeText(frame, field.value, 10 * scale, frame.ink, 'body')
        }
      }
    }
  }

  const backgrounds: PdfMark[] = []
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    if (paper.toLowerCase() !== '#ffffff') {
      backgrounds.push({ kind: 'fill', role: 'paper', page: pageNumber, x: 0, y: 0, width: page.width, height: page.height, color: paper, text: '', align: 'left', fontSize: 0, lineGap: 0 })
    }
    if (sidebar) {
      backgrounds.push({ kind: 'fill', role: 'sidebar', page: pageNumber, x: 0, y: 0, width: sidebarWidth, height: page.height, color: accent, text: '', align: 'left', fontSize: 0, lineGap: 0 })
    }
    if (appearance.layout === 'educationFirst' && pageNumber === 1) {
      backgrounds.push({ kind: 'fill', role: 'graduate-bar', page: pageNumber, x: 0, y: 0, width: page.width, height: 8, color: accent, text: '', align: 'left', fontSize: 0, lineGap: 0 })
    }
  }

  return { marks: [...backgrounds, ...content], pageCount, pageWidth: page.width, pageHeight: page.height, sidebarWidth }
}

function paint(doc: Pdf, layout: PdfLayout, photo: string | undefined): void {
  while (doc.bufferedPageRange().count < layout.pageCount) doc.addPage()
  for (let index = 0; index < layout.pageCount; index += 1) {
    doc.switchToPage(index)
    for (const mark of layout.marks) {
      if (mark.page !== index + 1) continue
      if (mark.kind === 'fill') {
        doc.save().fillColor(mark.color).rect(mark.x, mark.y, mark.width, mark.height).fill().restore()
      } else if (mark.kind === 'chip') {
        doc.save().fillColor(mark.color).roundedRect(mark.x, mark.y, mark.width, mark.height, mark.height / 2).fill().restore()
      } else if (mark.kind === 'rule') {
        doc.save().strokeColor(mark.color).lineWidth(mark.height).moveTo(mark.x, mark.y + mark.height / 2).lineTo(mark.x + mark.width, mark.y + mark.height / 2).stroke().restore()
      } else if (mark.kind === 'image' && photo) {
        doc.image(photo, mark.x, mark.y, { width: mark.width, height: mark.height })
      } else if (mark.kind === 'text') {
        doc.fillColor(mark.color).fontSize(mark.fontSize).text(mark.text, mark.x, mark.y, {
          width: mark.width,
          height: mark.height + 2,
          align: mark.align,
          lineGap: mark.lineGap,
          lineBreak: true,
        })
      }
    }
  }
}

export async function renderResumePdf(document: ResumeDocument, outputPath: string): Promise<string> {
  const photoUrl = document.appearance.showPhoto && document.basics.photo ? document.basics.photo : undefined
  readPhoto(document)
  const font = await loadPdfFont(document.appearance.font)
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    autoFirstPage: true,
    bufferPages: true,
    compress: true,
  })
  const stream = createWriteStream(outputPath)
  const finished = new Promise<void>((resolve, reject) => {
    stream.once('finish', resolve)
    stream.once('error', reject)
    doc.once('error', reject)
  })
  doc.pipe(stream)
  try {
    doc.font(font)
    const measure: PdfMeasure = {
      widthOf(text, fontSize) {
        doc.fontSize(fontSize)
        return doc.widthOfString(text)
      },
      heightOf(text, fontSize, width, lineGap) {
        doc.fontSize(fontSize)
        return doc.heightOfString(text, { width, lineGap })
      },
    }
    const layout = layoutResumePdf(document, measure, { width: doc.page.width, height: doc.page.height })
    doc.font(font)
    paint(doc, layout, photoUrl)
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
