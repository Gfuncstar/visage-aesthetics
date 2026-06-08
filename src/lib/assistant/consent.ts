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
type ApptRow = { client_name: string; service_name: string; date: string }

export type ConsentReview = {
  bookedMissing: { name: string; service: string; date: string }[]
}

function norm(n: string): string {
  return n.trim().toLowerCase()
}

export async function consentReview(): Promise<ConsentReview | null> {
  const today = new Date().toISOString().slice(0, 10)
  const horizon = new Date(Date.now() + HORIZON_DAYS * DAY_MS).toISOString().slice(0, 10)
  const since = new Date(Date.now() - CONSENT_LOOKBACK_DAYS * DAY_MS).toISOString()

  try {
    const [requests, submissions, appts] = await Promise.all([
      // consent_requests may not exist on older databases — treat as empty.
      select<ReqRow>('consent_requests', { status: 'eq.sent', select: 'id,client_name', limit: 300 }).catch(() => [] as ReqRow[]),
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

    // Booked soon (and newly booked), nothing on file and no form sent yet.
    const seenBM = new Set<string>()
    const bookedMissing: { name: string; service: string; date: string }[] = []
    for (const a of appts) {
      const name = (a.client_name ?? '').trim()
      if (!name) continue
      const k = norm(name)
      if (consented.has(k) || requested.has(k) || seenBM.has(k)) continue
      seenBM.add(k)
      bookedMissing.push({ name, service: a.service_name || 'Appointment', date: a.date })
    }

    return { bookedMissing }
  } catch {
    return null
  }
}
