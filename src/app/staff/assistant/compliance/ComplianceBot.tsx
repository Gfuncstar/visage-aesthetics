'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  FileText,
  HelpCircle,
  ListChecks,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Status = 'covered' | 'conditions' | 'excluded' | 'refer'

type Verdict = {
  status: Status
  headline: string
  summary: string
  mapsTo: string
  conditions: string[]
  exclusions: string[]
  requirements: string[]
  citations: string[]
  referToBroker: boolean
}

type LiveFlag = {
  treatment: string
  status: Status
  note: string
  endorsement: string
}

type Meta = {
  wording: string
  insurer: string
  policyNumber: string
  periodFrom: string
  periodTo: string
  aggregateLimit: number
  standardDeductible: number
  bandsPurchased: string[]
  broker: string
}

type StatusData = {
  meta: Meta
  endorsements: { id: string; title: string; kind: string; summary: string }[]
  audit: LiveFlag[]
  aiReady: boolean
}

const STATUS_STYLES: Record<Status, { label: string; Icon: LucideIcon; chip: string; card: string }> = {
  covered: {
    label: 'Covered',
    Icon: CheckCircle2,
    chip: 'text-green-700 bg-green-50 border-green-200',
    card: 'border-green-200 bg-green-50/40',
  },
  conditions: {
    label: 'Covered with conditions',
    Icon: ShieldCheck,
    chip: 'text-gold-deep bg-gold/10 border-gold/40',
    card: 'border-gold/40 bg-gold/5',
  },
  excluded: {
    label: 'Not covered',
    Icon: XCircle,
    chip: 'text-red-700 bg-red-50 border-red-200',
    card: 'border-red-200 bg-red-50/40',
  },
  refer: {
    label: 'Check with broker',
    Icon: HelpCircle,
    chip: 'text-blue-700 bg-blue-50 border-blue-200',
    card: 'border-blue-200 bg-blue-50/40',
  },
}

function ukDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold'

function PointList({ title, points, Icon }: { title: string; points: string[]; Icon: LucideIcon }) {
  if (!points || points.length === 0) return null
  return (
    <div className="mt-4">
      <div className="eyebrow text-[10px] text-stone mb-2 flex items-center gap-1.5">
        <Icon size={12} strokeWidth={1.75} />
        {title}
      </div>
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="text-sm text-charcoal leading-snug flex gap-2">
            <span className="text-stone shrink-0">·</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ComplianceBot() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [treatment, setTreatment] = useState('')
  const [details, setDetails] = useState('')
  const [prescriber, setPrescriber] = useState('')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/assistant/compliance')
      if (res.ok) setStatus((await res.json()) as StatusData)
    } catch {
      /* panel is optional */
    }
  }, [])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  async function runCheck() {
    if (!treatment.trim()) {
      setError('Name the treatment or product to check.')
      return
    }
    setChecking(true)
    setError('')
    setVerdict(null)
    try {
      const res = await fetch('/api/staff/assistant/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatment, details, prescriber }),
      })
      const data = (await res.json()) as { verdict?: Verdict; error?: string }
      if (!res.ok || !data.verdict) {
        setError(data.error || 'Could not assess this treatment.')
      } else {
        setVerdict(data.verdict)
      }
    } catch {
      setError('Request failed. Try again.')
    } finally {
      setChecking(false)
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const style = verdict ? STATUS_STYLES[verdict.status] : null

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <Link
            href="/staff/assistant"
            className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            Assistant
          </Link>
          <button
            onClick={signOut}
            className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Compliance</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Is this treatment insured?
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
          Thinking of adding a new treatment or product? Describe it and the assistant checks it
          against the clinic insurance policy, then tells you what to do to stay covered.
        </p>

        {/* Policy at a glance */}
        {status?.meta && (
          <div className="mt-6 bg-cream-soft border border-line/40 rounded-sm p-4">
            <div className="eyebrow text-stone mb-2 flex items-center gap-1.5">
              <FileText size={12} strokeWidth={1.75} />
              Policy in force
            </div>
            <p className="text-sm text-charcoal leading-relaxed">
              {status.meta.wording} &nbsp;·&nbsp; {status.meta.insurer} &nbsp;·&nbsp; policy{' '}
              {status.meta.policyNumber}
            </p>
            <p className="text-xs text-ink-soft mt-1">
              {ukDate(status.meta.periodFrom)} to {ukDate(status.meta.periodTo)} &nbsp;·&nbsp; limit GBP{' '}
              {status.meta.aggregateLimit.toLocaleString('en-GB')} &nbsp;·&nbsp; Band{' '}
              {status.meta.bandsPurchased.join(', ')} only &nbsp;·&nbsp; excess GBP{' '}
              {status.meta.standardDeductible}
            </p>
          </div>
        )}

        {/* The form */}
        <div className="mt-8 space-y-3">
          <div>
            <label className="eyebrow text-[10px] text-stone mb-1.5 block">Treatment or product</label>
            <input
              className={inputClass}
              placeholder="e.g. Polynucleotides, Lemon Bottle fat dissolving, IV vitamin drip"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runCheck()
              }}
            />
          </div>
          <div>
            <label className="eyebrow text-[10px] text-stone mb-1.5 block">Details (optional)</label>
            <textarea
              className={`${inputClass} min-h-[88px] resize-y`}
              placeholder="Brand, where on the body, how it is given, who supplies it, the product licence or CE mark."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <div>
            <label className="eyebrow text-[10px] text-stone mb-1.5 block">
              Who performs or prescribes it (optional)
            </label>
            <input
              className={inputClass}
              placeholder="e.g. nurse prescriber, dentist, beauty therapist"
              value={prescriber}
              onChange={(e) => setPrescriber(e.target.value)}
            />
          </div>

          <button
            onClick={() => void runCheck()}
            disabled={checking}
            className="inline-flex items-center gap-2 bg-charcoal text-cream rounded-sm px-5 py-3 text-sm hover:bg-gold-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Checking the policy
              </>
            ) : (
              <>
                <ShieldCheck size={15} strokeWidth={1.75} />
                Check compliance
              </>
            )}
          </button>

          {status && !status.aiReady && (
            <p className="text-xs text-ink-soft">
              The assistant needs an API key set in the environment before it can answer.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Verdict */}
        {verdict && style && (
          <div className={`mt-8 border rounded-sm p-5 ${style.card}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`eyebrow text-[11px] px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${style.chip}`}>
                <style.Icon size={13} strokeWidth={1.9} />
                {style.label}
              </span>
              {verdict.mapsTo && verdict.mapsTo.toLowerCase() !== 'none' && (
                <span className="text-xs text-stone">maps to: {verdict.mapsTo}</span>
              )}
            </div>

            <p className="font-display italic text-lg text-charcoal leading-snug">{verdict.headline}</p>
            <p className="text-sm text-charcoal mt-2 leading-relaxed">{verdict.summary}</p>

            <PointList title="Conditions to meet" points={verdict.conditions} Icon={ListChecks} />
            <PointList title="Exclusions and traps" points={verdict.exclusions} Icon={ShieldAlert} />
            <PointList title="Standing requirements" points={verdict.requirements} Icon={BadgeCheck} />

            {verdict.referToBroker && status?.meta && (
              <div className="mt-4 flex items-start gap-2 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-sm p-3">
                <AlertTriangle size={15} strokeWidth={1.9} className="shrink-0 mt-0.5" />
                <span>Confirm with the broker before going ahead: {status.meta.broker}</span>
              </div>
            )}

            {verdict.citations.length > 0 && (
              <p className="text-xs text-stone mt-4">
                Based on: {verdict.citations.join(' · ')}
              </p>
            )}
          </div>
        )}

        <p className="text-[11px] text-ink-soft mt-4 leading-relaxed">
          This is a guide based on the policy wording, not legal or insurance advice. The wording
          governs. For anything material, confirm with the broker before offering a new treatment.
        </p>

        {/* Live audit of current treatments */}
        {status && status.audit.length > 0 && (
          <div className="mt-12">
            <div className="eyebrow text-stone mb-3 flex items-center gap-1.5">
              <ShieldAlert size={13} strokeWidth={1.75} />
              Current treatments worth a look
            </div>
            <div className="space-y-2">
              {status.audit.map((f) => {
                const s = STATUS_STYLES[f.status]
                return (
                  <div key={f.treatment} className="bg-cream-soft border border-line/40 rounded-sm p-4">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-medium text-charcoal">{f.treatment}</span>
                      <span className={`eyebrow text-[10px] px-2 py-0.5 rounded-full border ${s.chip}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft leading-snug">{f.note}</p>
                    <p className="text-[11px] text-stone mt-1">Based on: {f.endorsement}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
