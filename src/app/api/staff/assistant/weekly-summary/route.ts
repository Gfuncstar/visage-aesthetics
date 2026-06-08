// Weekly clinic summary — sent to Bernadette every Tuesday at 8am UTC.
// Shows the week ahead day-by-day (bookings + free slots), last week's numbers,
// and the current waitlist.
//
// Triggered by Vercel cron (see vercel.json). Also callable by signed-in staff
// for testing.

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { londonToday, addDaysStr, clockLabel } from '@/lib/booking-engine/time'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'
import { gbp, ukDate } from '@/lib/assistant/format'
import type { Booking, BusinessHours, TimeOff } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Set WEEKLY_SUMMARY_EMAIL env var to override. Default from voice: "bear dot parsons at outlook dot com"
const SUMMARY_TO = process.env.WEEKLY_SUMMARY_EMAIL ?? 'bernadette.parsons@outlook.com'
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

type Interval = { start: number; end: number }

function toLocalMin(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(iso))
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  return h * 60 + m
}

function subtractIntervals(free: Interval[], busy: Interval[]): Interval[] {
  let result = [...free]
  for (const b of busy) {
    result = result.flatMap((f) => {
      if (b.end <= f.start || b.start >= f.end) return [f]
      const parts: Interval[] = []
      if (b.start > f.start) parts.push({ start: f.start, end: b.start })
      if (b.end < f.end) parts.push({ start: b.end, end: f.end })
      return parts
    })
  }
  return result
}

function durationLabel(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null].filter(Boolean).join(' ')
}

function dayHeading(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const wday = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  return `${DAY_LONG[wday]} ${d} ${MONTH_SHORT[mo - 1]} ${y}`
}

function localDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date(iso))
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Email not configured' }, { status: 503 })

  const today = londonToday()
  const weekEnd = addDaysStr(today, 6)
  const lastWeekStart = addDaysStr(today, -7)
  const lastWeekEnd = addDaysStr(today, -1)

  // Build date bounds for PostgREST queries
  const weekStartUTC = `${today}T00:00:00Z`
  const weekEndUTC = `${weekEnd}T23:59:59Z`
  const lastWeekStartUTC = `${lastWeekStart}T00:00:00Z`
  const lastWeekEndUTC = `${lastWeekEnd}T23:59:59Z`

  const [businessHours, bookings, timeOff, lastWeekAppts, waitlist] = await Promise.all([
    select<BusinessHours>('business_hours', { limit: 7 }),
    select<Booking>('bookings', {
      and: `(starts_at.gte.${weekStartUTC},starts_at.lte.${weekEndUTC})`,
      status: 'neq.cancelled',
      order: 'starts_at.asc',
      limit: 200,
    }),
    select<TimeOff>('time_off', {
      and: `(starts_at.lte.${weekEndUTC},ends_at.gte.${weekStartUTC})`,
      limit: 100,
    }),
    select<{ date: string; price: number }>('appointments', {
      and: `(date.gte.${lastWeekStart},date.lte.${lastWeekEnd})`,
      status: 'eq.completed',
      select: 'date,price',
      limit: 500,
    }).catch(() => [] as { date: string; price: number }[]),
    select<{ client_name: string; service_name: string | null }>('waitlist', {
      status: 'eq.waiting',
      order: 'created_at.asc',
      limit: 20,
      select: 'client_name,service_name',
    }).catch(() => [] as { client_name: string; service_name: string | null }[]),
  ])

  // Build the body text section by section
  const lines: string[] = []
  lines.push(`Good morning, Bernadette. Here is your week ahead, as of ${dayHeading(today)}.`)
  lines.push('')

  // --- Week ahead ---
  let totalBooked = 0
  let totalFreeMin = 0

  for (let i = 0; i < 7; i++) {
    const date = addDaysStr(today, i)
    const wday = new Date(`${date}T12:00:00Z`).getUTCDay()
    const bh = businessHours.find((h) => h.weekday === wday)

    if (!bh?.is_open) continue // skip closed days silently

    const dayBookings = bookings
      .filter((b) => localDate(b.starts_at) === date && b.status !== 'cancelled')
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))

    const dayTimeOff = timeOff.filter((t) => localDate(t.starts_at) <= date && localDate(t.ends_at) >= date)

    const busySlots: Interval[] = [
      ...dayBookings.filter((b) => b.ends_at).map((b) => ({ start: toLocalMin(b.starts_at), end: toLocalMin(b.ends_at!) })),
      ...dayTimeOff.map((t) => ({ start: toLocalMin(t.starts_at), end: toLocalMin(t.ends_at) })),
    ]

    const gaps = subtractIntervals([{ start: bh.open_min, end: bh.close_min }], busySlots).filter(
      (g) => g.end - g.start >= 15,
    )
    const freeMin = gaps.reduce((s, g) => s + g.end - g.start, 0)
    totalBooked += dayBookings.length
    totalFreeMin += freeMin

    const openStr = `${clockLabel(bh.open_min)}–${clockLabel(bh.close_min)}`
    lines.push(`**${dayHeading(date)}** (${openStr})`)

    if (dayBookings.length === 0 && dayTimeOff.length === 0) {
      lines.push(`Nothing booked — ${durationLabel(bh.close_min - bh.open_min)} fully free.`)
    } else {
      for (const b of dayBookings) {
        lines.push(`• ${clockLabel(toLocalMin(b.starts_at))} — ${b.client_name} — ${b.service_name}`)
      }
      for (const t of dayTimeOff) {
        lines.push(`• ${clockLabel(toLocalMin(t.starts_at))}–${clockLabel(toLocalMin(t.ends_at))} blocked${t.reason ? ` (${t.reason})` : ''}`)
      }
      if (gaps.length > 0) {
        const gapStr = gaps.map((g) => `${clockLabel(g.start)}–${clockLabel(g.end)} (${durationLabel(g.end - g.start)})`).join(', ')
        lines.push(`  Free: ${gapStr}`)
      }
    }
    lines.push('')
  }

  if (totalBooked === 0) {
    lines.push('No appointments booked in your open days this week.')
    lines.push('')
  }

  if (totalFreeMin >= 30) {
    lines.push(`**Free time this week:** ${durationLabel(totalFreeMin)} across your open days.`)
    lines.push('')
  }

  // --- Last week ---
  const lastWeekCount = lastWeekAppts.length
  const lastWeekRevenue = lastWeekAppts.reduce((s, a) => s + (Number(a.price) || 0), 0)
  lines.push(`**Last week:** ${lastWeekCount} appointment${lastWeekCount === 1 ? '' : 's'} completed${lastWeekRevenue > 0 ? `, est. ${gbp(lastWeekRevenue)}` : ''}.`)
  lines.push('')

  // --- Waitlist ---
  if (waitlist.length > 0) {
    lines.push(`**Waitlist (${waitlist.length}):**`)
    for (const w of waitlist) {
      lines.push(`• ${w.client_name}${w.service_name ? ` — ${w.service_name}` : ''}`)
    }
    lines.push('')
  }

  lines.push('Have a great week.')

  const body = lines.join('\n')

  const [d, mo] = today.split('-').map(Number)
  const subject = `Week ahead — ${dayHeading(today).split(' ').slice(0, 3).join(' ')}`

  const opts = {
    preheader: `${totalBooked} appointment${totalBooked === 1 ? '' : 's'} booked this week.`,
    headline: 'Your week ahead',
    body,
    cta: 'none' as const,
  }

  try {
    await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to: [SUMMARY_TO],
      replyTo: REPLY_TO,
      subject,
      html: buildBroadcastHtml(opts),
      text: buildBroadcastText({ headline: opts.headline, body, cta: 'none' }),
    })
    return NextResponse.json({ ok: true, to: SUMMARY_TO, bookings: totalBooked })
  } catch (err) {
    console.error('[weekly-summary] send failed', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 502 })
  }
}
