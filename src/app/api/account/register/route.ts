import { NextResponse } from 'next/server'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { accountsConfigured, normaliseEmail, makeSession, sessionCookie } from '@/lib/account/session'
import { hashPassword } from '@/lib/account/password'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public: create a client account by setting a password. Only allowed for an
// email that has at least one booking on file, so accounts map to real clients
// and the form cannot be used to fish for who is registered. On success the
// client is logged straight in via the session cookie.
export async function POST(req: Request) {
  if (!assistantConfigured() || !accountsConfigured()) {
    return NextResponse.json({ error: 'Accounts are not available right now.' }, { status: 503 })
  }

  let body: { email?: unknown; password?: unknown; remember?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const remember = body.remember === true

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Please choose a password of at least 8 characters.' }, { status: 400 })
  if (password.length > 200) return NextResponse.json({ error: 'That password is too long.' }, { status: 400 })

  try {
    const existing = await select<{ email: string }>('client_accounts', { email: `eq.${email}`, select: 'email', limit: 1 })
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account already exists for that email. Please log in instead.' }, { status: 409 })
    }

    // Tie the account to a real booking made with this email.
    const booked = await select<{ id: string }>('bookings', { client_email: `ilike.${email}`, select: 'id', limit: 1 })
    if (booked.length === 0) {
      return NextResponse.json({ error: 'We could not find a booking for that email. Please book first, or use the email from your confirmation.' }, { status: 403 })
    }

    await insert('client_accounts', { email, password_hash: hashPassword(password) })
    await audit('create', 'client_account', undefined, { via: 'register' })

    const session = makeSession(email, remember)
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', sessionCookie(session.value, session.maxAge))
    return res
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not create your account.' }, { status: 502 })
  }
}
