// The receptionist command engine. A dictated or typed instruction is parsed
// into a structured action, summarised for confirmation, then executed against
// the booking tables. This is what lets staff say "book Sarah in for Botox
// on Thursday at 2" and have it done.

import { select, insert, update, audit } from './db'
import { getService } from '../booking-engine/availability'
import { londonWallToUtc, dayLabel, clockLabel, londonToday } from '../booking-engine/time'
import { fillGap } from '../booking-engine/notify'
import { mirrorBookingAppointment } from '../booking-engine/appointments-mirror'
import type { Booking } from '../booking-engine/types'

export type Action =
  | { type: 'book'; service: string; date: string; time: string; clientName: string; phone?: string | null }
  | { type: 'cancel'; clientName: string; date?: string | null }
  | { type: 'block_time'; date: string; startTime: string; endTime: string; reason?: string | null }
  | { type: 'waitlist'; clientName: string; service?: string | null; phone?: string | null }
  | { type: 'flag'; clientName: string; flag: 'block' | 'deposit' | 'do_not_contact'; value: boolean }
  | { type: 'set_hours'; weekday: number; isOpen: boolean; openMin?: number | null; closeMin?: number | null }
  | { type: 'block_until'; clientName: string; until: string }
  | { type: 'unknown'; reason: string }

function minutesOf(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return null
  const mins = Number(m[1]) * 60 + Number(m[2])
  return mins >= 0 && mins < 1440 ? mins : null
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** A plain-English summary of what the action will do, for confirmation. */
export function summariseAction(a: Action): string {
  switch (a.type) {
    case 'book':
      return `Book ${a.clientName} in for ${a.service} on ${labelDate(a.date)} at ${labelTime(a.time)}.`
    case 'cancel':
      return `Cancel ${a.clientName}'s appointment${a.date ? ` on ${labelDate(a.date)}` : ''}.`
    case 'block_time':
      return `Block ${labelTime(a.startTime)} to ${labelTime(a.endTime)} on ${labelDate(a.date)}${a.reason ? ` (${a.reason})` : ''}.`
    case 'waitlist':
      return `Add ${a.clientName} to the waitlist${a.service ? ` for ${a.service}` : ''}.`
    case 'flag': {
      const f = a.flag === 'block' ? 'block online booking' : a.flag === 'deposit' ? 'require a deposit' : 'do not contact'
      return `Turn ${a.value ? 'on' : 'off'} "${f}" for ${a.clientName}.`
    }
    case 'set_hours': {
      const day = DAY_NAMES[a.weekday] ?? `day ${a.weekday}`
      if (!a.isOpen) return `Close ${day}s.`
      const o = a.openMin != null ? clockLabel(a.openMin) : '?'
      const c = a.closeMin != null ? clockLabel(a.closeMin) : '?'
      return `Set ${day}s to open ${o}–${c}.`
    }
    case 'block_until': {
      const label = /^\d{4}-\d{2}-\d{2}$/.test(a.until)
        ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${a.until}T12:00:00Z`))
        : a.until
      return `Mark ${a.clientName} as clinic-full until ${label} — they will see no availability when trying to book.`
    }
    default:
      return a.reason || 'I could not work out what to do.'
  }
}

function labelDate(d: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? dayLabel(d) : d
}
function labelTime(t: string): string {
  const m = minutesOf(t)
  return m == null ? t : clockLabel(m)
}

/** Run a parsed action. Returns a short result message. */
export async function executeAction(a: Action): Promise<{ ok: boolean; message: string }> {
  switch (a.type) {
    case 'book': {
      const mins = minutesOf(a.time)
      const service = await getService(a.service)
      if (!service) return { ok: false, message: `I do not recognise the treatment "${a.service}".` }
      if (mins == null || !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) return { ok: false, message: 'I could not read the date or time.' }
      const startsAt = londonWallToUtc(a.date, mins)
      const endsAt = londonWallToUtc(a.date, mins + service.duration_min)
      const booking = await insert<Booking>('bookings', {
        service_id: service.id,
        service_name: service.name,
        service_slug: service.slug,
        client_name: a.clientName,
        client_phone: a.phone || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        source: 'staff',
      })
      await audit('create', 'booking', booking.id, { via: 'command' })
      await mirrorBookingAppointment({
        bookingId: booking.id,
        clientName: a.clientName,
        startsAt: startsAt.toISOString(),
        serviceName: service.name,
        status: 'confirmed',
        price: service.price_from,
      })
      return { ok: true, message: `Booked ${a.clientName} in for ${service.name} on ${dayLabel(a.date)} at ${clockLabel(mins)}.` }
    }

    case 'cancel': {
      const enc = a.clientName.replace(/[%,()]/g, ' ')
      const q: Record<string, string | number> = { client_name: `ilike.${enc}`, status: 'neq.cancelled', order: 'starts_at.asc', limit: 5 }
      let rows = await select<Booking>('bookings', q)
      if (a.date && /^\d{4}-\d{2}-\d{2}$/.test(a.date)) {
        rows = rows.filter((b) => b.starts_at.slice(0, 10) === a.date)
      } else {
        const today = londonToday()
        const upcoming = rows.filter((b) => b.starts_at.slice(0, 10) >= today)
        if (upcoming.length) rows = upcoming
      }
      const booking = rows[0]
      if (!booking) return { ok: false, message: `I could not find a booking for ${a.clientName}.` }
      await update('bookings', { id: booking.id }, { status: 'cancelled' })
      await audit('cancel', 'booking', booking.id, { via: 'command' })
      await mirrorBookingAppointment({
        bookingId: booking.id,
        clientName: booking.client_name,
        startsAt: booking.starts_at,
        serviceName: booking.service_name,
        status: 'cancelled',
      })
      await fillGap(booking)
      return { ok: true, message: `Cancelled ${booking.client_name}'s ${booking.service_name} on ${dayLabel(booking.starts_at.slice(0, 10))}.` }
    }

    case 'block_time': {
      const s = minutesOf(a.startTime)
      const e = minutesOf(a.endTime)
      if (s == null || e == null || e <= s || !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) {
        return { ok: false, message: 'I could not read the times to block.' }
      }
      await insert('time_off', {
        starts_at: londonWallToUtc(a.date, s).toISOString(),
        ends_at: londonWallToUtc(a.date, e).toISOString(),
        reason: a.reason || null,
      })
      return { ok: true, message: `Blocked ${clockLabel(s)} to ${clockLabel(e)} on ${dayLabel(a.date)}.` }
    }

    case 'waitlist': {
      const service = a.service ? await getService(a.service) : null
      await insert('waitlist', {
        service_slug: service?.slug ?? a.service ?? null,
        service_name: service?.name ?? null,
        client_name: a.clientName,
        client_phone: a.phone || null,
        status: 'waiting',
      })
      return { ok: true, message: `Added ${a.clientName} to the waitlist${service ? ` for ${service.name}` : ''}.` }
    }

    case 'flag': {
      const normalised = norm(a.clientName)
      if (a.flag === 'do_not_contact') {
        if (a.value) {
          await insert('do_not_contact', { name_normalised: normalised, full_name: a.clientName, reason: 'Set by command' }).catch(() => {})
        } else {
          await update('do_not_contact', { name_normalised: normalised }, {}).catch(() => {})
        }
        return { ok: true, message: `${a.value ? 'Marked' : 'Cleared'} do-not-contact for ${a.clientName}.` }
      }
      const col = a.flag === 'block' ? 'blocked' : 'requires_deposit'
      // When unblocking, also clear any temporary blocked_until date
      const patch: Record<string, unknown> = { [col]: a.value }
      if (a.flag === 'block' && !a.value) patch.blocked_until = null
      const existing = await select<{ id: string }>('client_flags', { name_normalised: `eq.${normalised}`, limit: 1 })
      if (existing.length) await update('client_flags', { name_normalised: normalised }, patch)
      else await insert('client_flags', { name_normalised: normalised, full_name: a.clientName, ...patch })
      return { ok: true, message: `${a.value ? 'Turned on' : 'Turned off'} ${a.flag === 'block' ? 'online-booking block' : 'deposit requirement'} for ${a.clientName}.` }
    }

    case 'block_until': {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(a.until)) return { ok: false, message: 'I could not parse the date.' }
      const normalised = norm(a.clientName)
      const existing = await select<{ id: string }>('client_flags', { name_normalised: `eq.${normalised}`, limit: 1 })
      if (existing.length) {
        await update('client_flags', { name_normalised: normalised }, { blocked_until: a.until })
      } else {
        await insert('client_flags', { name_normalised: normalised, full_name: a.clientName, blocked: false, requires_deposit: false, blocked_until: a.until })
      }
      const label = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${a.until}T12:00:00Z`))
      return { ok: true, message: `${a.clientName} is clinic-full until ${label}. They will see no availability when trying to book.` }
    }

    case 'set_hours': {
      if (a.weekday < 0 || a.weekday > 6) return { ok: false, message: 'Invalid day of week.' }
      const patch: Record<string, unknown> = { is_open: a.isOpen }
      if (a.isOpen) {
        if (a.openMin == null || a.closeMin == null) return { ok: false, message: 'I need both an opening and closing time.' }
        if (a.openMin < 0 || a.openMin >= 1440 || a.closeMin <= a.openMin || a.closeMin > 1440) {
          return { ok: false, message: 'Those times don\'t make sense — check open is before close.' }
        }
        patch.open_min = a.openMin
        patch.close_min = a.closeMin
      }
      await update('business_hours', { weekday: String(a.weekday) }, patch)
      const day = DAY_NAMES[a.weekday]!
      if (!a.isOpen) return { ok: true, message: `Closed ${day}s.` }
      return { ok: true, message: `Set ${day}s to open ${clockLabel(a.openMin!)}–${clockLabel(a.closeMin!)}.` }
    }

    default:
      return { ok: false, message: a.reason || 'Nothing to do.' }
  }
}
