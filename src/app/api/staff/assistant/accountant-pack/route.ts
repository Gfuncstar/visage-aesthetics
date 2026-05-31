import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, audit } from '@/lib/assistant/db'
import { monthBounds, currentMonthKey } from '@/lib/assistant/format'
import {
  monthSummary,
  revenueByTreatment,
  buildAccountantText,
  buildAccountantCsv,
} from '@/lib/assistant/finance'
import type { Appointment, Order } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/staff/assistant/accountant-pack?month=YYYY-MM&format=csv|json
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  const params = new URL(req.url).searchParams
  const monthParam = params.get('month')?.trim()
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : currentMonthKey()
  const format = params.get('format') === 'csv' ? 'csv' : 'json'
  const { start, end } = monthBounds(month)

  try {
    const [appts, orders] = await Promise.all([
      select<Appointment>('appointments', {
        and: `(date.gte.${start},date.lte.${end})`,
        order: 'date.asc',
        limit: 5000,
      }),
      select<Order>('orders', {
        and: `(date.gte.${start},date.lte.${end})`,
        order: 'date.asc',
        limit: 5000,
      }),
    ])

    if (format === 'csv') {
      const csv = buildAccountantCsv(appts, orders)
      await audit('export', 'accountant_pack', month, { format: 'csv' })
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="visage-${month}.csv"`,
        },
      })
    }

    const summary = monthSummary(appts, orders)
    const revenue = revenueByTreatment(appts)
    const text = buildAccountantText(month, summary, revenue)
    await audit('export', 'accountant_pack', month, { format: 'text' })
    return NextResponse.json({ ok: true, month, text, summary })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not build pack'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
