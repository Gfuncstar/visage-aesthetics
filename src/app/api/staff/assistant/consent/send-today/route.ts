import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { consentFormForService } from '@/lib/consent/forms'
import { consentChaseState } from '@/lib/assistant/consent'
import { sendConsentForm } from '@/lib/consent/send'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TZ = 'Europe/London'
const RECENTLY_SENT_MS = 60 * 60_000

function londonDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
}

// POST — send (or resend) the consent form to every still-upcoming appointment
// TODAY whose treatment needs one and which hasn't completed it yet. The staff
// "Send today's outstanding consent" button. Each client is emailed at most once
// per hour (a recently-sent form is left alone) so repeated clicks don't spam,
// and clients with no email on file are reported back so staff can chase them
// another way.
export async function POST() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const now = new Date()
  const horizon = new Date(now.getTime() + 24 * 3600_000)
  const today = londonDate(now)

  // Confirmed bookings from now to the next 24h, narrowed to those that fall on
  // today's London date — so "today" is correct regardless of server timezone.
  const upcoming = await select<Booking>('bookings', {
    status: 'eq.confirmed',
    and: `(starts_at.gte.${now.toISOString()},starts_at.lte.${horizon.toISOString()})`,
    order: 'starts_at.asc',
    limit: 200,
  })
  const todays = upcoming.filter((b) => londonDate(new Date(b.starts_at)) === today)

  const chase = await consentChaseState()

  let sent = 0
  let resent = 0
  let alreadyDone = 0
  let recentlySent = 0
  const noEmail: string[] = []

  for (const b of todays) {
    const form = consentFormForService(b.service_slug, b.service_name)
    if (!form) continue // treatment needs no form (e.g. a consultation)
    if (chase.doneBookingIds.has(b.id)) { alreadyDone++; continue }
    if (!b.client_email) { noEmail.push(b.client_name); continue }
    const prior = chase.sentByBooking.get(b.id)
    if (prior && now.getTime() - new Date(prior.lastSentAt).getTime() < RECENTLY_SENT_MS) { recentlySent++; continue }
    const res = await sendConsentForm({ form, clientName: b.client_name, clientEmail: b.client_email, bookingId: b.id })
    if (res.ok) { if (prior) resent++; else sent++ }
  }

  return NextResponse.json({ ok: true, sent, resent, alreadyDone, recentlySent, noEmail })
}
