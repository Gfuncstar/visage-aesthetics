import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { monthBounds, currentMonthKey } from '@/lib/assistant/format'
import { monthSummary, revenueByTreatment } from '@/lib/assistant/finance'
import type { Appointment, Order } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/staff/assistant/profit?month=YYYY-MM
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ configured: false })
  }
  const monthParam = new URL(req.url).searchParams.get('month')?.trim()
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : currentMonthKey()

  // Six-month trend window covering the selected month and the five before it.
  const trendKeys = monthKeysEndingAt(month, 6)
  const windowStart = monthBounds(trendKeys[trendKeys.length - 1]).start
  const windowEnd = monthBounds(trendKeys[0]).end

  try {
    const [appts, orders] = await Promise.all([
      select<Appointment>('appointments', {
        and: `(date.gte.${windowStart},date.lte.${windowEnd})`,
        order: 'date.asc',
        limit: 5000,
      }),
      select<Order>('orders', {
        and: `(date.gte.${windowStart},date.lte.${windowEnd})`,
        order: 'date.asc',
        limit: 5000,
      }),
    ])

    const { start, end } = monthBounds(month)
    const monthAppts = appts.filter((a) => a.date >= start && a.date <= end)
    const monthOrders = orders.filter((o) => o.date >= start && o.date <= end)

    const summary = monthSummary(monthAppts, monthOrders)
    const revenue = revenueByTreatment(monthAppts)

    const trend = trendKeys
      .slice()
      .reverse()
      .map((key) => {
        const b = monthBounds(key)
        const rev = appts
          .filter((a) => a.status === 'completed' && a.date >= b.start && a.date <= b.end)
          .reduce((s, a) => s + (Number(a.price) || 0), 0)
        const spend = orders
          .filter((o) => o.status === 'confirmed' && o.date >= b.start && o.date <= b.end)
          .reduce((s, o) => s + (Number(o.total) || 0), 0)
        return { month: key, revenue: rev, spend }
      })

    return NextResponse.json({ configured: true, month, summary, revenue, trend })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not compute profit'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

function monthKeysEndingAt(month: string, count: number): string[] {
  const [y, m] = month.split('-').map(Number)
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    out.push(d.toISOString().slice(0, 7))
  }
  return out // newest first
}
