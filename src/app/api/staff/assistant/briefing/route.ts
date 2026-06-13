import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { buildBriefing } from '@/lib/assistant/briefing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/staff/assistant/briefing — the owner's spoken briefing, read aloud
// in the browser. PIN-gated like the rest of the Assistant data routes.
export async function GET() {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  try {
    const briefing = await buildBriefing()
    return NextResponse.json(briefing)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not build the briefing'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
