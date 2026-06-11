// A lightweight "undo the last action" channel for the staff back end. The most
// recent reversible action is stashed in localStorage so the Undo control in the
// top nav can offer to roll it back from anywhere, then a window event keeps the
// button and the page that made the change in sync. Currently covers cancelling
// a booking (the main destructive action) — new kinds can be added to UndoAction
// and handled in <UndoButton />.

export type UndoAction = {
  kind: 'restore-booking'
  bookingId: string
  status: string // the status to put the booking back to
  label: string // human description, e.g. "Restore Keeley Simpson's booking"
  at: number // when it was recorded (epoch ms)
}

const KEY = 'va_staff_undo'
export const UNDO_CHANGE_EVENT = 'va-staff-undo-change'
export const UNDO_DONE_EVENT = 'va-staff-undo-done'
// How long an undo stays on offer before it's treated as stale (10 minutes).
export const UNDO_TTL_MS = 10 * 60 * 1000

export function recordUndo(action: Omit<UndoAction, 'at'>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...action, at: Date.now() }))
    window.dispatchEvent(new Event(UNDO_CHANGE_EVENT))
  } catch {
    /* storage unavailable — quietly skip the undo offer */
  }
}

export function readUndo(): UndoAction | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const a = JSON.parse(raw) as UndoAction
    if (!a || typeof a.at !== 'number' || Date.now() - a.at > UNDO_TTL_MS) return null
    return a
  } catch {
    return null
  }
}

export function clearUndo(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(UNDO_CHANGE_EVENT))
}
