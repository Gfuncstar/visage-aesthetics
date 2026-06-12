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
    select<{ client_name: string; form_id: string }>('consent_submissions', { select: 'client_name,form_id', limit: 5000 }).catch(() => []),
    select<{ client_name_norm: string }>('consent_waivers', { select: 'client_name_norm', limit: 5000 }).catch(() => []),
    select<{ client_name: string; form_id: string }>('consent_requests', { status: 'in.(sent,completed,waived)', select: 'client_name,form_id', limit: 5000 }).catch(() => []),
  ])
  const completed = new Set(subs.map((s) => `${norm(s.client_name)}|${s.form_id}`))
  const waived = new Set(waivers.map((w) => w.client_name_norm))
  const sentSet = new Set(reqs.map((r) => `${norm(r.client_name)}|${r.form_id}`))

  let compliant = 0
  const outstanding: ComplianceItem[] = []
  for (const { b, formId, formName } of items) {
    const k = norm(b.client_name)
    if (completed.has(`${k}|${formId}`) || waived.has(k)) {
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
      sent: sentSet.has(`${k}|${formId}`),
    })
  }

  const total = items.length
  const percent = Math.round((compliant / total) * 100)
  return { date, total, compliant, percent, outstanding }
}
