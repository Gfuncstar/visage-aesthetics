// Europe/London wall-clock helpers for the booking engine.
//
// Bookings are stored as UTC timestamptz. Opening hours and the diary are
// expressed in London wall time (which is GMT in winter, BST in summer). These
// helpers convert between the two without pulling in a date library, by asking
// Intl for the zone's offset at a given instant.

export const TZ = 'Europe/London'

/** Minutes that Europe/London is ahead of UTC at the given instant. */
export function tzOffsetMinutes(date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  let hour = Number(map.hour) % 24
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  )
  return Math.round((asUTC - date.getTime()) / 60000)
}

/** Convert a London wall time (date string YYYY-MM-DD + minutes from midnight) to a UTC Date. */
export function londonWallToUtc(dateStr: string, minutes: number): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d, 0, 0, 0) + minutes * 60000
  const offset = tzOffsetMinutes(new Date(guess))
  let utc = guess - offset * 60000
  // Refine once across a DST boundary.
  const offset2 = tzOffsetMinutes(new Date(utc))
  if (offset2 !== offset) utc = guess - offset2 * 60000
  return new Date(utc)
}

/** London weekday (0=Sun..6=Sat) and minutes-from-midnight for a UTC instant. */
export function londonParts(date: Date): { dateStr: string; weekday: number; minutes: number } {
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = dtf.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const hour = Number(map.hour) % 24
  return {
    dateStr: `${map.year}-${map.month}-${map.day}`,
    weekday: weekdays[map.weekday] ?? 0,
    minutes: hour * 60 + Number(map.minute),
  }
}

/** "1:30pm" from minutes-from-midnight. */
export function clockLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

/** London "Saturday 14 June" style label for a YYYY-MM-DD date. */
export function dayLabel(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateStr}T12:00:00Z`))
}

/** Today in London as YYYY-MM-DD. */
export function londonToday(): string {
  return londonParts(new Date()).dateStr
}

/** Add days to a YYYY-MM-DD string, returning YYYY-MM-DD. */
export function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
