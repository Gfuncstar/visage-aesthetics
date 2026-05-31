import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isStaffAuthed } from '@/lib/staff-auth'
import { exchangeCode } from '@/lib/assistant/graph-inbox'
import { audit } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Microsoft redirects back here after the owner consents. Exchange the code for
// tokens, store the refresh token, and bounce back to the Orders page.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error_description') || url.searchParams.get('error')

  const ordersUrl = new URL('/staff/assistant/orders', url.origin)

  if (error) {
    ordersUrl.searchParams.set('inbox', 'error')
    return NextResponse.redirect(ordersUrl)
  }

  const store = await cookies()
  const expected = store.get('va_inbox_oauth_state')?.value
  store.delete('va_inbox_oauth_state')
  if (!code || !state || !expected || state !== expected) {
    ordersUrl.searchParams.set('inbox', 'error')
    return NextResponse.redirect(ordersUrl)
  }

  try {
    const { account } = await exchangeCode(code, url.origin)
    await audit('connect', 'inbox', account ?? undefined)
    ordersUrl.searchParams.set('inbox', 'connected')
    if (account) ordersUrl.searchParams.set('account', account)
    return NextResponse.redirect(ordersUrl)
  } catch {
    ordersUrl.searchParams.set('inbox', 'error')
    return NextResponse.redirect(ordersUrl)
  }
}
