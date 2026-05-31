import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import { isStaffAuthed } from '@/lib/staff-auth'
import { graphConfigured, buildAuthUrl } from '@/lib/assistant/graph-inbox'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Kicks off the Microsoft sign-in so the owner can connect the order inbox.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!graphConfigured()) {
    return NextResponse.json(
      { error: 'Inbox connection is not configured (MS_GRAPH_CLIENT_ID / MS_GRAPH_CLIENT_SECRET missing).' },
      { status: 503 },
    )
  }
  const origin = new URL(req.url).origin
  const state = randomBytes(16).toString('hex')
  const store = await cookies()
  store.set('va_inbox_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return NextResponse.redirect(buildAuthUrl(origin, state))
}
