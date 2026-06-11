import { NextResponse } from 'next/server'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server'
import { STAFF_COOKIE, buildSessionToken, isAuthedFromRequest, isStaffAuthed } from '@/lib/staff-auth'
import {
  RP_ID,
  RP_NAME,
  ALLOWED_ORIGINS,
  saveChallenge,
  consumeChallenge,
  saveCredential,
  getCredential,
  updateSignCount,
} from '@/lib/webauthn'
import { assistantConfigured } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getOrigin(req: Request): string {
  // Use the actual request origin so this works on both vaclinic.co.uk
  // and any Vercel preview deployment without extra env vars.
  const origin = req.headers.get('origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin
  return ALLOWED_ORIGINS[0]
}

export async function POST(req: Request) {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const origin = getOrigin(req)

  // ── Register: generate options ────────────────────────────────────────────
  if (action === 'register-options') {
    if (!isAuthedFromRequest(req)) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: 'bernadette',
      userDisplayName: 'Bernadette',
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        userVerification: 'required',
      },
    })

    await saveChallenge(options.challenge, 'register')
    return NextResponse.json(options)
  }

  // ── Register: verify ──────────────────────────────────────────────────────
  if (action === 'register-verify') {
    if (!isAuthedFromRequest(req)) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const body = await req.json() as RegistrationResponseJSON
    const expectedChallenge = await consumeChallenge('register')
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge expired — tap Enable Face ID again' }, { status: 400 })
    }

    try {
      const { verified, registrationInfo } = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: ALLOWED_ORIGINS,
        expectedRPID: RP_ID,
        requireUserVerification: true,
      })

      if (!verified || !registrationInfo) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
      }

      const { credential, credentialDeviceType } = registrationInfo
      // credential.id is already a Base64URLString in SimpleWebAuthn v13
      await saveCredential(
        credential.id,
        Buffer.from(credential.publicKey).toString('base64'),
        credential.counter,
        credentialDeviceType,
      )

      return NextResponse.json({ ok: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[webauthn] register-verify error:', msg)
      return NextResponse.json({ error: `Registration failed: ${msg}` }, { status: 400 })
    }
  }

  // ── Authenticate: generate options ───────────────────────────────────────
  if (action === 'auth-options') {
    const stored = await getCredential()

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials: stored ? [{ id: stored.credential_id }] : [],
    })

    await saveChallenge(options.challenge, 'authenticate')
    return NextResponse.json({ ...options, hasCredential: Boolean(stored) })
  }

  // ── Authenticate: verify + issue session ─────────────────────────────────
  if (action === 'auth-verify') {
    const body = await req.json() as AuthenticationResponseJSON
    const expectedChallenge = await consumeChallenge('authenticate')
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge expired — tap Sign in with Face ID again' }, { status: 400 })
    }

    const stored = await getCredential()
    if (!stored) return NextResponse.json({ error: 'No passkey registered' }, { status: 400 })

    try {
      const { verified, authenticationInfo } = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: ALLOWED_ORIGINS,
        expectedRPID: RP_ID,
        requireUserVerification: true,
        credential: {
          id: stored.credential_id,
          publicKey: Buffer.from(stored.public_key, 'base64'),
          counter: stored.sign_count,
        },
      })

      if (!verified) return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })

      await updateSignCount(stored.credential_id, authenticationInfo.newCounter)

      const { value, maxAge } = buildSessionToken()
      const res = NextResponse.json({ ok: true })
      res.cookies.set(STAFF_COOKIE, value, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge,
      })
      return res
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[webauthn] auth-verify error:', msg)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: Request) {
  if (!isAuthedFromRequest(req)) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { remove } = await import('@/lib/assistant/db')
  const stored = await getCredential()
  if (stored) await remove('webauthn_credentials', { id: stored.id })
  return NextResponse.json({ ok: true })
}
