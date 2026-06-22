// Availability engine: turn opening hours, existing bookings and blocked time
// into the list of bookable slots for a given service on a given London day.

import { select } from '../assistant/db'
import { londonWallToUtc, londonParts, clockLabel, londonToday, TZ } from './time'
import type { Booking, Service, Slot, TimeOff } from './types'
import { loadOpeningWindows, windowsForWeekday, type OpeningWindow } from './opening-hours'

const STEP_MIN = 30 // slot granularity — clients can only start on the :00/:30 grid
const LEAD_MIN = 120 // earliest bookable lead time from now (2 hours)
// How far ahead the public diary opens. Kept generous (about ten months) so the
// calendar runs to the end of the year and beyond — clients can book months out,
// not just the next couple. The range is fetched in one batch (see
// availabilityCalendar), so a longer horizon does not cost more database load.
const MAX_ADVANCE_DAYS = 300

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

/** All active services in display order, including those not bookable online.
 *  Staff pickers (diary, reception) use this so they can book staff-only
 *  services — e.g. a follow-up Review — that clients can't self-book online. */
export async function listActiveServices(): Promise<Service[]> {
  return select<Service>('services', {
    active: 'eq.true',
    order: 'display_order.asc',
    limit: 100,
  })
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
 * Needs the day's opening windows, existing bookings and time-off (loaded by
 * the caller or by computeDay below). A day may have several windows (e.g. a
 * daytime clinic plus an evening session); each is walked in turn.
 */
export function slotsForDay(
  service: Service,
  dateStr: string,
  windows: OpeningWindow[],
  bookings: Booking[],
  timeOff: TimeOff[],
  now: Date,
  appts: ApptInterval[] = [],
): Slot[] {
  if (!windows || windows.length === 0) return []
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
  for (const w of windows) {
    for (let start = w.open_min; start + total <= w.close_min; start += STEP_MIN) {
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
  }
  return slots
}

/** Load everything needed and compute slots for one service + date. */
export async function computeDay(service: Service, dateStr: string): Promise<Slot[]> {
  const now = new Date()
  if (dateStr < londonToday()) return []
  const [windows, bookings, appts, timeOff] = await Promise.all([
    windowsForWeekday(weekdayOf(dateStr)),
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
  return slotsForDay(service, dateStr, windows, bookings, timeOff, now, appts)
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

/** Add n days to a YYYY-MM-DD string, returning YYYY-MM-DD (noon-anchored, DST-safe). */
function addDaysStr(fromStr: string, n: number): string {
  const d = new Date(`${fromStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * Day-by-day availability summary for a date range, used by the date picker to
 * grey out full / closed days. Returns a map of dateStr -> count of free slots.
 *
 * The whole window is loaded in one batch — opening hours (one row per weekday)
 * plus every booking, appointment and time-off touching the range — and each day
 * is then computed in memory. This keeps the database load flat (a handful of
 * queries) no matter how far ahead the calendar reaches.
 */
export async function availabilityCalendar(service: Service, fromStr: string, days: number): Promise<Record<string, number>> {
  const span = Math.min(Math.max(1, Math.floor(days)), MAX_ADVANCE_DAYS)
  const now = new Date()
  const today = londonToday()

  const rangeStartIso = dayStartIso(fromStr)
  const rangeEndIso = dayEndIso(addDaysStr(fromStr, span - 1))

  const [windowsByWeekday, bookings, appts, timeOff] = await Promise.all([
    loadOpeningWindows(),
    select<Booking>('bookings', {
      and: `(starts_at.gte.${rangeStartIso},starts_at.lt.${rangeEndIso})`,
      status: 'neq.cancelled',
      limit: 5000,
    }),
    // Ovatu diary safety net — booked appointments with a real time. Tolerant of
    // older databases without the time columns (returns nothing then).
    select<ApptInterval>('appointments', {
      select: 'starts_at,ends_at,status',
      and: `(starts_at.gte.${rangeStartIso},starts_at.lt.${rangeEndIso})`,
      status: 'eq.booked',
      limit: 5000,
    }).catch(() => [] as ApptInterval[]),
    select<TimeOff>('time_off', {
      and: `(starts_at.lt.${rangeEndIso},ends_at.gt.${rangeStartIso})`,
      limit: 1000,
    }),
  ])

  const out: Record<string, number> = {}
  for (let i = 0; i < span; i++) {
    const ds = addDaysStr(fromStr, i)
    if (ds < today) {
      out[ds] = 0
      continue
    }
    const windows = windowsByWeekday.get(weekdayOf(ds)) ?? []
    out[ds] = slotsForDay(service, ds, windows, bookings, timeOff, now, appts).length
  }
  return out
}

export { MAX_ADVANCE_DAYS, TZ }
