// Consent oversight for the staff "needs attention" surfaces. Two signals:
//
//  1. outstanding — consent forms that were sent to a client but not yet
//     completed (consent_requests still 'sent').
//  2. bookedMissing — clients booked in over the next two weeks who have no
//     completed consent form on record and no form already sent. These are the
//     ones to send a form to so nobody is treated without consent.
//
// Names are matched the same forgiving way as the write-up chase (normalised
// client name), so it lines up with how the rest of the back end reconciles
// the imported diary against what's been recorded.

import { select } from './db'
import { goLiveTimestamp } from './go-live'

const HORIZON_DAYS = 14
const CONSENT_LOOKBACK_DAYS = 180
const DAY_MS = 24 * 60 * 60 * 1000

// Grandfather: only flag appointments BOOKED on/after go-live, so the existing
// diary (consented in person the old way) isn't chased — only new bookings from
// launch onward. Driven by the shared GO_LIVE_DATE so a system switch resets
// this with everything else (see go-live.ts). CONSENT_ENFORCE_FROM (ISO
// timestamp) overrides it for a one-off if needed.
const CONSENT_ENFORCE_FROM = process.env.CONSENT_ENFORCE_FROM || goLiveTimestamp()

type SubRow = { client_name: string; submitted_at: string }
type ReqRow = { id: string; client_name: string }
type WaiverRow = { client_name_norm: string }
type ApptRow = { client_name: string; service_name: string; date: string }

export type ConsentReview = {
  bookedMissing: { name: string; service: string; date: string }[]
}

function norm(n: string): string {
  return n.trim().toLowerCase()
}

// Normalised names of every client who already has consent accounted for —
// a completed submission, a form already sent (consent_requests), or a waiver.
// Used by the reminder cron to avoid re-sending a consent form to someone who
// has already completed or been sent one. Matched by normalised name, the same
// forgiving way as the rest of the consent reconciliation.
export async function consentNamesOnFile(): Promise<Set<string>> {
  const since = new Date(Date.now() - CONSENT_LOOKBACK_DAYS * DAY_MS).toISOString()
  const [requests, waivers, submissions] = await Promise.all([
    select<ReqRow>('consent_requests', { status: 'in.(sent,waived,completed)', select: 'id,client_name', limit: 2000 }).catch(() => [] as ReqRow[]),
    select<WaiverRow>('consent_waivers', { select: 'client_name_norm', limit: 2000 }).catch(() => [] as WaiverRow[]),
    select<SubRow>('consent_submissions', { submitted_at: `gte.${since}`, select: 'client_name,submitted_at', limit: 5000 }).catch(() => [] as SubRow[]),
  ])
  const set = new Set<string>()
  for (const s of submissions) { const k = norm(s.client_name ?? ''); if (k) set.add(k) }
  for (const r of requests) { const k = norm(r.client_name ?? ''); if (k) set.add(k) }
  for (const w of waivers) { if (w.client_name_norm) set.add(w.client_name_norm) }
  return set
}

// Normalised names of every client whose consent is genuinely DONE — a
// completed submission, a completed/waived request, or a waiver. Unlike
// consentNamesOnFile this deliberately EXCLUDES a form that's only been sent and
// not filled in yet, so the per-row list tick means "signed", not "chased".
export async function consentNamesDone(): Promise<Set<string>> {
  const since = new Date(Date.now() - CONSENT_LOOKBACK_DAYS * DAY_MS).toISOString()
  const [requests, waivers, submissions] = await Promise.all([
    select<ReqRow>('consent_requests', { status: 'in.(completed,waived)', select: 'id,client_name', limit: 2000 }).catch(() => [] as ReqRow[]),
    select<WaiverRow>('consent_waivers', { select: 'client_name_norm', limit: 2000 }).catch(() => [] as WaiverRow[]),
    select<SubRow>('consent_submissions', { submitted_at: `gte.${since}`, select: 'client_name,submitted_at', limit: 5000 }).catch(() => [] as SubRow[]),
  ])
  const set = new Set<string>()
  for (const s of submissions) { const k = norm(s.client_name ?? ''); if (k) set.add(k) }
  for (const r of requests) { const k = norm(r.client_name ?? ''); if (k) set.add(k) }
  for (const w of waivers) { if (w.client_name_norm) set.add(w.client_name_norm) }
  return set
}

// Booking ids that already have consent accounted for — a submission or a sent
// request tied to that booking. Used by the 24h auto-send so consent is chased
// per treatment: each booking that hasn't got its own consent yet gets the form,
// even for returning clients who consented for an earlier visit.
export async function consentBookingIdsOnFile(): Promise<Set<string>> {
  const [subs, reqs] = await Promise.all([
    select<{ booking_id: string | null }>('consent_submissions', { select: 'booking_id', limit: 5000 }).catch(() => [] as { booking_id: string | null }[]),
    select<{ booking_id: string | null }>('consent_requests', { status: 'in.(sent,completed,waived)', select: 'booking_id', limit: 5000 }).catch(() => [] as { booking_id: string | null }[]),
  ])
  const set = new Set<string>()
  for (const s of subs) if (s.booking_id) set.add(s.booking_id)
  for (const r of reqs) if (r.booking_id) set.add(r.booking_id)
  return set
}

export type ConsentChaseState = {
  // Bookings whose consent is genuinely done — a submission, or a completed /
  // waived request — so they should never be chased again.
  doneBookingIds: Set<string>
  // For bookings only SENT a form (not yet filled in): how many times it's been
  // sent and when last, so the pre-appointment chase fires once, never per hour.
  sentByBooking: Map<string, { count: number; lastSentAt: string }>
}

// Per-booking consent state for the 4h "please complete" resend. One sweep of
// the submissions and request rows, turned into the two lookups the cron needs.
export async function consentChaseState(): Promise<ConsentChaseState> {
  const [subs, reqs] = await Promise.all([
    select<{ booking_id: string | null }>('consent_submissions', { select: 'booking_id', limit: 5000 }).catch(() => [] as { booking_id: string | null }[]),
    select<{ booking_id: string | null; status: string; created_at: string }>('consent_requests', { select: 'booking_id,status,created_at', limit: 5000 }).catch(() => [] as { booking_id: string | null; status: string; created_at: string }[]),
  ])
  const doneBookingIds = new Set<string>()
  for (const s of subs) if (s.booking_id) doneBookingIds.add(s.booking_id)
  const sentByBooking = new Map<string, { count: number; lastSentAt: string }>()
  for (const r of reqs) {
    if (!r.booking_id) continue
    if (r.status === 'completed' || r.status === 'waived') { doneBookingIds.add(r.booking_id); continue }
    if (r.status !== 'sent') continue
    const cur = sentByBooking.get(r.booking_id)
    if (!cur) sentByBooking.set(r.booking_id, { count: 1, lastSentAt: r.created_at })
    else sentByBooking.set(r.booking_id, { count: cur.count + 1, lastSentAt: cur.lastSentAt > r.created_at ? cur.lastSentAt : r.created_at })
  }
  return { doneBookingIds, sentByBooking }
}

export async function consentReview(): Promise<ConsentReview | null> {
  const today = new Date().toISOString().slice(0, 10)
  const horizon = new Date(Date.now() + HORIZON_DAYS * DAY_MS).toISOString().slice(0, 10)
  const since = new Date(Date.now() - CONSENT_LOOKBACK_DAYS * DAY_MS).toISOString()

  try {
    const [requests, waivers, submissions, appts] = await Promise.all([
      // consent_requests may not exist on older databases — treat as empty.
      select<ReqRow>('consent_requests', { status: 'in.(sent,waived)', select: 'id,client_name', limit: 300 }).catch(() => [] as ReqRow[]),
      select<WaiverRow>('consent_waivers', { select: 'client_name_norm', limit: 500 }).catch(() => [] as WaiverRow[]),
      select<SubRow>('consent_submissions', { submitted_at: `gte.${since}`, select: 'client_name,submitted_at', limit: 1000 }),
      select<ApptRow>('appointments', {
        and: `(date.gte.${today},date.lte.${horizon},status.neq.cancelled,created_at.gte.${CONSENT_ENFORCE_FROM})`,
        select: 'client_name,service_name,date',
        order: 'date.asc',
        limit: 500,
      }),
    ])

    const consented = new Set(submissions.map((s) => norm(s.client_name ?? '')).filter(Boolean))
    const requested = new Set(requests.map((r) => norm(r.client_name ?? '')).filter(Boolean))
    const waived = new Set(waivers.map((w) => w.client_name_norm).filter(Boolean))

    // Booked soon (and newly booked), nothing on file and no form sent yet.
    const seenBM = new Set<string>()
    const bookedMissing: { name: string; service: string; date: string }[] = []
    for (const a of appts) {
      const name = (a.client_name ?? '').trim()
      if (!name) continue
      const k = norm(name)
      if (consented.has(k) || requested.has(k) || waived.has(k) || seenBM.has(k)) continue
      seenBM.add(k)
      bookedMissing.push({ name, service: a.service_name || 'Appointment', date: a.date })
    }

    return { bookedMissing }
  } catch {
    return null
  }
}
