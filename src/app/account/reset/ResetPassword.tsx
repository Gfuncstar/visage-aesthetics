'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token'))
  }, [])

  async function submit() {
    setError(null)
    if (password.length < 8) { setError('Please choose a password of at least 8 characters.'); return }
    if (password !== confirm) { setError('Those passwords do not match.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/account/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Could not set your password. Please request a new link.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'w-full border border-line/60 rounded-sm px-4 py-2.5 text-sm bg-cream-soft focus:border-gold outline-none'

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-24">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Set your password</h1>

        {done ? (
          <>
            <div className="mt-6 border border-green-300 bg-green-50 text-green-800 text-sm rounded-sm px-4 py-4 leading-relaxed">
              <Check className="inline mr-1" size={16} /> Your password is set and you are logged in.
            </div>
            <Link href="/account" className="inline-block mt-6 bg-charcoal text-cream text-sm rounded-sm px-5 py-2.5 hover:bg-gold-deep transition-colors">
              See my appointments
            </Link>
          </>
        ) : (
          <>
            <p className="text-ink-soft mt-4 leading-relaxed">Choose a password for your account. You will use your email and this password to log in.</p>
            <div className="mt-5 space-y-3">
              <label className="block text-sm">
                <span className="text-ink-soft mb-1 block">New password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="text-ink-soft mb-1 block">Confirm password</span>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputClass} onKeyDown={(e) => e.key === 'Enter' && void submit()} />
              </label>
              {error && <p className="text-sm text-clay">{error}</p>}
              <button onClick={() => void submit()} disabled={busy} className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-sm rounded-sm px-5 py-2.5 hover:bg-gold-deep transition-colors disabled:opacity-50 w-full">
                {busy ? 'Saving…' : 'Set password'}
              </button>
            </div>
            <p className="text-xs text-ink-soft mt-8">
              Link expired?{' '}
              <Link href="/account" className="text-gold-deep underline">Request a new one</Link>.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
