// Per-day compliance wash-up: of the treatments seen on a day that need a
// consent form, how many have it completed or waived (taken in clinic). A single
// percentage for the end-of-day card, plus the outstanding items so staff can
// action each one — send the form, or mark it done (e.g. a paper consent taken
// in clinic, via the consent waiver).

import { select } from './db'
import { consentFormForService } from '@/lib/consent/forms'
import { goLiveTimestamp } from './go-live'
import type { Booking } from '@/lib/booking-engine/types'

const norm = (s: string) => (s ?? '').trim().toLowerCase()

// Grandfather the Ovatu transition: only count bookings made on/after go-live,
// so clients who consented in Ovatu (on paper) aren't flagged as missing. Same
// baseline the home-page consent warnings use.
const CONSENT_ENFORCE_FROM = process.env.CONSENT_ENFORCE_FROM || goLiveTimestamp()

export type ComplianceItem = {
  bookingId: string
  clientName: string
  clientEmail: string | null
  serviceName: string
  formId: string
  formName: string
  sent: boolean // a form was sent but not completed
}

export type DayCompliance = {
  date: string
  total: number // treatments that need a consent form
  compliant: number // completed or waived
  percent: number // 0..100 (100 when nothing needs consent)
  outstanding: ComplianceItem[]
}

function londonDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date(iso))
}

export async function dayCompliance(date: string): Promise<DayCompliance> {
  const dayStart = new Date(`${date}T00:00:00Z`)
  const from = new Date(dayStart.getTime() - 6 * 3600_000).toISOString()
  const to = new Date(dayStart.getTime() + 30 * 3600_000).toISOString()

  const bookings = await select<Booking>('bookings', {
    and: `(starts_at.gte.${from},starts_at.lte.${to},created_at.gte.${CONSENT_ENFORCE_FROM})`,
    status: 'neq.cancelled',
    order: 'starts_at.asc',
    limit: 200,
  }).catch(() => [] as Booking[])

  const todays = bookings.filter((b) => londonDate(b.starts_at) === date && b.status !== 'no_show')

  // The treatments that need a consent form are the compliance items.
  const items: { b: Booking; formId: string; formName: string }[] = []
  for (const b of todays) {
    const form = consentFormForService(b.service_slug, b.service_name)
    if (form) items.push({ b, formId: form.id, formName: form.name })
  }

  if (items.length === 0) {
    return { date, total: 0, compliant: 0, percent: 100, outstanding: [] }
  }

  const [subs, waivers, reqs] = await Promise.all([
    select<{ booking_id: string | null }>('consent_submissions', { select: 'booking_id', limit: 5000 }).catch(() => []),
    select<{ client_name_norm: string }>('consent_waivers', { select: 'client_name_norm', limit: 5000 }).catch(() => []),
    select<{ booking_id: string | null }>('consent_requests', { status: 'in.(sent,completed,waived)', select: 'booking_id', limit: 5000 }).catch(() => []),
  ])
  // Consent is per treatment, so compliance keys off THIS booking's own consent —
  // a past consent for an earlier visit does not cover a new one. The client-level
  // waiver stays as the manual "handled in clinic" override.
  const completedBooking = new Set(subs.map((s) => s.booking_id).filter(Boolean) as string[])
  const waived = new Set(waivers.map((w) => w.client_name_norm))
  const sentBooking = new Set(reqs.map((r) => r.booking_id).filter(Boolean) as string[])

  let compliant = 0
  const outstanding: ComplianceItem[] = []
  for (const { b, formId, formName } of items) {
    if (completedBooking.has(b.id) || waived.has(norm(b.client_name))) {
      compliant++
      continue
    }
    outstanding.push({
      bookingId: b.id,
      clientName: b.client_name,
      clientEmail: b.client_email,
      serviceName: b.service_name,
      formId,
      formName,
      sent: sentBooking.has(b.id),
    })
  }

  const total = items.length
  const percent = Math.round((compliant / total) * 100)
  return { date, total, compliant, percent, outstanding }
}
