import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insert, remove, audit } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST { item } — mark a stock item as ordered (knocks it off the list until
// the delivery is logged). DELETE { item } — undo.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  let item = ''
  try {
    const b = (await req.json()) as { item?: unknown }
    if (typeof b.item === 'string') item = b.item.trim().slice(0, 80)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!item) return NextResponse.json({ error: 'No item' }, { status: 400 })
  try {
    await insert('reorder_marks', { item_key: item })
    await audit('order', 'reorder_mark', item)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 502 })
  }
}

export async function DELETE(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  let item = ''
  try {
    const b = (await req.json()) as { item?: unknown }
    if (typeof b.item === 'string') item = b.item.trim().slice(0, 80)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!item) return NextResponse.json({ error: 'No item' }, { status: 400 })
  try {
    await remove('reorder_marks', { item_key: item })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 502 })
  }
}
