import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { londonToday } from '@/lib/booking-engine/time'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type WaitRow = { id: string; client_name: string; service_name: string | null; client_phone: string | null; created_at: string }

// The front-desk overview: today's diary, recent online bookings, reminders
// going out, the waitlist, and who is due back.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ configured: false })

  const now = new Date()
  const todayStr = londonToday()
  const todayStart = `${todayStr}T00:00:00Z`
  const todayEnd = `${todayStr}T23:59:59Z`
  const weekEnd = new Date(now.getTime() + 7 * 86400_000).toISOString()
  const next24 = new Date(now.getTime() + 24 * 3600_000).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 86400_000).toISOString()

  try {
    const [today, justBooked, upcoming, soon, waitlist] = await Promise.all([
      select<Booking>('bookings', { and: `(starts_at.gte.${todayStart},starts_at.lte.${todayEnd})`, status: 'neq.cancelled', order: 'starts_at.asc', limit: 100 }),
      select<Booking>('bookings', { source: 'eq.online', and: `(created_at.gte.${weekAgo})`, order: 'created_at.desc', limit: 8 }),
      select<Booking>('bookings', { and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${weekEnd})`, status: 'neq.cancelled', select: 'id', limit: 300 }),
      select<Booking>('bookings', { status: 'eq.confirmed', and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${next24})`, select: 'id,reminded_at', limit: 200 }),
      select<WaitRow>('waitlist', { status: 'eq.waiting', order: 'created_at.asc', limit: 50 }),
    ])

    const remindersPending = soon.filter((b) => !b.reminded_at).length

    return NextResponse.json({
      configured: true,
      today: todayStr,
      stats: {
        todayCount: today.filter((b) => b.status !== 'cancelled').length,
        weekCount: upcoming.length,
        waitlistCount: waitlist.length,
        remindersPending,
        remindersSoon: soon.length,
      },
      todaysBookings: today.map(lite),
      justBooked: justBooked.map(lite),
      waitlist,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

function lite(b: Booking) {
  return {
    id: b.id,
    service_name: b.service_name,
    client_name: b.client_name,
    client_phone: b.client_phone,
    starts_at: b.starts_at,
    status: b.status,
    source: b.source,
    created_at: b.created_at,
  }
}
