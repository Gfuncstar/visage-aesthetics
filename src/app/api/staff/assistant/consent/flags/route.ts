import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { consentNamesDone, consentReview } from '@/lib/assistant/consent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — two normalized client-name lists for the per-row consent indicator:
//   missing — booked in the next 2 weeks with no consent on file and none sent
//             (post go-live only). These get the red warning flag.
//   onFile  — clients whose consent is genuinely DONE (completed/signed or
//             waived). These get the green tick. A form that's only been sent and
//             not yet filled in is NOT here, so it shows no tick — staff can see
//             at a glance it's still outstanding.
// A name in neither list (e.g. a grandfathered booking we aren't chasing) shows
// no indicator at all, so the list never claims consent it can't vouch for.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ missing: [], onFile: [] })

  try {
    const [review, doneSet] = await Promise.all([
      consentReview(),
      consentNamesDone().catch(() => new Set<string>()),
    ])
    const missing = (review?.bookedMissing ?? []).map((m) => m.name.trim().toLowerCase())
    return NextResponse.json({ missing, onFile: Array.from(doneSet) })
  } catch {
    return NextResponse.json({ missing: [], onFile: [] })
  }
}
