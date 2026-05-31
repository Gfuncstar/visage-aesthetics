// End-of-day summary: who was seen today and who still needs writing up.
// Read server-side and shown as a nudge on the Assistant landing page.

import { select } from './db'

type ApptRow = { client_name: string; service_name: string; starts_at: string | null }
type RecRow = { client_name: string }
type ReqRow = { id: string }

export type EndOfDay = {
  seen: number
  written: number
  toWrite: { name: string; service: string }[]
  squeezeIns: number
}

export async function endOfDaySummary(): Promise<EndOfDay | null> {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const [appts, records, requests] = await Promise.all([
      select<ApptRow>('appointments', {
        date: `eq.${today}`,
        status: 'neq.cancelled',
        order: 'starts_at.asc',
        select: 'client_name,service_name,starts_at',
        limit: 100,
      }),
      select<RecRow>('treatment_records', { date: `eq.${today}`, select: 'client_name', limit: 200 }),
      select<ReqRow>('booking_requests', { status: 'eq.to_book', select: 'id', limit: 100 }),
    ])

    if (appts.length === 0) return { seen: 0, written: 0, toWrite: [], squeezeIns: requests.length }

    const written = new Set(records.map((r) => (r.client_name ?? '').trim().toLowerCase()).filter(Boolean))

    // One entry per client (a visit may span several services).
    const byName = new Map<string, string>()
    for (const a of appts) {
      const name = (a.client_name ?? '').trim()
      if (name && !byName.has(name)) byName.set(name, a.service_name || 'Appointment')
    }

    const toWrite: { name: string; service: string }[] = []
    for (const [name, service] of byName) {
      if (!written.has(name.toLowerCase())) toWrite.push({ name, service })
    }

    return {
      seen: byName.size,
      written: byName.size - toWrite.length,
      toWrite,
      squeezeIns: requests.length,
    }
  } catch {
    return null
  }
}
