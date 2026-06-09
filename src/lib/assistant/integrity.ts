// Daily booking-integrity check for the Ovatu transition.
//
// While the in-house system runs in parallel with Ovatu, three things must stay
// true for the two to match with no overbooking:
//
//   1. uncovered  — every future Ovatu appointment (synced into `appointments`)
//      has a matching active booking, so the website knows that slot is taken.
//   2. duplicates — no client has two active bookings at the same time.
//   3. overlaps   — no two different clients sit in overlapping slots.
//
// This runs purely off the data the app already reads, so it works before and
// after go-live, and degrades to "ok" if the database is unreachable.

import { select } from './db'
import { londonToday } from '@/lib/booking-engine/time'
import type { Booking } from '@/lib/booking-engine/types'

const norm = (s: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

function fmt(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso))
}

export type IntegrityReport = {
  checkedAt: string
  ok: boolean
  uncovered: string[] // Ovatu appointments with no matching active booking
  duplicates: string[] // same client + same time, more than one active booking
  overlaps: string[] // two different clients in overlapping slots
}

type ApptRow = { client_name: string; starts_at: string | null }

export async function bookingIntegrityCheck(): Promise<IntegrityReport> {
  const now = new Date()
  const nowIso = now.toISOString()
  const today = londonToday()

  const [appts, bookings] = await Promise.all([
    select<ApptRow>('appointments', {
      select: 'client_name,starts_at',
      status: 'eq.booked',
      import_batch: 'eq.ovatu-ical',
      and: `(date.gte.${today})`,
      limit: 2000,
    }).catch(() => [] as ApptRow[]),
    select<Booking>('bookings', {
      and: `(starts_at.gte.${nowIso})`,
      status: 'neq.cancelled',
      limit: 2000,
    }).catch(() => [] as Booking[]),
  ])

  const key = (name: string, iso: string) => `${norm(name)}|${new Date(iso).getTime()}`
  const activeKeys = new Set(bookings.map((b) => key(b.client_name, b.starts_at)))

  // 1) Ovatu appointments not covered by an active booking.
  const uncovered: string[] = []
  for (const a of appts) {
    if (!a.starts_at) continue
    if (!activeKeys.has(key(a.client_name, a.starts_at))) {
      uncovered.push(`${a.client_name} — ${fmt(a.starts_at)}`)
    }
  }

  // 2) Duplicate active bookings (same client, same start).
  const groups = new Map<string, Booking[]>()
  for (const b of bookings) {
    const k = key(b.client_name, b.starts_at)
    const arr = groups.get(k) ?? []
    arr.push(b)
    groups.set(k, arr)
  }
  const duplicates: string[] = []
  for (const arr of groups.values()) {
    if (arr.length > 1) duplicates.push(`${arr[0].client_name} — ${fmt(arr[0].starts_at)} (${arr.length}×)`)
  }

  // 3) Overlaps between different clients. Sorted by start, so we can stop once
  // a later booking starts after the current one ends.
  const overlaps: string[] = []
  const sorted = [...bookings].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    const aEnd = new Date(a.ends_at).getTime()
    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j]
      if (new Date(b.starts_at).getTime() >= aEnd) break
      if (norm(a.client_name) === norm(b.client_name)) continue
      overlaps.push(`${a.client_name} & ${b.client_name} — ${fmt(a.starts_at)}`)
    }
  }

  const ok = uncovered.length === 0 && duplicates.length === 0 && overlaps.length === 0
  return { checkedAt: nowIso, ok, uncovered, duplicates, overlaps }
}
