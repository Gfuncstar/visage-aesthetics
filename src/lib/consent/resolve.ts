// Server-only: resolve a consent link token to "which form, for whom".
//
// One public URL shape — /consent/<token> — serves two cases:
//   1. a booking's manage_token (the form attached to that appointment), and
//   2. a manually-sent consent request token (staff sent a form outside the
//      booking system, e.g. because it was not completed).
// Both tokens are unguessable UUIDs, so a single lookup path is safe.

import { select } from '@/lib/assistant/db'
import { consentFormForService, getConsentForm, type ConsentForm } from './forms'
import type { Booking } from '@/lib/booking-engine/types'

export type ConsentRequestRow = {
  id: string
  token: string
  form_id: string
  form_name: string
  client_name: string
  client_email: string | null
  booking_id: string | null
  status: string
  completed_at: string | null
}

export type ConsentContext = {
  source: 'booking' | 'request'
  bookingId: string | null
  requestId: string | null
  clientName: string
  clientEmail: string | null
  serviceName: string | null
  serviceSlug: string | null
  form: ConsentForm
}

export type ResolvedConsent = { context: ConsentContext | null; alreadyDone: boolean }

async function submissionExists(bookingId: string | null, requestId: string | null): Promise<boolean> {
  const filter = bookingId ? { booking_id: `eq.${bookingId}` } : requestId ? { request_id: `eq.${requestId}` } : null
  if (!filter) return false
  try {
    const rows = await select<{ id: string }>('consent_submissions', { ...filter, select: 'id', limit: 1 })
    return rows.length > 0
  } catch {
    return false
  }
}

export async function resolveConsent(token: string): Promise<ResolvedConsent> {
  // 1. A booking by its manage_token.
  let booking: Booking | null = null
  try {
    const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
    booking = rows[0] ?? null
  } catch {
    booking = null
  }
  if (booking) {
    const form = consentFormForService(booking.service_slug, booking.service_name)
    if (!form) return { context: null, alreadyDone: false }
    const alreadyDone = await submissionExists(booking.id, null)
    return {
      context: {
        source: 'booking',
        bookingId: booking.id,
        requestId: null,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        serviceName: booking.service_name,
        serviceSlug: booking.service_slug,
        form,
      },
      alreadyDone,
    }
  }

  // 2. A manually-sent consent request by its token (table may not exist yet).
  let request: ConsentRequestRow | null = null
  try {
    const rows = await select<ConsentRequestRow>('consent_requests', { token: `eq.${token}`, limit: 1 })
    request = rows[0] ?? null
  } catch {
    request = null
  }
  if (request) {
    const form = getConsentForm(request.form_id)
    if (!form) return { context: null, alreadyDone: false }
    const alreadyDone = request.status === 'completed' || (await submissionExists(request.booking_id, request.id))
    return {
      context: {
        source: 'request',
        bookingId: request.booking_id,
        requestId: request.id,
        clientName: request.client_name,
        clientEmail: request.client_email,
        serviceName: form.name,
        serviceSlug: null,
        form,
      },
      alreadyDone,
    }
  }

  return { context: null, alreadyDone: false }
}
