import { NextResponse } from 'next/server'
import { STAFF_COOKIE, buildSessionToken, checkPin } from '@/lib/staff-auth'

export const runtime = 'nodejs'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// In-memory store — good enough for a single-practitioner app. Resets on
// cold start, which is acceptable; the 400ms delay is the primary defence.
const attempts = new Map<string, { count: number; resetAt: number }>()

function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return (forwarded ? forwarded.split(',')[0] : 'unknown').trim().slice(0, 45)
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) return false
  return entry.count >= MAX_ATTEMPTS
}

function recordFailure(ip: string): void {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    entry.count += 1
  }
}

function clearAttempts(ip: string): void {
  attempts.delete(ip)
}

export async function POST(req: Request) {
  const ip = getIp(req)

  if (isRateLimited(ip)) {
    await new Promise((r) => setTimeout(r, 1000))
    return NextResponse.json(
      { error: 'Too many attempts — please wait 15 minutes.' },
      { status: 429 },
    )
  }

  let pin = ''
  try {
    const body = (await req.json()) as { pin?: unknown }
    if (typeof body.pin === 'string') pin = body.pin
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!pin || !checkPin(pin)) {
    await new Promise((r) => setTimeout(r, 400))
    recordFailure(ip)
    return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 })
  }

  clearAttempts(ip)
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
