'use client'

import { useCallback, useEffect, useState } from 'react'
import { Award, Calendar, Check, Copy, ExternalLink, LogOut, Newspaper, X } from 'lucide-react'
import MicButton, { appendText } from '@/components/ui/MicButton'
import { notifyDone } from '@/lib/staff-toast'

type Kind = 'award' | 'press'
type Status = 'new' | 'shortlisted' | 'submitted' | 'dismissed'

const STATUS_DONE: Record<Status, string> = {
  new: 'Moved back to new',
  shortlisted: 'Shortlisted',
  submitted: 'Marked as submitted',
  dismissed: 'Dismissed',
}

type Opportunity = {
  id: string
  kind: Kind
  title: string
  organisation: string | null
  url: string | null
  summary: string | null
  deadline: string | null
  cost_note: string | null
  fit_reason: string | null
  draft: string | null
  status: Status
}

function deadlineLabel(iso: string | null): { text: string; urgent: boolean } | null {
  if (!iso) return null
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  const days = Math.round((d.getTime() - Date.now()) / 86_400_000)
  const nice = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  if (days < 0) return { text: `Closed ${nice}`, urgent: false }
  if (days === 0) return { text: 'Closes today', urgent: true }
  if (days <= 14) return { text: `${nice} · ${days} day${days === 1 ? '' : 's'} left`, urgent: true }
  return { text: nice, urgent: false }
}

export default function Visibility() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [filter, setFilter] = useState<'all' | Kind>('all')
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/staff/assistant/opportunities')
    if (res.ok) {
      const d = await res.json()
      setItems(d.opportunities ?? [])
      setConfigured(d.configured !== false)
    }
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/staff/assistant/opportunities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  function setStatus(id: string, status: Status) {
    setItems((prev) =>
      status === 'dismissed' ? prev.filter((o) => o.id !== id) : prev.map((o) => (o.id === id ? { ...o, status } : o)),
    )
    void patch(id, { status })
    notifyDone(STATUS_DONE[status])
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const visible = items.filter((o) => filter === 'all' || o.kind === filter)
  const awards = items.filter((o) => o.kind === 'award').length
  const press = items.filter((o) => o.kind === 'press').length

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Marketing &nbsp;·&nbsp; Awards &amp; press</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Get the clinic seen.</h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Free awards worth entering and press worth replying to, found for you each week with a draft ready.
              Nothing is sent until you say so.
            </p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={`All (${items.length})`} />
          <FilterChip active={filter === 'award'} onClick={() => setFilter('award')} label={`Awards (${awards})`} />
          <FilterChip active={filter === 'press'} onClick={() => setFilter('press')} label={`Press (${press})`} />
        </div>

        {!configured ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
            The clinic database is not connected, so there is nothing to show yet.
          </p>
        ) : loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
            Nothing waiting. The scout runs weekly, anything it finds will appear here with a draft ready to review.
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((o) => (
              <OppCard key={o.id} o={o} onStatus={setStatus} onSaveDraft={(id, draft) => patch(id, { draft })} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm rounded-full border px-3.5 py-1.5 transition-colors ${
        active ? 'border-gold bg-gold/10 text-gold-deep' : 'border-line/50 text-stone hover:border-gold/50'
      }`}
    >
      {label}
    </button>
  )
}

function OppCard({
  o,
  onStatus,
  onSaveDraft,
}: {
  o: Opportunity
  onStatus: (id: string, s: Status) => void
  onSaveDraft: (id: string, draft: string) => void
}) {
  const [draft, setDraft] = useState(o.draft ?? '')
  const [copied, setCopied] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const dl = deadlineLabel(o.deadline)
  const Icon = o.kind === 'award' ? Award : Newspaper

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard blocked */
    }
  }

  function saveDraft() {
    onSaveDraft(o.id, draft)
    setSavedAt(Date.now())
    setTimeout(() => setSavedAt(null), 2500)
  }

  return (
    <div className={`border rounded-sm p-4 ${o.status === 'submitted' ? 'border-sage/50 bg-sage/5' : 'border-line/40 bg-cream-soft'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="inline-flex w-9 h-9 rounded-full bg-charcoal text-cream items-center justify-center shrink-0">
            <Icon size={15} strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-base font-medium text-charcoal leading-snug">{o.title}</div>
            {o.organisation && <div className="text-sm text-stone mt-0.5">{o.organisation}</div>}
          </div>
        </div>
        <button onClick={() => onStatus(o.id, 'dismissed')} className="text-stone hover:text-clay shrink-0" aria-label="Dismiss"><X size={16} strokeWidth={1.75} /></button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {dl && (
          <span className={`inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 ${dl.urgent ? 'bg-clay/10 text-clay border border-clay/30' : 'bg-cream border border-line/40 text-stone'}`}>
            <Calendar size={12} strokeWidth={1.75} /> {dl.text}
          </span>
        )}
        {o.cost_note && <span className="text-xs text-stone bg-cream border border-line/40 rounded-full px-2.5 py-1">{o.cost_note}</span>}
        {o.status === 'shortlisted' && <span className="text-xs text-gold-deep bg-gold/10 border border-gold/30 rounded-full px-2.5 py-1">Shortlisted</span>}
        {o.status === 'submitted' && <span className="text-xs text-sage bg-sage/10 border border-sage/30 rounded-full px-2.5 py-1">Submitted</span>}
      </div>

      {o.summary && <p className="text-sm text-ink-soft mt-3 leading-relaxed">{o.summary}</p>}
      {o.fit_reason && <p className="text-sm text-charcoal mt-2 leading-relaxed"><span className="text-gold-deep">Why it fits: </span>{o.fit_reason}</p>}

      <label className="text-eyebrow text-ink-soft mt-4 mb-1.5 block">{o.kind === 'award' ? 'Draft entry (edit before you submit)' : 'Draft pitch (edit before you send)'}</label>
      <div className="relative">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          className="w-full bg-cream border border-line/40 rounded-sm px-3 py-2.5 pr-10 text-sm text-charcoal focus:outline-none focus:border-gold leading-relaxed"
          placeholder="No draft yet."
        />
        <MicButton onText={(t) => setDraft((v) => appendText(v, t))} className="absolute right-2.5 top-2.5" />
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {o.url && (
          <a href={o.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ minHeight: 38 }}>
            <span className="inline-flex items-center gap-2"><ExternalLink size={14} strokeWidth={1.75} /> {o.kind === 'award' ? 'Open entry page' : 'Open request'}</span>
          </a>
        )}
        <button onClick={copyDraft} disabled={!draft} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 38 }}>
          <span className="inline-flex items-center gap-2"><Copy size={14} strokeWidth={1.75} /> {copied ? 'Copied' : 'Copy draft'}</span>
        </button>
        <button onClick={saveDraft} className="btn btn-secondary" style={{ minHeight: 38 }}>
          <span className="inline-flex items-center gap-2"><Check size={14} strokeWidth={1.75} /> {savedAt ? 'Saved' : 'Save edits'}</span>
        </button>
        {o.status !== 'shortlisted' && o.status !== 'submitted' && (
          <button onClick={() => onStatus(o.id, 'shortlisted')} className="btn" style={{ minHeight: 38 }}>Shortlist</button>
        )}
        <button onClick={() => onStatus(o.id, 'submitted')} className="btn ml-auto" style={{ minHeight: 38 }}>
          <span className="inline-flex items-center gap-2"><Check size={14} strokeWidth={2} /> Mark submitted</span>
        </button>
      </div>
    </div>
  )
}
