import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { getTreatmentType } from '@/lib/assistant/treatment-types'
import type { Appointment, TreatmentRecord } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Photo = {
  id: string
  client_name: string
  date: string
  type: string
  treatment_type: string | null
  url: string
  consent: boolean
  notes: string | null
}

// GET ?q=...      -> matching clients with a quick summary (search list)
// GET ?name=...   -> one client's full record (visits, notes, photos, summary)
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ configured: false, clients: [] })
  }
  const params = new URL(req.url).searchParams
  const name = params.get('name')?.trim()
  const q = params.get('q')?.trim() ?? ''

  try {
    if (name) {
      // PostgREST equality is case-sensitive; match case-insensitively.
      const enc = name.replace(/[%,()]/g, ' ')
      const norm = name.trim().toLowerCase().replace(/\s+/g, ' ')
      const [appts, treatments, photos, dnc, flags] = await Promise.all([
        select<Appointment>('appointments', { client_name: `ilike.${enc}`, order: 'date.desc', limit: 500 }),
        select<TreatmentRecord>('treatment_records', { client_name: `ilike.${enc}`, order: 'date.desc', limit: 500 }),
        select<Photo>('photos', { client_name: `ilike.${enc}`, order: 'date.desc', limit: 200 }),
        select<{ id: string }>('do_not_contact', { name_normalised: `eq.${norm}`, limit: 1 }).catch(() => []),
        select<{ blocked: boolean; requires_deposit: boolean }>('client_flags', { name_normalised: `eq.${norm}`, limit: 1 }).catch(() => []),
      ])

      const completed = appts.filter((a) => a.status === 'completed')
      const totalSpend = completed.reduce((s, a) => s + (Number(a.price) || 0), 0)
      const byTreatment = new Map<string, number>()
      for (const a of completed) byTreatment.set(a.service_name, (byTreatment.get(a.service_name) ?? 0) + 1)

      return NextResponse.json({
        configured: true,
        client: {
          name,
          visits: completed.length,
          totalSpend,
          firstVisit: completed.length ? completed[completed.length - 1].date : null,
          lastVisit: completed.length ? completed[0].date : null,
          treatments: Array.from(byTreatment.entries())
            .map(([service, count]) => ({ service, count }))
            .sort((a, b) => b.count - a.count),
        },
        appointments: appts,
        treatmentRecords: treatments.map((t) => ({
          ...t,
          treatment_label: getTreatmentType(t.treatment_type)?.name ?? t.treatment_type,
        })),
        photos,
        doNotContact: dnc.length > 0,
        blocked: flags[0]?.blocked ?? false,
        requiresDeposit: flags[0]?.requires_deposit ?? false,
      })
    }

    // Search / browse: distinct clients from appointments, sortable.
    const sort = params.get('sort') // 'spend' | 'visits' | default recent
    const enc = q.replace(/[%,()]/g, ' ')
    const rows = await select<Appointment>('appointments', {
      ...(q ? { client_name: `ilike.*${enc}*` } : {}),
      order: 'date.desc',
      limit: 3000,
    })
    const map = new Map<string, { name: string; visits: number; spend: number; lastVisit: string }>()
    for (const a of rows) {
      const key = a.client_name.trim()
      if (!key) continue
      const done = a.status === 'completed'
      const price = done ? Number(a.price) || 0 : 0
      const cur = map.get(key.toLowerCase())
      if (cur) {
        cur.visits += done ? 1 : 0
        cur.spend += price
      } else {
        map.set(key.toLowerCase(), { name: key, visits: done ? 1 : 0, spend: price, lastVisit: a.date })
      }
    }
    const cmp =
      sort === 'spend'
        ? (a: { spend: number }, b: { spend: number }) => b.spend - a.spend
        : sort === 'visits'
          ? (a: { visits: number }, b: { visits: number }) => b.visits - a.visits
          : (a: { lastVisit: string }, b: { lastVisit: string }) => b.lastVisit.localeCompare(a.lastVisit)
    const clients = Array.from(map.values()).sort(cmp).slice(0, 40)
    return NextResponse.json({ configured: true, clients })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not load record'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
