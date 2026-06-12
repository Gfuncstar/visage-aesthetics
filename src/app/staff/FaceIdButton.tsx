'use client'

import { useEffect, useState } from 'react'
import { ScanFace } from 'lucide-react'
import { startAuthentication, browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'

// "Sign in with Face ID" for the staff login page. Uses the platform
// authenticator (Face ID / Touch ID on Apple devices, fingerprint / Windows
// Hello elsewhere) via WebAuthn. Only shown when the device actually has one.
// The button is hidden entirely on devices that can't do it, so the passcode
// stays the path everywhere else.
export default function FaceIdButton() {
  const [available, setAvailable] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!browserSupportsWebAuthn()) return
    platformAuthenticatorIsAvailable()
      .then((ok) => setAvailable(ok))
      .catch(() => {})
  }, [])

  async function signIn() {
    setBusy(true)
    setError(null)
    try {
      const optRes = await fetch('/api/staff/webauthn?action=auth-options', { method: 'POST' })
      const optionsJSON = await optRes.json().catch(() => ({}))
      if (!optRes.ok) {
        setError(optionsJSON.error || 'Could not start Face ID.')
        setBusy(false)
        return
      }
      if (!optionsJSON.hasCredential) {
        setError('Face ID isn’t set up yet. Sign in with your passcode, then turn on Face ID from the staff home.')
        setBusy(false)
        return
      }

      const assertion = await startAuthentication({ optionsJSON })
      const verifyRes = await fetch('/api/staff/webauthn?action=auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
      })
      const v = await verifyRes.json().catch(() => ({}))
      if (!verifyRes.ok || !v.ok) {
        setError(v.error || 'Face ID sign-in failed.')
        setBusy(false)
        return
      }
      // Same landing as the passcode sign-in.
      window.location.assign('/staff')
    } catch (err) {
      // A user cancelling the Face ID prompt throws NotAllowedError / AbortError
      // — that's not an error to shout about, so just reset quietly.
      const msg = err instanceof Error ? err.name + ' ' + err.message : ''
      if (/NotAllowed|Abort/i.test(msg)) setError(null)
      else setError('Face ID was not completed.')
      setBusy(false)
    }
  }

  if (!available) return null

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-1 h-px bg-line/50" />
        <span className="text-xs text-ink-soft uppercase tracking-[0.18em]">or</span>
        <span className="flex-1 h-px bg-line/50" />
      </div>
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="btn btn-secondary btn-block disabled:opacity-50"
        style={{ minHeight: 48 }}
      >
        <span className="inline-flex items-center gap-2">
          <ScanFace size={17} strokeWidth={1.75} />
          {busy ? 'Waiting for Face ID…' : 'Sign in with Face ID'}
        </span>
      </button>
      {error && <p className="text-sm text-clay mt-2 leading-snug">{error}</p>}
    </div>
  )
}
