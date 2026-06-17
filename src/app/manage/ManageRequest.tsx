'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Mail, MessageCircle } from 'lucide-react'

const WHATSAPP = 'https://wa.me/447931395246'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Stable page shell — kept at module scope so it is not re-created on every
// render (which would remount the input and drop focus / the keyboard).
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-24">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Manage your appointment</h1>
        {children}
      </div>
    </section>
  )
}

export default function ManageRequest() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const clean = email.trim()
    if (!EMAIL_RE.test(clean)) {
      setError('Please enter the email address you booked with.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      // The endpoint always answers the same way (it never reveals who is a
      // client), so on any successful response we show the same confirmation.
      await fetch('/api/book/portal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <Shell>
        <div className="mt-6 border border-green-300 bg-green-50 text-green-800 text-sm rounded-sm px-4 py-4 leading-relaxed">
          <Check className="inline mr-1" size={16} /> Check your email. If <span className="font-medium">{email.trim()}</span> is
          the address you booked with, a link to your appointments is on its way (do check your spam folder, just in
          case). Open it on this phone or computer and you will go straight to your appointments, where you can change
          or cancel — no password needed.
        </div>
        <p className="text-sm text-ink-soft mt-6 leading-relaxed">
          Didn&apos;t get it after a few minutes, or not sure which email you used?{' '}
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline">
            Message us on WhatsApp
          </a>{' '}
          and we will sort it for you.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="text-sm text-gold-deep underline mt-6"
        >
          Use a different email
        </button>
      </Shell>
    )
  }

  return (
    <Shell>
      <p className="text-ink-soft mt-4 leading-relaxed">
        Need to change or cancel? Pop in the email address you booked with and we will send you a private link straight
        to your appointments. There is no password to set up or remember.
      </p>

      <ol className="mt-6 space-y-2 text-sm text-ink-soft">
        {[
          'Enter the email you booked with, below.',
          'Check your inbox for our link.',
          'Tap it to open your appointments, then choose “Change or cancel”.',
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-deep text-xs font-medium">
              {i + 1}
            </span>
            <span className="leading-relaxed pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-3">
        <label className="block text-sm">
          <span className="text-ink-soft flex items-center gap-2 mb-1"><Mail size={14} /> Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            placeholder="you@email.com"
            autoComplete="email"
            className="w-full border border-line/60 rounded-sm px-4 py-2.5 text-sm bg-cream-soft focus:border-gold outline-none"
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
          />
        </label>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          onClick={() => void submit()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-sm rounded-sm px-5 py-2.5 hover:bg-gold-deep transition-colors disabled:opacity-50 w-full"
        >
          {busy ? 'Sending…' : 'Email me my link'}
        </button>
      </div>

      <div className="mt-8 border-t border-line/40 pt-6 text-sm text-ink-soft leading-relaxed">
        <p className="flex items-start gap-2">
          <MessageCircle size={15} className="mt-0.5 shrink-0 text-gold-deep" />
          <span>
            Prefer to talk to us? <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-gold-deep underline">WhatsApp the clinic</a>{' '}
            and we will move your appointment for you.
          </span>
        </p>
        <p className="text-xs text-ink-soft mt-4">
          Want to book something new instead?{' '}
          <Link href="/book-online" className="text-gold-deep underline">See available times</Link>.
        </p>
      </div>
    </Shell>
  )
}
