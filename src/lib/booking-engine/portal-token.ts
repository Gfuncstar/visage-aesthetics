// Stateless magic-link tokens for the client account portal.
//
// A client never sets a password. They enter their email, we email a private
// link, and the link itself proves who they are. The token is an HMAC over the
// email plus an expiry, so nothing needs storing in the database and the link
// cannot be guessed or edited. It is only ever sent to the verified address.
//
// Signing key: PORTAL_SECRET if set, otherwise it falls back to STAFF_PIN (the
// app already requires that), so the portal works out of the box. Server-side
// only — the key is never sent to the browser.

import { createHmac, timingSafeEqual } from 'node:crypto'

const TTL_DAYS = 365

function secret(): string {
  const s = process.env.PORTAL_SECRET || process.env.STAFF_PIN || process.env.CRON_SECRET
  if (!s) throw new Error('No signing key for the client portal (set PORTAL_SECRET).')
  return s
}

/** True if a portal signing key is available, so links can be issued. */
export function portalConfigured(): boolean {
  return Boolean(process.env.PORTAL_SECRET || process.env.STAFF_PIN || process.env.CRON_SECRET)
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex')
}

function b64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url')
}
function unb64url(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8')
}

/** Build a signed token for an email address, valid for TTL_DAYS. */
export function makePortalToken(email: string): string {
  const e = normaliseEmail(email)
  const expires = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000
  const payload = `${e}:${expires}`
  return `${b64url(e)}.${expires}.${sign(payload)}`
}

/** Verify a token and return the email it was issued for, or null. */
export function readPortalToken(token: string | undefined | null): string | null {
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
  let expected: string
  try {
    expected = sign(`${email}:${expires}`)
  } catch {
    return null
  }
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return null
  return timingSafeEqual(a, b) ? email : null
}
