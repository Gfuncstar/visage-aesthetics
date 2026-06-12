'use client'

import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import FaceIdButton from '../FaceIdButton'

const STORAGE_KEY = 'visage_staff_pin'

export default function StaffGate() {
  const [pin, setPin] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setPin(saved)
      setRememberMe(true)
    }
  }, [])

  async function signIn(e: React.FormEvent) {
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
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, pin)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      // Always land on the home staff hub after signing in, whichever page the
      // login was reached from (Home, Assistant, Notes, or the installed PWA).
      window.location.assign('/staff')
    } catch {
      setError('Could not reach the server')
      setBusy(false)
    }
  }

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

          <form onSubmit={signIn} className="mt-8 space-y-4" noValidate>
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
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-sm text-ink-soft">Remember password</span>
            </label>
            {error && <p className="text-sm text-gold">{error}</p>}
            <button type="submit" disabled={busy || !pin} className="btn btn-primary btn-block">
              {busy ? 'Checking…' : 'Sign in'}
            </button>
          </form>

          <FaceIdButton />
        </div>
        <p className="text-center text-xs text-ink-soft mt-6">
          For Visage Aesthetics clinic staff only.
        </p>
      </div>
    </section>
  )
}
