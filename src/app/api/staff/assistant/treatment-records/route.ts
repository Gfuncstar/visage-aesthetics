import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, update, audit } from '@/lib/assistant/db'
import { buildClinicalNote, totalDose, type WriteUpInput } from '@/lib/assistant/notes'
import { pushNoteToSheet } from '@/lib/assistant/notes-sheet'
import { getTreatmentType, type UnitType } from '@/lib/assistant/treatment-types'
import type { TreatmentRecord } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/staff/assistant/treatment-records?batch=ABC123  (recall / traceability)
// or ?client_id=...  or recent.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ records: [], configured: false })
  }
  const params = new URL(req.url).searchParams
  const batch = params.get('batch')?.trim()
  const clientId = params.get('client_id')?.trim()
  try {
    const query: Record<string, string | number> = { order: 'date.desc', limit: 200 }
    if (batch) query.batch_number = `ilike.${batch}`
    if (clientId) query.client_id = `eq.${clientId}`
    const records = await select<TreatmentRecord>('treatment_records', query)
    return NextResponse.json({ records, configured: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not load records'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

function sanitiseInput(raw: unknown): WriteUpInput | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  const t = getTreatmentType(String(b.treatmentTypeId ?? ''))
  if (!t) return null
  const areasRaw = Array.isArray(b.areas) ? b.areas : []
  const areas = areasRaw
    .map((a) => {
      const o = a as Record<string, unknown>
      return { area: String(o.area ?? '').slice(0, 120), dose: Number(o.dose) || 0 }
    })
    .filter((a) => a.area)
  return {
    clientName: String(b.clientName ?? '').trim().slice(0, 200),
    treatmentTypeId: t.id,
    date: String(b.date ?? '').slice(0, 10),
    product: String(b.product ?? '').trim().slice(0, 200),
    batchNumber: String(b.batchNumber ?? '').trim().slice(0, 120),
    expiry: String(b.expiry ?? '').trim().slice(0, 40),
    areas,
    unit: t.unit as UnitType,
    technique: String(b.technique ?? '').trim().slice(0, 500),
    consent: Boolean(b.consent),
    reviewDate: String(b.reviewDate ?? '').slice(0, 10),
    notes: String(b.notes ?? '').trim().slice(0, 4000),
  }
}

// POST — save a treatment record. Writes to the clinic database AND pushes the
// clinical note to the existing patient-notes sheet. The clinical note text can
// be overridden by the editor (clinicalNote field).
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const input = sanitiseInput(parsed)
  if (!input) {
    return NextResponse.json({ error: 'A client name and treatment type are required.' }, { status: 400 })
  }
  if (!input.clientName) {
    return NextResponse.json({ error: 'A client name is required.' }, { status: 400 })
  }
  if (!input.date) {
    return NextResponse.json({ error: 'A treatment date is required.' }, { status: 400 })
  }

  const editedNote = typeof (parsed as Record<string, unknown>).clinicalNote === 'string'
    ? ((parsed as Record<string, unknown>).clinicalNote as string).slice(0, 8000)
    : ''
  const clinicalNote = editedNote.trim() || buildClinicalNote(input)
  const clientId = typeof (parsed as Record<string, unknown>).clientId === 'string'
    ? ((parsed as Record<string, unknown>).clientId as string)
    : null

  const sheet = await pushNoteToSheet(input, clinicalNote)

  let savedId: string | null = null
  let dbError: string | null = null
  if (assistantConfigured()) {
    try {
      const rec = await insert<TreatmentRecord>('treatment_records', {
        client_id: clientId,
        client_name: input.clientName,
        date: input.date,
        treatment_type: input.treatmentTypeId,
        product: input.product || null,
        batch_number: input.batchNumber || null,
        expiry: input.expiry || null,
        areas: input.areas.map((a) => ({ area: a.area, dose: a.dose, unit: input.unit })),
        total_dose: input.unit === 'none' ? null : totalDose(input.areas),
        unit: input.unit === 'none' ? null : input.unit,
        technique: input.technique || null,
        consent: input.consent,
        review_date: input.reviewDate || null,
        notes: input.notes || null,
        clinical_note: clinicalNote,
      })
      savedId = rec.id
      await audit('create', 'treatment_record', rec.id, { treatment: input.treatmentTypeId })

      // Run the matching batch's stock down by what was used, so stock levels
      // stay accurate for the "what to order" view. Best-effort.
      if (input.batchNumber && input.unit !== 'none') {
        const used = totalDose(input.areas)
        if (used > 0) {
          try {
            const b = await select<{ id: string; quantity_used: number }>('batches', {
              batch_number: `ilike.${input.batchNumber}`,
              select: 'id,quantity_used',
              order: 'created_at.desc',
              limit: 1,
            })
            if (b[0]) await update('batches', { id: b[0].id }, { quantity_used: Number(b[0].quantity_used) + used })
          } catch (err) {
            console.error('[assistant/treatment-records] batch decrement failed', err)
          }
        }
      }
    } catch (err) {
      dbError = err instanceof Error ? err.message : 'Database save failed'
      console.error('[assistant/treatment-records] db save failed', err)
    }
  }

  // Succeed if it landed in at least one durable place.
  if (!savedId && !sheet.ok) {
    return NextResponse.json(
      { error: `Could not save the note. ${dbError ?? sheet.error ?? ''}`.trim() },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    id: savedId,
    savedToDatabase: Boolean(savedId),
    savedToSheet: sheet.ok,
    clinicalNote,
  })
}
