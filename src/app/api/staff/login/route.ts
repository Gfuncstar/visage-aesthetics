import { NextResponse } from 'next/server'
import { STAFF_COOKIE, buildSessionToken, checkPin } from '@/lib/staff-auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let pin = ''
  try {
    const body = (await req.json()) as { pin?: unknown }
    if (typeof body.pin === 'string') pin = body.pin
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!pin || !checkPin(pin)) {
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 })
  }

  const { value, maxAge } = buildSessionToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(STAFF_COOKIE, value, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
  return res
}
