import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'

export const runtime = 'nodejs'

const FIELDS = [
  'name',
  'dateOfTreatment',
  'treatment',
  'specificArea',
  'productUsed',
  'lotNoExp',
  'dosage',
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

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: sharedSecret, ...body }),
      cache: 'no-store',
    })
    if (!upstream.ok) {
      const text = await upstream.text()
      console.error('Sheet webhook failed', upstream.status, text)
      return NextResponse.json({ error: 'Could not save to sheet' }, { status: 502 })
    }
  } catch (err) {
    console.error('Sheet webhook error', err)
    return NextResponse.json({ error: 'Could not save to sheet' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
