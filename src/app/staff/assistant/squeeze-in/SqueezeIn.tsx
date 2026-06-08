'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, Check, Copy, LogOut, Mic, Send, Sparkles, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

const textareaClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold leading-relaxed'

type Request = {
  id: string
  client_name: string
  treatment: string | null
  contact: string | null
  preferred_date: string | null
  preferred_note: string | null
  suggested: string | null
  draft_reply: string | null
}

function waLink(contact: string | null, message: string): string | null {
  const digits = (contact ?? '').replace(/\D/g, '')
  if (digits.length < 7) return null
  const intl = digits.startsWith('0') ? `44${digits.slice(1)}` : digits
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`
}

export default function SqueezeIn() {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [listening, setListening] = useState(false)
  const [micSupported, setMicSupported] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setMicSupported(Boolean(SR))
  }, [])

  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (listening) {
      recRef.current?.stop()
      return
    }
    const rec = new SR()
    rec.lang = 'en-GB'
    rec.continuous = true
    rec.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let said = ''
      for (let i = e.resultIndex; i < e.results.length; i++) said += e.results[i][0].transcript
      setText((prev) => (prev ? `${prev} ${said}` : said).trim())
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  const load = useCallback(async () => {
    const res = await fetch('/api/staff/assistant/squeeze-in')
    if (res.ok) {
      const d = await res.json()
      setRequests(d.requests ?? [])
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function read() {
    if (!text.trim()) return
    if (listening) recRef.current?.stop()
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/staff/assistant/squeeze-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not read that.'); return }
      const n = Array.isArray(d.requests) ? d.requests.length : 0
      setText('')
      setResult(`Added ${n} to your to-book list below${n ? ' — with the best free gap for each.' : '.'}`)
      void load()
    } catch {
      setError('Network error.')
    } finally {
      setBusy(false)
    }
  }

  async function setStatus(id: string, status: 'booked' | 'dismissed') {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    await fetch(`/api/staff/assistant/squeeze-in/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    notifyDone(status === 'booked' ? 'Marked as booked' : 'Dismissed')
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Reception &nbsp;·&nbsp; Squeeze-in</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Who wants squeezing in?</h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Got a message asking to fit someone in? Just say it. I&apos;ll work out who, what and when,
              and check your diary for the best gap.
            </p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="border border-gold/40 bg-gold/5 rounded-sm p-5 mb-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-eyebrow text-gold-deep">Say it or type it</span>
            {micSupported && (
              <button
                type="button"
                onClick={toggleMic}
                className={`inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 transition-colors ${
                  listening ? 'border-clay bg-clay/10 text-clay' : 'border-gold/50 text-gold-deep hover:bg-gold/10'
                }`}
              >
                <Mic size={15} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
                {listening ? 'Listening… tap to stop' : 'Tap to talk'}
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className={textareaClass}
            placeholder="e.g. Sarah Grantham messaged asking for Botox, hoping for Thursday afternoon next week, contact 07700 900123. Also Amy would like lip filler any morning this week."
          />
          <p className="text-xs text-ink-soft mt-2">
            {micSupported
              ? 'Tap “Tap to talk” and speak, or just type. On a phone the keyboard microphone works too.'
              : 'Type it, or on a phone tap the microphone on the keyboard and talk.'}
          </p>
          {error && <p className="text-xs text-clay mt-2">{error}</p>}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <button onClick={read} disabled={busy || !text.trim()} className="btn btn-primary disabled:opacity-50">
              <span className="inline-flex items-center gap-2"><Sparkles size={15} strokeWidth={1.75} /> {busy ? 'Working it out…' : 'Sort it out'}</span>
            </button>
            {result && <span className="text-sm text-sage inline-flex items-center gap-1.5"><Check size={14} strokeWidth={2} /> {result}</span>}
          </div>
        </div>

        <div className="eyebrow text-gold mb-3">To book ({requests.length})</div>
        {requests.length === 0 ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
            Nothing waiting. Anything you capture will sit here until you&apos;ve booked it into Ovatu.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <RequestCard key={r.id} r={r} onStatus={setStatus} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function RequestCard({ r, onStatus }: { r: Request; onStatus: (id: string, s: 'booked' | 'dismissed') => void }) {
  const [reply, setReply] = useState(r.draft_reply ?? '')
  const [copied, setCopied] = useState(false)
  const wa = waLink(r.contact, reply)

  async function copyReply() {
    try {
      await navigator.clipboard.writeText(reply)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="border border-line/40 bg-cream-soft rounded-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-medium text-charcoal">{r.client_name}{r.treatment ? <span className="text-ink-soft font-normal"> · {r.treatment}</span> : null}</div>
          {r.preferred_note && <div className="text-sm text-stone mt-0.5">Wants: {r.preferred_note}</div>}
          {r.contact && <div className="text-sm text-stone">{r.contact}</div>}
        </div>
        <button onClick={() => onStatus(r.id, 'dismissed')} className="text-stone hover:text-clay shrink-0" aria-label="Dismiss"><X size={16} strokeWidth={1.75} /></button>
      </div>

      {r.suggested && (
        <div className="mt-3 flex items-start gap-2 text-sm text-charcoal bg-cream border border-line/30 rounded-sm px-3 py-2">
          <Calendar size={15} strokeWidth={1.75} className="text-gold-deep mt-0.5 shrink-0" />
          <span>{r.suggested}</span>
        </div>
      )}

      <label className="text-eyebrow text-ink-soft mt-3 mb-1.5 block">Reply to send them (edit if you like)</label>
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={3}
        className="w-full bg-cream border border-line/40 rounded-sm px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold leading-relaxed"
      />

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ minHeight: 38 }}>
            <span className="inline-flex items-center gap-2"><Send size={14} strokeWidth={1.75} /> Send on WhatsApp</span>
          </a>
        )}
        <button onClick={copyReply} className="btn btn-secondary" style={{ minHeight: 38 }}>
          <span className="inline-flex items-center gap-2"><Copy size={14} strokeWidth={1.75} /> {copied ? 'Copied' : 'Copy reply'}</span>
        </button>
        <button onClick={() => onStatus(r.id, 'booked')} className="btn ml-auto" style={{ minHeight: 38 }}>
          <span className="inline-flex items-center gap-2"><Check size={14} strokeWidth={2} /> Done</span>
        </button>
      </div>
    </div>
  )
}
