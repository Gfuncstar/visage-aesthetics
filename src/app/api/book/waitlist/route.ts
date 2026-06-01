import { NextResponse } from 'next/server'
import { assistantConfigured, insert } from '@/lib/assistant/db'
import { getService } from '@/lib/booking-engine/availability'
import { lookupClientFlags } from '@/lib/booking-engine/client-flags'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public: join the waitlist for a service. A blocked client is silently not
// added (they believe they joined, but are never alerted).
export async function POST(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  let b: { service?: unknown; name?: unknown; email?: unknown; phone?: unknown; note?: unknown }
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const slug = typeof b.service === 'string' ? b.service.trim().slice(0, 80) : ''
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 120) : ''
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 160) : ''
  const phone = typeof b.phone === 'string' ? b.phone.trim().slice(0, 40) : ''
  const note = typeof b.note === 'string' ? b.note.trim().slice(0, 400) : ''

  if (!name) return NextResponse.json({ error: 'Please leave your name.' }, { status: 400 })
  if (!email && !phone) return NextResponse.json({ error: 'Please leave an email or phone number.' }, { status: 400 })
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 })

  try {
    const flags = await lookupClientFlags({ name, email, phone })
    if (flags.blocked) return NextResponse.json({ ok: true }) // discreetly do nothing

    const service = slug ? await getService(slug) : null
    await insert('waitlist', {
      service_slug: service?.slug ?? slug ?? null,
      service_name: service?.name ?? null,
      client_name: name,
      client_email: email || null,
      client_phone: phone || null,
      preferred_note: note || null,
      status: 'waiting',
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not join' }, { status: 502 })
  }
}
