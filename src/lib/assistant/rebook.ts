// The Rebooker — surfaces clients who are about due to come back.
//
// Reads completed appointments (already synced from Ovatu) and works out, per
// client per treatment type, when they are next due based on a sensible recall
// interval. Anyone due soon or overdue, who does not already have that
// treatment booked again, is surfaced with a warm, ready-to-send message.
//
// This complements Ovatu: it never books anything. It just tells you who to
// nudge and drafts the nudge. The clinician sends it (WhatsApp / copy) and the
// client self-books through the normal Ovatu link.

import { select } from './db'
import { matchTreatmentType, getTreatmentType } from './treatment-types'
import { BOOKING_URL } from '../booking'
import type { Appointment, Client } from './types'

// Recall interval per treatment type, in days. Conservative: this is "about
// due", not a clinical instruction. The clinician decides.
const RECALL_DAYS: Record<string, number> = {
  'anti-wrinkle': 112, // ~16 weeks (3 to 4 months)
  'dermal-filler': 270, // ~9 months
  'skin-booster': 168, // ~6 months (Profhilo maintenance)
  polynucleotides: 168,
  microneedling: 112,
  'chemical-peel': 112,
}

// How the treatment reads in a friendly client message.
const PHRASE: Record<string, string> = {
  'anti-wrinkle': 'anti-wrinkle treatment',
  'dermal-filler': 'filler',
  'skin-booster': 'Profhilo',
  polynucleotides: 'polynucleotide treatment',
  microneedling: 'microneedling',
  'chemical-peel': 'skin peel',
}

// Surface anything due within the next 2 weeks or already overdue.
const DUE_SOON_DAYS = 14
// Do not dig up one-offs from the distant past: only people seen in the last 18 months.
const LOOKBACK_DAYS = 540

export type RebookItem = {
  markKey: string
  clientName: string
  firstName: string
  treatmentGroup: string
  treatmentLabel: string
  lastService: string
  lastDate: string
  dueDate: string
  monthsSince: number
  overdueDays: number
  phone: string | null
  draft: string
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000)
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

function buildDraft(firstName: string, group: string, monthsSince: number): string {
  const phrase = PHRASE[group] ?? 'treatment'
  const when = monthsSince <= 1 ? 'about a month ago' : `around ${monthsSince} months ago`
  return `Hi ${firstName}, your ${phrase} with us was ${when}, so you are about due if you would like it kept up. Book a time that suits you here: ${BOOKING_URL}`
}

export function recallDays(group: string): number | null {
  return RECALL_DAYS[group] ?? null
}

/**
 * Build the rebooking list. Marks (contacted / dismissed) whose snooze_until is
 * still in the future are hidden.
 */
export async function dueRebookings(): Promise<RebookItem[]> {
  const today = new Date()
  const todayIso = today.toISOString().slice(0, 10)
  const lookbackIso = addDays(todayIso, -LOOKBACK_DAYS)

  const [appts, clients, marks] = await Promise.all([
    select<Appointment>('appointments', { order: 'date.desc', limit: 5000 }),
    select<Client>('clients', { select: 'first_name,last_name,phone', limit: 5000 }).catch(() => []),
    select<{ mark_key: string; snooze_until: string | null }>('rebook_marks', {
      select: 'mark_key,snooze_until',
      limit: 5000,
    }).catch(() => []),
  ])

  // Phone lookup by "first last" (best effort; clients table may be sparse).
  const phoneByName = new Map<string, string>()
  for (const c of clients) {
    const full = `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim().toLowerCase()
    if (full && c.phone) phoneByName.set(full, c.phone)
  }

  // Snoozed keys still in effect.
  const snoozed = new Set<string>()
  for (const m of marks) {
    if (!m.snooze_until || m.snooze_until > todayIso) snoozed.add(m.mark_key)
  }

  // Future bookings per client+group, so we never nag someone already returning.
  const futureBooked = new Set<string>()
  for (const a of appts) {
    if (a.status !== 'booked') continue
    if (a.date < todayIso) continue
    const g = matchTreatmentType(a.service_name)
    if (g) futureBooked.add(`${a.client_name.trim().toLowerCase()}|${g}`)
  }

  // Most recent completed appointment per client+group.
  type Last = { clientName: string; service: string; date: string }
  const lastByKey = new Map<string, Last>()
  for (const a of appts) {
    if (a.status !== 'completed') continue
    if (a.date < lookbackIso) continue
    const group = matchTreatmentType(a.service_name)
    if (!group || !(group in RECALL_DAYS)) continue
    const key = `${a.client_name.trim().toLowerCase()}|${group}`
    // appts are date.desc, so the first one we see per key is the latest.
    if (!lastByKey.has(key)) lastByKey.set(key, { clientName: a.client_name.trim(), service: a.service_name, date: a.date })
  }

  const items: RebookItem[] = []
  for (const [key, last] of lastByKey) {
    if (snoozed.has(key) || futureBooked.has(key)) continue
    const group = key.split('|')[1]
    const interval = RECALL_DAYS[group]
    const dueDate = addDays(last.date, interval)
    const overdueDays = daysBetween(today, new Date(`${dueDate}T12:00:00Z`))
    if (overdueDays < -DUE_SOON_DAYS) continue // not due yet
    const monthsSince = Math.max(1, Math.round(daysBetween(today, new Date(`${last.date}T12:00:00Z`)) / 30))
    const firstName = firstNameOf(last.clientName)
    items.push({
      markKey: key,
      clientName: last.clientName,
      firstName,
      treatmentGroup: group,
      treatmentLabel: getTreatmentType(group)?.name ?? group,
      lastService: last.service,
      lastDate: last.date,
      dueDate,
      monthsSince,
      overdueDays,
      phone: phoneByName.get(last.clientName.toLowerCase()) ?? null,
      draft: buildDraft(firstName, group, monthsSince),
    })
  }

  // Most overdue first.
  items.sort((a, b) => b.overdueDays - a.overdueDays)
  return items
}
