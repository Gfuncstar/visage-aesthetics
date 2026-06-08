// A single, app-wide "it's done" confirmation for the staff back end. Any
// client action can call notifyDone() to flash a confirmation toast, so every
// action gives the same clear visual feedback. notifyDoneThenReload() stashes
// the message first so it still shows after a full page reload. The toast itself
// is rendered once by <StaffToaster /> in the staff layout.

export const STAFF_DONE_EVENT = 'va-staff-done'
export const STAFF_DONE_KEY = 'va_staff_done'

export function notifyDone(message = 'Done.'): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(STAFF_DONE_EVENT, { detail: message }))
}

export function notifyDoneThenReload(message = 'Done.'): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STAFF_DONE_KEY, message)
  } catch {
    /* sessionStorage unavailable — reload without the carried-over toast */
  }
  window.location.reload()
}
