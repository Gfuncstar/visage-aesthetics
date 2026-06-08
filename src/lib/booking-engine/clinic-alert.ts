// Internal "new booking" alert to the clinic owner.
//
// The client already gets their own confirmation email at booking and a
// day-before reminder. This is the other side of that: a simple email letting
// the clinic owner know someone has booked, with the details.
//
// Web push already fires on every booking, but it only reaches a device that
// has installed the staff app and subscribed. Email is the reliable fallback,
// sent to the same CLINIC_EMAIL address the agent reports use. Best-effort:
// this never throws into the booking flow.

import { Resend } from 'resend'
import { londonParts, dayLabel, clockLabel } from './time'

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
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  const p = londonParts(new Date(input.startsAtIso))
  const when = `${dayLabel(p.dateStr)} at ${clockLabel(p.minutes)}`

  const lines = [
    `${input.clientName} has booked ${input.serviceName}.`,
    `When: ${when}`,
    input.clientPhone ? `Phone: ${input.clientPhone}` : null,
    input.clientEmail ? `Email: ${input.clientEmail}` : null,
    input.notes ? `Notes: ${input.notes}` : null,
  ].filter((l): l is string => l !== null)

  const text = lines.join('\n')
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F1B1A;">
    ${lines.map((l) => `<p style="margin:0 0 6px;">${escapeHtml(l)}</p>`).join('')}
  </div>`

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [CLINIC_EMAIL],
      // Replies go straight to the client when we have their address.
      replyTo: input.clientEmail || undefined,
      // The owner mostly glances at this in the inbox rather than opening it,
      // so the subject carries the lot: who, when, what, and a phone number.
      subject: [
        `New booking: ${input.clientName}`,
        when,
        input.serviceName,
        input.clientPhone || null,
      ].filter(Boolean).join(' · '),
      html,
      text,
    })
    return true
  } catch (err) {
    console.error('[clinic-alert] booking email failed', err)
    return false
  }
}
