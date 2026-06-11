import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MEDICAL_TABLES = [
  'clients',
  'treatment_records',
  'appointments',
  'bookings',
  'consent_requests',
  'consent_submissions',
  'photos',
  'batches',
  'audit_log',
  'client_flags',
  'do_not_contact',
] as const

const BUSINESS_TABLES = [
  'orders',
  'order_lines',
  'suppliers',
  'products',
  'services',
] as const

// GET — streams a full JSON backup as a downloadable file
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const exportedAt = new Date().toISOString()
  const data: Record<string, unknown[]> = {}
  const counts: Record<string, number> = {}
  const errors: string[] = []

  for (const table of [...MEDICAL_TABLES, ...BUSINESS_TABLES]) {
    try {
      // Paginate — fetch up to 10,000 rows per table
      let rows: unknown[] = []
      let offset = 0
      const limit = 1000
      while (true) {
        const batch = await select<unknown>(table as string, { limit, offset } as never)
        rows = rows.concat(batch as unknown[])
        if ((batch as unknown[]).length < limit) break
        offset += limit
      }
      data[table] = rows
      counts[table] = rows.length
    } catch (err) {
      errors.push(`${table}: ${err instanceof Error ? err.message : 'failed'}`)
      data[table] = []
      counts[table] = 0
    }
  }

  const totalRows = Object.values(counts).reduce((s, n) => s + n, 0)

  const backup = {
    _meta: {
      exported_at: exportedAt,
      version: '1.0',
      clinic: 'Visage Aesthetics, Braintree, Essex',
      practitioner: 'Bernadette Tobin RGN, MSc',
      supabase_project: 'yawclxvhgbtzacthstpr',
      region: 'eu-west-2 (London)',
      total_rows: totalRows,
      table_counts: counts,
      medical_tables: MEDICAL_TABLES,
      errors: errors.length > 0 ? errors : undefined,
      note: 'UK GDPR — medical records. Handle as special category health data.',
    },
    ...data,
  }

  const json = JSON.stringify(backup, null, 2)
  const date = exportedAt.slice(0, 10)

  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="visage-backup-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}

// POST — returns latest backup log entry
export async function POST() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ configured: false })

  try {
    const rows = await select<{
      id: string
      backed_up_at: string
      tables_included: number
      total_rows: number
      dropbox_path: string
      email_sent: boolean
    }>('backup_log', { order: 'backed_up_at.desc', limit: 5 })
    return NextResponse.json({ ok: true, backups: rows })
  } catch {
    return NextResponse.json({ ok: true, backups: [] })
  }
}
