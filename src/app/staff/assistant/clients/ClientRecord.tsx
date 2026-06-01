'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, BellOff, Ban, Camera, Check, ChevronRight, CreditCard, ImagePlus, LogOut, Search, Trash2, X } from 'lucide-react'
import MicButton, { appendText } from '@/components/ui/MicButton'
import { gbp, ukDate } from '@/lib/assistant/format'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

type ClientHit = { name: string; visits: number; spend: number; lastVisit: string }
type Appt = { id: string; date: string; service_name: string; price: number; status: string }
type TRecord = {
  id: string; date: string; treatment_type: string; treatment_label: string
  product: string | null; batch_number: string | null; areas: { area: string; dose: number; unit?: string }[]
  total_dose: number | null; unit: string | null; notes: string | null; clinical_note: string | null
}
type Photo = { id: string; date: string; type: string; url: string; consent: boolean; treatment_type: string | null; notes: string | null }
type Message = { id: string; channel: string; kind: string; subject: string | null; body: string | null; created_at: string }
type Summary = { name: string; visits: number; totalSpend: number; firstVisit: string | null; lastVisit: string | null; treatments: { service: string; count: number }[] }

export default function ClientRecord() {
  const [q, setQ] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'spend' | 'visits'>('recent')
  const [hits, setHits] = useState<ClientHit[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [appts, setAppts] = useState<Appt[]>([])
  const [records, setRecords] = useState<TRecord[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [doNotContact, setDoNotContact] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((term: string, sort: string) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/staff/assistant/client-record?q=${encodeURIComponent(term)}&sort=${sort}`)
      if (res.ok) {
        const d = await res.json()
        setHits(d.clients ?? [])
      }
    }, 180)
  }, [])

  useEffect(() => { search('', 'recent') }, [search])

  function changeSort(s: 'recent' | 'spend' | 'visits') {
    setSortBy(s)
    search(q, s)
  }

  const openClient = useCallback(async (name: string) => {
    setSelected(name)
    setLoading(true)
    try {
      const res = await fetch(`/api/staff/assistant/client-record?name=${encodeURIComponent(name)}`)
      const d = await res.json()
      setSummary(d.client ?? null)
      setAppts(d.appointments ?? [])
      setRecords(d.treatmentRecords ?? [])
      setPhotos(d.photos ?? [])
      setMessages(d.messages ?? [])
      setDoNotContact(Boolean(d.doNotContact))
      setBlocked(Boolean(d.blocked))
      setRequiresDeposit(Boolean(d.requiresDeposit))
    } finally {
      setLoading(false)
    }
  }, [])

  async function toggleDnc(next: boolean) {
    setDoNotContact(next) // optimistic
    try {
      const res = await fetch('/api/staff/assistant/do-not-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selected, suppress: next }),
      })
      if (!res.ok) setDoNotContact(!next) // revert on failure
    } catch {
      setDoNotContact(!next)
    }
  }

  async function toggleFlag(flag: 'blocked' | 'requires_deposit', next: boolean) {
    const setter = flag === 'blocked' ? setBlocked : setRequiresDeposit
    setter(next) // optimistic
    try {
      const res = await fetch('/api/staff/assistant/client-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selected, flag, value: next }),
      })
      if (!res.ok) setter(!next)
    } catch {
      setter(!next)
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  if (selected) {
    return (
      <Detail
        name={selected}
        summary={summary}
        appts={appts}
        records={records}
        photos={photos}
        messages={messages}
        loading={loading}
        doNotContact={doNotContact}
        onToggleDnc={toggleDnc}
        blocked={blocked}
        requiresDeposit={requiresDeposit}
        onToggleFlag={toggleFlag}
        onBack={() => { setSelected(null); setSummary(null) }}
        onRefresh={() => openClient(selected)}
        onLightbox={setLightbox}
        lightbox={lightbox}
        onCloseLightbox={() => setLightbox(null)}
        onSignOut={signOut}
      />
    )
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Assistant &nbsp;·&nbsp; Client records</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Look someone up.</h1>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          {([['recent', 'Recent'], ['spend', 'Top spenders'], ['visits', 'Top visitors']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => changeSort(val)}
              className={`text-sm rounded-full border px-3.5 py-2 transition-colors ${
                sortBy === val ? 'border-gold bg-gold text-charcoal' : 'border-line/50 bg-cream-soft text-ink-soft hover:border-gold/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
          <input
            autoFocus
            className={`${inputClass} pl-11 pr-12`}
            placeholder="Search a client by name…"
            value={q}
            onChange={(e) => { setQ(e.target.value); search(e.target.value, sortBy) }}
          />
          <MicButton onText={(t) => { const nv = appendText(q, t); setQ(nv); search(nv, sortBy) }} className="absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="border border-line/40 rounded-sm divide-y divide-line/30 bg-cream-soft">
          {hits.length === 0 ? (
            <p className="text-sm text-ink-soft p-6 text-center">No clients found.</p>
          ) : hits.map((h) => (
            <button key={h.name} onClick={() => openClient(h.name)} className="w-full text-left px-5 py-3.5 hover:bg-cream-deep transition-colors flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base text-charcoal truncate">{h.name}</div>
                <div className="text-xs text-stone">last seen {ukDate(h.lastVisit)}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-lg font-medium text-charcoal leading-none">{gbp(h.spend)}</div>
                  <div className="text-sm text-ink-soft mt-0.5">{h.visits} visit{h.visits === 1 ? '' : 's'}</div>
                </div>
                <ChevronRight size={18} className="text-stone" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Detail({
  name, summary, appts, records, photos, messages, loading, doNotContact, onToggleDnc, blocked, requiresDeposit, onToggleFlag, onBack, onRefresh, onLightbox, lightbox, onCloseLightbox, onSignOut,
}: {
  name: string; summary: Summary | null; appts: Appt[]; records: TRecord[]; photos: Photo[]; messages: Message[]; loading: boolean
  doNotContact: boolean; onToggleDnc: (next: boolean) => void
  blocked: boolean; requiresDeposit: boolean; onToggleFlag: (flag: 'blocked' | 'requires_deposit', next: boolean) => void
  onBack: () => void; onRefresh: () => void; onLightbox: (url: string) => void; lightbox: string | null; onCloseLightbox: () => void; onSignOut: () => void
}) {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-6">
          <button onClick={onBack} className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2">
            <ArrowLeft size={14} strokeWidth={1.75} /> All clients
          </button>
          <button onClick={onSignOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight mb-4">{name}</h1>

        <div className="space-y-2 mb-6">
          <FlagToggle
            on={doNotContact}
            onToggle={onToggleDnc}
            Icon={BellOff}
            title="Do not contact"
            onText="No emails, WhatsApp or broadcasts will be sent to this client."
            offText="Outreach is allowed for this client."
          />
          <FlagToggle
            on={requiresDeposit}
            onToggle={(v) => onToggleFlag('requires_deposit', v)}
            Icon={CreditCard}
            title="Require deposit to book"
            onText="This client must pay a deposit online before a booking is confirmed."
            offText="No deposit required to book."
          />
          <FlagToggle
            on={blocked}
            onToggle={(v) => onToggleFlag('blocked', v)}
            Icon={Ban}
            title="Block online booking"
            onText="This client discreetly sees no availability when booking online."
            offText="This client can book online normally."
          />
        </div>

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Stat label="Visits" value={String(summary.visits)} />
            <Stat label="Total spend" value={gbp(summary.totalSpend)} />
            <Stat label="First seen" value={summary.firstVisit ? ukDate(summary.firstVisit) : '—'} />
            <Stat label="Last seen" value={summary.lastVisit ? ukDate(summary.lastVisit) : '—'} />
          </div>
        )}

        {summary && summary.treatments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {summary.treatments.map((t) => (
              <span key={t.service} className="text-sm rounded-full border border-line/50 bg-cream-soft px-3 py-1.5 text-ink-soft">
                {t.service} <span className="text-charcoal font-medium">×{t.count}</span>
              </span>
            ))}
          </div>
        )}

        {/* Photos */}
        <PhotoVault name={name} photos={photos} onRefresh={onRefresh} onLightbox={onLightbox} />

        {/* Clinical notes */}
        <div className="mt-10">
          <div className="eyebrow text-gold mb-3">Treatment notes</div>
          {loading ? <p className="text-sm text-ink-soft py-6 text-center">Loading…</p>
            : records.length === 0 ? (
            <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
              No clinical notes yet. Notes written in the Assistant treatment tool will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <details key={r.id} className="border border-line/40 rounded-sm bg-cream-soft px-4 py-3">
                  <summary className="cursor-pointer flex items-center justify-between gap-3">
                    <span className="text-charcoal font-medium">{r.treatment_label}</span>
                    <span className="text-xs text-stone">{ukDate(r.date)}</span>
                  </summary>
                  <div className="mt-3 text-sm text-ink-soft space-y-1.5">
                    {r.product && <div>Product: <span className="text-charcoal">{r.product}</span>{r.batch_number ? ` · batch ${r.batch_number}` : ''}</div>}
                    {r.areas?.length > 0 && (
                      <div>Areas: <span className="text-charcoal">{r.areas.map((a) => `${a.area} ${a.dose}${r.unit ?? a.unit ?? ''}`).join(', ')}</span>{r.total_dose ? ` (total ${r.total_dose} ${r.unit ?? ''})` : ''}</div>
                    )}
                    {r.clinical_note && <pre className="whitespace-pre-wrap font-body text-sm text-charcoal bg-cream border border-line/30 rounded-sm p-3 mt-2">{r.clinical_note}</pre>}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Messages sent */}
        {messages.length > 0 && (
          <div className="mt-10">
            <div className="eyebrow text-gold mb-3">Messages sent</div>
            <div className="border border-line/40 rounded-sm divide-y divide-line/30 bg-cream-soft">
              {messages.map((m) => (
                <div key={m.id} className="px-4 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-charcoal capitalize">{m.kind} <span className="text-stone lowercase">· {m.channel}</span></span>
                    <span className="text-xs text-stone">{ukDate(m.created_at)}</span>
                  </div>
                  {m.body && <div className="text-xs text-ink-soft mt-1 line-clamp-2">{m.body}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointment history */}
        <div className="mt-10">
          <div className="eyebrow text-gold mb-3">Appointment history</div>
          <div className="border border-line/40 rounded-sm divide-y divide-line/30 bg-cream-soft">
            {appts.length === 0 ? <p className="text-sm text-ink-soft p-5 text-center">No appointments.</p>
              : appts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="text-stone w-24 shrink-0">{ukDate(a.date)}</span>
                <span className="text-charcoal flex-1">{a.service_name}</span>
                <span className={`text-xs ${a.status === 'cancelled' ? 'text-clay' : a.status === 'booked' ? 'text-stone' : 'text-sage'}`}>{a.status}</span>
                <span className="text-charcoal w-16 text-right">{Number(a.price) ? gbp(Number(a.price)) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-charcoal/85 z-50 flex items-center justify-center p-4" onClick={onCloseLightbox}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-sm" />
          <button className="absolute top-4 right-4 text-cream" onClick={onCloseLightbox}><X size={28} /></button>
        </div>
      )}
    </section>
  )
}

function FlagToggle({
  on, onToggle, Icon, title, onText, offText,
}: {
  on: boolean; onToggle: (next: boolean) => void
  Icon: typeof BellOff; title: string; onText: string; offText: string
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-sm border px-4 py-3 ${on ? 'border-clay/40 bg-clay/5' : 'border-line/40 bg-cream-soft'}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={16} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${on ? 'text-clay' : 'text-stone'}`} />
        <div>
          <div className={`text-sm font-medium ${on ? 'text-clay' : 'text-charcoal'}`}>{title}</div>
          <div className="text-xs text-stone mt-0.5">{on ? onText : offText}</div>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onToggle(!on)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? 'bg-clay' : 'bg-line'}`}
        aria-label={`Toggle ${title}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-cream transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line/40 bg-cream-soft rounded-sm p-3">
      <div className="text-eyebrow text-ink-soft mb-1">{label}</div>
      <div className="font-display italic text-2xl text-charcoal leading-none">{value}</div>
    </div>
  )
}

function PhotoVault({ name, photos, onRefresh, onLightbox }: { name: string; photos: Photo[]; onRefresh: () => void; onLightbox: (url: string) => void }) {
  const [type, setType] = useState<'before' | 'after'>('before')
  const [consent, setConsent] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function upload(file: File) {
    if (!consent) { setErr('Tick consent before uploading a client photo.'); return }
    setBusy(true); setErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('client_name', name)
      fd.append('type', type)
      fd.append('date', date)
      fd.append('consent', 'true')
      const res = await fetch('/api/staff/assistant/photos', { method: 'POST', body: fd })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(d.error || 'Upload failed.'); return }
      onRefresh()
    } catch { setErr('Network error.') } finally { setBusy(false) }
  }

  async function del(id: string) {
    if (!window.confirm('Delete this photo?')) return
    await fetch(`/api/staff/assistant/photos?id=${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div>
      <div className="eyebrow text-gold mb-3 flex items-center gap-2"><Camera size={14} strokeWidth={1.75} /> Photo vault</div>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {photos.map((p) => (
            <div key={p.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`${p.type} ${ukDate(p.date)}`} onClick={() => onLightbox(p.url)} className="w-full aspect-square object-cover rounded-sm border border-line/40 cursor-zoom-in" />
              <span className="absolute bottom-1 left-1 text-[10px] uppercase tracking-wide bg-charcoal/70 text-cream px-1.5 py-0.5 rounded-sm">{p.type}</span>
              <button onClick={() => del(p.id)} className="absolute top-1 right-1 bg-charcoal/70 text-cream rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-line/40 bg-cream-soft rounded-sm p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="grid grid-cols-2 gap-1">
            {(['before', 'after'] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`text-sm rounded-sm border px-3 py-1.5 capitalize transition-colors ${type === t ? 'border-gold bg-gold/10 text-charcoal' : 'border-line/40 text-ink-soft'}`}>{t}</button>
            ))}
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-cream border border-line/40 rounded-sm px-2.5 py-1.5 text-sm" />
          <label className="text-sm text-ink-soft inline-flex items-center gap-2 cursor-pointer ml-auto">
            <span className={`inline-flex w-5 h-5 rounded-sm border items-center justify-center ${consent ? 'bg-gold border-gold text-charcoal' : 'border-line bg-cream'}`}>{consent && <Check size={12} strokeWidth={3} />}</span>
            <input type="checkbox" className="sr-only" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            Consent to store
          </label>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = '' }} />
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn btn-secondary disabled:opacity-50">
          <span className="inline-flex items-center gap-2"><ImagePlus size={15} strokeWidth={1.75} /> {busy ? 'Uploading…' : `Add ${type} photo`}</span>
        </button>
        {err && <p className="text-xs text-clay mt-2">{err}</p>}
        <p className="text-xs text-ink-soft mt-2 leading-relaxed">Only store photos with the client&apos;s consent. Stored against this client, with the consent recorded.</p>
      </div>
    </div>
  )
}
