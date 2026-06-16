import { NextResponse } from 'next/server'
import { sessionCookie } from '@/lib/account/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: clear the client session cookie.
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', sessionCookie('', 0))
  return res
}
