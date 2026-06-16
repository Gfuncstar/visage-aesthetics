import { NextResponse } from 'next/server'
import { assistantConfigured, select, insert, update, audit } from '@/lib/assistant/db'
import { accountsConfigured, readResetToken, makeSession, sessionCookie } from '@/lib/account/session'
import { hashPassword } from '@/lib/account/password'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: set a new password from a reset / set-up link. Upserts the account, so
// the same endpoint both resets a forgotten password and creates the account for
// an existing client claiming their booking email for the first time. Logs them
// straight in on success.
export async function POST(req: Request) {
  if (!assistantConfigured() || !accountsConfigured()) {
    return NextResponse.json({ error: 'Accounts are not available right now.' }, { status: 503 })
  }

  let body: { token?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const email = readResetToken(token)
  if (!email) return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 401 })
  if (password.length < 8) return NextResponse.json({ error: 'Please choose a password of at least 8 characters.' }, { status: 400 })
  if (password.length > 200) return NextResponse.json({ error: 'That password is too long.' }, { status: 400 })

  try {
    const password_hash = hashPassword(password)
    const existing = await select<{ email: string }>('client_accounts', { email: `eq.${email}`, select: 'email', limit: 1 })
    if (existing.length > 0) {
      await update('client_accounts', { email }, { password_hash, updated_at: new Date().toISOString() })
      await audit('update', 'client_account', undefined, { via: 'reset' })
    } else {
      await insert('client_accounts', { email, password_hash })
      await audit('create', 'client_account', undefined, { via: 'reset-claim' })
    }

    const session = makeSession(email, true)
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', sessionCookie(session.value, session.maxAge))
    return res
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not set your password.' }, { status: 502 })
  }
}
