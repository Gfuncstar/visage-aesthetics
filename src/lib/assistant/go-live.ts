// Cutover from Ovatu to the in-house system.
//
// From the go-live date the new app is the system of record: clients, notes,
// treatment records, consent and bookings are created here, not in Ovatu, and
// the daily Ovatu sync is switched off (see the sync route).
//
// IMPORTANT: going live does NOT delete or hide historical data. The insurance
// policy requires treatment records to be kept for at least 10 years, so all
// pre-cutover data stays available (read-only). This date only marks where the
// new era starts; it is the single place to change the cutover day.

export const GO_LIVE_DATE = '2026-06-07' // YYYY-MM-DD, clinic local

/** True if an ISO date (YYYY-MM-DD) is on or after the cutover day. */
export function isAfterGoLive(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return dateStr.slice(0, 10) >= GO_LIVE_DATE
}

/** True once the cutover day has arrived. */
export function goLiveReached(): boolean {
  return new Date().toISOString().slice(0, 10) >= GO_LIVE_DATE
}
