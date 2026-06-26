import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update } from '@/lib/assistant/db'
import { sendConfirmRequest } from '@/lib/booking-engine/confirm-request'
import { smsConfigured } from '@/lib/assistant/sms'
import { consentFormForService } from '@/lib/consent/forms'
import { consentBookingIdsOnFile, consentChaseState } from '@/lib/assistant/consent'
import { sendConsentForm } from '@/lib/consent/send'
import { goLiveTimestamp } from '@/lib/assistant/go-live'
import { withHeartbeat } from '@/lib/assistant/heartbeat'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Only auto-send consent for bookings made on/after go-live, so Ovatu-era
// clients (consented on paper) aren't emailed a form. Matches the home page.
const CONSENT_ENFORCE_FROM = process.env.CONSENT_ENFORCE_FROM || goLiveTimestamp()
export const maxDuration = 60

// Sends the "please confirm you're coming" request for confirmed bookings
// starting in the next ~48h that have not been reminded yet. 48h is well outside
// the 24-hour change cut-off, so this single reminder can still offer Confirm and
// Rearrange. The client gets a branded email with one-click buttons (or an SMS
// with the same links if there's no email on file). Called hourly by the
// scheduler with ?key=<push_cron_secret>, or by signed-in staff (?test=1
// reports the count).
//
// In the same pass it also sends the consent form for any booking due in the
// next 24h whose treatment needs one (e.g. Botox → Botox Consent Form) when the
// client hasn't already completed, been sent, or been waived one. Dedup is by
// the consent_requests row this creates, so nobody is emailed twice.
//
// Finally it runs a 4h "please complete" resend: any booking now within 4h whose
// form was sent but still isn't filled in gets one more nudge (sent at most
// once — see the resend pass below).
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  const isStaff = await isStaffAuthed()

  // Vercel cron calls this with an Authorization: Bearer <CRON_SECRET> header
  // (same pattern as the agent crons). Also accept the app_config push secret
  // via ?key=, or a signed-in staff session.
  const cronSecret = process.env.CRON_SECRET
  const bearerOk = Boolean(cronSecret) && req.headers.get('authorization') === `Bearer ${cronSecret}`

  let secretOk = false
  try {
    const rows = await select<{ value: string }>('app_config', { key: 'eq.push_cron_secret', limit: 1 })
    secretOk = Boolean(rows[0]?.value) && key === rows[0].value
  } catch {
    /* ignore */
  }
  if (!bearerOk && !secretOk && !isStaff) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  return withHeartbeat('book-reminders', async () => {
  const now = new Date()
  // The "please confirm your appointment" email goes out ~48 hours before the
  // appointment: a single reminder, sent well outside the 24-hour change cut-off
  // so the client can still confirm or rearrange. The cron runs hourly, so a
  // booking is picked up on the first run once it is inside the 48h window
  // (i.e. ~47–48h before the start).
  const reminderWindowEnd = new Date(now.getTime() + 48 * 3600_000)
  // Consent forms keep their own 24h send window (the pass further below).
  const consentWindowEnd = new Date(now.getTime() + 24 * 3600_000)

  // The single "please confirm" pass: confirmed bookings starting within the next
  // ~48h that have not been reminded yet. sendConfirmRequest decides confirm-only
  // vs confirm+rearrange from how far out the booking is — at ~48h it is outside
  // the cut-off, so the Rearrange button is included.
  const due = await select<Booking>('bookings', {
    status: 'eq.confirmed',
    reminded_at: 'is.null',
    and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${reminderWindowEnd.toISOString()})`,
    order: 'starts_at.asc',
    limit: 200,
  })

  if (url.searchParams.get('test') === '1' && isStaff) {
    return NextResponse.json({ ok: true, test: true, dueCount: due.length, smsConfigured: smsConfigured() })
  }

  let sms = 0
  let email = 0

  for (const b of due) {
    const result = await sendConfirmRequest(b)
    if (result.channel === 'sms') sms++
    if (result.channel === 'email') email++

    // Only mark reminded if a message was actually sent — don't silently
    // swallow the slot for bookings with no contact on file.
    if (result.channel) {
      await update('bookings', { id: b.id }, { reminded_at: now.toISOString() })
    }
  }

  // Consent forms — send the matching form to anyone due in the next 24h who
  // needs one and hasn't completed (or already been sent) it. Evaluated
  // independently of the confirmation reminder (no reminded_at filter) so a
  // booking confirmed earlier still gets its consent form.
  let consent = 0
  const consentDue = await select<Booking>('bookings', {
    status: 'eq.confirmed',
    and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${consentWindowEnd.toISOString()},created_at.gte.${CONSENT_ENFORCE_FROM})`,
    order: 'starts_at.asc',
    limit: 200,
  })
  // Per treatment: send if THIS booking has no consent yet, even for returning
  // clients who consented for an earlier visit.
  const onFile = await consentBookingIdsOnFile()
  for (const b of consentDue) {
    if (!b.client_email) continue
    const form = consentFormForService(b.service_slug, b.service_name)
    if (!form) continue
    if (onFile.has(b.id)) continue
    const res = await sendConsentForm({ form, clientName: b.client_name, clientEmail: b.client_email, bookingId: b.id })
    if (res.ok) {
      consent++
      onFile.add(b.id)
    }
  }

  // Consent resend — 4h before the appointment, chase anyone who was sent a
  // consent form but still hasn't completed it, so a forgotten form gets one
  // last nudge in time to fill in. Sent at most once: we only resend when there
  // is a single outstanding 'sent' request that's over an hour old, so we never
  // double up on a form just sent (including one sent moments ago by the 24h
  // pass above) and never email again after this one chase. The fresh link from
  // sendConsentForm supersedes the first; completing either clears both (see the
  // consent submission handler), so nothing lingers on the outstanding list.
  let consentResent = 0
  const resendBy = new Date(now.getTime() + 4 * 3600_000)
  const resendDue = await select<Booking>('bookings', {
    status: 'eq.confirmed',
    and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${resendBy.toISOString()},created_at.gte.${CONSENT_ENFORCE_FROM})`,
    order: 'starts_at.asc',
    limit: 200,
  })
  const chase = await consentChaseState()
  const RESEND_MIN_AGE_MS = 60 * 60_000
  for (const b of resendDue) {
    if (!b.client_email) continue
    const form = consentFormForService(b.service_slug, b.service_name)
    if (!form) continue
    if (chase.doneBookingIds.has(b.id)) continue
    const sent = chase.sentByBooking.get(b.id)
    if (!sent || sent.count >= 2) continue
    if (now.getTime() - new Date(sent.lastSentAt).getTime() < RESEND_MIN_AGE_MS) continue
    const res = await sendConsentForm({ form, clientName: b.client_name, clientEmail: b.client_email, bookingId: b.id })
    if (res.ok) consentResent++
  }

  return NextResponse.json({ ok: true, dueCount: due.length, sms, email, consent, consentResent })
  })
}
