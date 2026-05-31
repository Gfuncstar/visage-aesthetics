import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insertMany, audit } from '@/lib/assistant/db'
import { ovatuConfigured, fetchClients, fetchAppointments } from '@/lib/assistant/ovatu'
import type { Appointment, Client } from '@/lib/assistant/types'

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
    const clients = await fetchClients()
    const since = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
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

    await audit('sync', 'ovatu', undefined, { clients: clientsUpserted, appointments: apptsUpserted })
    return NextResponse.json({ ok: true, clients: clientsUpserted, appointments: apptsUpserted })
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
