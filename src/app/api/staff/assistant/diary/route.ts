import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { getService } from '@/lib/booking-engine/availability'
import { londonWallToUtc, londonToday } from '@/lib/booking-engine/time'
import { mirrorBookingAppointment } from '@/lib/booking-engine/appointments-mirror'
import type { Booking, TimeOff, BusinessHours } from '@/lib/booking-engine/types'
import type { Appointment } from '@/lib/assistant/types'
import { loadOpeningWindows, type OpeningWindow } from '@/lib/booking-engine/opening-hours'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TZ = 'Europe/London'
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// An email already on record for this client (their most recent booking, else
// an imported appointment), so an existing client never has to re-enter it.
async function emailOnFile(name: string): Promise<string | null> {
  const clean = name.trim()
  if (!clean) return null
  try {
    const b = await select<{ client_email: string | null }>('bookings', {
      client_name: `ilike.${clean}`,
      client_email: 'not.is.null',
      select: 'client_email',
      order: 'created_at.desc',
      limit: 1,
    })
    if (b[0]?.client_email) return b[0].client_email
    const a = await select<{ email: string | null }>('appointments', {
      client_name: `ilike.${clean}`,
      email: 'not.is.null',
      select: 'email',
      order: 'date.desc',
      limit: 1,
    })
    if (a[0]?.email) return a[0].email
  } catch {
    /* best-effort lookup; treat a failure as "none on file" */
  }
  return null
}

function dayBounds(dateStr: string): { start: string; end: string } {
  return { start: `${dateStr}T00:00:00Z`, end: `${dateStr}T23:59:59Z` }
}

// Names are how the whole app ties a client together (the client record matches
// appointments by name), so normalise the same way for the first-timer check.
function normName(name: string | null | undefined): string {
  return (name ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// The London calendar day an ISO instant falls on (YYYY-MM-DD), to compare
// against appointment dates which are already stored as plain calendar days.
function londonDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
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
    const [bookings, timeOff, waitlist, businessHours, windowMap, history, writeUps] = await Promise.all([
      select<Booking>('bookings', { and: `(starts_at.gte.${start},starts_at.lte.${end})`, order: 'starts_at.asc', limit: 200 }),
      select<TimeOff>('time_off', { and: `(starts_at.lte.${end},ends_at.gte.${start})`, order: 'starts_at.asc', limit: 100 }),
      select<Record<string, unknown>>('waitlist', { status: 'eq.waiting', order: 'created_at.asc', limit: 50 }),
      select<BusinessHours>('business_hours', { limit: 7 }),
      // Full opening-window list per weekday (a day can have several — a daytime
      // clinic plus an evening session). The diary's gap/free views and the
      // inline hours editor use this so split days display and edit correctly.
      loadOpeningWindows(),
      // The appointment history (Ovatu imports + mirrored bookings) is the app's
      // source of truth for who's been before — bookings alone would flag every
      // regular as new. We only need the earliest appointment date per client.
      select<Pick<Appointment, 'client_name' | 'date'>>('appointments', {
        select: 'client_name,date', order: 'date.asc', limit: 8000,
      }),
      // Clinical write-ups in this window, so a card ticks "notes done" whether
      // the note came from the Patient Notes form (sets bookings.notes_done) or
      // the Treatment write-up tool (a treatment_records row), matched by name+date.
      select<{ client_name: string; date: string }>('treatment_records', {
        and: `(date.gte.${from},date.lte.${to})`, select: 'client_name,date', limit: 1000,
      }),
    ])
    // Earliest appointment date we've ever recorded for each client (by name).
    const earliest = new Map<string, string>()
    for (const a of history) {
      const key = normName(a.client_name)
      if (!key || !a.date) continue
      const day = a.date.slice(0, 10)
      if (!earliest.has(key) || day < earliest.get(key)!) earliest.set(key, day)
    }
    // First-timer = no appointment on record before this booking's own day. Their
    // booking is mirrored into appointments at the same date, so a later booking
    // for the same person sees that earlier date and is no longer flagged — the
    // NEW badge lands only on a client's very first appointment.
    // A note is "done" for a visit when there is a write-up for that client on
    // that day, by either route. Key on name + calendar day.
    const writtenUp = new Set(writeUps.map((r) => `${(r.date ?? '').slice(0, 10)}|${normName(r.client_name)}`))
    const withNew = bookings.map((b) => {
      const prior = earliest.get(normName(b.client_name))
      const isNew = b.status !== 'cancelled' && (!prior || prior >= londonDate(b.starts_at))
      const notesDone = Boolean(b.notes_done) || writtenUp.has(`${londonDate(b.starts_at)}|${normName(b.client_name)}`)
      return { ...b, is_new_client: isNew, notes_done: notesDone }
    })
    // Plain object keyed by weekday for the client (Maps don't serialise).
    const windows: Record<number, OpeningWindow[]> = {}
    for (const [wd, list] of windowMap) windows[wd] = list
    return NextResponse.json({ bookings: withNew, timeOff, waitlist, businessHours, windows, configured: true })
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
    // Every new booking must reach the client by email (confirmations, aftercare).
    // Accept an email entered now, otherwise fall back to one already on file for
    // this client; reject only when there is neither.
    const typedEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 160) : ''
    let clientEmail = EMAIL_RE.test(typedEmail) ? typedEmail : ''
    if (!clientEmail) clientEmail = (await emailOnFile(name)) ?? ''
    if (!clientEmail) {
      return NextResponse.json(
        { error: 'An email is required for a new booking, and none is on file for this client.' },
        { status: 400 },
      )
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
      client_email: clientEmail,
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
