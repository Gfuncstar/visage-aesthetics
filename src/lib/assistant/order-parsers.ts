// Supplier order-confirmation parsing.
//
// Strategy:
//   1. Identify the supplier from the sender address / subject / body.
//   2. Run a supplier-specific parser for the known UK suppliers.
//   3. Fall back to a general regex sweep, then (if configured) an LLM
//      extraction for anything unrecognised or low-confidence.
//
// Nothing parsed here is ever auto-trusted: every result lands in the review
// queue (status 'pending') for the owner to confirm or edit before it counts.
// All amounts are GBP.

import type { OrderCategory } from './types'

export type ParsedLine = {
  description: string
  quantity: number
  unitPrice: number
  batchNumber?: string | null
  expiry?: string | null
}

export type ParsedOrder = {
  supplierName: string
  date: string // ISO YYYY-MM-DD
  orderNumber: string | null
  currency: string
  net: number
  vat: number
  total: number
  category: OrderCategory
  lines: ParsedLine[]
  confidence: number // 0..1
  method: string // which parser produced this
}

export type EmailInput = {
  from: string
  subject: string
  text: string // plain-text body (HTML should be stripped before calling)
  date?: string // ISO datetime of the message, optional
}

// ---- Known UK suppliers: domain / name signatures ----
const SUPPLIERS: { name: string; match: RegExp }[] = [
  { name: 'Church Pharmacy', match: /church\s*pharmacy|churchpharmacy/i },
  { name: 'Healthxchange', match: /healthxchange|health\s*xchange/i },
  { name: 'Fox Pharmacy', match: /fox\s*pharmacy|foxpharmacy/i },
  { name: 'Wigmore Medical', match: /wigmore\s*medical|wigmoremedical/i },
  { name: 'Eden Aesthetics', match: /eden\s*aesthetics|edenaesthetics/i },
  { name: 'Med-fx', match: /med-?fx|medfx/i },
]

export function identifySupplier(email: EmailInput): string | null {
  const haystack = `${email.from} ${email.subject} ${email.text.slice(0, 2000)}`
  for (const s of SUPPLIERS) {
    if (s.match.test(haystack)) return s.name
  }
  return null
}

function toIsoDate(raw: string | undefined): string | null {
  if (!raw) return null
  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  let m = s.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (m) {
    let [, d, mo, y] = m
    if (y.length === 2) y = `20${y}`
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  m = s.match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/)
  if (m) {
    const parsed = new Date(`${m[1]} ${m[2]} ${m[3]}`)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  }
  return null
}

function money(raw: string | undefined): number {
  if (!raw) return 0
  const n = parseFloat(raw.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1]
  }
  return undefined
}

// ---- Generic regex sweep, shared by all supplier parsers ----
function genericExtract(email: EmailInput): Omit<ParsedOrder, 'supplierName' | 'method' | 'confidence'> {
  const t = email.text

  const orderNumber =
    firstMatch(t, [
      /order\s*(?:no\.?|number|#|ref(?:erence)?)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-\/]{2,})/i,
      /invoice\s*(?:no\.?|number|#)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-\/]{2,})/i,
    ]) ?? null

  const total = money(
    firstMatch(t, [
      /(?:grand\s*)?total\s*(?:incl?\.?\s*vat)?\s*[:£]?\s*£?\s*([\d,]+\.\d{2})/i,
      /amount\s*(?:due|paid)\s*[:£]?\s*£?\s*([\d,]+\.\d{2})/i,
      /total\s*[:£]?\s*£?\s*([\d,]+\.\d{2})/i,
    ]),
  )
  const vat = money(
    firstMatch(t, [/vat(?:\s*@?\s*\d+%?)?\s*[:£]?\s*£?\s*([\d,]+\.\d{2})/i, /tax\s*[:£]?\s*£?\s*([\d,]+\.\d{2})/i]),
  )
  let net = money(
    firstMatch(t, [/(?:sub-?total|net|goods)\s*(?:excl?\.?\s*vat)?\s*[:£]?\s*£?\s*([\d,]+\.\d{2})/i]),
  )
  if (!net && total) net = +(total - vat).toFixed(2)

  const date =
    toIsoDate(firstMatch(t, [/(?:order|invoice|date)\s*(?:date)?\s*[:]?\s*([0-9A-Za-z\/\-.\s]{6,20})/i])) ??
    toIsoDate(email.date) ??
    new Date().toISOString().slice(0, 10)

  return {
    date,
    orderNumber,
    currency: 'GBP',
    net,
    vat,
    total,
    category: 'stock',
    lines: [],
  }
}

/** Deterministic parse for a known/identified supplier (or generic if unknown). */
export function parseKnown(email: EmailInput): ParsedOrder {
  const supplierName = identifySupplier(email) ?? guessSupplierFromDomain(email.from) ?? 'Unknown supplier'
  const base = genericExtract(email)
  const known = supplierName !== 'Unknown supplier'
  // Confidence reflects how much we actually pinned down.
  let confidence = 0.3
  if (known) confidence += 0.25
  if (base.total > 0) confidence += 0.25
  if (base.orderNumber) confidence += 0.1
  if (base.vat > 0) confidence += 0.1
  confidence = Math.min(confidence, 0.95)
  return { ...base, supplierName, confidence, method: known ? 'supplier-regex' : 'generic-regex' }
}

function guessSupplierFromDomain(from: string): string | null {
  const m = from.match(/@([^>\s]+)/)
  if (!m) return null
  const domain = m[1].split('.')[0]
  if (!domain || domain.length < 3) return null
  return domain.charAt(0).toUpperCase() + domain.slice(1)
}

// ---- LLM fallback (Anthropic) for unknown / low-confidence senders ----
const LLM_SYSTEM = `You extract structured data from a UK aesthetics-clinic supplier order or invoice email. Return ONLY a JSON object, no prose, with this exact shape:
{"supplierName": string, "date": "YYYY-MM-DD", "orderNumber": string|null, "net": number, "vat": number, "total": number, "currency": "GBP", "category": "stock"|"equipment"|"insurance"|"marketing"|"premises"|"training"|"other", "lines": [{"description": string, "quantity": number, "unitPrice": number, "batchNumber": string|null, "expiry": string|null}]}
Rules: amounts are plain numbers (no symbols). If a value is not present, use 0 (numbers) or null (text). Currency is GBP. Pick the single best category. Include batchNumber and expiry per line ONLY if they are explicitly stated in the email (some dispatch notes include lot/batch numbers); otherwise use null. Expiry as YYYY-MM or YYYY-MM-DD if shown. Do not invent line items, batch numbers or expiries you cannot see.`

export async function parseWithLlm(email: EmailInput): Promise<ParsedOrder | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })
  try {
    const res = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1500,
      system: LLM_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `From: ${email.from}\nSubject: ${email.subject}\n\n${email.text.slice(0, 12000)}`,
        },
      ],
    })
    const text = res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('\n')
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const j = JSON.parse(match[0]) as Record<string, unknown>
    const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0)
    const cats: OrderCategory[] = ['stock', 'equipment', 'insurance', 'marketing', 'premises', 'training', 'other']
    const category = cats.includes(j.category as OrderCategory) ? (j.category as OrderCategory) : 'stock'
    return {
      supplierName: String(j.supplierName ?? identifySupplier(email) ?? 'Unknown supplier').slice(0, 200),
      date: toIsoDate(String(j.date ?? '')) ?? email.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      orderNumber: j.orderNumber ? String(j.orderNumber).slice(0, 60) : null,
      currency: 'GBP',
      net: num(j.net),
      vat: num(j.vat),
      total: num(j.total) || num(j.net) + num(j.vat),
      category,
      lines: Array.isArray(j.lines)
        ? (j.lines as Record<string, unknown>[]).slice(0, 50).map((l) => ({
            description: String(l.description ?? '').slice(0, 300),
            quantity: num(l.quantity) || 1,
            unitPrice: num(l.unitPrice),
            batchNumber: l.batchNumber ? String(l.batchNumber).slice(0, 80) : null,
            expiry: l.expiry ? String(l.expiry).slice(0, 20) : null,
          }))
        : [],
      confidence: 0.7,
      method: 'llm',
    }
  } catch (err) {
    console.error('[order-parsers] LLM extraction failed', err)
    return null
  }
}

/**
 * Full parse: try the deterministic parser; if it's a known supplier with a
 * solid total, keep it; otherwise (unknown sender or weak result) try the LLM.
 */
export async function parseOrderEmail(email: EmailInput): Promise<ParsedOrder> {
  const known = parseKnown(email)
  const strong = known.method === 'supplier-regex' && known.total > 0 && known.confidence >= 0.7
  if (strong) return known
  const llm = await parseWithLlm(email)
  if (llm && (llm.total > 0 || llm.lines.length > 0)) return llm
  return known
}
