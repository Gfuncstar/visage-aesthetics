import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { buildBroadcastHtml, type CtaKind } from '@/lib/broadcast-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function str(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.slice(0, max)
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  let body = ''
  let preheader = ''
  let headline = ''
  let imageUrl = ''
  let cta: CtaKind = 'none'

  try {
    const payload = (await req.json()) as Record<string, unknown>
    body = str(payload.body, 20000)
    preheader = str(payload.preheader, 200)
    headline = str(payload.headline, 200)
    imageUrl = str(payload.imageUrl, 1000)
    if (payload.cta === 'book' || payload.cta === 'contact') cta = payload.cta
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const html = buildBroadcastHtml({
    body: body || '_(Body will appear here)_',
    preheader,
    headline,
    imageUrl,
    cta,
    recipientEmail: 'preview@vaclinic.co.uk',
  })

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
