// A single, app-wide confirmation for the staff back end. Any client action can
// call notifyDone() to flash a success toast, or notifyError() to flash a
// failure toast, so every action gives the same clear visual feedback — and a
// failed action never masquerades as a success. notifyDoneThenReload() stashes
// the message first so it still shows after a full page reload. The toast itself
// is rendered once by <StaffToaster /> in the staff layout.

export const STAFF_DONE_EVENT = 'va-staff-done'
export const STAFF_DONE_KEY = 'va_staff_done'

export type StaffToastTone = 'done' | 'error'
export type StaffToastDetail = { message: string; tone: StaffToastTone }

export function notifyDone(message = 'Done.'): void {
  emit(message, 'done')
}

export function notifyError(message = 'Something went wrong. Please try again.'): void {
  emit(message, 'error')
}

function emit(message: string, tone: StaffToastTone): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<StaffToastDetail>(STAFF_DONE_EVENT, { detail: { message, tone } }))
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
