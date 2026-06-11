// Server-only: send a consent form to a client by email and record the request.
//
// Extracted from the staff "send consent" route so the same path can be used
// by the automated reminder cron (which sends the matching form 24h before an
// appointment if it hasn't been completed) and by staff sending one by hand.

import { Resend } from 'resend'
import { insert, audit } from '@/lib/assistant/db'
import type { ConsentForm } from './forms'
import { isSuppressed } from '@/lib/assistant/suppression'
import { recordMessage } from '@/lib/assistant/messages'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'

const SITE = 'https://www.vaclinic.co.uk'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FROM_EMAIL =
  process.env.BROADCAST_FROM_EMAIL ?? 'Bernadette | Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

export type ConsentSendResult =
  | { ok: true; link: string }
  | { ok: false; error: string; status: number }

// Send `form` to the client and create a tracked consent_requests row. Returns
// the secure link on success so staff can copy it as a fallback.
export async function sendConsentForm(opts: {
  form: ConsentForm
  clientName: string
  clientEmail: string
  bookingId?: string | null
}): Promise<ConsentSendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'Mail service not configured (RESEND_API_KEY missing).', status: 500 }

  const clientName = opts.clientName.trim().slice(0, 200)
  const clientEmail = opts.clientEmail.trim().toLowerCase().slice(0, 200)
  const bookingId = opts.bookingId ?? null
  if (!clientName) return { ok: false, error: 'Please enter the client name.', status: 400 }
  if (!EMAIL_RE.test(clientEmail)) return { ok: false, error: 'Please enter a valid email address.', status: 400 }
  if (await isSuppressed(clientName, clientEmail)) {
    return { ok: false, error: 'This client is marked do-not-contact.', status: 403 }
  }

  try {
    const request = await insert<{ id: string; token: string }>('consent_requests', {
      form_id: opts.form.id,
      form_name: opts.form.name,
      client_name: clientName,
      client_email: clientEmail,
      booking_id: bookingId,
      status: 'sent',
    })

    const link = `${SITE}/consent/${request.token}`
    const headline = 'Your consent form'
    const emailBody = `Hi ${firstName(clientName)},

Please complete your ${opts.form.name.replace(/ Consent Form$/i, '').trim()} consent form before your appointment. It only takes a couple of minutes.

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
    if (error) return { ok: false, error: error.message || 'Send failed', status: 502 }

    await recordMessage({ clientName, email: clientEmail, channel: 'email', kind: 'other', subject: 'Consent form', body: emailBody })
    await audit('send', 'consent_request', request.id, { form: opts.form.id, email: clientEmail })
    return { ok: true, link }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not send the form.', status: 502 }
  }
}
