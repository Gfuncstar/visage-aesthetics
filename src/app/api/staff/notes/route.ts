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
      redirect: 'follow',
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
      // not JSON; might be Apps Script's HTML redirect chrome — that's
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
    console.error('Sheet webhook error', err)
    return NextResponse.json({ error: 'Could not save to sheet' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
