import { NextResponse } from 'next/server'
import { readPortalToken } from '@/lib/booking-engine/portal-token'
import { makeSession, sessionCookie } from '@/lib/account/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE = 'https://www.vaclinic.co.uk'

// Bridge for the older email magic-links (e.g. the Ovatu migration mail, which
// sends /account?token=...). A valid token is exchanged for a normal session
// cookie and the client lands logged in on /account, where they can set a
// password if they want one. An expired/invalid token just bounces to /account.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  const email = readPortalToken(token)
  if (!email) {
    return NextResponse.redirect(`${SITE}/account?expired=1`)
  }
  const session = makeSession(email, true)
  const res = NextResponse.redirect(`${SITE}/account`)
  res.headers.set('Set-Cookie', sessionCookie(session.value, session.maxAge))
  return res
}
