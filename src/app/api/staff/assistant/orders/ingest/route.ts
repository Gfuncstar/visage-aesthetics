import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { ingestOrderEmail, htmlToText } from '@/lib/assistant/order-ingest'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST /api/staff/assistant/orders/ingest
// Two ways to call it:
//   • A mailbox forwarding rule / email-to-webhook service POSTs the email here,
//     authenticated with the ORDER_INGEST_SECRET shared secret.
//   • A signed-in staff member can paste an email in to test extraction.
//
// Body: { from, subject, html?, text?, messageId?, secret? }
export async function POST(req: Request) {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }

  let b: Record<string, unknown>
  try {
    b = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Auth: either a valid staff session OR the shared ingest secret.
  const secret = process.env.ORDER_INGEST_SECRET
  const providedSecret = typeof b.secret === 'string' ? b.secret : ''
  const bySecret = Boolean(secret) && providedSecret === secret
  if (!bySecret && !(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const from = String(b.from ?? '').slice(0, 320)
  const subject = String(b.subject ?? '').slice(0, 500)
  const html = typeof b.html === 'string' ? b.html : ''
  const rawText = typeof b.text === 'string' ? b.text : ''
  const text = (rawText || htmlToText(html)).slice(0, 20000)
  const messageId = typeof b.messageId === 'string' ? b.messageId.slice(0, 300) : null
  const date = typeof b.date === 'string' ? b.date : undefined

  if (!text.trim() && !subject.trim()) {
    return NextResponse.json({ error: 'Nothing to parse.' }, { status: 400 })
  }

  const outcome = await ingestOrderEmail({ from, subject, text, date }, messageId)
  if (outcome.status === 'error') {
    return NextResponse.json({ error: outcome.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true, ...outcome })
}
