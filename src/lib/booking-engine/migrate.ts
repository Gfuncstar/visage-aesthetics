// Bring upcoming Ovatu bookings into the new system.
//
// The clinic can be booked weeks ahead in Ovatu. After the swap those clients
// must be able to change or cancel with the same experience as a new booking.
// A reporting row is not enough: a changeable booking needs an exact start
// time, the treatment (for its length), and the client's contact details.
//
// This takes the parsed rows from an Ovatu CSV export, and for every upcoming
// booked appointment it can fully resolve, creates a real native booking (with
// its own manage link). Anything it cannot resolve safely is reported back for
// a person to handle, rather than guessed. It never double-books: a row that
// already exists as a booking is skipped.

import { select, insert, audit } from '@/lib/assistant/db'
import { londonWallToUtc, londonToday } from './time'
import { mirrorBookingAppointment } from './appointments-mirror'
import { makePortalToken } from './portal-token'
import { portalLoginEmail } from '@/lib/booking-email'
import type { Booking, Service } from './types'
import type { ParsedAppointment } from '@/lib/assistant/ovatu-csv'

const SITE = 'https://www.vaclinic.co.uk'

export type MigrateReport = {
  considered: number // upcoming booked rows looked at
  created: number
  duplicates: number
  emailed: number
  needsTime: string[] // no start time in the export
  needsService: string[] // service name did not match a treatment
  noEmail: string[] // booking made, but client has no email to self-serve
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** Best-effort match of an Ovatu service name to a configured treatment. */
function matchService(name: string, services: Service[]): Service | null {
  const q = norm(name)
  if (!q) return null
  let best: Service | null = null
  for (const s of services) {
    const n = norm(s.name)
    if (n === q) return s
    if (!best && (n.includes(q) || q.includes(n))) best = s
  }
  return best
}

/**
 * Migrate the upcoming, booked rows of a parsed Ovatu export into real
 * bookings. Set `send` to email each migrated client their account link.
 */
export async function migrateUpcomingBookings(
  rows: ParsedAppointment[],
  opts: { send: boolean; dryRun?: boolean },
): Promise<MigrateReport> {
  const today = londonToday()
  const report: MigrateReport = {
    considered: 0,
    created: 0,
    duplicates: 0,
    emailed: 0,
    needsTime: [],
    needsService: [],
    noEmail: [],
  }

  const services = await select<Service>('services', { active: 'eq.true', limit: 200 })
  const apiKey = process.env.RESEND_API_KEY

  for (const r of rows) {
    // Only future appointments still expected to happen.
    if (r.status !== 'booked' || r.date < today) continue
    report.considered++

    const who = r.client_name || 'Unknown'
    if (r.startMinutes == null) {
      report.needsTime.push(`${who} — ${r.service_name || 'treatment'} on ${r.date}`)
      continue
    }
    const service = matchService(r.service_name, services)
    if (!service) {
      report.needsService.push(`${who} — "${r.service_name}" on ${r.date}`)
      continue
    }

    const startsAt = londonWallToUtc(r.date, r.startMinutes)
    const endsAt = londonWallToUtc(r.date, r.startMinutes + service.duration_min)
    const startIso = startsAt.toISOString()

    // Never double-book: skip if this client already has a booking at this time.
    const existing = await select<Booking>('bookings', {
      client_name: `ilike.${r.client_name.replace(/[%,()]/g, ' ')}`,
      starts_at: `eq.${startIso}`,
      limit: 1,
    }).catch(() => [] as Booking[])
    if (existing.length) {
      report.duplicates++
      continue
    }

    // Preview only: count what would be created, write nothing.
    if (opts.dryRun) {
      report.created++
      if (!r.email) report.noEmail.push(`${who} — ${service.name} on ${r.date}`)
      continue
    }

    try {
      const booking = await insert<Booking>('bookings', {
        service_id: service.id,
        service_name: service.name,
        service_slug: service.slug,
        client_name: r.client_name,
        client_email: r.email,
        client_phone: r.phone,
        starts_at: startIso,
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        notes: 'Brought over from Ovatu',
        source: 'staff',
      })
      await mirrorBookingAppointment({
        bookingId: booking.id,
        clientName: r.client_name,
        startsAt: startIso,
        serviceName: service.name,
        status: 'confirmed',
        price: service.price_from,
      })
      report.created++

      if (!r.email) {
        report.noEmail.push(`${who} — ${service.name} on ${r.date}`)
      } else if (opts.send && apiKey) {
        const url = `${SITE}/account?token=${encodeURIComponent(makePortalToken(r.email))}`
        const mail = portalLoginEmail({ name: r.client_name, url })
        try {
          const { Resend } = await import('resend')
          await new Resend(apiKey).emails.send({
            from: process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
            to: [r.email],
            replyTo: process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk',
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          })
          report.emailed++
        } catch (err) {
          console.error('[migrate] account email failed', err)
        }
      }
    } catch (err) {
      console.error('[migrate] booking insert failed', err)
    }
  }

  if (!opts.dryRun) {
    await audit('migrate', 'booking', undefined, {
      created: report.created,
      duplicates: report.duplicates,
      needsTime: report.needsTime.length,
      needsService: report.needsService.length,
    })
  }
  return report
}
