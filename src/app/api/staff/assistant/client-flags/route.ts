import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insertMany, update, audit } from '@/lib/assistant/db'
import { customers } from '@/lib/customers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

// POST { name, flag: 'blocked'|'requires_deposit', value } — set a booking flag
// for a client. Upserts a client_flags row; stores their mailing-list email and
// phone so the flag matches them at booking time.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let name = ''
  let flag = ''
  let value: boolean | null = null
  try {
    const b = (await req.json()) as { name?: unknown; flag?: unknown; value?: unknown }
    if (typeof b.name === 'string') name = b.name.trim().slice(0, 120)
    if (b.flag === 'blocked' || b.flag === 'requires_deposit') flag = b.flag
    if (typeof b.value === 'boolean') value = b.value
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
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
