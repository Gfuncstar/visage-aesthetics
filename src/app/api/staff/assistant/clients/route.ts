import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { customers } from '@/lib/customers'
import type { Client } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Suggestion = { id: string | null; name: string; email: string | null; source: string }

// GET /api/staff/assistant/clients?q=...
// Returns client suggestions: synced/created DB clients first, then the
// existing (Cliniko) mailing list as fallback names so the picker is useful
// before any Ovatu/CSV sync has happened.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  const q = new URL(req.url).searchParams.get('q')?.trim().toLowerCase() ?? ''

  const out: Suggestion[] = []
  const seen = new Set<string>()

  if (assistantConfigured()) {
    try {
      const clients = await select<Client>('clients', { order: 'last_name.asc', limit: 500 })
      for (const c of clients) {
        const name = `${c.first_name} ${c.last_name}`.trim()
        const key = (c.email || name).toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        out.push({ id: c.id, name, email: c.email, source: c.source })
      }
    } catch (err) {
      console.error('[assistant/clients] db read failed', err)
    }
  }

  for (const c of customers) {
    const name = `${c.firstName} ${c.lastName}`.trim()
    const key = (c.email || name).toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ id: null, name, email: c.email, source: 'cliniko' })
  }

  const filtered = q
    ? out.filter((s) => s.name.toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q))
    : out
  filtered.sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ clients: filtered.slice(0, 50), total: filtered.length })
}

// POST — create a client record in the clinic database.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  let body: { firstName?: string; lastName?: string; email?: string; phone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const firstName = (body.firstName ?? '').toString().trim().slice(0, 120)
  const lastName = (body.lastName ?? '').toString().trim().slice(0, 120)
  if (!firstName && !lastName) {
    return NextResponse.json({ error: 'A name is required.' }, { status: 400 })
  }
  try {
    const client = await insert<Client>('clients', {
      first_name: firstName,
      last_name: lastName,
      email: (body.email ?? '').toString().trim().toLowerCase() || null,
      phone: (body.phone ?? '').toString().trim() || null,
      source: 'manual',
    })
    await audit('create', 'client', client.id)
    return NextResponse.json({ ok: true, client })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not create client'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
