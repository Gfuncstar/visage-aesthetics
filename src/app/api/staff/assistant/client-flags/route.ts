import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insertMany, update, audit } from '@/lib/assistant/db'
import { customers } from '@/lib/customers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

// POST { name, flag: 'blocked'|'requires_deposit', value } — set a boolean booking flag.
// POST { name, blockedUntil: 'YYYY-MM-DD' | null }       — set/clear the time-bound block.
// Upserts a client_flags row; stores their mailing-list email so the flag matches
// them at booking time.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let name = ''
  let flag = ''
  let value: boolean | null = null
  let rawBody: { name?: unknown; flag?: unknown; value?: unknown; blockedUntil?: unknown }
  try {
    rawBody = (await req.json()) as typeof rawBody
    if (typeof rawBody.name === 'string') name = rawBody.name.trim().slice(0, 120)
    if (rawBody.flag === 'blocked' || rawBody.flag === 'requires_deposit') flag = rawBody.flag
    if (typeof rawBody.value === 'boolean') value = rawBody.value
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // ── blockedUntil branch ──────────────────────────────────────────────────────
  if ('blockedUntil' in rawBody) {
    if (!name) return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    const until =
      rawBody.blockedUntil === null || rawBody.blockedUntil === ''
        ? null
        : typeof rawBody.blockedUntil === 'string'
          ? rawBody.blockedUntil
          : null
    const normalised = norm(name)
    try {
      const existing = await select<{ id: string }>('client_flags', { name_normalised: `eq.${normalised}`, limit: 1 })
      if (existing.length > 0) {
        await update('client_flags', { name_normalised: normalised }, { blocked_until: until })
      } else if (until !== null) {
        const cust = customers.find((c) => norm(`${c.firstName ?? ''} ${c.lastName ?? ''}`) === normalised)
        await insertMany('client_flags', [{
          name_normalised: normalised,
          full_name: name,
          email: cust?.email?.toLowerCase() ?? null,
          blocked_until: until,
        }], { onConflict: 'name_normalised' })
      }
      await audit('update', 'client_flags', normalised, { blockedUntil: until })
      return NextResponse.json({ ok: true })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
    }
  }
  // ── boolean flag branch ──────────────────────────────────────────────────────

  if (!name || !flag || value === null) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const normalised = norm(name)
  try {
    const existing = await select<{ id: string }>('client_flags', { name_normalised: `eq.${normalised}`, limit: 1 })
    if (existing.length > 0) {
      await update('client_flags', { name_normalised: normalised }, { [flag]: value })
    } else {
      const cust = customers.find((c) => norm(`${c.firstName ?? ''} ${c.lastName ?? ''}`) === normalised)
      await insertMany('client_flags', [{
        name_normalised: normalised,
        full_name: name,
        email: cust?.email?.toLowerCase() ?? null,
        [flag]: value,
      }], { onConflict: 'name_normalised' })
    }
    await audit('update', 'client_flags', normalised, { flag, value })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}
