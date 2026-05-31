import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { monthBounds } from '@/lib/assistant/format'
import { ORDER_CATEGORIES, type Order, type OrderCategory } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CATEGORY_SET = new Set(ORDER_CATEGORIES.map((c) => c.value))

// GET /api/staff/assistant/orders?month=YYYY-MM&status=pending|confirmed
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ orders: [], configured: false })
  }
  const params = new URL(req.url).searchParams
  const month = params.get('month')?.trim()
  const status = params.get('status')?.trim()
  try {
    const query: Record<string, string | number> = { order: 'date.desc', limit: 500 }
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const { start, end } = monthBounds(month)
      query['and'] = `(date.gte.${start},date.lte.${end})`
    }
    if (status === 'pending' || status === 'confirmed') query.status = `eq.${status}`
    const orders = await select<Order>('orders', query)
    return NextResponse.json({ orders, configured: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not load orders'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

// POST — manually add an order/expense. Manual adds are confirmed by default.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  let b: Record<string, unknown>
  try {
    b = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supplierName = String(b.supplier_name ?? '').trim().slice(0, 200)
  const date = String(b.date ?? '').slice(0, 10)
  const category = String(b.category ?? 'stock') as OrderCategory
  if (!supplierName) return NextResponse.json({ error: 'Supplier is required.' }, { status: 400 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'A valid date is required.' }, { status: 400 })
  }
  if (!CATEGORY_SET.has(category)) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
  }

  const num = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  const net = num(b.net)
  const vat = num(b.vat)
  let total = num(b.total)
  if (!total && (net || vat)) total = net + vat

  try {
    const order = await insert<Order>('orders', {
      supplier_name: supplierName,
      date,
      order_number: String(b.order_number ?? '').trim() || null,
      category,
      net,
      vat,
      total,
      currency: 'GBP',
      paid: Boolean(b.paid),
      status: 'confirmed',
    })
    await audit('create', 'order', order.id, { manual: true })
    return NextResponse.json({ ok: true, order })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not save order'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
