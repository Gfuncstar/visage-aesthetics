import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { listActiveServices } from '@/lib/booking-engine/availability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Staff: the full active service list, including staff-only services that are
// not bookable online (e.g. a follow-up Review). The diary and reception
// "add to diary" pickers use this instead of the public /api/book/services so
// staff can book services clients can't self-book.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ services: [], configured: false })
  try {
    const services = await listActiveServices()
    return NextResponse.json({ services, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}
