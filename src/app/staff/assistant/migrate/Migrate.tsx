'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, CheckCircle2, Eye, Mail, Upload } from 'lucide-react'

type Report = {
  considered: number
  created: number
  duplicates: number
  emailed: number
  needsTime: string[]
  needsService: string[]
  noEmail: string[]
}

type Result = { ok: boolean; dryRun: boolean; headers: string[]; report: Report }

export default function Migrate() {
  const [csv, setCsv] = useState('')
  const [send, setSend] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  async function run(dryRun: boolean) {
    if (!csv.trim()) return
    if (!dryRun && !window.confirm('Create these bookings in the new system now?')) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/staff/assistant/migrate-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv, dryRun, send }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setCsv(await file.text())
  }

  const r = result?.report

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-24">
        <Link
          href="/staff/assistant"
          className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Assistant
        </Link>
        <div className="eyebrow text-gold mb-2">Swap over</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Bring bookings across
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed">
          Already booked clients live in Ovatu. Export your upcoming appointments from Ovatu as a CSV,
          paste or upload it here, and every future booking becomes a real booking in the new system,
          so those clients can change or cancel just like a new one. Preview first. Nothing is written
          until you choose to.
        </p>
        <p className="text-xs text-ink-soft mt-3 leading-relaxed">
          The export needs, at least, a date, a time, the client name and the treatment. Email and
          mobile let the client manage online and get reminders.
        </p>

        <div className="mt-6">
          <label className="inline-flex items-center gap-2 text-sm text-charcoal border border-charcoal/30 rounded-sm px-3 py-2 cursor-pointer hover:border-gold transition-colors">
            <Upload size={14} /> Choose CSV file
            <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
          </label>
        </div>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="…or paste the CSV contents here"
          rows={6}
          className="mt-3 w-full border border-line/60 rounded-sm px-3 py-2 text-xs font-mono bg-cream-soft focus:border-gold outline-none"
        />

        <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={send} onChange={(e) => setSend(e.target.checked)} />
          Email each client their account link when bringing them across
        </label>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => void run(true)}
            disabled={busy || !csv.trim()}
            className="inline-flex items-center justify-center gap-2 bg-cream-soft border border-charcoal/30 text-charcoal text-sm rounded-sm px-5 py-2.5 hover:border-gold transition-colors disabled:opacity-50"
          >
            <Eye size={14} /> {busy ? 'Working…' : 'Preview'}
          </button>
          <button
            onClick={() => void run(false)}
            disabled={busy || !csv.trim()}
            className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-sm rounded-sm px-5 py-2.5 hover:bg-gold-deep transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={14} /> Bring them across
          </button>
        </div>

        {error && (
          <div className="mt-6 border border-red-300 bg-red-50 text-red-800 text-sm rounded-sm px-4 py-3">{error}</div>
        )}

        {r && (
          <div className="mt-8">
            <div
              className={`rounded-sm px-4 py-3 border text-sm ${
                result?.dryRun ? 'border-gold/50 bg-gold/10' : 'border-green-300 bg-green-50'
              }`}
            >
              <strong>{result?.dryRun ? 'Preview' : 'Done'}.</strong>{' '}
              {result?.dryRun
                ? `${r.created} booking${r.created === 1 ? '' : 's'} would be brought across`
                : `${r.created} booking${r.created === 1 ? '' : 's'} brought across`}
              {' '}from {r.considered} upcoming appointment{r.considered === 1 ? '' : 's'}.
              {r.duplicates > 0 && ` ${r.duplicates} already there (skipped).`}
              {!result?.dryRun && r.emailed > 0 && ` ${r.emailed} client${r.emailed === 1 ? '' : 's'} emailed.`}
            </div>

            {r.needsService.length > 0 && (
              <ReviewList
                title={`Treatment name did not match (${r.needsService.length})`}
                hint="Add or rename the treatment in services, or book these by hand."
                items={r.needsService}
              />
            )}
            {r.needsTime.length > 0 && (
              <ReviewList
                title={`No start time in the export (${r.needsTime.length})`}
                hint="Re-export with a time column, or book these by hand."
                items={r.needsTime}
              />
            )}
            {r.noEmail.length > 0 && (
              <ReviewList
                title={`Brought across, but no email on file (${r.noEmail.length})`}
                hint="These are booked in the diary. Without an email they cannot manage online, so reception handles changes by phone."
                items={r.noEmail}
                icon={<Mail size={14} className="text-amber-500" />}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function ReviewList({ title, hint, items, icon }: { title: string; hint: string; items: string[]; icon?: React.ReactNode }) {
  return (
    <div className="mt-4 border border-amber-300 bg-amber-50 rounded-sm px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
        {icon ?? <AlertTriangle size={14} className="text-amber-500" />} {title}
      </div>
      <p className="text-xs text-amber-800 mt-1">{hint}</p>
      <ul className="text-xs text-charcoal mt-2 space-y-0.5 list-disc pl-5 max-h-48 overflow-auto">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  )
}
