import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import type { BusinessHours } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ hours: [], configured: false })
  try {
    const hours = await select<BusinessHours>('business_hours', { order: 'weekday.asc', limit: 7 })
    return NextResponse.json({ hours, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

export async function PATCH(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const weekday = Number(body.weekday)
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: 'weekday must be 0–6' }, { status: 400 })
  }

  try {
    await update<BusinessHours>('business_hours', { weekday: String(weekday) }, {
      is_open: Boolean(body.is_open),
      open_min: Number(body.open_min),
      close_min: Number(body.close_min),
    })
    await audit('update', 'business_hours', String(weekday))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}
