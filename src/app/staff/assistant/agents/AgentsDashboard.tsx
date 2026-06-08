'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Image,
  LogOut,
  Package,
  Play,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

type AgentId =
  | 'stock-expiry'
  | 'financial-summary'
  | 'clinical-audit'
  | 'social-content'
  | 'seasonal-campaign'
  | 'review-sentiment'
  | 'faq-updater'
  | 'seo-monitor'

type AgentDef = {
  id: AgentId
  name: string
  schedule: string
  description: string
  hint: string
  Icon: LucideIcon
  output: 'email' | 'dashboard' | 'both'
}

const AGENTS: AgentDef[] = [
  {
    id: 'stock-expiry',
    name: 'Stock expiry',
    schedule: 'Daily 08:00',
    description: 'Flags batches expiring within 30 days.',
    hint: 'Flags products expiring within 30 days',
    Icon: Package,
    output: 'email',
  },
  {
    id: 'financial-summary',
    name: 'Financial summary',
    schedule: 'Mondays 07:00',
    description: 'Week and month P&L summary.',
    hint: 'Generates a monthly revenue and margin snapshot',
    Icon: TrendingUp,
    output: 'email',
  },
  {
    id: 'clinical-audit',
    name: 'Clinical audit',
    schedule: '1st of month',
    description: 'NMC compliance report for the previous month.',
    hint: 'Checks treatments against protocol, flags gaps',
    Icon: FileText,
    output: 'email',
  },
  {
    id: 'social-content',
    name: 'Social content',
    schedule: 'Tuesdays 09:00',
    description: 'Instagram and Facebook captions from recent blog posts.',
    hint: 'Drafts social posts from treatments and season',
    Icon: Image,
    output: 'dashboard',
  },
  {
    id: 'seasonal-campaign',
    name: 'Seasonal campaigns',
    schedule: 'Daily check',
    description: 'Drafts a campaign email 6 weeks before key dates.',
    hint: 'Suggests promotions timed to next seasonal event',
    Icon: Calendar,
    output: 'dashboard',
  },
  {
    id: 'review-sentiment',
    name: 'Review sentiment',
    schedule: 'Mondays 08:15',
    description: 'Weekly analysis of Google review themes.',
    hint: 'Summarises tone of recent Google reviews',
    Icon: Star,
    output: 'both',
  },
  {
    id: 'faq-updater',
    name: 'FAQ updater',
    schedule: '1st of month',
    description: 'Clusters contact enquiries into FAQ gap suggestions.',
    hint: 'Refreshes website FAQ from recent client questions',
    Icon: HelpCircle,
    output: 'dashboard',
  },
  {
    id: 'seo-monitor',
    name: 'SEO competitor monitor',
    schedule: 'Thursdays 07:00',
    description: 'Tracks Essex competitor rankings for 12 keywords. Finds gaps, competitor threats, and award citation opportunities.',
    hint: 'Checks clinic rankings for key local search terms',
    Icon: Search,
    output: 'both',
  },
]

type SocialDraft = {
  id: string
  platform: 'instagram' | 'facebook'
  caption: string
  hashtags: string
  source_slug: string
  source_title: string
  status: string
  created_at: string
}

type Sentiment = {
  analyzed_at: string
  total_reviews: number
  themes_positive: string
  themes_concern: string
  summary: string
  action_needed: boolean
}

type SeoReport = {
  week_of: string
  summary: string
  action_items: string
  keyword_count: number
  competitor_alerts: string
  award_opportunities: string
}

type StatusData = {
  social_drafts: SocialDraft[]
  sentiment: Sentiment | null
  seo_report: SeoReport | null
  configured: boolean
}

type RunResult = { ok: boolean; message: string }

function resultMessage(id: AgentId, data: Record<string, unknown>, ok: boolean): string {
  if (!ok) return 'Failed — check server logs'
  if (data.skipped) return `Skipped: ${String(data.reason ?? 'no data yet')}`
  if (data.triggered === false) return 'No campaign trigger today'
  if (id === 'stock-expiry') {
    const n = Number(data.expiring ?? 0)
    return n === 0 ? 'No expiring stock' : `${n} item${n > 1 ? 's' : ''} flagged — email sent`
  }
  if (id === 'financial-summary') return 'Summary emailed to Bernadette'
  if (id === 'clinical-audit') return 'Audit report emailed to Bernadette'
  if (id === 'social-content') {
    const n = Number(data.drafts_created ?? 0)
    return n > 0 ? `${n} draft${n > 1 ? 's' : ''} created` : 'No new posts to draft from'
  }
  if (id === 'seasonal-campaign') return `Campaign draft created: ${String(data.campaign ?? '')}`
  if (id === 'review-sentiment') return 'Analysis complete'
  if (id === 'faq-updater') return `${Number(data.suggestions ?? 0)} suggestions saved`
  if (id === 'seo-monitor') {
    const appearing = Number(data.appearing ?? 0)
    const total = Number(data.keywords_checked ?? 0)
    return `${appearing}/${total} keywords covered — report emailed`
  }
  return 'Done'
}

export default function AgentsDashboard() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<Partial<Record<AgentId, boolean>>>({})
  const [results, setResults] = useState<Partial<Record<AgentId, RunResult>>>({})

  const loadStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/staff/assistant/agents/status')
      if (res.ok) setStatus(await res.json() as StatusData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadStatus() }, [loadStatus])

  async function runAgent(id: AgentId) {
    setRunning((p) => ({ ...p, [id]: true }))
    setResults((p) => { const n = { ...p }; delete n[id]; return n })
    try {
      const res = await fetch(`/api/staff/assistant/agents/${id}`, { method: 'POST' })
      const data = await res.json() as Record<string, unknown>
      setResults((p) => ({ ...p, [id]: { ok: res.ok, message: resultMessage(id, data, res.ok) } }))
      void loadStatus()
    } catch {
      setResults((p) => ({ ...p, [id]: { ok: false, message: 'Request failed' } }))
    } finally {
      setRunning((p) => ({ ...p, [id]: false }))
    }
  }

  async function patchDraft(id: string, newStatus: 'approved' | 'dismissed') {
    await fetch(`/api/staff/assistant/agents/social-drafts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setStatus((prev) =>
      prev
        ? { ...prev, social_drafts: prev.social_drafts.filter((d) => d.id !== id) }
        : prev,
    )
    notifyDone(newStatus === 'approved' ? 'Draft approved' : 'Draft dismissed')
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const drafts = status?.social_drafts ?? []
  const sentiment = status?.sentiment ?? null
  const seoReport = status?.seo_report ?? null

  let positiveThemes: string[] = []
  let concernThemes: string[] = []
  if (sentiment) {
    try { positiveThemes = JSON.parse(sentiment.themes_positive) as string[] } catch { /* */ }
    try { concernThemes = JSON.parse(sentiment.themes_concern) as string[] } catch { /* */ }
  }

  let seoActions: { priority: number; action: string; why: string }[] = []
  let seoAlerts: string[] = []
  let seoAwardOps: string[] = []
  if (seoReport) {
    try { seoActions = (JSON.parse(seoReport.action_items) as typeof seoActions).sort((a, b) => a.priority - b.priority) } catch { /* */ }
    try { seoAlerts = JSON.parse(seoReport.competitor_alerts) as string[] } catch { /* */ }
    try { seoAwardOps = JSON.parse(seoReport.award_opportunities) as string[] } catch { /* */ }
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Agents</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
              Running in the background.
            </h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Seven agents keeping the clinic moving — stock, finance, compliance, social, campaigns, reviews, and FAQs.
              Run any manually or let the schedule handle it.
            </p>
          </div>
          <button
            onClick={signOut}
            className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {/* Social drafts */}
        {drafts.length > 0 && (
          <div className="mb-10">
            <div className="eyebrow text-stone mb-3">
              Social drafts &nbsp;·&nbsp; {drafts.length} awaiting review
            </div>
            <div className="space-y-3">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-cream-soft border border-line/40 rounded-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`eyebrow text-[10px] px-2 py-0.5 rounded-full border ${
                          draft.platform === 'instagram'
                            ? 'text-gold-deep bg-gold/10 border-gold/30'
                            : 'text-blue-700 bg-blue-50 border-blue-200'
                        }`}
                      >
                        {draft.platform}
                      </span>
                      <span className="text-xs text-stone truncate max-w-[200px]">
                        {draft.source_title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => void patchDraft(draft.id, 'approved')}
                        className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 rounded px-2 py-1 transition-colors"
                      >
                        <CheckCircle2 size={11} />
                        Approve
                      </button>
                      <button
                        onClick={() => void patchDraft(draft.id, 'dismissed')}
                        className="text-stone hover:text-charcoal transition-colors p-1"
                        aria-label="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal leading-relaxed">{draft.caption}</p>
                  {draft.hashtags && (
                    <p className="text-xs text-stone mt-1.5">{draft.hashtags}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review sentiment */}
        {sentiment && (
          <div className="mb-10 bg-cream-soft border border-line/40 rounded-sm p-4">
            <div className="eyebrow text-stone mb-2">
              Latest review sentiment &nbsp;·&nbsp; {sentiment.total_reviews} reviews
            </div>
            <p className="text-sm text-charcoal leading-relaxed mb-3">{sentiment.summary}</p>
            {(positiveThemes.length > 0 || concernThemes.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {positiveThemes.map((t) => (
                  <span
                    key={t}
                    className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
                {concernThemes.map((t) => (
                  <span
                    key={t}
                    className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5"
                  >
                    ⚠ {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO report */}
        {seoReport && (
          <div className="mb-10">
            <div className="eyebrow text-stone mb-3">
              SEO monitor &nbsp;·&nbsp; w/c {seoReport.week_of} &nbsp;·&nbsp; {seoReport.keyword_count} keywords
            </div>

            {seoReport.summary && (
              <div className="bg-cream-soft border border-line/40 rounded-sm p-4 mb-3">
                <p className="text-sm text-charcoal leading-relaxed">{seoReport.summary}</p>
              </div>
            )}

            {seoAlerts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 mb-3">
                <div className="eyebrow text-[10px] text-amber-700 mb-2">Competitor alerts</div>
                {seoAlerts.map((a, i) => (
                  <p key={i} className="text-xs text-amber-900 mb-1">• {a}</p>
                ))}
              </div>
            )}

            {seoActions.length > 0 && (
              <div className="space-y-2 mb-3">
                <div className="eyebrow text-[10px] text-stone mb-1">This week&apos;s actions</div>
                {seoActions.map((item, i) => (
                  <div
                    key={i}
                    className={`border-l-2 pl-3 py-1 ${item.priority === 1 ? 'border-gold' : 'border-line'}`}
                  >
                    <p className="text-sm text-charcoal font-medium leading-snug">{item.action}</p>
                    <p className="text-xs text-stone mt-0.5">{item.why}</p>
                  </div>
                ))}
              </div>
            )}

            {seoAwardOps.length > 0 && (
              <div className="space-y-1">
                <div className="eyebrow text-[10px] text-stone mb-1">Award citation opportunities</div>
                {seoAwardOps.map((a, i) => (
                  <p key={i} className="text-xs text-gold-deep">★ {a}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agent list */}
        <div className="eyebrow text-stone mb-3">All agents</div>

        {loading && !status && (
          <p className="text-sm text-stone">Loading…</p>
        )}

        {status && !status.configured && (
          <p className="text-sm text-stone">
            Clinic database not configured — agents that store data won't run.
          </p>
        )}

        <div className="space-y-2">
          {AGENTS.map(({ id, name, schedule, description, hint, Icon, output }) => {
            const isRunning = running[id]
            const result = results[id]
            return (
              <div
                key={id}
                className="bg-cream-soft border border-line/40 rounded-sm p-4 flex items-center gap-4"
              >
                <div className="inline-flex w-9 h-9 rounded-full bg-charcoal text-cream items-center justify-center shrink-0">
                  <Icon size={15} strokeWidth={1.75} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap">
                    <span className="text-sm font-medium text-charcoal">{name}</span>
                    <span className="text-[11px] text-stone flex items-center gap-1">
                      <Clock size={10} />
                      {schedule}
                    </span>
                    <span className="text-[11px] text-stone">
                      ·&nbsp;
                      {output === 'email' && 'email'}
                      {output === 'dashboard' && 'dashboard'}
                      {output === 'both' && 'email + dashboard'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5 leading-snug">{description}</p>
                  {result && (
                    <p
                      className={`text-xs mt-1 ${
                        result.ok ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {result.message}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => void runAgent(id)}
                    disabled={Boolean(isRunning)}
                    className="inline-flex items-center gap-1.5 text-xs text-charcoal hover:text-gold-deep border border-line/60 hover:border-gold/40 rounded px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw size={11} className="animate-spin" />
                        Running
                      </>
                    ) : (
                      <>
                        <Play size={11} />
                        Run now
                      </>
                    )}
                  </button>
                  <p className="text-xs text-ink-soft mt-1.5 leading-snug text-right">{hint}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
