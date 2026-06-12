'use client'

import { dayTakings } from '@/lib/assistant/treatment-pricing'
import { gbp } from '@/lib/assistant/format'

const TZ = 'Europe/London'
function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}
function toLocalMin(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(iso))
  return Number(parts.find((p) => p.type === 'hour')?.value ?? '0') * 60 + Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
}

type DayBooking = { service_name: string; status: string; starts_at: string; ends_at?: string }

// The day's takings — the website value of the treatments seen that day. Shown
// only once the clinic day is done (a past day, or today after the last client
// has finished) so it sits on each day as a record of what was taken.
export default function DayTakingsCard({ day, bookings, nowMin }: { day: string; bookings: DayBooking[]; nowMin: number }) {
  const today = todayStr()
  const live = bookings.filter((b) => b.status !== 'cancelled')
  if (live.length === 0) return null

  let complete = day < today
  if (day === today) {
    const ends = live.map((b) => (b.ends_at ? toLocalMin(b.ends_at) : toLocalMin(b.starts_at) + 60))
    complete = ends.length > 0 && nowMin >= Math.max(...ends)
  }
  if (!complete) return null

  const { total, attended } = dayTakings(bookings)
  if (attended === 0) return null

  return (
    <div className="mb-2 flex items-center justify-between gap-3 rounded-sm border border-gold/45 bg-gold/[0.08] px-4 py-3">
      <span className="text-eyebrow text-gold-deep">Day&apos;s takings · {attended} seen</span>
      <span className="font-display italic text-lg text-charcoal">{gbp(total)}</span>
    </div>
  )
}
