// Free-slot finding for the squeeze-in tool. Works out the gaps in a day's
// diary so the assistant can suggest the best time for an ad-hoc request.

const TZ = 'Europe/London'
const DAY_START = 9 * 60 // 09:00
const DAY_END = 18 * 60 // 18:00

export type DayAppt = { starts_at: string | null; ends_at: string | null; status: string }

function localMinutes(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  return h * 60 + m
}

function fmt(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type Gap = { start: number; end: number }

/** Free gaps (in local minutes) on a day, given that day's appointments. */
export function freeGaps(appts: DayAppt[], minDuration = 30): Gap[] {
  const busy = appts
    .filter((a) => a.status !== 'cancelled' && a.starts_at)
    .map((a) => ({
      start: localMinutes(a.starts_at as string),
      end: a.ends_at ? localMinutes(a.ends_at) : localMinutes(a.starts_at as string) + 30,
    }))
    .sort((x, y) => x.start - y.start)

  const gaps: Gap[] = []
  let cursor = DAY_START
  for (const b of busy) {
    if (b.start > cursor) gaps.push({ start: cursor, end: Math.min(b.start, DAY_END) })
    cursor = Math.max(cursor, b.end)
  }
  if (cursor < DAY_END) gaps.push({ start: cursor, end: DAY_END })
  return gaps.filter((g) => g.end - g.start >= minDuration)
}

/** A short human description of the day's availability. */
export function describeAvailability(appts: DayAppt[], minDuration = 30): string {
  const booked = appts.filter((a) => a.status !== 'cancelled' && a.starts_at)
  if (booked.length === 0) return 'Day is wide open.'
  const gaps = freeGaps(appts, minDuration)
  if (gaps.length === 0) return 'Fully booked that day.'
  const parts = gaps.map((g) => `${fmt(g.start)}–${fmt(g.end)}`)
  return `Free: ${parts.join(', ')}`
}

/** The first free gap's start time on a day, in local minutes — the slot to offer. */
export function firstFreeStart(appts: DayAppt[], minDuration = 30): number | null {
  const gaps = freeGaps(appts, minDuration)
  return gaps.length ? gaps[0].start : null
}

/** A friendly clock time from local minutes, e.g. "1:00pm". */
export function friendlyTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

export { fmt as formatMinutes }
