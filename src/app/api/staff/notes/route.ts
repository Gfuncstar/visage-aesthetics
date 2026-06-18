import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, update } from '@/lib/assistant/db'

export const runtime = 'nodejs'

// Google Apps Script web apps can be slow to respond on a cold start. Give the
// function enough headroom to wait for the sheet write rather than letting the
// platform kill it with a bare "Timed out" page. (Vercel caps this to the plan
// limit: 60s on Hobby, higher on Pro.)
export const maxDuration = 60

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function normName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Best-effort: once a treatment note is saved, tick the matching booking on the
// staff landing page so Bernadette can see at a glance whose notes are done.
// Matched by client name and the treatment date; never blocks the submission.
async function flagBookingNotesDone(name: string, date: string): Promise<void> {
  if (!assistantConfigured() || !name || !DATE_RE.test(date)) return
  const target = normName(name)
  try {
    const rows = await select<{ id: string; client_name: string }>('bookings', {
      and: `(starts_at.gte.${date}T00:00:00Z,starts_at.lte.${date}T23:59:59Z)`,
      status: 'neq.cancelled',
      select: 'id,client_name',
      limit: 50,
    })
    const matches = rows.filter((r) => normName(r.client_name ?? '') === target)
    for (const m of matches) {
      await update('bookings', { id: m.id }, { notes_done: true })
    }
  } catch (err) {
    console.error('[staff/notes] could not flag booking notes_done', err)
  }
}

// Keep a readable copy of the note in the clinic database, so a saved note can
// later be shown back (the Google sheet is write-only). Best-effort: a failure
// here must never stop the note being saved to the sheet.
async function savePatientNoteCopy(body: Record<string, string | undefined>): Promise<void> {
  if (!assistantConfigured() || !body.name) return
  try {
    await insert('patient_notes', {
      client_name: body.name,
      name_normalised: normName(body.name),
      date: body.dateOfTreatment || null,
      treatment: body.treatment || null,
      specific_area: body.specificArea || null,
      product_used: body.productUsed || null,
      lot_no_exp: body.lotNoExp || null,
      dosage: body.dosage || null,
      consultation_done: body.consultationDone || null,
      before_photos_taken: body.beforePhotosTaken || null,
      problems_noted: body.problemsNoted || null,
      aftercare_provided: body.aftercareProvided || null,
      additional_notes: body.additionalNotes || null,
      emergency_contact_provided: body.emergencyContactProvided || null,
      date_signed: body.dateSigned || null,
    })
  } catch (err) {
    console.error('[staff/notes] could not save patient_notes copy', err)
  }
}

const FIELDS = [
  'name',
  'dateOfTreatment',
  'treatment',
  'specificArea',
  'productUsed',
  'lotNoExp',
  'dosage',
  'consultationDone',
  'beforePhotosTaken',
  'problemsNoted',
  'aftercareProvided',
  'additionalNotes',
  'emergencyContactProvided',
  'dateSigned',
] as const

type Payload = Partial<Record<(typeof FIELDS)[number], string>>

function clean(input: unknown): Payload {
  const out: Payload = {}
  if (!input || typeof input !== 'object') return out
  for (const key of FIELDS) {
    const value = (input as Record<string, unknown>)[key]
    if (typeof value === 'string') out[key] = value.trim().slice(0, 4000)
  }
  return out
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const url = process.env.STAFF_NOTES_WEBHOOK_URL
  const sharedSecret = process.env.STAFF_NOTES_WEBHOOK_SECRET
  if (!url || !sharedSecret) {
    return NextResponse.json({ error: 'Sheet webhook not configured' }, { status: 500 })
  }

  let body: Payload
  try {
    body = clean(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!body.name || !body.treatment) {
    return NextResponse.json({ error: 'Name and treatment are required' }, { status: 400 })
  }

  // Abort the webhook call before the platform kills the whole function, so a
  // genuinely stuck sheet write returns our own friendly message instead of a
  // bare "Timed out" page.
  const controller = new AbortController()
  const abortTimer = setTimeout(() => controller.abort(), 50_000)

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: sharedSecret, ...body }),
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    })
    const text = await upstream.text()

    // Apps Script web apps redirect POST → 302 → /macros/echo, where the
    // response body might come back as JSON or HTML depending on how the
    // runtime handled the redirect. We treat as failure ONLY when we can
    // see a clear failure signal: explicit {ok:false} JSON, the
    // "Script function not found" error page, or a non-2xx status.
    let parsed: { ok?: boolean; error?: string } | null = null
    try {
      parsed = JSON.parse(text)
    } catch {
      // not JSON; might be Apps Script's HTML redirect chrome, that's
      // OK as long as the status was 2xx and the body isn't a known error.
    }

    const knownDeployError =
      text.includes('Script function not found') ||
      text.includes('TypeError') ||
      text.includes('ReferenceError')

    if (!upstream.ok || parsed?.ok === false || knownDeployError) {
      console.error('Sheet webhook rejected submission', {
        status: upstream.status,
        contentType: upstream.headers.get('content-type') || '',
        bodySnippet: text.slice(0, 300),
      })
      return NextResponse.json(
        {
          error:
            parsed?.error ||
            'The clinic notes sheet did not accept this submission. Please tell Giles.',
        },
        { status: 502 },
      )
    }
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError'
    console.error('Sheet webhook error', err)
    return NextResponse.json(
      {
        error: timedOut
          ? 'Saving took too long. The note may still have saved, so please check the sheet before trying again.'
          : 'Could not save to sheet',
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(abortTimer)
  }

  // The note is saved; keep a readable copy and tick the matching booking on the
  // landing page. Both are best-effort and the name is required above.
  await Promise.all([
    savePatientNoteCopy(body),
    flagBookingNotesDone(body.name ?? '', body.dateOfTreatment ?? ''),
  ])

  return NextResponse.json({ ok: true })
}

// ---- GET ?name=&date= : the notes already on file for a client -------------
// Powers the "previously saved notes" panel shown when a card's Notes tick is
// tapped. Combines the Patient Notes form copies with clinical write-ups, newest
// first, so whichever route was used, the saved note shows.
type SavedNote = { source: 'notes-form' | 'write-up'; date: string | null; treatment: string | null; body: string; created_at: string }

type PatientNoteRow = {
  client_name: string; date: string | null; treatment: string | null; specific_area: string | null
  product_used: string | null; lot_no_exp: string | null; dosage: string | null
  consultation_done: string | null
  before_photos_taken: string | null; problems_noted: string | null; aftercare_provided: string | null
  additional_notes: string | null; emergency_contact_provided: string | null; created_at: string
}
type WriteUpRow = { client_name: string; date: string | null; treatment_type: string | null; clinical_note: string | null; notes: string | null; created_at: string }

function patientNoteBody(r: PatientNoteRow): string {
  const lines: string[] = []
  if (r.specific_area) lines.push(`Area: ${r.specific_area}`)
  if (r.product_used) lines.push(`Product: ${r.product_used}${r.lot_no_exp ? ` (Lot/Exp: ${r.lot_no_exp})` : ''}`)
  if (r.dosage) lines.push(`Dosage: ${r.dosage}`)
  const flags: string[] = []
  if (r.consultation_done) flags.push(`Consultation done: ${r.consultation_done}`)
  if (r.before_photos_taken) flags.push(`Photographs taken: ${r.before_photos_taken}`)
  if (r.aftercare_provided) flags.push(`Aftercare sent: ${r.aftercare_provided}`)
  if (r.problems_noted && r.problems_noted !== 'No') flags.push(`Problems noted: ${r.problems_noted}`)
  if (r.emergency_contact_provided) flags.push(`Emergency contact: ${r.emergency_contact_provided}`)
  if (flags.length) lines.push(flags.join('  ·  '))
  if (r.additional_notes) lines.push(r.additional_notes)
  return lines.join('\n')
}

export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) return NextResponse.json({ notes: [] })
  const name = (new URL(req.url).searchParams.get('name') ?? '').trim().slice(0, 200)
  if (!name) return NextResponse.json({ notes: [] })
  const target = normName(name)
  try {
    const [formNotes, writeUps] = await Promise.all([
      select<PatientNoteRow>('patient_notes', { name_normalised: `eq.${target}`, order: 'created_at.desc', limit: 25 }),
      select<WriteUpRow>('treatment_records', { client_name: `ilike.${name}`, order: 'created_at.desc', limit: 25 }),
    ])
    const notes: SavedNote[] = [
      ...formNotes.map((r): SavedNote => ({ source: 'notes-form', date: r.date, treatment: r.treatment, body: patientNoteBody(r), created_at: r.created_at })),
      ...writeUps
        .filter((r) => normName(r.client_name ?? '') === target)
        .map((r): SavedNote => ({ source: 'write-up', date: r.date, treatment: r.treatment_type, body: (r.clinical_note || r.notes || '').trim(), created_at: r.created_at })),
    ]
      .filter((n) => n.body)
      .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    return NextResponse.json({ notes })
  } catch (err) {
    console.error('[staff/notes] could not read saved notes', err)
    return NextResponse.json({ notes: [] })
  }
}
