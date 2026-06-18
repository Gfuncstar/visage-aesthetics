import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { getService, findClash } from '@/lib/booking-engine/availability'
import { londonWallToUtc, londonToday, clockLabel } from '@/lib/booking-engine/time'
import { mirrorBookingAppointment } from '@/lib/booking-engine/appointments-mirror'
import type { Booking, TimeOff, BusinessHours } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function dayBounds(dateStr: string): { start: string; end: string } {
  return { start: `${dateStr}T00:00:00Z`, end: `${dateStr}T23:59:59Z` }
}

// One stable identity per client so a returning face isn't flagged as new:
// email wins, then phone (digits only), then a normalised name.
function clientKey(b: { client_email?: string | null; client_phone?: string | null; client_name?: string | null }): string {
  const email = b.client_email?.trim().toLowerCase()
  if (email) return `e:${email}`
  const phone = b.client_phone?.replace(/\D/g, '')
  if (phone) return `p:${phone}`
  return `n:${(b.client_name ?? '').trim().toLowerCase()}`
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
    const [bookings, timeOff, waitlist, businessHours, priorClients] = await Promise.all([
      select<Booking>('bookings', { and: `(starts_at.gte.${start},starts_at.lte.${end})`, order: 'starts_at.asc', limit: 200 }),
      select<TimeOff>('time_off', { and: `(starts_at.lte.${end},ends_at.gte.${start})`, order: 'starts_at.asc', limit: 100 }),
      select<Record<string, unknown>>('waitlist', { status: 'eq.waiting', order: 'created_at.asc', limit: 50 }),
      select<BusinessHours>('business_hours', { limit: 7 }),
      // Every client we've seen before this window — used to mark first-timers.
      select<Pick<Booking, 'client_email' | 'client_phone' | 'client_name'>>('bookings', {
        select: 'client_email,client_phone,client_name', and: `(starts_at.lt.${start},status.neq.cancelled)`, limit: 5000,
      }),
    ])
    // A booking is the client's first visit if we've never seen that client
    // before this window and it's their earliest appointment within it. Match on
    // email, then phone, then name so the same person isn't flagged twice.
    const seen = new Set(priorClients.map(clientKey))
    const withNew = bookings.map((b) => {
      const key = clientKey(b)
      const isNew = b.status !== 'cancelled' && !seen.has(key)
      seen.add(key)
      return { ...b, is_new_client: isNew }
    })
    return NextResponse.json({ bookings: withNew, timeOff, waitlist, businessHours, configured: true })
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

    // Refuse a slot that already has someone in it. The public route gets this
    // for free via slot filtering; manual entries need it spelled out. A single
    // practitioner can't see two clients at once, so this is a hard stop (the DB
    // trigger enforces the same rule as a backstop) — pick another time.
    const clash = await findClash(startsAt.toISOString(), endsAt.toISOString())
    if (clash) {
      const who = clash.serviceName ? `${clash.clientName} (${clash.serviceName})` : clash.clientName
      return NextResponse.json(
        { error: `${clockLabel(startMin)} already has ${who} booked in — please pick another time.`, clash: true },
        { status: 409 },
      )
    }

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
