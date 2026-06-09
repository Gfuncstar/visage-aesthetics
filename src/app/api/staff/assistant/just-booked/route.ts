import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — returns online bookings created in the last 48 hours, regardless of
// appointment date. Used by the CRM landing page "Just booked" card.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ bookings: [] })

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  try {
    const bookings = await select<{
      id: string
      client_name: string
      service_name: string
      starts_at: string
      status: string
      client_phone: string | null
      created_at: string
    }>('bookings', {
      source: 'eq.online',
      created_at: `gte.${since}`,
      status: 'neq.cancelled',
      order: 'created_at.desc',
      limit: 20,
    })
    return NextResponse.json({ bookings })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}
