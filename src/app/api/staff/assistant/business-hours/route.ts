import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, audit } from '@/lib/assistant/db'
import type { BusinessHours } from '@/lib/booking-engine/types'
import { loadOpeningWindows, setWeekdayWindows, type OpeningWindow } from '@/lib/booking-engine/opening-hours'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ hours: [], windows: {}, configured: false })
  try {
    const [hours, windowMap] = await Promise.all([
      select<BusinessHours>('business_hours', { order: 'weekday.asc', limit: 7 }),
      loadOpeningWindows(),
    ])
    // Plain object keyed by weekday for the client (Maps don't serialise).
    const windows: Record<number, OpeningWindow[]> = {}
    for (const [wd, list] of windowMap) windows[wd] = list
    return NextResponse.json({ hours, windows, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

function parseWindows(raw: unknown): OpeningWindow[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((w) => ({ open_min: Number((w as OpeningWindow)?.open_min), close_min: Number((w as OpeningWindow)?.close_min) }))
    .filter((w) => Number.isFinite(w.open_min) && Number.isFinite(w.close_min))
}

function validWeekday(v: unknown): number | null {
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null
}

// Set the full set of opening windows for a weekday (any number of sessions).
export async function PUT(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const weekday = validWeekday(body.weekday)
  if (weekday === null) return NextResponse.json({ error: 'weekday must be 0–6' }, { status: 400 })

  const windows = parseWindows(body.windows)
  for (const w of windows) {
    if (w.close_min <= w.open_min) {
      return NextResponse.json({ error: 'Each session must close after it opens.' }, { status: 400 })
    }
  }

  try {
    await setWeekdayWindows(weekday, windows)
    await audit('update', 'opening_windows', String(weekday))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}

// Legacy single-window save (kept for the quick diary editor and the assistant
// command). Replaces the weekday's windows with the one window, or closes it.
export async function PATCH(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const weekday = validWeekday(body.weekday)
  if (weekday === null) return NextResponse.json({ error: 'weekday must be 0–6' }, { status: 400 })

  const windows = Boolean(body.is_open)
    ? [{ open_min: Number(body.open_min), close_min: Number(body.close_min) }]
    : []
  if (windows.length && windows[0].close_min <= windows[0].open_min) {
    return NextResponse.json({ error: 'The closing time must be after the opening time.' }, { status: 400 })
  }

  try {
    await setWeekdayWindows(weekday, windows)
    await audit('update', 'business_hours', String(weekday))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}
