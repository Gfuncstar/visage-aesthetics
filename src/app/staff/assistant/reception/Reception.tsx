'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BellRing, CalendarDays, Check, Clock, ListPlus, LogOut, Mic, Sparkles, X } from 'lucide-react'

type Lite = { id: string; service_name: string; client_name: string; client_phone: string | null; starts_at: string; status: string; source: string; created_at: string }
type WaitRow = { id: string; client_name: string; service_name: string | null; client_phone: string | null }
type Data = {
  configured: boolean
  today: string
  stats: { todayCount: number; weekCount: number; waitlistCount: number; remindersPending: number; remindersSoon: number }
  todaysBookings: Lite[]
  justBooked: Lite[]
  waitlist: WaitRow[]
}

const TZ = 'Europe/London'
function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}
function dayTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}
function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

const statusTone: Record<string, string> = {
  confirmed: 'text-sage',
  pending: 'text-gold-deep',
  completed: 'text-stone',
  no_show: 'text-clay',
}

export default function Reception() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/staff/assistant/reception')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])
  useEffect(() => { void load() }, [load])

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const s = data?.stats

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <Link href="/staff/assistant/reception" className="inline-flex items-center gap-2 mb-5 bg-charcoal text-cream rounded-sm px-4 py-3 text-sm font-medium hover:bg-gold-deep transition-colors">
              <ArrowLeft size={14} strokeWidth={1.75} /> Receptionist
            </Link>
            <div className="eyebrow text-gold mb-2 inline-flex items-center gap-2">
              Front desk
              <span className="text-[10px] tracking-[0.18em] uppercase rounded-full px-2 py-0.5 bg-gold/15 text-gold-deep border border-gold/40">Paused</span>
            </div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">The front desk.</h1>
            <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">Everything happening around the chair, in one place. The clinical side stays with you.</p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="border border-gold/40 bg-gold/5 rounded-sm px-4 py-3 mb-6 text-sm text-charcoal leading-relaxed">
          <span className="font-medium text-gold-deep">Paused, in standby.</span> This mirrors the live Ovatu diary so you can see it working. It is not taking real bookings yet, and nothing is sent to clients. It goes live only on your say-so.
        </div>

        <CommandBar onActioned={load} />

        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : !data?.configured ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">The clinic database is not connected yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <Stat n={s!.todayCount} label="In today" tone="ink" />
              <Stat n={s!.weekCount} label="Next 7 days" tone="ink" />
              <Stat n={s!.waitlistCount} label="On waitlist" tone={s!.waitlistCount > 0 ? 'gold' : 'mute'} />
            </div>

            {/* Reminders going out */}
            <div className={`flex items-center gap-3 rounded-sm border px-4 py-3 mb-8 ${s!.remindersPending > 0 ? 'border-gold/40 bg-gold/5' : 'border-sage/30 bg-sage/5'}`}>
              <BellRing size={16} strokeWidth={1.75} className={s!.remindersPending > 0 ? 'text-gold-deep' : 'text-sage'} />
              <div className="text-sm text-charcoal">
                {s!.remindersSoon === 0 ? 'No appointments in the next 24 hours.' : `${s!.remindersSoon} appointment${s!.remindersSoon === 1 ? '' : 's'} in the next 24 hours. ${s!.remindersPending} reminder${s!.remindersPending === 1 ? '' : 's'} still to send.`}
              </div>
            </div>

            <Section title="Today" icon={CalendarDays} href="/staff/assistant/diary" cta="Open diary">
              {data.todaysBookings.length === 0 ? (
                <Empty>Nothing booked today.</Empty>
              ) : (
                <div className="space-y-2">
                  {data.todaysBookings.map((b) => (
                    <Row key={b.id} left={<span><span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>} sub={b.service_name} right={<span className={`capitalize ${statusTone[b.status] ?? 'text-stone'}`}>{b.status.replace('_', ' ')}</span>} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Just booked online" icon={Sparkles}>
              {data.justBooked.length === 0 ? (
                <Empty>No online bookings in the last week.</Empty>
              ) : (
                <div className="space-y-2">
                  {data.justBooked.map((b) => (
                    <Row key={b.id} left={<span className="font-medium">{b.client_name}</span>} sub={`${b.service_name} · ${dayTimeLabel(b.starts_at)}`} right={<span className="text-stone text-xs">{ago(b.created_at)}</span>} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Waitlist" icon={ListPlus} href="/staff/assistant/diary" cta="In diary">
              {data.waitlist.length === 0 ? (
                <Empty>No one waiting.</Empty>
              ) : (
                <div className="space-y-2">
                  {data.waitlist.map((w) => (
                    <Row key={w.id} left={<span className="font-medium">{w.client_name}</span>} sub={[w.service_name, w.client_phone].filter(Boolean).join(' · ') || null} right={null} />
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </section>
  )
}

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
      if (d.action?.type === 'unknown') { setError(d.summary || 'I could not work out what to do.'); return }
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
    <div className="border border-gold/40 bg-gold/5 rounded-sm p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-eyebrow text-gold-deep">What would you like me to do?</span>
        {micSupported && (
          <button type="button" onClick={toggleMic} className={`inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 transition-colors ${listening ? 'border-clay bg-clay/10 text-clay' : 'border-gold/50 text-gold-deep hover:bg-gold/10'}`}>
            <Mic size={15} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
            {listening ? 'Listening… tap to stop' : 'Tap to talk'}
          </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-cream border border-line rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold leading-relaxed"
        placeholder="e.g. Book Sarah Grantham in for Botox on Thursday at 2pm. Or: block Friday afternoon. Or: cancel John's appointment."
      />
      {error && <p className="text-sm text-clay mt-2">{error}</p>}
      {done && <p className="text-sm text-sage mt-2 inline-flex items-center gap-1.5"><Check size={14} strokeWidth={2} /> {done}</p>}
      {answer && <div className="text-sm text-charcoal mt-3 border border-line/40 bg-cream rounded-sm px-3 py-2.5">{answer}</div>}

      {proposal ? (
        <div className="mt-3 border border-gold/40 bg-cream rounded-sm p-3">
          <div className="text-sm text-charcoal mb-3">{proposal.summary}</div>
          <div className="flex items-center gap-2">
            <button onClick={confirm} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>
              <span className="inline-flex items-center gap-2"><Check size={14} strokeWidth={2} /> {busy ? 'Doing it…' : 'Do it'}</span>
            </button>
            <button onClick={() => setProposal(null)} className="btn btn-secondary" style={{ minHeight: 38 }}>
              <span className="inline-flex items-center gap-2"><X size={14} strokeWidth={1.75} /> Not that</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={interpret} disabled={busy || !text.trim()} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 40 }}>
            <span className="inline-flex items-center gap-2"><Sparkles size={15} strokeWidth={1.75} /> {busy ? 'Working…' : 'Action this'}</span>
          </button>
          <button onClick={ask} disabled={busy || !text.trim()} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 40 }}>
            <span className="inline-flex items-center gap-2">Ask a question</span>
          </button>
        </div>
      )}
      <p className="text-xs text-ink-soft mt-2">Tell me to do something (book, cancel, block time), or ask about the clinic (how many Botox last month, quietest day, top spenders).</p>
    </div>
  )
}

function Stat({ n, label, tone }: { n: number; label: string; tone: 'gold' | 'mute' | 'ink' }) {
  const color = tone === 'gold' ? 'text-gold-deep' : tone === 'mute' ? 'text-stone' : 'text-charcoal'
  return (
    <div className="bg-cream-soft border border-line/40 rounded-sm px-3 py-3 text-center">
      <div className={`font-display italic text-3xl leading-none ${color}`}>{n}</div>
      <div className="text-eyebrow text-ink-soft mt-1.5">{label}</div>
    </div>
  )
}

function Section({ title, icon: Icon, href, cta, children }: { title: string; icon: typeof Clock; href?: string; cta?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="eyebrow text-gold flex items-center gap-2"><Icon size={13} strokeWidth={1.75} /> {title}</div>
        {href && cta && <Link href={href} className="text-xs text-gold-deep hover:underline">{cta} →</Link>}
      </div>
      {children}
    </div>
  )
}

function Row({ left, sub, right }: { left: React.ReactNode; sub: string | null; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm text-charcoal truncate">{left}</div>
        {sub && <div className="text-xs text-stone truncate mt-0.5">{sub}</div>}
      </div>
      {right && <div className="shrink-0 text-sm">{right}</div>}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-3">{children}</p>
}
