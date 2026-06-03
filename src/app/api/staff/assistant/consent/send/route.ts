import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insert, audit } from '@/lib/assistant/db'
import { getConsentForm } from '@/lib/consent/forms'
import { isSuppressed } from '@/lib/assistant/suppression'
import { recordMessage } from '@/lib/assistant/messages'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SITE = 'https://www.vaclinic.co.uk'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FROM_EMAIL =
  process.env.BROADCAST_FROM_EMAIL ?? 'Bernadette | Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

// POST { formId, clientName, clientEmail, bookingId? } — send a consent form to
// a client outside the booking system (e.g. when it was not completed). Creates
// a tracked request and emails the client a secure link.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'The clinic database is not configured.' }, { status: 503 })
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Mail service not configured (RESEND_API_KEY missing).' }, { status: 500 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const form = getConsentForm(String(b.formId ?? ''))
  if (!form) return NextResponse.json({ error: 'Unknown consent form.' }, { status: 400 })
  const clientName = String(b.clientName ?? '').trim().slice(0, 200)
  const clientEmail = String(b.clientEmail ?? '').trim().toLowerCase().slice(0, 200)
  const bookingId = typeof b.bookingId === 'string' && b.bookingId ? b.bookingId : null
  if (!clientName) return NextResponse.json({ error: 'Please enter the client name.' }, { status: 400 })
  if (!EMAIL_RE.test(clientEmail)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  if (await isSuppressed(clientName, clientEmail)) {
    return NextResponse.json({ error: 'This client is marked do-not-contact.' }, { status: 403 })
  }

  try {
    const request = await insert<{ id: string; token: string }>('consent_requests', {
      form_id: form.id,
      form_name: form.name,
      client_name: clientName,
      client_email: clientEmail,
      booking_id: bookingId,
      status: 'sent',
    })

    const link = `${SITE}/consent/${request.token}`
    const headline = 'Your consent form'
    const emailBody = `Hi ${firstName(clientName)},

Please complete your ${form.name.replace(/ Consent Form$/i, '').trim()} consent form before your appointment. It only takes a couple of minutes.

[Complete your form here](${link})

If you have any questions, just reply to this email.`

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [clientEmail],
      replyTo: REPLY_TO,
      subject: `Your consent form for Visage Aesthetics`,
      html: buildBroadcastHtml({ headline, body: emailBody, cta: 'none', recipientEmail: clientEmail }),
      text: buildBroadcastText({ headline, body: emailBody, cta: 'none', recipientEmail: clientEmail }),
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    if (error) return NextResponse.json({ error: error.message || 'Send failed' }, { status: 502 })

    await recordMessage({ clientName, email: clientEmail, channel: 'email', kind: 'other', subject: 'Consent form', body: emailBody })
    await audit('send', 'consent_request', request.id, { form: form.id, email: clientEmail })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not send the form.' }, { status: 502 })
  }
}
