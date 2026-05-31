import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, update, remove, audit } from '@/lib/assistant/db'
import { ORDER_CATEGORIES, type Order } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CATEGORY_SET = new Set(ORDER_CATEGORIES.map((c) => c.value))
const UUID_RE = /^[0-9a-f-]{36}$/i

// PATCH — edit a field, confirm a queued parse, or toggle paid.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

  let b: Record<string, unknown>
  try {
    b = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  if (typeof b.supplier_name === 'string') patch.supplier_name = b.supplier_name.trim().slice(0, 200)
  if (typeof b.order_number === 'string') patch.order_number = b.order_number.trim() || null
  if (typeof b.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) patch.date = b.date
  if (typeof b.category === 'string' && CATEGORY_SET.has(b.category as never)) patch.category = b.category
  if (b.net !== undefined) patch.net = Number(b.net) || 0
  if (b.vat !== undefined) patch.vat = Number(b.vat) || 0
  if (b.total !== undefined) patch.total = Number(b.total) || 0
  if (typeof b.paid === 'boolean') patch.paid = b.paid
  if (b.status === 'pending' || b.status === 'confirmed') patch.status = b.status

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  try {
    const rows = await update<Order>('orders', { id }, patch)
    if (rows.length === 0) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    await audit('update', 'order', id, patch)
    return NextResponse.json({ ok: true, order: rows[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not update order'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

// DELETE — remove an order/expense line.
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })
  try {
    await remove('orders', { id })
    await audit('delete', 'order', id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not delete order'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
