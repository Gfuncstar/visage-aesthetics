import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insertMany, audit } from '@/lib/assistant/db'
import { parseOvatuCsv } from '@/lib/assistant/ovatu-csv'
import type { Appointment } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST { csv: string } — import an Ovatu appointments CSV export.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  let csv = ''
  try {
    const b = (await req.json()) as { csv?: unknown }
    if (typeof b.csv === 'string') csv = b.csv
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!csv.trim()) {
    return NextResponse.json({ error: 'No CSV content provided.' }, { status: 400 })
  }

  const { rows, skipped, headers } = parseOvatuCsv(csv)
  if (rows.length === 0) {
    return NextResponse.json(
      {
        error:
          'No appointments could be read from that file. Check it has a header row with a date column.',
        headers,
      },
      { status: 400 },
    )
  }

  const importBatch = `csv-${new Date().toISOString()}`
  const payload = rows.map((r) => ({
    client_name: r.client_name,
    date: r.date,
    service_name: r.service_name,
    price: r.price,
    status: r.status,
    // Keep the contact details the export carries — previously these were
    // parsed and then dropped, leaving migrated bookings with no way to reach
    // the client.
    email: r.email,
    phone: r.phone,
    import_batch: importBatch,
  }))

  try {
    const inserted = await insertMany<Appointment>('appointments', payload)
    await audit('import', 'appointment', importBatch, { count: inserted.length, skipped })
    const completed = inserted.filter((a) => a.status === 'completed').length
    return NextResponse.json({
      ok: true,
      imported: inserted.length,
      completed,
      skipped,
      headers,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Import failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
