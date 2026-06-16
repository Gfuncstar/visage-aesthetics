// Signed, stateless tokens for client accounts — a session cookie and a
// short-lived password-reset / set-up link. Same HMAC approach as the staff
// session and the old magic-link portal: the token carries the email plus an
// expiry, signed server-side, so nothing needs storing and it cannot be forged
// or edited. A "purpose" string is folded into the signature, so a session
// token can never be replayed as a reset token (or vice versa).
//
// Signing key: PORTAL_SECRET, falling back to STAFF_PIN / CRON_SECRET, so the
// portal works with the keys the app already has. Server-side only.

import { createHmac, timingSafeEqual } from 'node:crypto'

export const CLIENT_COOKIE = 'va_client_session'

const REMEMBER_DAYS = 30
const SESSION_HOURS = 12
const RESET_HOURS = 1

type Purpose = 'session' | 'reset'

function secret(): string {
  const s = process.env.PORTAL_SECRET || process.env.STAFF_PIN || process.env.CRON_SECRET
  if (!s) throw new Error('No signing key for client accounts (set PORTAL_SECRET).')
  return s
}

export function accountsConfigured(): boolean {
  return Boolean(process.env.PORTAL_SECRET || process.env.STAFF_PIN || process.env.CRON_SECRET)
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

function sign(purpose: Purpose, email: string, expires: number): string {
  return createHmac('sha256', secret()).update(`${purpose}:${email}:${expires}`).digest('hex')
}

function b64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url')
}
function unb64url(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8')
}

function makeToken(purpose: Purpose, email: string, ttlMs: number): string {
  const e = normaliseEmail(email)
  const expires = Date.now() + ttlMs
  return `${b64url(e)}.${expires}.${sign(purpose, e, expires)}`
}

function readToken(purpose: Purpose, token: string | undefined | null): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [emailB64, expiresStr, sig] = parts
  let email: string
  try {
    email = unb64url(emailB64)
  } catch {
    return null
  }
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return null
  const expected = sign(purpose, email, expires)
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return null
  return timingSafeEqual(a, b) ? email : null
}

/** Build a session token + matching cookie max-age. "Remember me" lasts 30 days. */
export function makeSession(email: string, remember: boolean): { value: string; maxAge: number } {
  const ttlMs = (remember ? REMEMBER_DAYS * 24 : SESSION_HOURS) * 60 * 60 * 1000
  return { value: makeToken('session', email, ttlMs), maxAge: Math.floor(ttlMs / 1000) }
}

export function readSession(token: string | undefined | null): string | null {
  return readToken('session', token)
}

/** Read the client session straight off a raw Request's Cookie header. */
export function emailFromRequest(req: Request): string | null {
  const header = req.headers.get('cookie') ?? ''
  const match = header.match(new RegExp(`(?:^|;\\s*)${CLIENT_COOKIE}=([^;]+)`))
  const token = match ? decodeURIComponent(match[1]) : undefined
  return readSession(token)
}

/** Short-lived link for resetting a password or claiming an existing booking email. */
export function makeResetToken(email: string): string {
  return makeToken('reset', email, RESET_HOURS * 60 * 60 * 1000)
}

export function readResetToken(token: string | undefined | null): string | null {
  return readToken('reset', token)
}

/** Serialise the session cookie. clear=true expires it immediately (logout). */
export function sessionCookie(value: string, maxAge: number): string {
  const attrs = [
    `${CLIENT_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`,
  ]
  return attrs.join('; ')
}
