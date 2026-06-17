// Opening windows: the set of time windows the clinic is open on each weekday.
// A day can have several (a daytime clinic plus an evening session, say). This
// is the source of truth for the booking engine and the Opening Hours editor.
//
// The legacy one-row-per-weekday `business_hours` table is kept in sync with
// each day's FIRST window (and its is_open flag), so the existing diary /
// reception / gap views keep working and never treat an inter-session gap as
// free time. Booking availability itself always uses the full window list.

import { select, insertMany, remove, update } from '../assistant/db'

export type OpeningWindow = { open_min: number; close_min: number }

type Row = { weekday: number; open_min: number; close_min: number }

function cleanWindows(windows: OpeningWindow[]): OpeningWindow[] {
  return windows
    .filter(
      (w) =>
        Number.isFinite(w.open_min) &&
        Number.isFinite(w.close_min) &&
        w.open_min >= 0 &&
        w.close_min <= 1440 &&
        w.close_min > w.open_min,
    )
    .sort((a, b) => a.open_min - b.open_min)
}

/** All opening windows, grouped by weekday and sorted by start time. */
export async function loadOpeningWindows(): Promise<Map<number, OpeningWindow[]>> {
  const rows = await select<Row>('opening_windows', { order: 'weekday.asc', limit: 500 })
  const map = new Map<number, OpeningWindow[]>()
  for (const r of rows) {
    const arr = map.get(r.weekday) ?? []
    arr.push({ open_min: r.open_min, close_min: r.close_min })
    map.set(r.weekday, arr)
  }
  for (const arr of map.values()) arr.sort((a, b) => a.open_min - b.open_min)
  return map
}

/** Opening windows for a single weekday (0=Sun..6=Sat), sorted by start time. */
export async function windowsForWeekday(weekday: number): Promise<OpeningWindow[]> {
  const rows = await select<Row>('opening_windows', {
    weekday: `eq.${weekday}`,
    order: 'open_min.asc',
    limit: 50,
  })
  return rows.map((r) => ({ open_min: r.open_min, close_min: r.close_min }))
}

/**
 * Replace a weekday's opening windows, and mirror the result into the legacy
 * business_hours row (is_open + first window). Pass an empty list to close it.
 */
export async function setWeekdayWindows(weekday: number, windows: OpeningWindow[]): Promise<void> {
  const clean = cleanWindows(windows)
  await remove('opening_windows', { weekday: String(weekday) })
  if (clean.length) {
    await insertMany(
      'opening_windows',
      clean.map((w) => ({ weekday, open_min: w.open_min, close_min: w.close_min })),
    )
  }
  await update('business_hours', { weekday: String(weekday) }, {
    is_open: clean.length > 0,
    open_min: clean[0]?.open_min ?? 600,
    close_min: clean[0]?.close_min ?? 1020,
  })
}
