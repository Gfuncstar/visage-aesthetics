import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update } from '@/lib/assistant/db'
import { sendConfirmRequest } from '@/lib/booking-engine/confirm-request'
import { smsConfigured } from '@/lib/assistant/sms'
import { consentFormForService } from '@/lib/consent/forms'
import { consentNamesOnFile } from '@/lib/assistant/consent'
import { sendConsentForm } from '@/lib/consent/send'
import { goLiveTimestamp } from '@/lib/assistant/go-live'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Only auto-send consent for bookings made on/after go-live, so Ovatu-era
// clients (consented on paper) aren't emailed a form. Matches the home page.
const CONSENT_ENFORCE_FROM = process.env.CONSENT_ENFORCE_FROM || goLiveTimestamp()
export const maxDuration = 60

// Sends the "please confirm you're coming" request for confirmed bookings
// starting in the next ~24h that have not been reminded yet. The client gets a
// branded email with a one-click "Confirm your appointment" button (or an SMS
// with the same link if there's no email on file). Called hourly by the
// scheduler with ?key=<push_cron_secret>, or by signed-in staff (?test=1
// reports the count).
//
// In the same pass it also sends the consent form for any booking due in the
// next 24h whose treatment needs one (e.g. Botox → Botox Consent Form) when the
// client hasn't already completed, been sent, or been waived one. Dedup is by
// the consent_requests row this creates, so nobody is emailed twice.
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

  const now = new Date()
  const windowEnd = new Date(now.getTime() + 24 * 3600_000)

  const due = await select<Booking>('bookings', {
    status: 'eq.confirmed',
    reminded_at: 'is.null',
    and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${windowEnd.toISOString()})`,
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
    and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${windowEnd.toISOString()},created_at.gte.${CONSENT_ENFORCE_FROM})`,
    order: 'starts_at.asc',
    limit: 200,
  })
  const onFile = await consentNamesOnFile()
  for (const b of consentDue) {
    if (!b.client_email) continue
    const form = consentFormForService(b.service_slug, b.service_name)
    if (!form) continue
    const key = b.client_name.trim().toLowerCase()
    if (onFile.has(key)) continue
    const res = await sendConsentForm({ form, clientName: b.client_name, clientEmail: b.client_email, bookingId: b.id })
    if (res.ok) {
      consent++
      // Guard against sending twice to the same client within this run (e.g.
      // two bookings); the consent_requests row covers future runs.
      onFile.add(key)
    }
  }

  return NextResponse.json({ ok: true, dueCount: due.length, sms, email, consent })
}
