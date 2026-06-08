import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { runPreflight } from '@/lib/booking-engine/preflight'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET — the go-live readiness report (front end + back end). Staff only.
// Read-only: it changes nothing, so it is safe to run as often as you like.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  try {
    const report = await runPreflight()
    return NextResponse.json(report)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Check failed' }, { status: 502 })
  }
}
