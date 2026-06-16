import { NextResponse } from 'next/server'
import { assistantConfigured, select, insert, update, audit } from '@/lib/assistant/db'
import { accountsConfigured, emailFromRequest } from '@/lib/account/session'
import { hashPassword, verifyPassword } from '@/lib/account/password'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Authenticated (session cookie): change the logged-in client's password.
// If they already have a password it must be confirmed; if they logged in via
// an email link and never set one, this sets it for the first time.
export async function POST(req: Request) {
  if (!assistantConfigured() || !accountsConfigured()) {
    return NextResponse.json({ error: 'Accounts are not available right now.' }, { status: 503 })
  }
  const email = emailFromRequest(req)
  if (!email) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })

  let body: { currentPassword?: unknown; newPassword?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
  if (newPassword.length < 8) return NextResponse.json({ error: 'Please choose a password of at least 8 characters.' }, { status: 400 })
  if (newPassword.length > 200) return NextResponse.json({ error: 'That password is too long.' }, { status: 400 })

  try {
    const rows = await select<{ password_hash: string }>('client_accounts', {
      email: `eq.${email}`,
      select: 'password_hash',
      limit: 1,
    })
    const account = rows[0]
    if (account) {
      if (!verifyPassword(currentPassword, account.password_hash)) {
        return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 401 })
      }
      await update('client_accounts', { email }, { password_hash: hashPassword(newPassword), updated_at: new Date().toISOString() })
      await audit('update', 'client_account', undefined, { via: 'change-password' })
    } else {
      // Logged in via an email link without a password yet — set one now.
      await insert('client_accounts', { email, password_hash: hashPassword(newPassword) })
      await audit('create', 'client_account', undefined, { via: 'change-password-set' })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not update your password.' }, { status: 502 })
  }
}
