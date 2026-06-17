// End-of-day summary: who was seen today and who still needs writing up.
// Read server-side and shown as a nudge on the Assistant landing page.

import { select } from './db'
import { goLiveDate } from './go-live'
import { dismissalKey } from './writeup-dismissals'

type ApptRow = { client_name: string; service_name: string; starts_at: string | null; date: string }
type RecRow = { client_name: string; date: string }
type ReqRow = { id: string }

export type OverdueWriteUp = { name: string; service: string; date: string; daysAgo: number }

export type EndOfDay = {
  seen: number
  written: number
  toWrite: { name: string; service: string }[]
  squeezeIns: number
  /** Appointments more than 24h ago that still have no write-up, oldest first. */
  overdue: OverdueWriteUp[]
}

// How far back to chase missing write-ups.
const OVERDUE_WINDOW_DAYS = 14

// Go-live baseline: visits before this date are NOT chased as overdue, so the
// imported back-history doesn't all show up as missing write-ups. Driven by the
// shared GO_LIVE_DATE so a system switch resets this feed with everything else
// (see go-live.ts). WRITEUP_OVERDUE_SINCE overrides it for a one-off if needed.
const OVERDUE_SINCE = process.env.WRITEUP_OVERDUE_SINCE || goLiveDate()

const DAY_MS = 24 * 60 * 60 * 1000

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10)
}

// One key per client per day, so a write-up dated the same day as the visit
// counts as "done" for that visit.
function visitKey(name: string, date: string): string {
  return `${date}|${name.trim().toLowerCase()}`
}

export async function endOfDaySummary(): Promise<EndOfDay | null> {
  const today = new Date().toISOString().slice(0, 10)
  // Chase the last OVERDUE_WINDOW_DAYS, but never earlier than the go-live date.
  const windowStart = isoDaysAgo(OVERDUE_WINDOW_DAYS)
  const since = OVERDUE_SINCE > windowStart ? OVERDUE_SINCE : windowStart
  try {
    const [appts, records, requests, windowAppts, windowRecords, dismissedRows] = await Promise.all([
      select<ApptRow>('appointments', {
        date: `eq.${today}`,
        status: 'neq.cancelled',
        order: 'starts_at.asc',
        select: 'client_name,service_name,starts_at,date',
        limit: 100,
      }),
      select<RecRow>('treatment_records', { date: `eq.${today}`, select: 'client_name,date', limit: 200 }),
      select<ReqRow>('booking_requests', { status: 'eq.to_book', select: 'id', limit: 100 }),
      select<ApptRow>('appointments', {
        and: `(date.gte.${since},date.lt.${today},status.neq.cancelled)`,
        order: 'date.asc',
        select: 'client_name,service_name,starts_at,date',
        limit: 300,
      }),
      select<RecRow>('treatment_records', {
        date: `gte.${since}`,
        select: 'client_name,date',
        limit: 500,
      }),
      // Reminders the clinician has explicitly dismissed — never chase these
      // again. Resilient so a read failure can't blank the whole summary.
      select<{ visit_key: string }>('writeup_dismissals', { select: 'visit_key', limit: 2000 }).catch(
        () => [] as { visit_key: string }[],
      ),
    ])

    const dismissed = new Set(dismissedRows.map((d) => d.visit_key))

    // Overdue: visits before today, in the window, with no matching write-up.
    // (Anything within the last 24h — i.e. today — is handled by toWrite, not here.)
    const writtenWindow = new Set(windowRecords.map((r) => visitKey(r.client_name ?? '', r.date)))
    const overdueSeen = new Set<string>()
    const overdue: OverdueWriteUp[] = []
    for (const a of windowAppts) {
      const name = (a.client_name ?? '').trim()
      if (!name) continue
      const key = visitKey(name, a.date)
      if (writtenWindow.has(key) || overdueSeen.has(key) || dismissed.has(key)) continue
      overdueSeen.add(key)
      const daysAgo = Math.max(1, Math.round((new Date(`${today}T00:00:00`).getTime() - new Date(`${a.date}T00:00:00`).getTime()) / DAY_MS))
      overdue.push({ name, service: a.service_name || 'Appointment', date: a.date, daysAgo })
    }

    if (appts.length === 0) {
      return { seen: 0, written: 0, toWrite: [], squeezeIns: requests.length, overdue }
    }

    const written = new Set(records.map((r) => (r.client_name ?? '').trim().toLowerCase()).filter(Boolean))

    // One entry per client (a visit may span several services).
    const byName = new Map<string, string>()
    for (const a of appts) {
      const name = (a.client_name ?? '').trim()
      if (name && !byName.has(name)) byName.set(name, a.service_name || 'Appointment')
    }

    const toWrite: { name: string; service: string }[] = []
    for (const [name, service] of byName) {
      if (written.has(name.toLowerCase())) continue
      if (dismissed.has(dismissalKey(name, today))) continue
      toWrite.push({ name, service })
    }

    return {
      seen: byName.size,
      written: byName.size - toWrite.length,
      toWrite,
      squeezeIns: requests.length,
      overdue,
    }
  } catch {
    return null
  }
}
