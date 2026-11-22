import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from 'pdf-lib'
import { formatDate } from '@/lib/utils'

export interface InvoicePdfData {
  number: string
  status: string
  issueDate: Date
  dueDate: Date
  paidAt: Date | null
  taxRate: number
  notes: string | null
  fromName: string | null
  fromEmail: string | null
  fromAddress: string | null
  subtotal: number
  total: number
  client: { name: string; email: string | null; company: string | null }
  project: { name: string } | null
  items: { description: string; quantity: number; rate: number; amount: number }[]
}

// US Letter, in points
const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 54
const RIGHT = PAGE_W - MARGIN
const CONTENT_W = PAGE_W - MARGIN * 2
const BOTTOM = 72

const INK = rgb(0.102, 0.102, 0.102) // #1a1a1a
const MUTED = rgb(0.42, 0.447, 0.502)
const FAINT = rgb(0.612, 0.639, 0.686)
const RULE = rgb(0.898, 0.906, 0.922)
const ACCENT = rgb(0.898, 0.302, 0.18) // #E54D2E
const PAID = rgb(0.02, 0.588, 0.412)

// Table column right edges
const COL_AMOUNT = RIGHT
const COL_RATE = RIGHT - 102
const COL_QTY = COL_RATE - 90
const DESC_W = COL_QTY - 56 - MARGIN

const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function invoicePdfFilename(number: string): string {
  const safe = number.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return `${safe || 'invoice'}.pdf`
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const raw of para.split(/ +/)) {
      let word = raw
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate
        continue
      }
      if (line) {
        lines.push(line)
        line = ''
      }
      // A single word wider than the column gets hard-broken
      while (font.widthOfTextAtSize(word, size) > maxWidth && word.length > 1) {
        let i = word.length - 1
        while (i > 1 && font.widthOfTextAtSize(word.slice(0, i), size) > maxWidth) i--
        lines.push(word.slice(0, i))
        word = word.slice(i)
      }
      line = word
    }
    lines.push(line)
  }
  return lines
}

export async function buildInvoicePdf(invoice: InvoicePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  // The built-in fonts only cover WinAnsi. Anything outside it would make
  // pdf-lib throw, so drop emoji and substitute the rest.
  const supported = new Set(regular.getCharacterSet())
  const clean = (value: string) =>
    Array.from(
      value
        .normalize('NFC')
        .replace(/\r\n?/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/[\p{Extended_Pictographic}\u{200d}\u{fe0f}]/gu, '')
    )
      .map((ch) => (ch === '\n' || supported.has(ch.codePointAt(0)!) ? ch : '?'))
      .join('')

  doc.setTitle(clean(`Invoice ${invoice.number}`))
  if (invoice.fromName) doc.setAuthor(clean(invoice.fromName))
  doc.setCreator('Pulse Pro')

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  type TextOpts = { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; right?: boolean }
  // Draws one line with its baseline at `atY`. With `right`, x is the right edge.
  const draw = (value: string, x: number, atY: number, opts: TextOpts = {}) => {
    const font = opts.font ?? regular
    const size = opts.size ?? 9.5
    const text = clean(value).replace(/\n/g, ' ')
    const drawX = opts.right ? x - font.widthOfTextAtSize(text, size) : x
    page.drawText(text, { x: drawX, y: atY, font, size, color: opts.color ?? INK })
  }
  const rule = (atY: number, color = RULE) =>
    page.drawLine({
      start: { x: MARGIN, y: atY },
      end: { x: RIGHT, y: atY },
      thickness: 0.75,
      color,
    })
  const label = (value: string, x: number, atY: number, right = false) =>
    draw(value.toUpperCase(), x, atY, { font: bold, size: 7.5, color: FAINT, right })

  // Header: sender on the left, invoice meta on the right
  const headerTop = y
  const fromWidth = 250

  let leftY = headerTop - 8
  label('From', MARGIN, leftY)
  leftY -= 18
  for (const line of wrap(clean(invoice.fromName || 'Business'), bold, 12, fromWidth)) {
    draw(line, MARGIN, leftY, { font: bold, size: 12 })
    leftY -= 15
  }
  leftY -= 1
  const fromDetails = [invoice.fromEmail, invoice.fromAddress].filter(Boolean).join('\n')
  if (fromDetails) {
    for (const line of wrap(clean(fromDetails), regular, 9.5, fromWidth)) {
      draw(line, MARGIN, leftY, { color: MUTED })
      leftY -= 13
    }
  }

  let rightY = headerTop - 8
  draw('INVOICE', RIGHT, rightY, { font: bold, size: 7.5, color: ACCENT, right: true })
  rightY -= 24
  draw(invoice.number, RIGHT, rightY, { font: bold, size: 20, right: true })
  rightY -= 18
  if (invoice.project) {
    draw(invoice.project.name, RIGHT, rightY, { color: MUTED, right: true })
    rightY -= 16
  }
  const meta: [string, string][] = [
    ['Issued', formatDate(invoice.issueDate)],
    ['Due', formatDate(invoice.dueDate)],
  ]
  if (invoice.paidAt) meta.push(['Paid', formatDate(invoice.paidAt)])
  for (const [name, value] of meta) {
    const valueText = clean(value)
    draw(valueText, RIGHT, rightY, { color: MUTED, right: true })
    const valueWidth = regular.widthOfTextAtSize(valueText, 9.5)
    draw(`${name}:`, RIGHT - valueWidth - 4, rightY, { font: bold, size: 9.5, right: true })
    rightY -= 13
  }

  y = Math.min(leftY, rightY) - 14
  rule(y)

  // Bill to
  y -= 24
  label('Bill To', MARGIN, y)
  y -= 16
  draw(invoice.client.name, MARGIN, y, { font: bold, size: 10.5 })
  y -= 14
  for (const line of [invoice.client.company, invoice.client.email]) {
    if (!line) continue
    draw(line, MARGIN, y, { color: MUTED })
    y -= 13
  }

  // Line items
  const tableHeader = () => {
    label('Description', MARGIN, y)
    label('Qty', COL_QTY, y, true)
    label('Rate', COL_RATE, y, true)
    label('Amount', COL_AMOUNT, y, true)
    y -= 9
    rule(y)
  }
  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN - 8
  }

  y -= 22
  tableHeader()

  const lineHeight = 13
  for (const item of invoice.items) {
    const lines = wrap(clean(item.description), regular, 9.5, DESC_W)
    const rowHeight = lines.length * lineHeight + 14
    if (y - rowHeight < BOTTOM) {
      newPage()
      tableHeader()
    }
    const firstBaseline = y - 17
    lines.forEach((line, i) => draw(line, MARGIN, firstBaseline - i * lineHeight))
    draw(item.quantity.toFixed(2), COL_QTY, firstBaseline, { color: MUTED, right: true })
    draw(money(item.rate), COL_RATE, firstBaseline, { color: MUTED, right: true })
    draw(money(item.amount), COL_AMOUNT, firstBaseline, { font: bold, right: true })
    y -= rowHeight
    rule(y)
  }

  // Totals
  const hasTax = invoice.taxRate > 0
  const totalsHeight = (hasTax ? 32 : 16) + 46
  if (y - totalsHeight < BOTTOM) newPage()
  const totalsLeft = RIGHT - 210

  y -= 22
  draw('Subtotal', totalsLeft, y, { color: MUTED })
  draw(money(invoice.subtotal), RIGHT, y, { color: MUTED, right: true })
  if (hasTax) {
    y -= 16
    draw(`Tax (${invoice.taxRate}%)`, totalsLeft, y, { color: MUTED })
    draw(money(invoice.subtotal * (invoice.taxRate / 100)), RIGHT, y, { color: MUTED, right: true })
  }
  y -= 10
  page.drawLine({
    start: { x: totalsLeft, y },
    end: { x: RIGHT, y },
    thickness: 0.75,
    color: RULE,
  })
  y -= 20
  draw('Total', totalsLeft, y, { font: bold, size: 11 })
  draw(money(invoice.total), RIGHT, y, { font: bold, size: 14, right: true })

  // Notes
  if (invoice.notes && invoice.notes.trim()) {
    const noteLines = wrap(clean(invoice.notes.trim()), regular, 9.5, CONTENT_W)
    y -= 26
    if (y - 40 < BOTTOM) newPage()
    else {
      rule(y)
      y -= 22
    }
    label('Notes', MARGIN, y)
    y -= 15
    for (const line of noteLines) {
      if (y < BOTTOM) newPage()
      draw(line, MARGIN, y, { color: MUTED })
      y -= lineHeight
    }
  }

  // Paid watermark and footers
  const pages = doc.getPages()

  if (invoice.status === 'paid') {
    const size = 130
    const angle = Math.PI / 6
    const w = bold.widthOfTextAtSize('PAID', size)
    const h = size * 0.72
    pages[0].drawText('PAID', {
      x: PAGE_W / 2 - ((w / 2) * Math.cos(angle) - (h / 2) * Math.sin(angle)),
      y: PAGE_H / 2 - ((w / 2) * Math.sin(angle) + (h / 2) * Math.cos(angle)),
      font: bold,
      size,
      color: PAID,
      opacity: 0.1,
      rotate: degrees(30),
    })
  }

  pages.forEach((p, i) => {
    page = p
    if (i === pages.length - 1) {
      const thanks = 'Thank you for your business.'
      const width = regular.widthOfTextAtSize(thanks, 8)
      draw(thanks, (PAGE_W - width) / 2, 40, { size: 8, color: FAINT })
    }
    if (pages.length > 1) {
      draw(`${invoice.number}  ·  Page ${i + 1} of ${pages.length}`, RIGHT, 40, {
        size: 8,
        color: FAINT,
        right: true,
      })
    }
  })

  return doc.save()
}
