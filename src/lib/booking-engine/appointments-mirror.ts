// Mirror native bookings into the `appointments` table.
//
// Why: the diary reads `bookings`, but finance, rebook, end-of-day and the
// "ask" reports all read `appointments` (the table Ovatu used to fill). After
// the Ovatu cutover that table would stop growing and the reports would go
// stale. Mirroring each booking into `appointments` keeps one reporting table
// that works before and after go-live.
//
// No double-counting: each appointment row is keyed on a synthetic ovatu_id of
// "booking:<id>" and upserted, so repeated calls (create, then complete, then
// cancel) update the same row rather than adding new ones. Best-effort: this
// never throws into the booking flow.

import { insertMany } from '@/lib/assistant/db'
import { londonParts } from './time'
import type { BookingStatus } from './types'

const STATUS_MAP: Record<BookingStatus, 'completed' | 'cancelled' | 'no_show' | 'booked' | null> = {
  pending: null, // an unpaid hold is not a real appointment yet
  confirmed: 'booked',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no_show',
}

export async function mirrorBookingAppointment(input: {
  bookingId: string
  clientName: string
  startsAt: string // ISO timestamp
  endsAt?: string // ISO timestamp
  serviceName: string
  status: BookingStatus
  price?: number
}): Promise<void> {
  const mapped = STATUS_MAP[input.status]
  if (!mapped) return
  try {
    const row: Record<string, unknown> = {
      ovatu_id: `booking:${input.bookingId}`,
      client_name: input.clientName,
      // Group by the London calendar day, not the raw UTC slice — otherwise a
      // late-evening booking can land on the wrong reporting date.
      date: londonParts(new Date(input.startsAt)).dateStr,
      starts_at: input.startsAt,
      service_name: input.serviceName,
      status: mapped,
      import_batch: 'in-house',
    }
    if (input.endsAt) row.ends_at = input.endsAt
    // Only set price when we know it, so a later status change (e.g. cancel)
    // does not overwrite the real booked price with 0.
    if (typeof input.price === 'number') row.price = input.price
    await insertMany('appointments', [row], { onConflict: 'ovatu_id' })
  } catch (err) {
    console.error('[appointments-mirror] failed', err)
  }
}
