'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Bot,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  LogOut,
  MessageCircle,
  Package,
  Pencil,
  Play,
  RefreshCw,
  Save,
  Search,
  Send,
  Star,
  ThumbsUp,
  TrendingUp,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { notifyDone, notifyError } from '@/lib/staff-toast'
import { CLINIC } from '@/lib/clinic'
import { blogPosts } from '@/lib/blog-posts'

/** source_slug → blog category, used as the eyebrow on the branded preview image. */
const BLOG_CATEGORY_BY_SLUG: Record<string, string> = Object.fromEntries(
  blogPosts.map((p) => [p.slug, p.category]),
)

/**
 * Pick a related clinic photo for a draft by matching its topic (slug + title)
 * against treatment keywords. Falls back to a clinic interior shot. Most
 * specific rules first.
 */
const RELATED_IMAGE_RULES: [RegExp, string][] = [
  [/profhilo/, '/images/profhilo.jpg'],
  [/micro.?needling|needling/, '/images/micro-needling.jpg'],
  [/filler|lip|cheek|tear.?trough|jaw/, '/images/dermal-filler.jpg'],
  [/aqualyx|fat.?dissolv/, '/images/aqualyx.jpg'],
  [/hyperhidrosis|sweat/, '/images/hyperhidrosis.jpg'],
  [/migraine/, '/images/migraines.jpg'],
  [/mole/, '/images/map-my-mole.jpg'],
  [/\bmen\b|male/, '/images/mens-aesthetics.jpg'],
  [/botox|anti.?wrinkle|wrinkle|platysma|neck|brow|frown|forehead|toxin/, '/images/anti-wrinkle.jpg'],
]

function relatedImage(draft: SocialDraft): string {
  const hay = `${draft.source_slug} ${draft.source_title}`.toLowerCase()
  for (const [re, img] of RELATED_IMAGE_RULES) if (re.test(hay)) return img
  return '/images/clinic-wide.jpg'
}

/** Clinic photos staff can pick from when changing a draft's image. */
const IMAGE_OPTIONS: { label: string; src: string }[] = [
  { label: 'Anti-wrinkle', src: '/images/anti-wrinkle.jpg' },
  { label: 'Dermal filler', src: '/images/dermal-filler.jpg' },
  { label: 'Profhilo', src: '/images/profhilo.jpg' },
  { label: 'Micro-needling', src: '/images/micro-needling.jpg' },
  { label: 'Aqualyx', src: '/images/aqualyx.jpg' },
  { label: 'Hyperhidrosis', src: '/images/hyperhidrosis.jpg' },
  { label: "Men's", src: '/images/mens-aesthetics.jpg' },
  { label: 'Mole check', src: '/images/map-my-mole.jpg' },
  { label: 'Clinic', src: '/images/clinic-wide.jpg' },
  { label: 'Clinic room', src: '/images/clinic-1.jpg' },
  { label: 'Before / after', src: '/images/before-after.jpg' },
]

/**
 * Branded preview image for a draft — the same dynamic OG endpoint the public
 * pages use (`/og?title=…&eyebrow=…&img=…`), so the preview shows a real,
 * on-brand image: a clinic photo composited with the post copy (title,
 * eyebrow, award strip). `image` is the chosen photo path.
 */
function previewImageSrc(draft: SocialDraft, image: string): string {
  const params = new URLSearchParams({
    title: draft.source_title || CLINIC.name,
    eyebrow: BLOG_CATEGORY_BY_SLUG[draft.source_slug] || `${CLINIC.name}, ${CLINIC.addressLocality}`,
    img: image,
  })
  return `/og?${params.toString()}`
}

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
    Icon: ImageIcon,
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
  image?: string | null
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
  approved_drafts: SocialDraft[]
  sentiment: Sentiment | null
  seo_report: SeoReport | null
  configured: boolean
  instagram_connected: boolean
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
  const [previewDraft, setPreviewDraft] = useState<SocialDraft | null>(null)
  const [imageByDraft, setImageByDraft] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editHashtags, setEditHashtags] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)

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

  async function patchDraft(draft: SocialDraft, newStatus: 'approved' | 'dismissed') {
    const image = imageByDraft[draft.id] ?? relatedImage(draft)
    await fetch(`/api/staff/assistant/agents/social-drafts/${draft.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        newStatus === 'approved' ? { status: 'approved', image } : { status: 'dismissed' },
      ),
    })
    setStatus((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        social_drafts: prev.social_drafts.filter((d) => d.id !== draft.id),
        approved_drafts:
          newStatus === 'approved'
            ? [{ ...draft, image, status: 'approved' }, ...prev.approved_drafts]
            : prev.approved_drafts,
      }
    })
    setPreviewDraft((prev) => (prev?.id === draft.id ? null : prev))
    notifyDone(newStatus === 'approved' ? 'Draft approved' : 'Draft dismissed')
  }

  async function publishDraft(draft: SocialDraft) {
    setPublishing(draft.id)
    try {
      const res = await fetch(`/api/staff/assistant/agents/social-drafts/${draft.id}/publish`, {
        method: 'POST',
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        notifyError(data.error || 'Could not publish to Instagram')
        return
      }
      setStatus((prev) =>
        prev
          ? { ...prev, approved_drafts: prev.approved_drafts.filter((d) => d.id !== draft.id) }
          : prev,
      )
      notifyDone('Posted to Instagram')
    } catch {
      notifyError('Could not publish to Instagram')
    } finally {
      setPublishing(null)
    }
  }

  function startEdit(draft: SocialDraft) {
    setEditingId(draft.id)
    setEditCaption(draft.caption)
    setEditHashtags(draft.hashtags ?? '')
  }

  async function saveEdit(id: string) {
    const caption = editCaption.trim()
    if (!caption) return
    const hashtags = editHashtags.trim()
    setSavingEdit(true)
    try {
      await fetch(`/api/staff/assistant/agents/social-drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, hashtags }),
      })
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              social_drafts: prev.social_drafts.map((d) =>
                d.id === id ? { ...d, caption, hashtags } : d,
              ),
            }
          : prev,
      )
      setEditingId(null)
      notifyDone('Draft updated')
    } finally {
      setSavingEdit(false)
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const drafts = status?.social_drafts ?? []
  const approved = status?.approved_drafts ?? []
  const igConnected = status?.instagram_connected ?? false
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
                    {editingId !== draft.id && (
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <button
                          onClick={() => startEdit(draft)}
                          className="inline-flex items-center gap-1 text-xs text-charcoal hover:text-gold-deep border border-line/60 hover:border-gold/40 rounded px-2 py-1 transition-colors"
                        >
                          <Pencil size={11} />
                          Edit
                        </button>
                        <button
                          onClick={() => setPreviewDraft(draft)}
                          className="inline-flex items-center gap-1 text-xs text-charcoal hover:text-gold-deep border border-line/60 hover:border-gold/40 rounded px-2 py-1 transition-colors"
                        >
                          <Eye size={11} />
                          Preview
                        </button>
                        <button
                          onClick={() => void patchDraft(draft, 'approved')}
                          className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 rounded px-2 py-1 transition-colors"
                        >
                          <CheckCircle2 size={11} />
                          Approve
                        </button>
                        <button
                          onClick={() => void patchDraft(draft, 'dismissed')}
                          className="text-stone hover:text-charcoal transition-colors p-1"
                          aria-label="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === draft.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        rows={4}
                        className="w-full bg-cream border border-line rounded-sm px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold leading-relaxed"
                        placeholder="Post caption"
                      />
                      <input
                        value={editHashtags}
                        onChange={(e) => setEditHashtags(e.target.value)}
                        className="w-full bg-cream border border-line rounded-sm px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-gold"
                        placeholder="#Hashtags"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal border border-line/60 hover:border-stone rounded px-2 py-1 transition-colors"
                        >
                          <X size={12} />
                          Cancel
                        </button>
                        <button
                          onClick={() => void saveEdit(draft.id)}
                          disabled={savingEdit || !editCaption.trim()}
                          className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 rounded px-2 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Save size={12} />
                          {savingEdit ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-charcoal leading-relaxed">{draft.caption}</p>
                      {draft.hashtags && (
                        <p className="text-xs text-stone mt-1.5">{draft.hashtags}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved — ready to publish to Instagram */}
        {approved.length > 0 && (
          <div className="mb-10">
            <div className="eyebrow text-stone mb-3">
              Approved &nbsp;·&nbsp; {approved.length} ready to publish
            </div>
            {!igConnected && (
              <p className="text-xs text-stone mb-3 border border-line/40 rounded-sm bg-cream-soft px-3 py-2 leading-relaxed">
                Instagram isn&rsquo;t connected yet — set <code className="text-gold-deep">META_IG_USER_ID</code> to enable publishing. Approved posts wait here until then.
              </p>
            )}
            <div className="space-y-3">
              {approved.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-cream-soft border border-line/40 rounded-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs text-stone truncate max-w-[200px]">
                      {draft.source_title}
                    </span>
                    <button
                      onClick={() => void publishDraft(draft)}
                      disabled={!igConnected || publishing === draft.id}
                      className="inline-flex items-center gap-1.5 text-xs text-cream bg-gold-deep hover:bg-gold rounded px-3 py-1.5 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send size={12} />
                      {publishing === draft.id ? 'Publishing…' : 'Publish to Instagram'}
                    </button>
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

      {previewDraft && (
        <div
          className="fixed inset-0 bg-charcoal/70 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setPreviewDraft(null)}
        >
          <div
            className="bg-cream w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-line/40 shrink-0">
              <div className="eyebrow text-gold">
                {previewDraft.platform === 'instagram' ? 'Instagram' : 'Facebook'} preview
              </div>
              <button
                onClick={() => setPreviewDraft(null)}
                className="text-stone hover:text-charcoal text-2xl leading-none"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto bg-stone-100 p-4">
              {(() => {
                const chosen = imageByDraft[previewDraft.id] ?? relatedImage(previewDraft)
                return previewDraft.platform === 'instagram' ? (
                  <InstagramPreview draft={previewDraft} image={chosen} />
                ) : (
                  <FacebookPreview draft={previewDraft} image={chosen} />
                )
              })()}

              {/* Image picker */}
              <div className="mt-4">
                <div className="eyebrow text-stone mb-2 flex items-center gap-1.5">
                  <ImageIcon size={12} strokeWidth={1.75} /> Change image
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {IMAGE_OPTIONS.map((opt) => {
                    const chosen = imageByDraft[previewDraft.id] ?? relatedImage(previewDraft)
                    const active = chosen === opt.src
                    return (
                      <button
                        key={opt.src}
                        onClick={() =>
                          setImageByDraft((prev) => ({ ...prev, [previewDraft.id]: opt.src }))
                        }
                        title={opt.label}
                        aria-label={opt.label}
                        className={`shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${
                          active ? 'border-gold' : 'border-transparent hover:border-gold/40'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- staff-area convention; static public path */}
                        <img src={opt.src} alt={opt.label} className="w-14 h-14 object-cover block" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <p className="text-[11px] text-stone text-center mt-3 leading-snug">
                Approximate preview — branded image generated from the post; captions and hashtags appear as shown.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line/40 shrink-0">
              <button
                onClick={() => void patchDraft(previewDraft, 'dismissed')}
                className="inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal border border-line/60 hover:border-stone rounded px-3 py-1.5 transition-colors"
              >
                <X size={12} />
                Dismiss
              </button>
              <button
                onClick={() => void patchDraft(previewDraft, 'approved')}
                className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 rounded px-3 py-1.5 transition-colors"
              >
                <CheckCircle2 size={12} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ClinicAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-charcoal text-cream flex items-center justify-center shrink-0 font-display italic text-sm">
      V
    </div>
  )
}

function PostImage({ draft, image }: { draft: SocialDraft; image: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- matches staff-area convention; same-origin dynamic /og route
    <img
      src={previewImageSrc(draft, image)}
      alt={draft.source_title}
      className="w-full aspect-[1200/630] object-cover border-y border-line/30 bg-cream-soft"
    />
  )
}

function InstagramPreview({ draft, image }: { draft: SocialDraft; image: string }) {
  return (
    <div className="bg-white max-w-sm mx-auto border border-line/40 rounded-sm overflow-hidden text-charcoal">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <ClinicAvatar />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">visageaestheticclinic</p>
          <p className="text-[11px] text-stone leading-tight">
            {CLINIC.addressLocality}, {CLINIC.addressRegion}
          </p>
        </div>
      </div>

      <PostImage draft={draft} image={image} />

      <div className="flex items-center gap-4 px-3 pt-2.5">
        <Heart size={20} strokeWidth={1.75} />
        <MessageCircle size={20} strokeWidth={1.75} />
        <Send size={20} strokeWidth={1.75} />
        <Bookmark size={20} strokeWidth={1.75} className="ml-auto" />
      </div>

      <div className="px-3 py-2 text-sm leading-snug">
        <span className="font-semibold mr-1.5">visageaestheticclinic</span>
        <span className="whitespace-pre-wrap">{draft.caption}</span>
        {draft.hashtags && (
          <p className="text-[#385185] mt-1.5 whitespace-pre-wrap">{draft.hashtags}</p>
        )}
      </div>
    </div>
  )
}

function FacebookPreview({ draft, image }: { draft: SocialDraft; image: string }) {
  return (
    <div className="bg-white max-w-sm mx-auto border border-line/40 rounded-sm overflow-hidden text-charcoal">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <ClinicAvatar />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{CLINIC.name}</p>
          <p className="text-[11px] text-stone leading-tight flex items-center gap-1">
            Just now · <Globe size={10} strokeWidth={2} />
          </p>
        </div>
      </div>

      <div className="px-3 pb-2.5 text-sm leading-snug">
        <span className="whitespace-pre-wrap">{draft.caption}</span>
        {draft.hashtags && (
          <p className="text-[#385185] mt-1.5 whitespace-pre-wrap">{draft.hashtags}</p>
        )}
      </div>

      <PostImage draft={draft} image={image} />

      <div className="flex items-center justify-around px-3 py-1.5 border-t border-line/30 text-stone">
        <span className="inline-flex items-center gap-1.5 text-xs py-1">
          <ThumbsUp size={15} strokeWidth={1.75} /> Like
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs py-1">
          <MessageCircle size={15} strokeWidth={1.75} /> Comment
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs py-1">
          <Send size={15} strokeWidth={1.75} /> Share
        </span>
      </div>
    </div>
  )
}
