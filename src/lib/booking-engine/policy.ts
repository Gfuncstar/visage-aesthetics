// Booking change policy — a single source of truth for the cancellation window.
//
// Per the clinic's terms, an appointment cannot be rearranged or cancelled
// within 24 hours of its start time. This is enforced server-side (the manage
// API) and reflected in the UI and the reminder emails (the 48h reminder offers
// "Rearrange"; the 24h reminder only offers "Confirm").

export const CHANGE_CUTOFF_HOURS = 24

/** True when the appointment is inside the no-change window (less than 24h away). */
export function withinChangeCutoff(startsAtIso: string, now: Date = new Date()): boolean {
  const starts = new Date(startsAtIso).getTime()
  if (Number.isNaN(starts)) return false
  return starts - now.getTime() < CHANGE_CUTOFF_HOURS * 60 * 60 * 1000
}

export const CHANGE_CUTOFF_MESSAGE =
  'Within 24 hours of your appointment, changes can no longer be made online. Please call the clinic and we will help.'
