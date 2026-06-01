// Transactional follow-ups for the booking engine: review requests, waitlist
// alerts, and the auto no-show deposit rule. SMS where possible, email as the
// fallback, and the do-not-contact marker is always honoured.

import { Resend } from 'resend'
import { select, update, insertMany, audit } from '../assistant/db'
import { sendSms, smsConfigured } from '../assistant/sms'
import { isSuppressed } from '../assistant/suppression'
import { recordMessage, type MessageKind } from '../assistant/messages'
import { matchTreatmentType } from '../assistant/treatment-types'
import { dueRebookings } from '../assistant/rebook'
import { londonParts, dayLabel, clockLabel } from './time'
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
  kind: MessageKind,
): Promise<boolean> {
  if (await isSuppressed(booking.client_name, booking.client_email)) return false
  if (booking.client_phone && smsConfigured()) {
    if (await sendSms(booking.client_phone, text)) {
      await recordMessage({ clientName: booking.client_name, phone: booking.client_phone, channel: 'sms', kind, body: text })
      return true
    }
  }
  const r = resend()
  if (booking.client_email && r) {
    try {
      await r.emails.send({ from: FROM_EMAIL, to: [booking.client_email], replyTo: REPLY_TO, subject, text })
      await recordMessage({ clientName: booking.client_name, email: booking.client_email, channel: 'email', kind, subject, body: text })
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
  await reach(booking, text, 'Thank you from Visage Aesthetics', 'review')
  await update('bookings', { id: booking.id }, { review_requested_at: new Date().toISOString() })
}

const GAP_FILL_LIMIT = 6

/**
 * When an appointment is freed (cancellation or reschedule), fill the gap:
 * text the specific opening to the best-matched clients. That means the people
 * waitlisted for this treatment first, then clients who are due back for the
 * same treatment, longest-waiting / most-overdue first, once each.
 */
export async function fillGap(slot: {
  service_slug: string | null
  service_name: string
  starts_at: string
  client_name: string
}): Promise<number> {
  const p = londonParts(new Date(slot.starts_at))
  const when = `${dayLabel(p.dateStr)} at ${clockLabel(p.minutes)}`
  const text = `Good news from Visage Aesthetics: ${slot.service_name} on ${when} has just come free. First to book keeps it: ${SITE}/book-online`
  const subject = `A ${slot.service_name} appointment has opened`

  const skip = new Set<string>([normName(slot.client_name)])
  const seen = new Set<string>()
  let sent = 0

  // 1) Waitlist for this exact service (and mark them notified).
  if (slot.service_slug) {
    const waiting = await select<{ id: string; client_name: string; client_email: string | null; client_phone: string | null }>(
      'waitlist',
      { service_slug: `eq.${slot.service_slug}`, status: 'eq.waiting', order: 'created_at.asc', limit: GAP_FILL_LIMIT },
    )
    for (const w of waiting) {
      const key = normName(w.client_name)
      if (skip.has(key) || seen.has(key)) continue
      seen.add(key)
      const ok = await reach({ client_name: w.client_name, client_email: w.client_email, client_phone: w.client_phone }, text, subject, 'waitlist')
      await update('waitlist', { id: w.id }, { status: 'notified', notified_at: new Date().toISOString() })
      if (ok) sent++
    }
  }

  // 2) Clients due back for the same treatment, to top up the offer.
  const group = matchTreatmentType(slot.service_name)
  if (group && sent < GAP_FILL_LIMIT) {
    const due = (await dueRebookings().catch(() => [])).filter((d) => d.treatmentGroup === group)
    for (const d of due) {
      if (seen.size >= GAP_FILL_LIMIT) break
      const key = normName(d.clientName)
      if (skip.has(key) || seen.has(key)) continue
      seen.add(key)
      const ok = await reach({ client_name: d.clientName, client_email: d.email, client_phone: d.phone }, text, subject, 'waitlist')
      if (ok) sent++
    }
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
