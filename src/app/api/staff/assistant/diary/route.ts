import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, update, audit } from '@/lib/assistant/db'
import { getService } from '@/lib/booking-engine/availability'
import { londonWallToUtc, londonToday } from '@/lib/booking-engine/time'
import { mirrorBookingAppointment } from '@/lib/booking-engine/appointments-mirror'
import type { Booking, TimeOff, BusinessHours } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function dayBounds(dateStr: string): { start: string; end: string } {
  return { start: `${dateStr}T00:00:00Z`, end: `${dateStr}T23:59:59Z` }
}

// GET ?date=YYYY-MM-DD (single day) or ?from=&to= (range, e.g. a week) — the
// bookings and blocked time in that window.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ bookings: [], timeOff: [], configured: false })
  const params = new URL(req.url).searchParams
  const from = params.get('from') ?? params.get('date') ?? londonToday()
  const to = params.get('to') ?? params.get('date') ?? from
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) return NextResponse.json({ error: 'Bad date' }, { status: 400 })
  const start = dayBounds(from).start
  const end = dayBounds(to).end
  try {
    const [bookings, timeOff, waitlist, businessHours] = await Promise.all([
      select<Booking>('bookings', { and: `(starts_at.gte.${start},starts_at.lte.${end})`, order: 'starts_at.asc', limit: 200 }),
      select<TimeOff>('time_off', { and: `(starts_at.lte.${end},ends_at.gte.${start})`, order: 'starts_at.asc', limit: 100 }),
      select<Record<string, unknown>>('waitlist', { status: 'eq.waiting', order: 'created_at.asc', limit: 50 }),
      select<BusinessHours>('business_hours', { limit: 7 }),
    ])
    return NextResponse.json({ bookings, timeOff, waitlist, businessHours, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

// POST — create a staff booking, or block time.
//   { kind: 'booking', service, date, startMinutes, name, email?, phone?, notes? }
//   { kind: 'time_off', date, startMinutes, endMinutes, reason? }
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const date = String(body.date ?? '')
  if (!DATE_RE.test(date)) return NextResponse.json({ error: 'Bad date' }, { status: 400 })

  try {
    if (body.kind === 'time_off') {
      const startMin = Number(body.startMinutes)
      const endMin = Number(body.endMinutes)
      if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
        return NextResponse.json({ error: 'Bad time range' }, { status: 400 })
      }
      const row = await insert<TimeOff>('time_off', {
        starts_at: londonWallToUtc(date, startMin).toISOString(),
        ends_at: londonWallToUtc(date, endMin).toISOString(),
        reason: typeof body.reason === 'string' ? body.reason.slice(0, 200) : null,
      })
      await audit('create', 'time_off', row.id)
      return NextResponse.json({ ok: true })
    }

    // booking
    const slug = String(body.service ?? '')
    const startMin = Number(body.startMinutes)
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
    if (!slug || !Number.isFinite(startMin) || !name) {
      return NextResponse.json({ error: 'Service, time and name are required.' }, { status: 400 })
    }
    const service = await getService(slug)
    if (!service) return NextResponse.json({ error: 'Unknown service' }, { status: 404 })
    const startsAt = londonWallToUtc(date, startMin)
    const endsAt = londonWallToUtc(date, startMin + service.duration_min)
    const booking = await insert<Booking>('bookings', {
      service_id: service.id,
      service_name: service.name,
      service_slug: service.slug,
      client_name: name,
      client_email: typeof body.email === 'string' ? body.email.trim().slice(0, 160) || null : null,
      client_phone: typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) || null : null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'confirmed',
      notes: typeof body.notes === 'string' ? body.notes.slice(0, 600) || null : null,
      source: 'staff',
    })
    await audit('create', 'booking', booking.id, { source: 'staff' })
    await mirrorBookingAppointment({
      bookingId: booking.id,
      clientName: name,
      startsAt: startsAt.toISOString(),
      serviceName: service.name,
      status: 'confirmed',
      price: service.price_from,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}

// PATCH { kind: 'hours', weekday: 0-6, isOpen, openMin, closeMin }
export async function PATCH(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  if (body.kind !== 'hours') return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
  const weekday = Number(body.weekday)
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return NextResponse.json({ error: 'Bad weekday' }, { status: 400 })
  const isOpen = Boolean(body.isOpen)
  const patch: Record<string, unknown> = { is_open: isOpen }
  if (isOpen) {
    const openMin = Number(body.openMin)
    const closeMin = Number(body.closeMin)
    if (!Number.isFinite(openMin) || !Number.isFinite(closeMin) || openMin < 0 || closeMin > 1440 || closeMin <= openMin) {
      return NextResponse.json({ error: 'Bad times' }, { status: 400 })
    }
    patch.open_min = openMin
    patch.close_min = closeMin
  }
  await update('business_hours', { weekday: String(weekday) }, patch)
  return NextResponse.json({ ok: true })
}
