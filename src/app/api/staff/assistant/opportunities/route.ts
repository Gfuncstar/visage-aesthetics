import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import type { Opportunity } from '@/lib/assistant/opportunities'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — the visibility list (awards + press the scout has found).
// Defaults to everything not dismissed, newest first.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ opportunities: [], configured: false })

  const url = new URL(req.url)
  const kind = url.searchParams.get('kind')
  const includeDismissed = url.searchParams.get('all') === '1'

  const query: Record<string, string | number> = { order: 'created_at.desc', limit: 200 }
  if (kind === 'award' || kind === 'press') query.kind = `eq.${kind}`
  if (!includeDismissed) query.status = 'neq.dismissed'

  try {
    const opportunities = await select<Opportunity>('opportunities', query)
    return NextResponse.json({ opportunities, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}
