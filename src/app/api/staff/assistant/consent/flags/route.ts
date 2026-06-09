import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { consentReview } from '@/lib/assistant/consent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — returns normalized client names who are booked in the next 2 weeks
// but have no consent form on file and none sent. Used by the diary and
// reception views to show a per-row consent warning indicator.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ missing: [] })

  try {
    const review = await consentReview()
    const missing = (review?.bookedMissing ?? []).map((m) => m.name.trim().toLowerCase())
    return NextResponse.json({ missing })
  } catch {
    return NextResponse.json({ missing: [] })
  }
}
