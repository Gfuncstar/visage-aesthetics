import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { parseOvatuCsv } from '@/lib/assistant/ovatu-csv'
import { migrateUpcomingBookings } from '@/lib/booking-engine/migrate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

// POST { csv, dryRun?, send? } — bring upcoming Ovatu bookings into the new
// system as real, changeable bookings. Staff only.
//   dryRun: true  -> preview the result, write nothing (default).
//   send: true    -> also email each migrated client their account link.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })

  let csv = ''
  let dryRun = true
  let send = false
  try {
    const b = (await req.json()) as { csv?: unknown; dryRun?: unknown; send?: unknown }
    if (typeof b.csv === 'string') csv = b.csv
    if (typeof b.dryRun === 'boolean') dryRun = b.dryRun
    if (typeof b.send === 'boolean') send = b.send
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!csv.trim()) return NextResponse.json({ error: 'Paste the Ovatu CSV export first.' }, { status: 400 })

  const { rows, headers } = parseOvatuCsv(csv)
  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'No rows could be read. The file needs a header row with at least a date column.', headers },
      { status: 400 },
    )
  }

  try {
    const report = await migrateUpcomingBookings(rows, { send, dryRun })
    return NextResponse.json({ ok: true, dryRun, headers, report })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Migration failed' }, { status: 502 })
  }
}
