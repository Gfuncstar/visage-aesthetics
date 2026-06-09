// Surfaces clients who were asked to confirm an upcoming appointment but
// haven't yet — feeds the staff "needs attention" landing card and the
// confirmations page. A booking is "unconfirmed" when it is still confirmed
// (not cancelled), starts within the next ~30h, has had its confirm request
// sent (reminded_at set), and has no confirmed_at stamp.
//
// Degrades gracefully (returns null) if the clinic database is unreachable or
// the confirmed_at column hasn't been added yet.

import { select } from './db'
import type { Booking } from '@/lib/booking-engine/types'

const WINDOW_HOURS = 30

export type UnconfirmedBooking = {
  id: string
  name: string
  service: string
  startsAt: string
  phone: string | null
  email: string | null
}

export type ConfirmationReview = { unconfirmed: UnconfirmedBooking[] }

export async function confirmationReview(): Promise<ConfirmationReview | null> {
  const now = new Date()
  const windowEnd = new Date(now.getTime() + WINDOW_HOURS * 3600_000)

  try {
    const rows = await select<Booking>('bookings', {
      status: 'eq.confirmed',
      reminded_at: 'not.is.null',
      confirmed_at: 'is.null',
      and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${windowEnd.toISOString()})`,
      order: 'starts_at.asc',
      limit: 200,
    })

    return {
      unconfirmed: rows.map((b) => ({
        id: b.id,
        name: b.client_name,
        service: b.service_name,
        startsAt: b.starts_at,
        phone: b.client_phone,
        email: b.client_email,
      })),
    }
  } catch {
    return null
  }
}
