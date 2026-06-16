// Sends the "please confirm you're coming" request for a single booking.
//
// Email is the primary channel (the branded HTML email carries a one-click
// "Confirm your appointment" button); if there's no email on file we fall back
// to an SMS carrying the same confirm link. Used both by the hourly reminder
// cron (24h before) and by the staff "message again" action on the
// confirmations page. Honours the do-not-contact marker. Never throws.

import { Resend } from 'resend'
import { appointmentConfirmEmail } from '@/lib/booking-email'
import { sendSms, smsConfigured } from '@/lib/assistant/sms'
import { recordMessage } from '@/lib/assistant/messages'
import { isSuppressed } from '@/lib/assistant/suppression'
import { londonParts, dayLabel, clockLabel } from './time'
import { withinChangeCutoff } from './policy'
import type { Booking } from './types'

const SITE = 'https://www.vaclinic.co.uk'
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

export type ConfirmRequestResult = { delivered: boolean; channel: 'email' | 'sms' | null; suppressed?: boolean }

export async function sendConfirmRequest(b: Booking): Promise<ConfirmRequestResult> {
  if (await isSuppressed(b.client_name, b.client_email)) {
    return { delivered: false, channel: null, suppressed: true }
  }

  const p = londonParts(new Date(b.starts_at))
  const when = `${dayLabel(p.dateStr)} at ${clockLabel(p.minutes)}`
  const first = b.client_name.trim().split(/\s+/)[0] || 'there'
  const confirmUrl = `${SITE}/book/confirm/${b.manage_token}`
  const manageUrl = `${SITE}/book/manage/${b.manage_token}`
  // More than 24h away → the client may still rearrange; inside 24h → confirm only.
  const allowRearrange = !withinChangeCutoff(b.starts_at)

  const apiKey = process.env.RESEND_API_KEY
  if (b.client_email && apiKey) {
    const mail = appointmentConfirmEmail({
      name: b.client_name,
      serviceName: b.service_name,
      startsAtIso: b.starts_at,
      manageToken: b.manage_token,
      allowRearrange,
    })
    try {
      await new Resend(apiKey).emails.send({
        from: FROM_EMAIL,
        to: [b.client_email],
        replyTo: REPLY_TO,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      })
      await recordMessage({ clientName: b.client_name, email: b.client_email, channel: 'email', kind: 'reminder', subject: mail.subject, body: mail.text, bookingId: b.id })
      return { delivered: true, channel: 'email' }
    } catch (err) {
      console.error('[confirm-request] email failed', err)
    }
  }

  if (b.client_phone && smsConfigured()) {
    const text = allowRearrange
      ? `Hi ${first}, a reminder of your ${b.service_name} at Visage Aesthetics on ${when}. Please confirm you're coming: ${confirmUrl} — to change it: ${manageUrl}`
      : `Hi ${first}, a reminder of your ${b.service_name} at Visage Aesthetics on ${when}. Please confirm you're coming: ${confirmUrl}. As it's within 24h this can't be changed online — call us if something's come up.`
    const ok = await sendSms(b.client_phone, text)
    if (ok) {
      await recordMessage({ clientName: b.client_name, phone: b.client_phone, channel: 'sms', kind: 'reminder', body: text, bookingId: b.id })
      return { delivered: true, channel: 'sms' }
    }
  }

  return { delivered: false, channel: null }
}
