import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { executeAction, type Action } from '@/lib/assistant/command'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TYPES = new Set(['book', 'cancel', 'block_time', 'waitlist', 'flag', 'set_hours'])

// POST { action } — execute a confirmed action from the command bar.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let action: Action
  try {
    const b = (await req.json()) as { action?: Action }
    if (!b.action || typeof b.action !== 'object' || !TYPES.has((b.action as Action).type)) {
      return NextResponse.json({ error: 'Nothing to do.' }, { status: 400 })
    }
    action = b.action
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const result = await executeAction(action)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not do that' }, { status: 502 })
  }
}
