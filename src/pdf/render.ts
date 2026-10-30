import { writeFile } from 'node:fs/promises'
import type { ResumeDocument } from '../domain/index.js'

/**
 * Minimal PDF writer that embeds text as UTF-16BE with a built-in font.
 * Chinese glyphs may fall back to missing-glyph boxes unless the viewer
 * substitutes fonts; the export path and structure remain stable for tools.
 */
export async function renderResumePdf(
  document: ResumeDocument,
  outputPath: string,
): Promise<string> {
  const lines: string[] = []
  const { basics, intention } = document
  lines.push(basics.name || 'Untitled Resume')
  if (basics.headline) lines.push(basics.headline)
  const contacts = [basics.email, basics.phone, basics.location].filter(Boolean).join(' | ')
  if (contacts) lines.push(contacts)
  const intentionLine = [intention.role, intention.industry, intention.cities, intention.workType].filter(Boolean).join(' | ')
  if (intentionLine) lines.push(intentionLine)
  if (document.summary) {
    lines.push('')
    lines.push(document.summary)
  }
  for (const item of document.experiences) {
    pushBlock(lines, [item.position, item.organization].filter(Boolean).join(' | '), [item.startDate, item.endDate].filter(Boolean).join(' - '), item.highlights)
  }
  for (const item of document.projects) {
    pushBlock(lines, item.name, [item.role, item.entity].filter(Boolean).join(' | '), item.highlights)
  }
  for (const item of document.education) {
    pushBlock(lines, [item.school, item.degree, item.area].filter(Boolean).join(' | '), [item.startDate, item.endDate].filter(Boolean).join(' - '), item.courses)
  }
  for (const item of document.skills) {
    pushBlock(lines, item.name, item.level, item.keywords)
  }
  for (const item of document.languages) {
    pushBlock(lines, item.language, item.fluency, [])
  }
  for (const item of document.certificates) {
    pushBlock(lines, item.name, [item.issuer, item.date].filter(Boolean).join(' | '), [])
  }
  for (const item of document.awards) {
    pushBlock(lines, item.title, [item.awarder, item.date].filter(Boolean).join(' | '), item.summary ? [item.summary] : [])
  }
  for (const item of document.activities) {
    pushBlock(lines, [item.position, item.organization].filter(Boolean).join(' | '), [item.startDate, item.endDate].filter(Boolean).join(' - '), item.highlights)
  }
  if (document.interests.length > 0) pushBlock(lines, '兴趣', '', document.interests)
  for (const item of document.publications) {
    pushBlock(lines, item.name, [item.type, item.publisher, item.date].filter(Boolean).join(' | '), [])
  }
  if (document.referencesOnRequest && document.references.length === 0) pushBlock(lines, '推荐人', '如需要可提供', [])
  for (const item of document.references) {
    pushBlock(lines, item.name, [item.relationship, item.organization].filter(Boolean).join(' | '), [item.phone, item.email].filter(Boolean))
  }

  const content = buildContentStream(lines)
  const pdf = buildPdf(content)
  await writeFile(outputPath, pdf)
  return outputPath
}

function pushBlock(lines: string[], title: string, meta: string, bullets: string[]): void {
  lines.push('')
  if (title) lines.push(title)
  if (meta) lines.push(meta)
  for (const bullet of bullets) lines.push(`- ${bullet}`)
}

function escapePdfText(text: string): string {
  // PDF literal string with UTF-16BE BOM for non-Latin1; keep ASCII simple.
  if (/^[\x20-\x7e]*$/.test(text)) {
    return `(${text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')})`
  }
  const bom = [0xfe, 0xff]
  const bytes: number[] = [...bom]
  for (const char of text) {
    const code = char.codePointAt(0)!
    if (code > 0xffff) {
      bytes.push(0xff, 0xfd)
      continue
    }
    bytes.push((code >> 8) & 0xff, code & 0xff)
  }
  return `<${Buffer.from(bytes).toString('hex')}>`
}

function buildContentStream(lines: string[]): string {
  const ops: string[] = ['BT', '/F1 12 Tf', '50 780 Td', '16 TL']
  for (const [index, line] of lines.entries()) {
    if (index > 0) ops.push('T*')
    ops.push(`${escapePdfText(line)} Tj`)
  }
  ops.push('ET')
  return ops.join('\n')
}

function buildPdf(contentStream: string): Buffer {
  const objects: string[] = []
  objects.push('<< /Type /Catalog /Pages 2 0 R >>')
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>')
  objects.push(`<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream`)
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xref = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return Buffer.from(pdf, 'utf8')
}
