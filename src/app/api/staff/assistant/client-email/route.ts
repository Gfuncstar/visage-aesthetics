import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { buildClientEmail, type WriteUpInput } from '@/lib/assistant/notes'
import { getTreatmentType, type UnitType } from '@/lib/assistant/treatment-types'
import { isSuppressed } from '@/lib/assistant/suppression'
import { recordMessage } from '@/lib/assistant/messages'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Same sender identity as the Broadcasts and Rebooker tools, so it matches.
const FROM_EMAIL =
  process.env.BROADCAST_FROM_EMAIL ?? 'Bernadette | Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Trust the write-up content but rebuild the email server-side so the body and
// subject are never taken straight from the client. The subject/body the
// clinician edited in the tool are accepted as overrides (they are the author),
// but the recipient is validated and suppression is always honoured.
function sanitiseInput(raw: unknown): WriteUpInput | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  const t = getTreatmentType(String(b.treatmentTypeId ?? ''))
  if (!t) return null
  return {
    clientName: String(b.clientName ?? '').trim().slice(0, 200),
    treatmentTypeId: t.id,
    date: String(b.date ?? '').slice(0, 10),
    product: '',
    batchNumber: '',
    expiry: '',
    areas: [],
    unit: t.unit as UnitType,
    technique: '',
    consent: false,
    reviewDate: '',
    notes: String(b.notes ?? '').trim().slice(0, 4000),
    interest: String(b.interest ?? '').trim().slice(0, 200),
  }
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Mail service not configured (RESEND_API_KEY missing). Copy the email instead.' },
      { status: 500 },
    )
  }

  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const input = sanitiseInput(parsed)
  if (!input || !input.clientName) {
    return NextResponse.json({ error: 'A client name and treatment type are required.' }, { status: 400 })
  }

  const b = parsed as Record<string, unknown>
  const to = String(b.to ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ error: 'No valid email address for this client.' }, { status: 422 })
  }
  if (await isSuppressed(input.clientName, to)) {
    return NextResponse.json({ error: 'This client is marked do-not-contact.' }, { status: 403 })
  }

  // Rebuild from the write-up, then let the clinician's edits stand as overrides.
  const built = buildClientEmail(input)
  const subject = (typeof b.subject === 'string' && b.subject.trim()
    ? b.subject
    : built.subject
  ).slice(0, 200)
  const body = (typeof b.body === 'string' && b.body.trim() ? b.body : built.body).slice(0, 8000)

  const resend = new Resend(apiKey)
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      replyTo: REPLY_TO,
      subject,
      html: buildBroadcastHtml({ headline: built.headline, body, cta: 'none', recipientEmail: to }),
      text: buildBroadcastText({ headline: built.headline, body, cta: 'none', recipientEmail: to }),
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    if (error) return NextResponse.json({ error: error.message || 'Send failed' }, { status: 502 })
    await recordMessage({ clientName: input.clientName, email: to, channel: 'email', kind: 'other', subject, body })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
