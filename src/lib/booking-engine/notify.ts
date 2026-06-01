// Transactional follow-ups for the booking engine: review requests, waitlist
// alerts, and the auto no-show deposit rule. SMS where possible, email as the
// fallback, and the do-not-contact marker is always honoured.

import { Resend } from 'resend'
import { select, update, insertMany, audit } from '../assistant/db'
import { sendSms, smsConfigured } from '../assistant/sms'
import { isSuppressed } from '../assistant/suppression'
import { normName } from './client-flags'
import type { Booking } from './types'

const SITE = 'https://www.vaclinic.co.uk'
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'
const REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL ??
  'https://www.google.com/search?q=Visage+Aesthetics+Braintree+reviews'
const NO_SHOW_LIMIT = 2

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

function resend(): Resend | null {
  const k = process.env.RESEND_API_KEY
  return k ? new Resend(k) : null
}

/** Text/email a short message to a client, honouring do-not-contact. SMS preferred. */
async function reach(
  booking: Pick<Booking, 'client_name' | 'client_email' | 'client_phone'>,
  text: string,
  subject: string,
): Promise<boolean> {
  if (await isSuppressed(booking.client_name, booking.client_email)) return false
  if (booking.client_phone && smsConfigured()) {
    if (await sendSms(booking.client_phone, text)) return true
  }
  const r = resend()
  if (booking.client_email && r) {
    try {
      await r.emails.send({ from: FROM_EMAIL, to: [booking.client_email], replyTo: REPLY_TO, subject, text })
      return true
    } catch (err) {
      console.error('[notify] email failed', err)
    }
  }
  return false
}

/** Ask a client for a Google review after a completed appointment (once). */
export async function sendReviewRequest(booking: Booking): Promise<void> {
  if (booking.review_requested_at) return
  const text = `Hi ${firstName(booking.client_name)}, thank you for visiting Visage Aesthetics. If you have a moment, a short Google review means a great deal: ${REVIEW_URL}`
  await reach(booking, text, 'Thank you from Visage Aesthetics')
  await update('bookings', { id: booking.id }, { review_requested_at: new Date().toISOString() })
}

/**
 * When an appointment is cancelled, alert clients waiting for that service that
 * a time has opened. Notifies up to a handful of the longest-waiting, once each.
 */
export async function notifyWaitlistForService(serviceSlug: string | null): Promise<number> {
  if (!serviceSlug) return 0
  const waiting = await select<{
    id: string
    client_name: string
    client_email: string | null
    client_phone: string | null
  }>('waitlist', { service_slug: `eq.${serviceSlug}`, status: 'eq.waiting', order: 'created_at.asc', limit: 5 })
  if (waiting.length === 0) return 0

  const text = `Good news from Visage Aesthetics: a time has just opened for your treatment. First to book keeps it: ${SITE}/book-online`
  let sent = 0
  for (const w of waiting) {
    const ok = await reach(
      { client_name: w.client_name, client_email: w.client_email, client_phone: w.client_phone },
      text,
      'A time has opened at Visage Aesthetics',
    )
    await update('waitlist', { id: w.id }, { status: 'notified', notified_at: new Date().toISOString() })
    if (ok) sent++
  }
  return sent
}

/**
 * After a no-show, if the client has now missed NO_SHOW_LIMIT or more
 * appointments, automatically require a deposit for future online bookings.
 */
export async function applyNoShowDeposit(booking: Booking): Promise<boolean> {
  const enc = booking.client_name.replace(/[%,()]/g, ' ')
  const noShows = await select<{ id: string }>('bookings', {
    client_name: `ilike.${enc}`,
    status: 'eq.no_show',
    limit: 10,
  })
  if (noShows.length < NO_SHOW_LIMIT) return false

  const normalised = normName(booking.client_name)
  const existing = await select<{ id: string }>('client_flags', { name_normalised: `eq.${normalised}`, limit: 1 })
  if (existing.length > 0) {
    await update('client_flags', { name_normalised: normalised }, { requires_deposit: true })
  } else {
    await insertMany(
      'client_flags',
      [{
        name_normalised: normalised,
        full_name: booking.client_name,
        email: booking.client_email?.toLowerCase() ?? null,
        phone: (booking.client_phone ?? '').replace(/\D/g, '') || null,
        requires_deposit: true,
        note: 'Auto: repeated no-shows',
      }],
      { onConflict: 'name_normalised' },
    )
  }
  await audit('update', 'client_flags', normalised, { requires_deposit: true, reason: 'auto-no-show' })
  return true
}
