'use client'

import { useEffect, useState } from 'react'
import { ScanFace, Check } from 'lucide-react'
import { startRegistration, browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'

// Per-device flag so the prompt settles into a "Face ID is on" state on the
// device it was set up on, without a server round-trip on every home load.
const FLAG = 'va_faceid_enabled'

// "Turn on Face ID on this device" — shown on the staff home once signed in, so
// the next sign-in can be Face ID instead of the passcode. Only appears where a
// platform authenticator is actually available.
export default function FaceIdSetup() {
  const [available, setAvailable] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEnabled(localStorage.getItem(FLAG) === '1')
    if (!browserSupportsWebAuthn()) return
    platformAuthenticatorIsAvailable()
      .then((ok) => setAvailable(ok))
      .catch(() => {})
  }, [])

  async function enable() {
    setBusy(true)
    setError(null)
    try {
      const optRes = await fetch('/api/staff/webauthn?action=register-options', { method: 'POST' })
      const optionsJSON = await optRes.json().catch(() => ({}))
      if (!optRes.ok) {
        setError(optionsJSON.error || 'Could not start setup.')
        setBusy(false)
        return
      }

      const attestation = await startRegistration({ optionsJSON })
      const verifyRes = await fetch('/api/staff/webauthn?action=register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestation),
      })
      const v = await verifyRes.json().catch(() => ({}))
      if (!verifyRes.ok || !v.ok) {
        setError(v.error || 'Could not turn on Face ID.')
        setBusy(false)
        return
      }
      localStorage.setItem(FLAG, '1')
      setEnabled(true)
    } catch (err) {
      const msg = err instanceof Error ? err.name + ' ' + err.message : ''
      if (/NotAllowed|Abort/i.test(msg)) setError(null)
      else setError('Face ID setup was not completed.')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    setError(null)
    try {
      await fetch('/api/staff/webauthn', { method: 'DELETE' })
    } catch {
      /* best effort */
    }
    localStorage.removeItem(FLAG)
    setEnabled(false)
    setBusy(false)
  }

  if (!available) return null

  if (enabled) {
    return (
      <div className="mt-9 flex items-center justify-between gap-3 rounded-sm border border-sage/40 bg-sage/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Check size={16} strokeWidth={2} className="text-sage shrink-0" />
          <div>
            <div className="text-sm font-medium text-charcoal">Face ID is on for this device</div>
            <div className="text-xs text-stone mt-0.5">Next time you can sign in with Face ID instead of the passcode.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={disable}
          disabled={busy}
          className="text-xs text-stone hover:text-clay border border-line/50 hover:border-clay/40 rounded-sm px-2.5 py-1.5 transition-colors shrink-0 disabled:opacity-50"
        >
          {busy ? '…' : 'Turn off'}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-9 rounded-sm border border-line/40 bg-cream-soft px-4 py-4">
      <div className="flex items-start gap-2.5 mb-3">
        <ScanFace size={18} strokeWidth={1.75} className="text-gold-deep shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-charcoal">Sign in faster with Face ID</div>
          <div className="text-xs text-stone mt-0.5 leading-snug">Turn on Face ID on this device so you don’t have to type the passcode each time.</div>
        </div>
      </div>
      <button
        type="button"
        onClick={enable}
        disabled={busy}
        className="btn btn-secondary disabled:opacity-50"
        style={{ minHeight: 44 }}
      >
        <span className="inline-flex items-center gap-2">
          <ScanFace size={16} strokeWidth={1.75} />
          {busy ? 'Setting up…' : 'Turn on Face ID'}
        </span>
      </button>
      {error && <p className="text-sm text-clay mt-2 leading-snug">{error}</p>}
    </div>
  )
}
