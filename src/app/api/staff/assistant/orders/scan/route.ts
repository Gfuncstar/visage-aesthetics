import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { parseOrderImage } from '@/lib/assistant/order-parsers'
import { persistParsedOrder } from '@/lib/assistant/order-ingest'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_BYTES = 12 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

// POST (multipart, field "file") — a photo of a delivery note / invoice.
// Extracts the order (supplier, date, products, batch numbers, costs) and lands
// it in the review queue. Batch numbers become stock that auto-fills write-ups.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Photo reading is not configured (ANTHROPIC_API_KEY missing).' }, { status: 500 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 })
  }
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No photo provided.' }, { status: 400 })
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Please use a JPG, PNG or WEBP photo.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Photo is too large (max 12 MB).' }, { status: 400 })
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

  const parsed = await parseOrderImage(base64, file.type)
  if (!parsed) {
    return NextResponse.json({ error: 'Could not read that photo. Try a clearer, flatter shot.' }, { status: 502 })
  }

  const outcome = await persistParsedOrder(parsed, {
    rawSource: `Photo of ${parsed.supplierName} order${parsed.orderNumber ? ` ${parsed.orderNumber}` : ''}`,
  })
  if (outcome.status === 'error') {
    return NextResponse.json({ error: outcome.error }, { status: 502 })
  }

  const batches = parsed.lines.filter((l) => l.batchNumber).map((l) => l.batchNumber)
  return NextResponse.json({
    ok: true,
    status: outcome.status,
    supplier: parsed.supplierName,
    orderNumber: parsed.orderNumber,
    lines: parsed.lines.length,
    batches,
  })
}
