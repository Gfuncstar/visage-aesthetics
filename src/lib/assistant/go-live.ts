// Cutover from Ovatu to the in-house system — the single "go" switch.
//
// While the clinic runs Ovatu and the new app in parallel, leave things as they
// are: the Ovatu sync stays on and nothing changes. When you are ready to swap
// over completely, set ONE environment variable in Vercel:
//
//     NEXT_PUBLIC_CUTOVER = go
//
// (It is NEXT_PUBLIC_ so the front end picks it up too. Plain CUTOVER also works
// for the back end alone. Setting a NEXT_PUBLIC_ var triggers a redeploy, which
// is what bakes the new "Book" links into the live site.)
//
// That single change swaps the clinic to the in-house system end to end:
//   - FRONT END: every "Book" button stops opening the Ovatu widget and points
//     at the in-house booking flow (/book-online);
//   - BACK END: the daily Ovatu sync stops, so the new app becomes the sole
//     source of truth for clients, appointments and notes from that moment on;
//   - consent forms are sent automatically at booking.
//
// To swap back, remove the variable (or set it to anything other than "go").
//
// Two things are independent of this switch (they work whenever their key is
// set, before or after go-live):
//   - Deposits: per-client toggle on the client record; the client pays on
//     booking via Stripe whenever STRIPE_SECRET_KEY is set.
//   - Email / SMS confirmations: whenever RESEND_API_KEY / SMS is set.
//
// IMPORTANT: going live never deletes or hides historical data. The insurance
// policy requires treatment records to be kept for at least 10 years, so all
// pre-cutover data stays available.

export const GO_LIVE_DATE = '2026-06-07' // YYYY-MM-DD, clinic local — for reference

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

/** True if an ISO date (YYYY-MM-DD) is on or after the cutover reference date. */
export function isAfterGoLive(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return dateStr.slice(0, 10) >= GO_LIVE_DATE
}
