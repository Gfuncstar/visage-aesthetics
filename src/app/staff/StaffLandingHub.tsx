'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Headphones, Mic, Sparkles, X } from 'lucide-react'
import GapCalendar from './GapCalendar'

export default function StaffLandingHub() {
  return (
    <div className="mt-3 space-y-6">
      {/* The briefing — a short spoken update on the day, read aloud. Sits at the
          very top so it's the first thing on the home screen, before the diary. */}
      <Link
        href="/staff/briefing"
        className="group flex items-center gap-4 border border-gold/40 bg-gold/5 rounded-sm px-4 py-3.5 hover:border-gold transition-colors"
      >
        <span className="inline-flex w-11 h-11 rounded-full bg-charcoal text-cream items-center justify-center shrink-0 group-hover:bg-gold-deep transition-colors">
          <Headphones size={18} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block font-display italic text-lg text-charcoal leading-tight">Today’s briefing</span>
          <span className="block text-xs text-ink-soft leading-snug">
            A quiet word on today, the week ahead, and where to push — read aloud.
          </span>
        </span>
      </Link>

      {/* The diary calendar — the main focus of the page (today's chair, gaps
          and the whole book all live here, so no separate "today" list). */}
      <GapCalendar />

      {/* Assistant — below the calendar */}
      <CommandBar onActioned={() => {}} />
    </div>
  )
}

// ---- Command bar -----------------------------------------------------------
type ParsedAction = { type: string; [k: string]: unknown }

function CommandBar({ onActioned }: { onActioned: () => void }) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [micSupported, setMicSupported] = useState(false)
  const [busy, setBusy] = useState(false)
  const [proposal, setProposal] = useState<{ action: ParsedAction; summary: string } | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setMicSupported(Boolean(SR))
  }, [])

  // Let Escape dismiss the confirmation pop-up that appears after an action runs.
  useEffect(() => {
    if (!done) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDone(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done])

  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (listening) { recRef.current?.stop(); return }
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

  async function ask() {
    if (!text.trim()) return
    if (listening) recRef.current?.stop()
    setBusy(true); setError(null); setDone(null); setProposal(null); setAnswer(null)
    try {
      const res = await fetch('/api/staff/assistant/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not answer that.'); return }
      setAnswer(d.answer || 'No answer.')
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  async function interpret() {
    if (!text.trim()) return
    if (listening) recRef.current?.stop()
    setBusy(true); setError(null); setDone(null); setProposal(null); setAnswer(null)
    try {
      const res = await fetch('/api/staff/assistant/command', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not read that.'); return }
      if (d.action?.type === 'unknown') {
        setError('That looks like a question — hit "Ask a question" to look that up.')
        return
      }
      setProposal({ action: d.action, summary: d.summary })
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  async function confirm() {
    if (!proposal) return
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/staff/assistant/command/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: proposal.action }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || d.ok === false) { setError(d.message || d.error || 'Could not do that.'); return }
      setDone(d.message || 'Done.')
      setProposal(null); setText('')
      onActioned()
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      <div className="border border-gold/40 bg-gold/5 rounded-sm p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="eyebrow text-gold-deep">How can I help?</span>
          {micSupported && (
            <button
              type="button"
              onClick={toggleMic}
              className={`inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 transition-colors ${
                listening ? 'border-clay bg-clay/10 text-clay' : 'border-gold/50 text-gold-deep hover:bg-gold/10'
              }`}
            >
              <Mic size={15} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
              {listening ? 'Listening…' : 'Talk'}
            </button>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full bg-cream border border-line rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold leading-relaxed"
          placeholder="Type what you want to do or ask, then choose below…"
        />
        {error && <p className="text-sm text-clay mt-2">{error}</p>}
        {answer && (
          <div className="text-sm text-charcoal mt-3 border border-line/40 bg-cream rounded-sm px-3 py-2.5 leading-relaxed">
            {answer}
          </div>
        )}
        {proposal && (
          <div className="mt-3 border border-gold/40 bg-cream rounded-sm p-3">
            <div className="text-sm text-charcoal mb-3">{proposal.summary}</div>
            <div className="flex items-center gap-2">
              <button onClick={confirm} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>
                <span className="inline-flex items-center gap-2">
                  <Check size={14} strokeWidth={2} /> {busy ? 'Doing it…' : 'Do it'}
                </span>
              </button>
              <button onClick={() => setProposal(null)} className="btn btn-secondary" style={{ minHeight: 38 }}>
                <span className="inline-flex items-center gap-2"><X size={14} strokeWidth={1.75} /> Not that</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {!proposal && (
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gold/40 bg-gold/5 rounded-sm px-4 py-3">
            <button
              onClick={interpret}
              disabled={busy || !text.trim()}
              className="btn btn-primary w-full disabled:opacity-50 mb-2"
              style={{ minHeight: 40 }}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} strokeWidth={1.75} />
                {busy ? 'Working…' : 'Action'}
              </span>
            </button>
            <p className="text-xs text-ink-soft leading-snug">Book · cancel · block time · change hours · flag a client</p>
          </div>
          <div className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
            <button
              onClick={ask}
              disabled={busy || !text.trim()}
              className="btn btn-secondary w-full disabled:opacity-50 mb-2"
              style={{ minHeight: 40 }}
            >
              Question
            </button>
            <p className="text-xs text-ink-soft leading-snug">Last visit · treatment history · who&apos;s due · waitlist · stats</p>
          </div>
        </div>
      )}

      {/* Confirmation pop-up — shown after an action is approved and has run, so
          it's impossible to miss that the change went through. */}
      {done && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-done-title"
          onClick={() => setDone(null)}
        >
          <div
            className="bg-cream border border-gold/40 rounded-md shadow-xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-flex w-12 h-12 rounded-full bg-sage/15 text-sage items-center justify-center mb-4">
              <Check size={24} strokeWidth={2} />
            </span>
            <h2 id="action-done-title" className="font-display italic text-2xl text-charcoal leading-tight">
              Done
            </h2>
            <p className="text-sm text-charcoal/80 mt-2 leading-relaxed">{done}</p>
            <button
              onClick={() => setDone(null)}
              className="btn btn-primary mt-5"
              style={{ minHeight: 40 }}
              autoFocus
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
