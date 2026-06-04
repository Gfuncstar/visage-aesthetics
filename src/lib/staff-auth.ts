import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const STAFF_COOKIE = 'va_staff_session'
const SESSION_HOURS = 8

function secret(): string {
  const s = process.env.STAFF_PIN
  if (!s) throw new Error('STAFF_PIN is not set')
  return s
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

export function buildSessionToken(): { value: string; maxAge: number } {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000
  const payload = `staff:${expires}`
  return {
    value: `${payload}:${sign(payload)}`,
    maxAge: SESSION_HOURS * 60 * 60,
  }
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false
  const parts = token.split(':')
  if (parts.length !== 3) return false
  const [, expiresStr, sig] = parts
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return false
  const expected = sign(`staff:${expiresStr}`)
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function checkPin(pin: string): boolean {
  // Compare HMACs so the buffer lengths are always equal — prevents a length
  // oracle that would reveal how many characters the passcode has.
  const key = Buffer.from('va-pin-check')
  const expected = createHmac('sha256', key).update(secret()).digest()
  const provided = createHmac('sha256', key).update(pin).digest()
  return timingSafeEqual(expected, provided)
}

export async function isStaffAuthed(): Promise<boolean> {
  const store = await cookies()
  return verifySessionToken(store.get(STAFF_COOKIE)?.value)
}

// Read the session cookie directly from a raw Request — avoids the async
// next/headers cookies() call which can stall inside Route Handlers.
export function isAuthedFromRequest(req: Request): boolean {
  const header = req.headers.get('cookie') ?? ''
  const match = header.match(new RegExp(`(?:^|;\\s*)${STAFF_COOKIE}=([^;]+)`))
  const token = match ? decodeURIComponent(match[1]) : undefined
  return verifySessionToken(token)
}
