import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insertMany, remove } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function norm(name: string): string {
  return name.trim().toLowerCase()
}

// POST { clientName } — mark a client as consent-waived so they drop off the
// "no consent on file" list. DELETE { clientName } removes the waiver.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let clientName = ''
  try {
    const b = (await req.json()) as { clientName?: unknown }
    if (typeof b.clientName === 'string') clientName = b.clientName.trim().slice(0, 200)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!clientName) return NextResponse.json({ error: 'clientName required' }, { status: 400 })

  try {
    await insertMany(
      'consent_waivers',
      [{ client_name: clientName, client_name_norm: norm(clientName) }],
      { onConflict: 'client_name_norm' },
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not waive' }, { status: 502 })
  }
}

export async function DELETE(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let clientName = ''
  try {
    const b = (await req.json()) as { clientName?: unknown }
    if (typeof b.clientName === 'string') clientName = b.clientName.trim().slice(0, 200)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!clientName) return NextResponse.json({ error: 'clientName required' }, { status: 400 })

  try {
    await remove('consent_waivers', { client_name_norm: norm(clientName) })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not remove waiver' }, { status: 502 })
  }
}
