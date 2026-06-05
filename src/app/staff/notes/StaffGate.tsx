'use client'

import { useEffect, useState } from 'react'
import { Fingerprint, Lock } from 'lucide-react'
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types'

type View = 'loading' | 'face-id' | 'pin' | 'offer-face-id'

// Safety net so the passkey call can never spin forever: if the OS prompt
// doesn't resolve, reject so the UI recovers instead of stalling.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Face ID timed out')), ms)),
  ])
}

export default function StaffGate() {
  const [view, setView] = useState<View>('loading')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [hasPasskey, setHasPasskey] = useState(false)
  // Options are fetched ahead of the tap. On iOS the passkey prompt must be
  // triggered directly by the user gesture — an awaited fetch in the click
  // handler drops the gesture and the prompt silently never appears (the stall).
  const [authOptions, setAuthOptions] = useState<PublicKeyCredentialRequestOptionsJSON | null>(null)
  const [regOptions, setRegOptions] = useState<PublicKeyCredentialCreationOptionsJSON | null>(null)

  // On mount: check if a passkey is registered + browser supports it
  useEffect(() => {
    if (!browserSupportsWebAuthn()) {
      setView('pin')
      return
    }
    fetch('/api/staff/webauthn?action=auth-options', { method: 'POST' })
      .then((r) => r.json())
      .then((d: PublicKeyCredentialRequestOptionsJSON & { hasCredential?: boolean }) => {
        if (d.hasCredential) {
          setAuthOptions(d)
          setHasPasskey(true)
          setView('face-id')
        } else {
          setView('pin')
        }
      })
      .catch(() => setView('pin'))
  }, [])

  // Pre-fetch the right options as soon as a Face ID screen is shown, so the
  // tap handler can call the passkey API immediately, within the user gesture.
  useEffect(() => {
    if (view === 'offer-face-id' && !regOptions) {
      fetch('/api/staff/webauthn?action=register-options', { method: 'POST' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && !d.error) setRegOptions(d) })
        .catch(() => {})
    }
    if (view === 'face-id' && !authOptions) {
      fetch('/api/staff/webauthn?action=auth-options', { method: 'POST' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && !d.error) setAuthOptions(d) })
        .catch(() => {})
    }
  }, [view, regOptions, authOptions])

  // ── Face ID authentication ────────────────────────────────────────────────
  async function signInWithFaceId() {
    setError(null)
    setBusy(true)
    try {
      // Prefer the pre-fetched options so the prompt fires within the gesture.
      let options = authOptions
      if (!options) {
        const optRes = await fetch('/api/staff/webauthn?action=auth-options', { method: 'POST' })
        options = await optRes.json() as PublicKeyCredentialRequestOptionsJSON
      }

      const assertion = await withTimeout(startAuthentication({ optionsJSON: options }), 90_000)

      const verifyRes = await fetch('/api/staff/webauthn?action=auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
      })

      if (verifyRes.ok) {
        window.location.reload()
      } else {
        const d = await verifyRes.json().catch(() => ({}))
        setError(d.error || 'Face ID failed — use your passcode')
        setAuthOptions(null) // stale challenge — refetch next time
        setView('pin')
      }
    } catch (err) {
      // User cancelled or Face ID unavailable — fall back to PIN
      const msg = err instanceof Error ? err.message : ''
      if (!msg.includes('cancel') && !msg.includes('abort') && !msg.includes('NotAllowed')) {
        setError('Face ID unavailable — use your passcode')
      }
      setAuthOptions(null)
      setView('pin')
    } finally {
      setBusy(false)
    }
  }

  // ── Passcode authentication ───────────────────────────────────────────────
  async function signInWithPin(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not sign in')
        setBusy(false)
        return
      }
      // Logged in via PIN — offer Face ID registration if supported and not yet set up
      if (browserSupportsWebAuthn() && !hasPasskey) {
        setView('offer-face-id')
      } else {
        window.location.reload()
      }
    } catch {
      setError('Could not reach the server')
      setBusy(false)
    }
  }

  // ── Face ID registration ──────────────────────────────────────────────────
  async function enableFaceId() {
    setError(null)
    setBusy(true)
    try {
      // Use the pre-fetched options if we have them, so startRegistration is
      // triggered directly by the tap (iOS drops the gesture across a fetch).
      let options = regOptions
      if (!options) {
        const optRes = await fetch('/api/staff/webauthn?action=register-options', { method: 'POST' })
        if (!optRes.ok) {
          const d = await optRes.json().catch(() => ({})) as { error?: string }
          throw new Error(d.error ?? `register-options failed (${optRes.status})`)
        }
        options = await optRes.json() as PublicKeyCredentialCreationOptionsJSON
      }

      const attestation = await withTimeout(startRegistration({ optionsJSON: options }), 90_000)

      const verifyRes = await fetch('/api/staff/webauthn?action=register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestation),
      })

      if (verifyRes.ok) {
        window.location.reload()
        return
      }
      const d = await verifyRes.json().catch(() => ({})) as { error?: string }
      throw new Error(d.error ?? `register-verify failed (${verifyRes.status})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const cancelled = msg.includes('cancel') || msg.includes('abort') || msg.includes('NotAllowed')
      if (!cancelled) {
        setError(msg.includes('timed out') ? 'Face ID didn’t respond — please try again, or use your passcode.' : msg)
      }
      // The challenge is now spent/stale — drop it so the next tap re-fetches.
      setRegOptions(null)
      // Don't auto-reload on error — let the user see what went wrong
    } finally {
      setBusy(false)
    }
  }

  // ── Views ─────────────────────────────────────────────────────────────────

  if (view === 'loading') {
    return (
      <section className="bg-cream min-h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-gold/40 border-t-gold animate-spin" />
      </section>
    )
  }

  if (view === 'offer-face-id') {
    return (
      <section className="bg-cream text-charcoal min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-20">
          <div className="bg-cream-soft border border-line/40 rounded-md p-8 md:p-10 text-center">
            <div className="inline-flex w-16 h-16 rounded-full bg-charcoal text-cream items-center justify-center mb-5 mx-auto">
              <Fingerprint size={28} strokeWidth={1.5} />
            </div>
            <div className="eyebrow text-gold mb-2">One-time setup</div>
            <h1 className="font-display italic text-charcoal text-2xl md:text-3xl leading-tight mb-3">
              Enable Face ID?
            </h1>
            <p className="text-ink-soft leading-relaxed text-sm mb-8">
              Sign in with Face ID next time instead of typing your passcode.
              Your passcode always works as a backup.
            </p>
            {error && <p className="text-sm text-gold mb-4">{error}</p>}
            <div className="space-y-3">
              <button
                onClick={enableFaceId}
                disabled={busy}
                className="btn btn-primary btn-block"
              >
                <span className="inline-flex items-center gap-2">
                  <Fingerprint size={16} strokeWidth={1.75} />
                  {busy ? 'Setting up…' : 'Enable Face ID'}
                </span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary btn-block"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (view === 'face-id') {
    return (
      <section className="bg-cream text-charcoal min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto w-full px-5 py-20">
          <div className="bg-cream-soft border border-line/40 rounded-md p-8 md:p-10 text-center">
            <div className="inline-flex w-16 h-16 rounded-full bg-charcoal text-cream items-center justify-center mb-5 mx-auto">
              <Fingerprint size={28} strokeWidth={1.5} />
            </div>
            <div className="eyebrow text-gold mb-2">Clinic staff</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight mb-3">
              Staff login
            </h1>
            {error && <p className="text-sm text-gold mb-4">{error}</p>}
            <button
              onClick={signInWithFaceId}
              disabled={busy}
              className="btn btn-primary btn-block mb-4"
            >
              <span className="inline-flex items-center gap-2">
                <Fingerprint size={16} strokeWidth={1.75} />
                {busy ? 'Checking…' : 'Sign in with Face ID'}
              </span>
            </button>
            <button
              onClick={() => { setError(null); setView('pin') }}
              className="text-sm text-stone hover:text-gold-deep transition-colors"
            >
              Use passcode instead
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Default: PIN view
  return (
    <section className="bg-cream text-charcoal min-h-[80vh] flex items-center">
      <div className="max-w-md mx-auto w-full px-5 py-20">
        <div className="bg-cream-soft border border-line/40 rounded-md p-8 md:p-10">
          <div className="inline-flex w-12 h-12 rounded-full bg-charcoal text-cream items-center justify-center mb-5">
            <Lock size={18} strokeWidth={1.75} />
          </div>
          <div className="eyebrow text-gold mb-2">Clinic staff</div>
          <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">Staff login</h1>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Enter the staff passcode to record a treatment.
          </p>

          <form onSubmit={signInWithPin} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="pin" className="text-eyebrow text-ink-soft mb-2 block">Passcode</label>
              <input
                id="pin"
                type="password"
                autoFocus
                autoComplete="current-password"
                inputMode="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]"
              />
            </div>
            {error && <p className="text-sm text-gold">{error}</p>}
            <button type="submit" disabled={busy || !pin} className="btn btn-primary btn-block">
              {busy ? 'Checking…' : 'Sign in'}
            </button>
          </form>

          {hasPasskey && (
            <button
              onClick={() => { setError(null); setView('face-id') }}
              className="mt-4 w-full text-sm text-stone hover:text-gold-deep transition-colors text-center"
            >
              Use Face ID instead
            </button>
          )}
        </div>
        <p className="text-center text-xs text-ink-soft mt-6">
          For Visage Aesthetics clinic staff only.
        </p>
      </div>
    </section>
  )
}
