// Go-live: the clinic's cutover from Ovatu to the in-house system, in one place.
//
// This module carries two related concerns that both hinge on "go-live":
//
//   1. THE SWITCH — flip the clinic from Ovatu to the in-house system. While
//      the two run in parallel, leave things as they are (Ovatu sync on,
//      nothing changes). When ready, set ONE environment variable in Vercel:
//
//          NEXT_PUBLIC_CUTOVER = go
//
//      (NEXT_PUBLIC_ so the front end picks it up too; plain CUTOVER works for
//      the back end alone. Setting a NEXT_PUBLIC_ var triggers a redeploy,
//      which bakes the new "Book" links into the live site.)
//
//      That single change swaps the clinic end to end:
//        - FRONT END: every "Book" button stops opening the Ovatu widget and
//          points at the in-house booking flow (/book-online);
//        - BACK END: the daily Ovatu sync stops, so the new app becomes the
//          sole source of truth for clients, appointments and notes;
//        - consent forms are sent automatically at booking.
//      To swap back, remove the variable (or set it to anything but "go").
//
//   2. THE DATA EPOCH — the date the new system's data starts. The live staff
//      to-do feeds (write-ups needed, consent chasing, the stock "ordered"
//      state) measure "since" this date, so the imported back-history doesn't
//      resurface as a giant backlog the day you cut over. Override the date
//      with GO_LIVE_DATE=YYYY-MM-DD; see docs/GO_LIVE_RESET.md.
//
// Two things are independent of the switch (they work whenever their key is
// set, before or after go-live):
//   - Deposits: per-client toggle on the client record; client pays on booking
//     via Stripe whenever STRIPE_SECRET_KEY is set.
//   - Email / SMS confirmations: whenever RESEND_API_KEY / SMS is set.
//
// IMPORTANT: going live never deletes or hides historical data. The insurance
// policy requires treatment records to be kept for at least 10 years, so all
// pre-cutover data stays available (it just stops feeding the live to-do feeds).

// Cutover reference date (clinic local). Until GO_LIVE_DATE is set, this is the
// data epoch every live feed measures from.
const DEFAULT_GO_LIVE = '2026-06-07'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** The go-live date as an ISO date (YYYY-MM-DD). Env-overridable. */
export function goLiveDate(): string {
  const v = process.env.GO_LIVE_DATE
  return v && DATE_RE.test(v) ? v : DEFAULT_GO_LIVE
}

/** The go-live moment as an ISO timestamp (start of that day, UTC). */
export function goLiveTimestamp(): string {
  return `${goLiveDate()}T00:00:00Z`
}

/** Cutover reference date constant (back-compat for direct importers). */
export const GO_LIVE_DATE = DEFAULT_GO_LIVE

/**
 * The one switch. True once NEXT_PUBLIC_CUTOVER=go (or CUTOVER=go) is set.
 * NEXT_PUBLIC_CUTOVER is readable in both the browser bundle and on the server,
 * so it drives the front-end "Book" links and the back-end routes from one var.
 */
export function cutoverLive(): boolean {
  const v = (process.env.NEXT_PUBLIC_CUTOVER ?? process.env.CUTOVER ?? '').trim().toLowerCase()
  return v === 'go'
}

/**
 * Whether to send the consent form automatically at booking.
 * On once we go live. CONSENT_FORMS_ENABLED can force it on ("true") or off
 * ("false") independently of the cutover.
 */
export function consentAtBooking(): boolean {
  const flag = (process.env.CONSENT_FORMS_ENABLED || '').trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  return cutoverLive()
}

/** True if an ISO date (YYYY-MM-DD) is on or after the go-live date. */
export function isAfterGoLive(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return dateStr.slice(0, 10) >= goLiveDate()
}
