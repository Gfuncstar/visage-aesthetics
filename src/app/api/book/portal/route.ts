import { NextResponse } from 'next/server'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { readPortalToken } from '@/lib/booking-engine/portal-token'
import { londonToday } from '@/lib/booking-engine/time'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

type PortalBooking = {
  id: string
  serviceName: string
  serviceSlug: string | null
  startsAt: string
  status: string
  manageToken: string
  past: boolean
}

function tokenFrom(req: Request): string | null {
  return new URL(req.url).searchParams.get('token')
}

// Public (magic-link gated): everything a client booked, by email. The token in
// the link is the only key — no password. Returns each booking's manage link so
// the page can reuse the existing change/cancel flow.
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  const email = readPortalToken(tokenFrom(req))
  if (!email) return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 401 })

  try {
    const rows = await select<Booking>('bookings', {
      client_email: `ilike.${email}`,
      order: 'starts_at.desc',
      limit: 100,
    })
    const todayStart = `${londonToday()}T00:00:00.000Z`
    const bookings: PortalBooking[] = rows.map((b) => ({
      id: b.id,
      serviceName: b.service_name,
      serviceSlug: b.service_slug,
      startsAt: b.starts_at,
      status: b.status,
      manageToken: b.manage_token,
      past: b.starts_at < todayStart || b.status === 'completed',
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
  const email = readPortalToken(tokenFrom(req))
  if (!email) return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 401 })

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
