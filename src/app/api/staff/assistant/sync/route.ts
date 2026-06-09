import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insertMany, select, audit } from '@/lib/assistant/db'
import { ovatuConfigured, fetchClients, fetchAppointments } from '@/lib/assistant/ovatu'
import { cutoverLive } from '@/lib/assistant/go-live'
import type { Appointment, Client } from '@/lib/assistant/types'

const FALLBACK_DAYS = 400
const SYNC_KEY = 'last_ovatu_sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Syncs clients + appointments from Ovatu. Upserts on the unique ovatu_id so it
// is safe to run repeatedly (on a schedule or on demand).
//
// Auth: signed-in staff, OR a cron call carrying CRON_SECRET.
async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

async function run() {
  // The single cutover switch. While running in parallel with Ovatu this stays
  // on. Once CUTOVER=go is set (see src/lib/assistant/go-live.ts), the Ovatu
  // import becomes a no-op so the in-house system is the sole source of truth.
  if (cutoverLive()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'Cutover is live (CUTOVER=go). Ovatu sync is off; the in-house system is the source of truth.',
    })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  if (!ovatuConfigured()) {
    return NextResponse.json(
      { error: 'Ovatu is not configured (OVATU_API_TOKEN missing). Use the CSV import instead.' },
      { status: 503 },
    )
  }

  try {
    // Incremental: use the last successful sync timestamp so each run only
    // fetches what Ovatu has changed since then. Falls back to FALLBACK_DAYS
    // on the very first run (or if the key is missing).
    const configRows = await select<{ value: string }>('app_config', {
      key: `eq.${SYNC_KEY}`, limit: 1,
    }).catch(() => [] as { value: string }[])
    const lastSync = configRows[0]?.value
    const since = lastSync
      ? new Date(lastSync).toISOString().slice(0, 10)
      : new Date(Date.now() - FALLBACK_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const syncStarted = new Date().toISOString()

    const clients = await fetchClients()
    const appointments = await fetchAppointments(since)

    let clientsUpserted = 0
    let apptsUpserted = 0

    if (clients.length > 0) {
      const rows = await insertMany<Client>('clients', clients.map((c) => ({
        ovatu_id: c.ovatu_id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        source: 'ovatu',
      })), { onConflict: 'ovatu_id' })
      clientsUpserted = rows.length
    }

    if (appointments.length > 0) {
      const rows = await insertMany<Appointment>('appointments', appointments.map((a) => ({
        ovatu_id: a.ovatu_id,
        client_name: a.client_name,
        date: a.date,
        service_name: a.service_name,
        price: a.price,
        status: a.status,
        import_batch: 'ovatu-sync',
      })), { onConflict: 'ovatu_id' })
      apptsUpserted = rows.length
    }

    // Stamp successful sync time so the next run picks up only new changes.
    await insertMany('app_config', [{ key: SYNC_KEY, value: syncStarted }], { onConflict: 'key' }).catch(() => {})

    await audit('sync', 'ovatu', undefined, { clients: clientsUpserted, appointments: apptsUpserted, since })
    return NextResponse.json({ ok: true, clients: clientsUpserted, appointments: apptsUpserted, since })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sync failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
