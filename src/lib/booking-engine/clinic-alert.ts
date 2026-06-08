// Internal "new booking" alert to the clinic owner.
//
// The client already gets their own confirmation email at booking and a
// day-before reminder. This is the other side of that: telling the clinic
// owner a booking has just landed in the diary, on a channel that is always
// seen.
//
// Web push already fires on every booking, but it only reaches a device that
// has installed the staff app and subscribed. Email is the reliable fallback,
// sent to the same CLINIC_EMAIL address the agent reports use. Best-effort:
// this never throws into the booking flow.

import { Resend } from 'resend'
import { londonParts, dayLabel, clockLabel } from './time'

const SITE = 'https://www.vaclinic.co.uk'
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
// Owner-facing clinic alerts go here (same env the agent reports default to).
const CLINIC_EMAIL = process.env.CLINIC_EMAIL ?? 'ber.parsons@outlook.com'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:5px 14px 5px 0;color:#8A807D;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:5px 0;color:#1F1B1A;font-size:14px;font-weight:500;">${escapeHtml(value)}</td>
  </tr>`
}

/**
 * Email the clinic owner that a new booking has come in. Returns true if the
 * email was handed to Resend, false if email is not configured or send failed.
 */
export async function notifyClinicOfBooking(input: {
  clientName: string
  serviceName: string
  startsAtIso: string
  clientEmail?: string | null
  clientPhone?: string | null
  notes?: string | null
  source?: string | null
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  const p = londonParts(new Date(input.startsAtIso))
  const when = `${dayLabel(p.dateStr)} at ${clockLabel(p.minutes)}`
  const diaryUrl = `${SITE}/staff/assistant/diary`

  const textLines = [
    `${input.clientName} has booked ${input.serviceName}.`,
    '',
    `When: ${when}`,
    input.clientPhone ? `Phone: ${input.clientPhone}` : null,
    input.clientEmail ? `Email: ${input.clientEmail}` : null,
    input.notes ? `Notes: ${input.notes}` : null,
    input.source ? `Booked via: ${input.source}` : null,
    '',
    `Open the diary: ${diaryUrl}`,
  ].filter((l): l is string => l !== null)
  const text = textLines.join('\n')

  const detailRows = [
    row('Treatment', input.serviceName),
    row('When', when),
    input.clientPhone ? row('Phone', input.clientPhone) : '',
    input.clientEmail ? row('Email', input.clientEmail) : '',
    input.notes ? row('Notes', input.notes) : '',
    input.source ? row('Booked via', input.source) : '',
  ].join('')

  const html = `<div style="background:#F5F0EC;padding:28px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #D9CDBE;border-radius:8px;padding:28px;color:#1F1B1A;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#A8895E;margin-bottom:8px;">New booking</div>
      <h1 style="font-size:21px;font-weight:600;margin:0 0 18px;color:#1F1B1A;">${escapeHtml(input.clientName)}</h1>
      <table style="border-collapse:collapse;width:100%;margin-bottom:22px;">${detailRows}</table>
      <a href="${diaryUrl}" style="display:inline-block;background:#1F1B1A;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:500;padding:11px 20px;border-radius:5px;">Open the diary</a>
    </div>
  </div>`

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [CLINIC_EMAIL],
      // Replies go straight to the client when we have their address.
      replyTo: input.clientEmail || undefined,
      subject: `New booking: ${input.clientName}, ${input.serviceName}`,
      html,
      text,
    })
    return true
  } catch (err) {
    console.error('[clinic-alert] booking email failed', err)
    return false
  }
}
