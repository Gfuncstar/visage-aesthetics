import { NextResponse } from 'next/server'
import { assistantConfigured } from '@/lib/assistant/db'
import { getService, computeDay, availabilityCalendar } from '@/lib/booking-engine/availability'
import { londonToday } from '@/lib/booking-engine/time'
import { lookupClientFlags } from '@/lib/booking-engine/client-flags'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Public:
//   ?service=slug&date=YYYY-MM-DD          -> slots for that day
//   ?service=slug&from=YYYY-MM-DD&days=30  -> { date: freeCount } calendar
// Optional &email= &phone= identify the client; a blocked client is shown no
// availability (discreetly appears fully booked).
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ slots: [], configured: false })
  const params = new URL(req.url).searchParams
  const slug = (params.get('service') ?? '').trim().slice(0, 80)
  if (!slug) return NextResponse.json({ error: 'Missing service' }, { status: 400 })

  try {
    const service = await getService(slug)
    if (!service) return NextResponse.json({ error: 'Unknown service' }, { status: 404 })

    // Discreet block: a flagged client sees an empty diary, never an error.
    const flags = await lookupClientFlags({
      email: params.get('email'),
      phone: params.get('phone'),
      name: params.get('name'),
    })

    const date = params.get('date')
    if (date) {
      if (!DATE_RE.test(date)) return NextResponse.json({ error: 'Bad date' }, { status: 400 })
      const slots = flags.blocked ? [] : await computeDay(service, date)
      return NextResponse.json({ service: publicService(service), slots })
    }

    const from = params.get('from') && DATE_RE.test(params.get('from')!) ? params.get('from')! : londonToday()
    const days = Math.min(60, Math.max(1, Number(params.get('days') ?? 30)))
    const calendar = flags.blocked ? {} : await availabilityCalendar(service, from, days)
    return NextResponse.json({ service: publicService(service), calendar })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

function publicService(s: { slug: string; name: string; duration_min: number; price_from: number; category: string | null }) {
  return { slug: s.slug, name: s.name, duration_min: s.duration_min, price_from: s.price_from, category: s.category }
}
