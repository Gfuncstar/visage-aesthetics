'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  RefreshCw,
  RotateCcw,
  Rocket,
  XCircle,
} from 'lucide-react'

type CheckStatus = 'pass' | 'warn' | 'fail'

type Check = {
  id: string
  side: 'front' | 'back'
  label: string
  status: CheckStatus
  detail: string
  fix?: string
  blocker: boolean
}

type Report = {
  ready: boolean
  cutoverLive: boolean
  generatedAt: string
  blockers: number
  warnings: number
  checks: Check[]
}

const DOT: Record<CheckStatus, { Icon: typeof CheckCircle2; cls: string }> = {
  pass: { Icon: CheckCircle2, cls: 'text-green-600' },
  warn: { Icon: AlertTriangle, cls: 'text-amber-500' },
  fail: { Icon: XCircle, cls: 'text-red-600' },
}

function CheckRow({ c }: { c: Check }) {
  const { Icon, cls } = DOT[c.status]
  return (
    <div className="flex gap-3 py-3 border-b border-line/30 last:border-0">
      <Icon size={18} strokeWidth={1.75} className={`${cls} mt-0.5 shrink-0`} />
      <div className="min-w-0">
        <div className="text-sm text-charcoal font-medium flex items-center gap-2">
          {c.label}
          {c.blocker && c.status === 'fail' && (
            <span className="text-[10px] uppercase tracking-wide bg-red-100 text-red-700 rounded-sm px-1.5 py-0.5">
              Blocks swap
            </span>
          )}
        </div>
        <p className="text-xs text-ink-soft mt-1 leading-snug">{c.detail}</p>
        {c.fix && c.status !== 'pass' && (
          <p className="text-xs text-stone mt-1 leading-snug">
            <span className="font-medium">Fix:</span> {c.fix}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Preflight() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/staff/assistant/preflight', { cache: 'no-store' })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Check failed')
      setReport(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const front = report?.checks.filter((c) => c.side === 'front') ?? []
  const back = report?.checks.filter((c) => c.side === 'back') ?? []

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
        <div className="eyebrow text-gold mb-2">Go-live readiness</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Ready to swap?
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed">
          One check of everything the switch touches, front end and back end. Flip the switch only
          when this is all green. You can run it as often as you like. It changes nothing.
        </p>

        <button
          onClick={() => void load()}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 bg-charcoal text-cream text-sm rounded-sm px-4 py-2 hover:bg-gold-deep transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} strokeWidth={1.75} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Checking…' : 'Re-check'}
        </button>

        {error && (
          <div className="mt-6 border border-red-300 bg-red-50 text-red-800 text-sm rounded-sm px-4 py-3">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* Headline verdict */}
            <div
              className={`mt-6 rounded-sm px-4 py-4 border ${
                report.ready
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {report.ready ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
                <span className="font-display italic text-xl text-charcoal">
                  {report.ready ? 'Ready to swap' : `${report.blockers} thing${report.blockers === 1 ? '' : 's'} to fix first`}
                </span>
              </div>
              <p className="text-sm text-ink-soft mt-2 leading-snug">
                {report.ready
                  ? 'Every blocker is green. Flip the switch and the swap will be clean.'
                  : 'Fix the red items below, then re-check. Do not flip the switch while any are red.'}
                {report.warnings > 0 &&
                  ` ${report.warnings} optional item${report.warnings === 1 ? '' : 's'} not set (amber): you can still go live, they run in a reduced way until set.`}
              </p>
            </div>

            {/* Current switch state */}
            <div
              className={`mt-3 rounded-sm px-4 py-3 border text-sm flex items-center gap-2 ${
                report.cutoverLive
                  ? 'border-gold/50 bg-gold/10 text-charcoal'
                  : 'border-line/40 bg-cream-soft text-ink-soft'
              }`}
            >
              <Rocket size={16} className={report.cutoverLive ? 'text-gold-deep' : 'text-stone'} />
              {report.cutoverLive ? (
                <span>
                  The switch is <strong>LIVE</strong>. The in-house system is running. Ovatu sync is off.
                </span>
              ) : (
                <span>
                  The switch is <strong>off</strong>. Still running on Ovatu. Set{' '}
                  <code className="text-xs">NEXT_PUBLIC_CUTOVER=go</code> to swap.
                </span>
              )}
            </div>

            {/* Front end */}
            <h2 className="font-display italic text-lg text-charcoal mt-8 mb-1">Front end</h2>
            <p className="text-xs text-ink-soft mb-2">What a client sees and does when they book.</p>
            <div className="bg-cream-soft border border-line/40 rounded-sm px-4">
              {front.map((c) => (
                <CheckRow key={c.id} c={c} />
              ))}
            </div>

            {/* Back end */}
            <h2 className="font-display italic text-lg text-charcoal mt-8 mb-1">Back end</h2>
            <p className="text-xs text-ink-soft mb-2">What runs behind the scenes for the clinic.</p>
            <div className="bg-cream-soft border border-line/40 rounded-sm px-4">
              {back.map((c) => (
                <CheckRow key={c.id} c={c} />
              ))}
            </div>

            {/* How to swap */}
            <h2 className="font-display italic text-lg text-charcoal mt-8 mb-2">How to swap</h2>
            <ol className="text-sm text-ink-soft leading-relaxed list-decimal pl-5 space-y-1">
              <li>Get every item above green (amber is optional).</li>
              <li>
                In Vercel, set <code className="text-xs">NEXT_PUBLIC_CUTOVER</code> to{' '}
                <code className="text-xs">go</code>. That one change redeploys and swaps front end and
                back end together.
              </li>
              <li>Turn off online booking inside Ovatu so the old link cannot take a clashing slot.</li>
              <li>Re-check this page. The switch should read LIVE.</li>
            </ol>

            {/* Back door / rollback */}
            <div className="mt-8 border border-charcoal/30 bg-charcoal/5 rounded-sm px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw size={18} className="text-charcoal" />
                <h2 className="font-display italic text-lg text-charcoal">Back door: instant rollback</h2>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                If anything goes wrong, you go straight back to the current Ovatu set-up with one
                change: in Vercel, remove <code className="text-xs">NEXT_PUBLIC_CUTOVER</code> (or set it
                to anything other than <code className="text-xs">go</code>) and redeploy.
              </p>
              <ul className="text-sm text-ink-soft leading-relaxed list-disc pl-5 mt-2 space-y-1">
                <li>Every &ldquo;Book&rdquo; button points back at the Ovatu widget.</li>
                <li>The Ovatu sync starts again, so Ovatu is the source of truth once more.</li>
                <li>Consent forms stop sending automatically at booking.</li>
                <li>
                  Nothing is lost either way. Bookings taken in the in-house system while it was live
                  stay in the diary and the reports, and all history is kept (the policy needs records
                  for ten years).
                </li>
              </ul>
              <p className="text-sm text-ink-soft leading-relaxed mt-2">
                Re-open Ovatu&rsquo;s online booking when you roll back, and you are exactly where you
                started.
              </p>
            </div>

            <p className="text-xs text-stone mt-6">
              Checked {new Date(report.generatedAt).toLocaleString('en-GB')}.
            </p>
          </>
        )}

        {!report && loading && (
          <div className="mt-8 flex items-center gap-2 text-ink-soft text-sm">
            <Circle size={14} className="animate-pulse" />
            Running checks…
          </div>
        )}
      </div>
    </section>
  )
}
