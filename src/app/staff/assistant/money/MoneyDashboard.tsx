'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Download, LogOut, Upload } from 'lucide-react'
import { gbp, currentMonthKey, monthLabel, recentMonthKeys } from '@/lib/assistant/format'
import type { MonthSummary, RevenueGroup } from '@/lib/assistant/finance'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold'

type TrendPoint = { month: string; revenue: number; spend: number }
type ProfitData = {
  configured: boolean
  summary?: MonthSummary
  revenue?: RevenueGroup[]
  trend?: TrendPoint[]
}

export default function MoneyDashboard() {
  const [month, setMonth] = useState(currentMonthKey())
  const [data, setData] = useState<ProfitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [packText, setPackText] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const months = recentMonthKeys(12)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setPackText(null)
    try {
      const res = await fetch(`/api/staff/assistant/profit?month=${month}`)
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'Could not load.')
        return
      }
      setData(d)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    void load()
  }, [load])

  async function buildPack() {
    const res = await fetch(`/api/staff/assistant/accountant-pack?month=${month}`)
    const d = await res.json().catch(() => ({}))
    if (res.ok) setPackText(d.text)
    else setError(d.error || 'Could not build the pack.')
  }

  async function copyPack() {
    if (!packText) return
    await navigator.clipboard.writeText(packText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const s = data?.summary
  const maxTrend = Math.max(1, ...(data?.trend ?? []).flatMap((t) => [t.revenue, t.spend]))

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <Link href="/staff/assistant" className="inline-flex items-center gap-2 mb-5 bg-charcoal text-cream rounded-sm px-4 py-3 text-sm font-medium hover:bg-gold-deep transition-colors">
              <ArrowLeft size={14} strokeWidth={1.75} />
              Assistant
            </Link>
            <div className="eyebrow text-gold mb-2">Assistant &nbsp;·&nbsp; Profit &amp; accountant pack</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Where the month stands.</h1>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2" aria-label="Sign out">
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {data && !data.configured && (
          <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 mb-6 leading-relaxed">
            The clinic database is not connected. Add <code>SUPABASE_URL</code> and{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in Vercel to see revenue and profit.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={`${inputClass} w-auto`}>
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>

        {error && <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 mb-6">{error}</div>}

        {loading ? (
          <p className="text-sm text-ink-soft py-12 text-center">Loading…</p>
        ) : s ? (
          <>
            {/* Headline figures */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <Stat label="Revenue" value={gbp(s.revenue)} sub={`${s.appointmentsCount} completed`} />
              <Stat label="Total costs" value={gbp(s.totalCost)} sub={`Stock ${gbp(s.stockCost)}`} />
              <Stat label="Net profit" value={gbp(s.netProfit)} accent={s.netProfit >= 0 ? 'sage' : 'clay'} />
              <Stat label="Margin" value={`${s.marginPct.toFixed(1)}%`} accent={s.marginPct >= 0 ? 'sage' : 'clay'} />
            </div>

            {s.unpaid.length > 0 && (
              <div className="border border-clay/40 bg-clay/10 text-charcoal text-sm rounded-sm px-4 py-3 mb-8">
                <span className="font-medium">{s.unpaid.length} unpaid supplier invoice{s.unpaid.length === 1 ? '' : 's'}</span>
                {' '}({gbp(s.unpaidTotal)} outstanding).
              </div>
            )}

            {/* Trend */}
            {data.trend && data.trend.length > 0 && (
              <div className="border border-line/40 bg-cream-soft rounded-sm p-5 mb-8">
                <div className="eyebrow text-ink-soft mb-4">Revenue vs spend</div>
                <div className="flex items-end gap-3 h-40">
                  {data.trend.map((t) => (
                    <div key={t.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div className="flex items-end gap-1 h-full w-full justify-center">
                        <div className="w-3 bg-gold rounded-t" style={{ height: `${(t.revenue / maxTrend) * 100}%` }} title={`Revenue ${gbp(t.revenue)}`} />
                        <div className="w-3 bg-stone/50 rounded-t" style={{ height: `${(t.spend / maxTrend) * 100}%` }} title={`Spend ${gbp(t.spend)}`} />
                      </div>
                      <span className="text-[10px] text-ink-soft">{monthLabel(t.month).split(' ')[0].slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gold rounded-sm" /> Revenue</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-stone/50 rounded-sm" /> Spend</span>
                </div>
              </div>
            )}

            {/* Revenue by treatment */}
            {data.revenue && data.revenue.length > 0 && (
              <div className="mb-8">
                <div className="eyebrow text-ink-soft mb-3">Revenue by treatment</div>
                <div className="border border-line/40 rounded-sm divide-y divide-line/30 bg-cream-soft">
                  {data.revenue.map((g) => (
                    <div key={g.service} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-charcoal">{g.service} <span className="text-stone">×{g.count}</span></span>
                      <span className="text-charcoal font-medium">{gbp(g.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Tools: import + accountant pack */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <CsvImport onImported={load} />
          <div className="border border-line/40 bg-cream-soft rounded-sm p-5">
            <div className="eyebrow text-gold mb-3">Accountant pack</div>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              A copyable summary for {monthLabel(month)}, plus a CSV of every income and expense line.
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={buildPack} className="btn btn-secondary"><span className="inline-flex items-center gap-2">Build summary</span></button>
              <a href={`/api/staff/assistant/accountant-pack?month=${month}&format=csv`} className="btn btn-secondary">
                <span className="inline-flex items-center gap-2"><Download size={14} strokeWidth={1.75} /> Download CSV</span>
              </a>
            </div>
            {packText && (
              <div className="mt-4">
                <div className="flex justify-end mb-2">
                  <button onClick={copyPack} className="eyebrow text-gold-deep hover:text-charcoal inline-flex items-center gap-1.5">
                    <Copy size={12} strokeWidth={1.75} /> {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs text-charcoal bg-cream border border-line/40 rounded-sm p-4 whitespace-pre-wrap font-body overflow-auto max-h-96">{packText}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'sage' | 'clay' }) {
  const color = accent === 'sage' ? 'text-sage' : accent === 'clay' ? 'text-clay' : 'text-charcoal'
  return (
    <div className="border border-line/40 bg-cream-soft rounded-sm p-4">
      <div className="text-eyebrow text-ink-soft mb-1">{label}</div>
      <div className={`font-display italic text-3xl leading-none ${color}`}>{value}</div>
      {sub && <div className="text-xs text-stone mt-1.5">{sub}</div>}
    </div>
  )
}

function CsvImport({ onImported }: { onImported: () => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleFile(file: File) {
    setBusy(true)
    setMsg(null)
    try {
      const csv = await file.text()
      const res = await fetch('/api/staff/assistant/appointments/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg(d.error || 'Import failed.')
        return
      }
      setMsg(`Imported ${d.imported} appointments (${d.completed} completed). ${d.skipped} rows skipped.`)
      onImported()
    } catch {
      setMsg('Could not read that file.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border border-line/40 bg-cream-soft rounded-sm p-5">
      <div className="eyebrow text-gold mb-3">Import Ovatu revenue</div>
      <p className="text-sm text-ink-soft leading-relaxed mb-4">
        Export your appointments from Ovatu as CSV and drop it here. We read the date, client, service
        and price. (Once the Ovatu API is connected, this happens automatically.)
      </p>
      <label className="btn btn-secondary cursor-pointer inline-flex">
        <span className="inline-flex items-center gap-2"><Upload size={14} strokeWidth={1.75} /> {busy ? 'Importing…' : 'Choose CSV'}</span>
        <input type="file" accept=".csv,text/csv" className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = '' }} />
      </label>
      {msg && <p className="text-xs text-ink-soft mt-3">{msg}</p>}
    </div>
  )
}
