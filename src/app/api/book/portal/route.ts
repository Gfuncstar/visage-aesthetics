import { NextResponse } from 'next/server'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { emailFromRequest } from '@/lib/account/session'
import { londonToday } from '@/lib/booking-engine/time'
import { consentFormForService } from '@/lib/consent/forms'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

type PortalBooking = {
  id: string
  serviceName: string
  serviceSlug: string | null
  startsAt: string
  endsAt: string | null
  status: string
  manageToken: string
  past: boolean
  needsConsent: boolean
}

// Public (session gated): everything a client booked, by email. The logged-in
// client's email comes from their signed session cookie. Returns each booking's
// manage link so the page can reuse the existing change/cancel flow, plus an
// end time (for calendar files) and whether a consent form is still outstanding.
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  const email = emailFromRequest(req)
  if (!email) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })

  try {
    const rows = await select<Booking>('bookings', {
      client_email: `ilike.${email}`,
      order: 'starts_at.desc',
      limit: 100,
    })
    const todayStart = `${londonToday()}T00:00:00.000Z`

    // Which upcoming bookings need a consent form that has not been submitted?
    // Only check live, future bookings whose service has a form on file.
    const upcomingNeedingForm = rows.filter(
      (b) =>
        b.starts_at >= todayStart &&
        b.status !== 'cancelled' &&
        b.status !== 'completed' &&
        consentFormForService(b.service_slug, b.service_name),
    )
    const consentDone = new Set<string>()
    if (upcomingNeedingForm.length > 0) {
      const ids = upcomingNeedingForm.map((b) => b.id).join(',')
      const subs = await select<{ booking_id: string | null }>('consent_submissions', {
        booking_id: `in.(${ids})`,
        select: 'booking_id',
        limit: 1000,
      }).catch(() => [])
      for (const s of subs) if (s.booking_id) consentDone.add(s.booking_id)
    }
    const needsFormIds = new Set(upcomingNeedingForm.filter((b) => !consentDone.has(b.id)).map((b) => b.id))

    const bookings: PortalBooking[] = rows.map((b) => ({
      id: b.id,
      serviceName: b.service_name,
      serviceSlug: b.service_slug,
      startsAt: b.starts_at,
      endsAt: b.ends_at ?? null,
      status: b.status,
      manageToken: b.manage_token,
      past: b.starts_at < todayStart || b.status === 'completed',
      needsConsent: needsFormIds.has(b.id),
    }))
    const latest = rows[0]
    return NextResponse.json({
      name: latest?.client_name ?? '',
      email,
      phone: latest?.client_phone ?? '',
      bookings,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

// Public (magic-link gated): update the client's contact phone. Updates their
// client record and any upcoming bookings so reminders use the new number.
export async function PATCH(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  const email = emailFromRequest(req)
  if (!email) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })

  let phone = ''
  try {
    const b = (await req.json()) as { phone?: unknown }
    if (typeof b.phone === 'string') phone = b.phone.trim().slice(0, 40)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    // Update the client record (best-effort; the row may not exist yet).
    await update('clients', { email }, { phone }).catch(() => {})

    // Update upcoming, live bookings so reminders use the new number.
    const todayStart = `${londonToday()}T00:00:00.000Z`
    const upcoming = await select<Booking>('bookings', {
      client_email: `ilike.${email}`,
      status: 'neq.cancelled',
      and: `(starts_at.gte.${todayStart})`,
      limit: 50,
    })
    for (const b of upcoming) {
      await update('bookings', { id: b.id }, { client_phone: phone }).catch(() => {})
    }
    await audit('update', 'client', undefined, { via: 'portal', field: 'phone' })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 502 })
  }
}
