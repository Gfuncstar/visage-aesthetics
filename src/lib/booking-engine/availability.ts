// Availability engine: turn opening hours, existing bookings and blocked time
// into the list of bookable slots for a given service on a given London day.

import { select } from '../assistant/db'
import { londonWallToUtc, londonParts, clockLabel, londonToday, TZ } from './time'
import type { BusinessHours, Booking, Service, Slot, TimeOff } from './types'

const STEP_MIN = 15 // slot granularity
const LEAD_MIN = 120 // earliest bookable lead time from now (2 hours)
const MAX_ADVANCE_DAYS = 90

type Interval = { start: number; end: number } // minutes from midnight (London)

/** Load a single active service by slug. */
export async function getService(slug: string): Promise<Service | null> {
  const rows = await select<Service>('services', { slug: `eq.${slug}`, active: 'eq.true', limit: 1 })
  return rows[0] ?? null
}

/** All active, online-bookable services in display order. */
export async function listBookableServices(): Promise<Service[]> {
  return select<Service>('services', {
    active: 'eq.true',
    online_bookable: 'eq.true',
    order: 'display_order.asc',
    limit: 100,
  })
}

export type Clash = { clientName: string; startsAt: string; serviceName: string | null }

/**
 * The first active booking or booked Ovatu appointment overlapping
 * [startsAtIso, endsAtIso), or null when the slot is free.
 *
 * The public online route filters slots before booking, but the staff diary and
 * the Ovatu sync write straight to `bookings`, so they need an explicit clash
 * check — otherwise two different clients can land on one slot.
 */
export async function findClash(startsAtIso: string, endsAtIso: string): Promise<Clash | null> {
  const overlap = `starts_at.lt.${endsAtIso},ends_at.gt.${startsAtIso}`
  const [bookings, appts] = await Promise.all([
    select<Booking>('bookings', {
      and: `(${overlap},status.neq.cancelled)`,
      order: 'starts_at.asc',
      limit: 1,
    }),
    select<{ client_name: string | null; starts_at: string | null; service_name: string | null }>('appointments', {
      select: 'client_name,starts_at,service_name,status',
      and: `(${overlap},status.eq.booked)`,
      order: 'starts_at.asc',
      limit: 1,
    }).catch(() => [] as { client_name: string | null; starts_at: string | null; service_name: string | null }[]),
  ])
  const b = bookings[0]
  if (b) return { clientName: b.client_name, startsAt: b.starts_at, serviceName: b.service_name }
  const a = appts[0]
  if (a?.starts_at) return { clientName: a.client_name ?? 'an existing appointment', startsAt: a.starts_at, serviceName: a.service_name }
  return null
}

function busyFromBookings(bookings: Booking[], dateStr: string): Interval[] {
  const out: Interval[] = []
  for (const b of bookings) {
    if (b.status === 'cancelled') continue
    const s = londonParts(new Date(b.starts_at))
    const e = londonParts(new Date(b.ends_at))
    // Only the portion that falls on this day matters.
    const start = s.dateStr === dateStr ? s.minutes : 0
    const end = e.dateStr === dateStr ? e.minutes : 24 * 60
    if (s.dateStr === dateStr || e.dateStr === dateStr) out.push({ start, end })
  }
  return out
}

// During (and after) the Ovatu cutover the diary of record is `appointments`.
// Native bookings mirror into it, but Ovatu-origin appointments may exist there
// without a matching `bookings` row if a migration missed them. Treat any
// booked appointment with a real start/end as busy too, so we never offer a
// slot that is already taken in the Ovatu diary. Cancelled / no-show and
// time-less rows are ignored; double-counting a mirrored booking is harmless.
type ApptInterval = { starts_at: string | null; ends_at: string | null; status: string }

function busyFromAppointments(appts: ApptInterval[], dateStr: string): Interval[] {
  const out: Interval[] = []
  for (const a of appts) {
    if (!a.starts_at || !a.ends_at) continue
    if (a.status === 'cancelled' || a.status === 'no_show') continue
    const s = londonParts(new Date(a.starts_at))
    const e = londonParts(new Date(a.ends_at))
    const start = s.dateStr === dateStr ? s.minutes : 0
    const end = e.dateStr === dateStr ? e.minutes : 24 * 60
    if (s.dateStr === dateStr || e.dateStr === dateStr) out.push({ start, end })
  }
  return out
}

function busyFromTimeOff(timeOff: TimeOff[], dateStr: string): Interval[] {
  const out: Interval[] = []
  for (const t of timeOff) {
    const s = londonParts(new Date(t.starts_at))
    const e = londonParts(new Date(t.ends_at))
    if (s.dateStr === dateStr || e.dateStr === dateStr || (s.dateStr < dateStr && e.dateStr > dateStr)) {
      const start = s.dateStr === dateStr ? s.minutes : 0
      const end = e.dateStr === dateStr ? e.minutes : 24 * 60
      out.push({ start, end })
    }
  }
  return out
}

function overlaps(aStart: number, aEnd: number, busy: Interval[]): boolean {
  return busy.some((b) => aStart < b.end && aEnd > b.start)
}

/**
 * Compute bookable slots for a service on a London date (YYYY-MM-DD).
 * Needs the day's hours, existing bookings and time-off (loaded by the caller
 * or by computeDay below).
 */
export function slotsForDay(
  service: Service,
  dateStr: string,
  hours: BusinessHours | undefined,
  bookings: Booking[],
  timeOff: TimeOff[],
  now: Date,
  appts: ApptInterval[] = [],
): Slot[] {
  if (!hours || !hours.is_open) return []
  const total = service.duration_min + service.buffer_min
  const busy = [
    ...busyFromBookings(bookings, dateStr),
    ...busyFromAppointments(appts, dateStr),
    ...busyFromTimeOff(timeOff, dateStr),
  ]

  // Earliest allowed start (lead time), in London minutes for this date.
  const nowParts = londonParts(now)
  const isToday = nowParts.dateStr === dateStr
  const earliest = isToday ? nowParts.minutes + LEAD_MIN : 0

  const slots: Slot[] = []
  for (let start = hours.open_min; start + total <= hours.close_min; start += STEP_MIN) {
    if (start < earliest) continue
    const end = start + total
    if (overlaps(start, end, busy)) continue
    const startsAt = londonWallToUtc(dateStr, start)
    const endsAt = londonWallToUtc(dateStr, start + service.duration_min)
    slots.push({
      startMinutes: start,
      startsAtIso: startsAt.toISOString(),
      endsAtIso: endsAt.toISOString(),
      label: clockLabel(start),
    })
  }
  return slots
}

/** Load everything needed and compute slots for one service + date. */
export async function computeDay(service: Service, dateStr: string): Promise<Slot[]> {
  const now = new Date()
  if (dateStr < londonToday()) return []
  const [hoursRows, bookings, appts, timeOff] = await Promise.all([
    select<BusinessHours>('business_hours', { weekday: `eq.${weekdayOf(dateStr)}`, limit: 1 }),
    select<Booking>('bookings', {
      and: `(starts_at.gte.${dayStartIso(dateStr)},starts_at.lt.${dayEndIso(dateStr)})`,
      status: 'neq.cancelled',
      limit: 200,
    }),
    // Ovatu diary safety net — booked appointments with a real time. Tolerant of
    // older databases without the time columns (returns nothing then).
    select<ApptInterval>('appointments', {
      select: 'starts_at,ends_at,status',
      and: `(starts_at.gte.${dayStartIso(dateStr)},starts_at.lt.${dayEndIso(dateStr)})`,
      status: 'eq.booked',
      limit: 200,
    }).catch(() => [] as ApptInterval[]),
    select<TimeOff>('time_off', {
      and: `(starts_at.lt.${dayEndIso(dateStr)},ends_at.gt.${dayStartIso(dateStr)})`,
      limit: 100,
    }),
  ])
  return slotsForDay(service, dateStr, hoursRows[0], bookings, timeOff, now, appts)
}

/** Which London weekday a date falls on. */
function weekdayOf(dateStr: string): number {
  return londonParts(new Date(`${dateStr}T12:00:00Z`)).weekday
}

// Generous UTC bounds for a London day (covers the +/- 1h DST offset).
function dayStartIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toISOString()
}
function dayEndIso(dateStr: string): string {
  return new Date(`${dateStr}T23:59:59Z`).toISOString()
}

/**
 * Day-by-day availability summary for a date range, used by the date picker to
 * grey out full / closed days. Returns a map of dateStr -> count of free slots.
 */
export async function availabilityCalendar(service: Service, fromStr: string, days: number): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  const tasks: Promise<void>[] = []
  for (let i = 0; i < Math.min(days, MAX_ADVANCE_DAYS); i++) {
    const d = new Date(`${fromStr}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + i)
    const ds = d.toISOString().slice(0, 10)
    tasks.push(computeDay(service, ds).then((slots) => { out[ds] = slots.length }))
  }
  await Promise.all(tasks)
  return out
}

export { MAX_ADVANCE_DAYS, TZ }
