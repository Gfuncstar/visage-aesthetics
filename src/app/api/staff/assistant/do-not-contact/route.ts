import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insertMany, remove, audit } from '@/lib/assistant/db'
import { customers } from '@/lib/customers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

// POST { name, suppress } — mark a client do-not-contact, or lift the marker.
// When suppressing we also store the mailing-list email so suppression works
// by address as well as name.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let name = ''
  let suppress: boolean | null = null
  try {
    const b = (await req.json()) as { name?: unknown; suppress?: unknown }
    if (typeof b.name === 'string') name = b.name.trim().slice(0, 200)
    if (typeof b.suppress === 'boolean') suppress = b.suppress
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!name || suppress === null) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const normalised = norm(name)
  try {
    if (suppress) {
      const cust = customers.find((c) => norm(`${c.firstName ?? ''} ${c.lastName ?? ''}`) === normalised)
      await insertMany(
        'do_not_contact',
        [
          {
            name_normalised: normalised,
            full_name: name,
            email: cust?.email?.toLowerCase() ?? null,
            reason: 'Marked from client record',
          },
        ],
        { onConflict: 'name_normalised' },
      )
    } else {
      await remove('do_not_contact', { name_normalised: normalised })
    }
    await audit('update', 'do_not_contact', normalised, { suppress })
    return NextResponse.json({ ok: true, doNotContact: suppress })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}
