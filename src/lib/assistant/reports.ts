// Ask-anything reporting. A natural-language question is mapped (by the AI in
// the /ask route) to one of these safe, parameterised reports, which run over
// the clinic's real appointment history and return a short spoken-style answer.

import { select } from './db'
import { gbp, ukDate } from './format'

type Appt = { client_name: string; date: string; service_name: string; price: number; status: string }
type BookingRow = { client_name: string; starts_at: string; service_name: string; status: string }

export type ReportQuery =
  | { intent: 'count_treatments'; service?: string | null; from?: string | null; to?: string | null }
  | { intent: 'revenue'; service?: string | null; from?: string | null; to?: string | null }
  | { intent: 'lapsed_clients'; since: string }
  | { intent: 'busy_day'; which: 'busiest' | 'quietest'; from?: string | null; to?: string | null }
  | { intent: 'top_clients'; by: 'spend' | 'visits'; limit?: number }
  | { intent: 'no_show_rate'; from?: string | null; to?: string | null }
  | { intent: 'count_upcoming' }
  | { intent: 'last_visit'; clientName: string }
  | { intent: 'client_history'; clientName: string; limit?: number }
  | { intent: 'next_appointment'; clientName: string }
  | { intent: 'waitlist_check'; service?: string | null }
  | { intent: 'unknown'; reason: string }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function rangeAnd(from?: string | null, to?: string | null): string | undefined {
  const parts: string[] = []
  if (from && DATE_RE.test(from)) parts.push(`date.gte.${from}`)
  if (to && DATE_RE.test(to)) parts.push(`date.lte.${to}`)
  return parts.length ? `(${parts.join(',')})` : undefined
}

function rangeLabel(from?: string | null, to?: string | null): string {
  if (from && to) return ` between ${ukDate(from)} and ${ukDate(to)}`
  if (from) return ` since ${ukDate(from)}`
  if (to) return ` up to ${ukDate(to)}`
  return ''
}

export async function runReport(q: ReportQuery): Promise<string> {
  switch (q.intent) {
    case 'count_treatments': {
      const term = q.service ? q.service.replace(/[%,()]/g, ' ') : null
      const rows = await select<Appt>('appointments', {
        status: 'eq.completed',
        ...(term ? { service_name: `ilike.*${term}*` } : {}),
        and: rangeAnd(q.from, q.to),
        select: 'id',
        limit: 5000,
      })
      const what = q.service ? `${q.service} appointment${rows.length === 1 ? '' : 's'}` : `appointment${rows.length === 1 ? '' : 's'}`
      return `${rows.length} ${what} completed${rangeLabel(q.from, q.to)}.`
    }

    case 'revenue': {
      const term = q.service ? q.service.replace(/[%,()]/g, ' ') : null
      const rows = await select<Appt>('appointments', {
        status: 'eq.completed',
        ...(term ? { service_name: `ilike.*${term}*` } : {}),
        and: rangeAnd(q.from, q.to),
        select: 'price',
        limit: 5000,
      })
      const total = rows.reduce((s, a) => s + (Number(a.price) || 0), 0)
      return `${gbp(total)} from ${rows.length} completed ${q.service ? `${q.service} ` : ''}appointment${rows.length === 1 ? '' : 's'}${rangeLabel(q.from, q.to)}.`
    }

    case 'lapsed_clients': {
      if (!DATE_RE.test(q.since)) return 'I need a date to measure from.'
      const rows = await select<Appt>('appointments', { status: 'eq.completed', order: 'date.desc', select: 'client_name,date', limit: 5000 })
      const last = new Map<string, string>()
      for (const a of rows) {
        const k = a.client_name.trim()
        if (!k) continue
        if (!last.has(k.toLowerCase())) last.set(k.toLowerCase(), a.date)
      }
      const lapsed: string[] = []
      for (const a of rows) {
        const k = a.client_name.trim()
        const lk = k.toLowerCase()
        if (!last.has(lk)) continue
        if ((last.get(lk) as string) < q.since) { lapsed.push(k); last.delete(lk) }
      }
      const sample = lapsed.slice(0, 8).join(', ')
      return `${lapsed.length} client${lapsed.length === 1 ? '' : 's'} have not been in since ${ukDate(q.since)}${lapsed.length ? `. For example: ${sample}.` : '.'}`
    }

    case 'busy_day': {
      const rows = await select<Appt>('appointments', { status: 'eq.completed', and: rangeAnd(q.from, q.to), select: 'date', limit: 5000 })
      const counts = new Array(7).fill(0)
      for (const a of rows) {
        const d = new Date(`${a.date}T12:00:00Z`)
        if (!Number.isNaN(d.getTime())) counts[d.getUTCDay()]++
      }
      const open = counts.map((n, i) => ({ i, n })).filter((x) => x.n > 0)
      if (open.length === 0) return `No completed appointments to compare${rangeLabel(q.from, q.to)}.`
      const pick = q.which === 'quietest'
        ? open.reduce((a, b) => (b.n < a.n ? b : a))
        : open.reduce((a, b) => (b.n > a.n ? b : a))
      return `Your ${q.which} day is ${WEEKDAYS[pick.i]} (${pick.n} appointment${pick.n === 1 ? '' : 's'}${rangeLabel(q.from, q.to)}).`
    }

    case 'top_clients': {
      const rows = await select<Appt>('appointments', { status: 'eq.completed', select: 'client_name,price', limit: 5000 })
      const agg = new Map<string, { name: string; spend: number; visits: number }>()
      for (const a of rows) {
        const k = a.client_name.trim()
        if (!k) continue
        const cur = agg.get(k.toLowerCase()) ?? { name: k, spend: 0, visits: 0 }
        cur.spend += Number(a.price) || 0
        cur.visits += 1
        agg.set(k.toLowerCase(), cur)
      }
      const list = Array.from(agg.values()).sort((a, b) => (q.by === 'spend' ? b.spend - a.spend : b.visits - a.visits))
      const top = list.slice(0, Math.min(q.limit ?? 5, 10))
      if (top.length === 0) return 'No client history yet.'
      const lines = top.map((c) => `${c.name} (${q.by === 'spend' ? gbp(c.spend) : `${c.visits} visit${c.visits === 1 ? '' : 's'}`})`)
      return `Top ${top.length} by ${q.by === 'spend' ? 'spend' : 'visits'}: ${lines.join(', ')}.`
    }

    case 'no_show_rate': {
      const [done, ns] = await Promise.all([
        select<Appt>('appointments', { status: 'eq.completed', and: rangeAnd(q.from, q.to), select: 'id', limit: 5000 }),
        select<Appt>('appointments', { status: 'eq.no_show', and: rangeAnd(q.from, q.to), select: 'id', limit: 5000 }),
      ])
      const total = done.length + ns.length
      if (total === 0) return `No appointments to measure${rangeLabel(q.from, q.to)}.`
      const pct = Math.round((ns.length / total) * 100)
      return `${pct}% no-show rate${rangeLabel(q.from, q.to)} (${ns.length} of ${total}).`
    }

    case 'count_upcoming': {
      const rows = await select<Appt>('appointments', { status: 'eq.booked', and: `(date.gte.${new Date().toISOString().slice(0, 10)})`, select: 'id', limit: 5000 })
      return `${rows.length} upcoming appointment${rows.length === 1 ? '' : 's'} booked.`
    }

    case 'last_visit': {
      const enc = q.clientName.replace(/[%,()]/g, ' ')
      const rows = await select<Appt>('appointments', {
        client_name: `ilike.*${enc}*`,
        status: 'eq.completed',
        order: 'date.desc',
        select: 'client_name,date,service_name',
        limit: 1,
      })
      if (!rows.length) {
        // Also check bookings table (for clients who haven't been imported)
        const bRows = await select<BookingRow>('bookings', {
          client_name: `ilike.*${enc}*`,
          status: 'eq.completed',
          order: 'starts_at.desc',
          select: 'client_name,starts_at,service_name',
          limit: 1,
        }).catch(() => [] as BookingRow[])
        if (!bRows.length) return `No completed visits found for ${q.clientName}.`
        const b = bRows[0]
        return `${b.client_name} last came in on ${ukDate(b.starts_at.slice(0, 10))} for ${b.service_name}.`
      }
      const a = rows[0]
      return `${a.client_name} last came in on ${ukDate(a.date)} for ${a.service_name}.`
    }

    case 'client_history': {
      const enc = q.clientName.replace(/[%,()]/g, ' ')
      const limit = Math.min(q.limit ?? 8, 20)
      const rows = await select<Appt>('appointments', {
        client_name: `ilike.*${enc}*`,
        status: 'eq.completed',
        order: 'date.desc',
        select: 'date,service_name,price',
        limit,
      })
      if (!rows.length) return `No visit history found for ${q.clientName}.`
      const lines = rows.map((a) => `${ukDate(a.date)}: ${a.service_name}${a.price ? ` (${gbp(a.price)})` : ''}`)
      return `${q.clientName} — ${rows.length} visit${rows.length === 1 ? '' : 's'}:\n${lines.join('\n')}`
    }

    case 'next_appointment': {
      const enc = q.clientName.replace(/[%,()]/g, ' ')
      const today = new Date().toISOString().slice(0, 10)
      const rows = await select<BookingRow>('bookings', {
        client_name: `ilike.*${enc}*`,
        status: `neq.cancelled`,
        and: `(starts_at.gte.${today}T00:00:00Z)`,
        order: 'starts_at.asc',
        select: 'client_name,starts_at,service_name,status',
        limit: 1,
      })
      if (!rows.length) return `No upcoming appointment found for ${q.clientName}.`
      const b = rows[0]
      const d = new Date(b.starts_at)
      const dateStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long' }).format(d)
      const timeStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
      return `${b.client_name}'s next appointment is ${b.service_name} on ${dateStr} at ${timeStr}.`
    }

    case 'waitlist_check': {
      const term = q.service ? q.service.replace(/[%,()]/g, ' ') : null
      const rows = await select<{ client_name: string; service_name: string | null; client_phone: string | null }>('waitlist', {
        status: 'eq.waiting',
        ...(term ? { service_name: `ilike.*${term}*` } : {}),
        order: 'created_at.asc',
        limit: 20,
        select: 'client_name,service_name,client_phone',
      })
      if (!rows.length) return term ? `Nobody on the waitlist for ${q.service}.` : 'The waitlist is empty.'
      const lines = rows.map((w) => `${w.client_name}${w.service_name ? ` — ${w.service_name}` : ''}${w.client_phone ? ` (${w.client_phone})` : ''}`)
      return `Waitlist${term ? ` for ${q.service}` : ''} (${rows.length}):\n${lines.join('\n')}`
    }

    default:
      return q.reason || 'I could not work out what to look up.'
  }
}
