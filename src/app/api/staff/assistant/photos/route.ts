import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insert, remove, select, audit } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_BYTES = 12 * 1024 * 1024 // 12 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
const UUID_RE = /^[0-9a-f-]{36}$/i

// POST — upload a before/after photo against a client (multipart form).
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Photo storage not configured (BLOB_READ_WRITE_TOKEN missing).' }, { status: 500 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 })
  }

  const file = form.get('file')
  const clientName = String(form.get('client_name') ?? '').trim().slice(0, 200)
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  if (!clientName) return NextResponse.json({ error: 'A client is required.' }, { status: 400 })
  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPG, PNG, WEBP or HEIC image.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 12 MB).' }, { status: 400 })
  }

  const type = ['before', 'after', 'other'].includes(String(form.get('type'))) ? String(form.get('type')) : 'before'
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(form.get('date'))) ? String(form.get('date')) : new Date().toISOString().slice(0, 10)
  const consent = String(form.get('consent')) === 'true'
  const treatmentType = String(form.get('treatment_type') ?? '').trim() || null
  const notes = String(form.get('notes') ?? '').trim().slice(0, 1000) || null

  const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
  // Unguessable path; the row that references it lives in the RLS-locked DB.
  const filename = `clinic-photos/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

  try {
    const blob = await put(filename, file, { access: 'public', contentType: file.type || 'image/jpeg', addRandomSuffix: true })
    const row = await insert<{ id: string }>('photos', {
      client_name: clientName,
      date,
      type,
      treatment_type: treatmentType,
      url: blob.url,
      consent,
      notes,
    })
    await audit('create', 'photo', row.id, { client: clientName, type })
    return NextResponse.json({ ok: true, id: row.id, url: blob.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

// DELETE ?id=... — remove a photo (row + blob).
export async function DELETE(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  const id = new URL(req.url).searchParams.get('id')?.trim() ?? ''
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })
  try {
    const rows = await select<{ id: string; url: string }>('photos', { id: `eq.${id}`, limit: 1 })
    if (rows[0]?.url && process.env.BLOB_READ_WRITE_TOKEN) {
      try { await del(rows[0].url) } catch { /* blob may already be gone */ }
    }
    await remove('photos', { id })
    await audit('delete', 'photo', id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not delete'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
