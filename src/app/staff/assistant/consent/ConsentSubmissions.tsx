'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Clock, FileCheck2, Search } from 'lucide-react'
import { ukDate } from '@/lib/assistant/format'
import type { ConsentSubmissionRow, ConsentRequestSummary } from '@/app/api/staff/assistant/consent/route'

export default function ConsentSubmissions() {
  const [rows, setRows] = useState<ConsentSubmissionRow[]>([])
  const [outstanding, setOutstanding] = useState<ConsentRequestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/staff/assistant/consent')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Could not load'))))
      .then((d) => {
        if (cancelled) return
        setRows(d.submissions ?? [])
        setOutstanding(d.outstanding ?? [])
        if (d.error) setError(d.error)
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Open and scroll to a specific submission when arriving from the "View
  // consent form" button in Bernadette's notification email (?submission=<id>).
  useEffect(() => {
    if (loading || rows.length === 0) return
    const id = new URLSearchParams(window.location.search).get('submission')
    if (!id || !rows.some((r) => r.id === id)) return
    setOpenId(id)
    setTimeout(() => document.getElementById(`sub-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [loading, rows])

  const outstandingFiltered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return outstanding
    return outstanding.filter(
      (r) =>
        r.client_name.toLowerCase().includes(term) ||
        (r.client_email ?? '').toLowerCase().includes(term) ||
        r.form_name.toLowerCase().includes(term),
    )
  }, [outstanding, q])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(
      (r) =>
        r.client_name.toLowerCase().includes(term) ||
        (r.client_email ?? '').toLowerCase().includes(term) ||
        r.form_name.toLowerCase().includes(term),
    )
  }, [rows, q])

  return (
    <div className="mt-8">
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by client name, email or form…"
          className="w-full bg-cream border border-line/40 rounded-sm pl-10 pr-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]"
        />
      </div>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}
      {error && (
        <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 leading-relaxed">
          {error.includes('consent_submissions') || error.toLowerCase().includes('does not exist')
            ? 'No consent forms yet. (The consent_submissions table has not been created — run the migration in scripts/consent-submissions.sql to switch storage on.)'
            : error}
        </div>
      )}

      {!loading && outstandingFiltered.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={15} className="text-gold-deep" />
            <span className="text-eyebrow text-gold-deep">Outstanding — sent, not completed</span>
          </div>
          <ul className="space-y-2">
            {outstandingFiltered.map((r) => (
              <li key={r.id} className="border border-line/40 rounded-sm bg-cream px-4 py-3 flex items-center gap-3">
                <Clock size={16} className="text-stone shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-base text-charcoal truncate">{r.client_name}</span>
                  <span className="block text-xs text-ink-soft truncate">
                    {r.form_name.replace(/ Consent Form$/i, '')} &nbsp;·&nbsp; sent {ukDate(r.created_at)}
                    {r.client_email ? ` · ${r.client_email}` : ''}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && (filtered.length > 0 || outstandingFiltered.length > 0) && (
        <div className="flex items-center gap-2 mb-2">
          <FileCheck2 size={15} className="text-gold-deep" />
          <span className="text-eyebrow text-gold-deep">Completed</span>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-ink-soft">No completed consent forms yet.</p>
      )}

      <ul className="space-y-2">
        {filtered.map((r) => {
          const open = openId === r.id
          return (
            <li key={r.id} id={`sub-${r.id}`} className="border border-line/40 rounded-sm bg-cream-soft scroll-mt-24">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : r.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <FileCheck2 size={16} className="text-gold-deep shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-base text-charcoal truncate">{r.client_name}</span>
                  <span className="block text-xs text-ink-soft truncate">
                    {r.form_name} &nbsp;·&nbsp; {ukDate(r.submitted_at)}
                  </span>
                </span>
                {open ? <ChevronDown size={16} className="text-stone" /> : <ChevronRight size={16} className="text-stone" />}
              </button>

              {open && (
                <div className="px-4 pb-4 border-t border-line/30 pt-3">
                  <dl className="space-y-2.5">
                    {r.client_email && <Row label="Email" value={r.client_email} />}
                    {r.service_name && <Row label="Appointment" value={r.service_name} />}
                    {Object.entries(r.answers || {}).map(([k, v]) => (
                      <Row key={k} label={k} value={Array.isArray(v) ? (v.length ? v.join(', ') : '—') : v || '—'} />
                    ))}
                  </dl>
                  <div className="mt-3 border-t border-line/30 pt-3">
                    <span className="text-eyebrow text-ink-soft block mb-1">Declaration agreed</span>
                    <p className="text-sm text-charcoal leading-relaxed">{r.declaration}</p>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[40%_60%] gap-3">
      <dt className="text-xs text-ink-soft leading-snug">{label}</dt>
      <dd className="text-sm text-charcoal leading-snug">{value}</dd>
    </div>
  )
}
