import { NextResponse } from 'next/server'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { accountsConfigured, normaliseEmail, makeSession, sessionCookie } from '@/lib/account/session'
import { verifyPassword } from '@/lib/account/password'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: email + password login. Returns a single generic error whether the
// email is unknown or the password is wrong, so it never reveals which emails
// have accounts.
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
  const fail = () => NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 })

  if (!email || !password) return fail()

  try {
    const rows = await select<{ password_hash: string }>('client_accounts', {
      email: `eq.${email}`,
      select: 'password_hash',
      limit: 1,
    })
    const account = rows[0]
    if (!account || !verifyPassword(password, account.password_hash)) return fail()

    const session = makeSession(email, remember)
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', sessionCookie(session.value, session.maxAge))
    return res
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not log in.' }, { status: 502 })
  }
}
