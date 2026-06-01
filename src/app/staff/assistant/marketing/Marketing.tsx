'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, LogOut, Mail, Megaphone, Send, Share2 } from 'lucide-react'
import MicButton, { appendText } from '@/components/ui/MicButton'

type Activity = { id: string; channel: string; title: string | null; detail: string | null; url: string | null; count: number | null; status: string; created_at: string }
type Blog = { slug: string; title: string; category: string; datePublished: string }
type Data = {
  configured: boolean
  metaConnected: boolean
  stats: { blogs: number; emails: number; social: number; ads: number }
  blogs: Blog[]
  emails: Activity[]
  social: Activity[]
  ads: Activity[]
}

function ukDate(d: string): string {
  const x = new Date(d.length === 10 ? `${d}T12:00:00Z` : d)
  return Number.isNaN(x.getTime()) ? d : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(x)
}

export default function Marketing() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/staff/assistant/marketing')
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
            <div className="eyebrow text-gold mb-2">Marketing &nbsp;·&nbsp; Overview</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Getting the clinic seen.</h1>
            <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">What has gone out, in one place: blogs, emails, social and advertising.</p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : !data?.configured ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">The clinic database is not connected yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <Stat n={s!.blogs} label="Blog posts" />
              <Stat n={s!.emails} label="Emails sent" />
              <Stat n={s!.social} label="Social posts" />
              <Stat n={s!.ads} label="Adverts" />
            </div>

            <Composer metaConnected={data.metaConnected} onPosted={load} />

            <Section title="Blog posts published" icon={FileText}>
              {data.blogs.length === 0 ? <Empty>No posts yet.</Empty> : (
                <div className="space-y-2">
                  {data.blogs.map((b) => (
                    <a key={b.slug} href={`/blog/${b.slug}`} target="_blank" rel="noopener noreferrer" className="block border border-line/40 bg-cream-soft rounded-sm px-4 py-3 hover:border-gold/60 transition-colors">
                      <div className="text-sm text-charcoal">{b.title}</div>
                      <div className="text-xs text-stone mt-0.5">{b.category} &nbsp;·&nbsp; {ukDate(b.datePublished)}</div>
                    </a>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Emails sent" icon={Mail} href="/staff/broadcasts" cta="Compose">
              {data.emails.length === 0 ? <Empty>No broadcasts sent yet.</Empty> : (
                <div className="space-y-2">
                  {data.emails.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
                      <div className="min-w-0"><div className="text-sm text-charcoal truncate">{e.title}</div><div className="text-xs text-stone">{ukDate(e.created_at)}</div></div>
                      {e.count != null && <span className="text-xs text-stone shrink-0">{e.count} sent</span>}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Social posts" icon={Share2}>
              {data.social.length === 0 ? <Empty>Nothing posted yet.</Empty> : (
                <div className="space-y-2">
                  {data.social.map((p) => (
                    <div key={p.id} className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
                      <div className="text-sm text-charcoal">{p.detail || p.title}</div>
                      <div className="text-xs text-stone mt-0.5 capitalize">{p.status === 'draft' ? 'Draft (Meta not connected)' : p.status} &nbsp;·&nbsp; {ukDate(p.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Advertising" icon={Megaphone}>
              <AdLogger onLogged={load} />
              {data.ads.length > 0 && (
                <div className="space-y-2 mt-3">
                  {data.ads.map((a) => (
                    <div key={a.id} className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
                      <div className="text-sm text-charcoal">{a.title}</div>
                      {a.detail && <div className="text-xs text-ink-soft mt-0.5">{a.detail}</div>}
                      <div className="text-xs text-stone mt-0.5">{ukDate(a.created_at)}</div>
                    </div>
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

function Composer({ metaConnected, onPosted }: { metaConnected: boolean; onPosted: () => void }) {
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function post() {
    if (!message.trim()) return
    setBusy(true); setError(null); setNote(null)
    try {
      const res = await fetch('/api/staff/assistant/marketing', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'social', message, link }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not post.'); return }
      setNote(d.posted ? 'Posted to Meta.' : 'Saved as a draft. Connect Meta to publish.')
      setMessage(''); setLink(''); onPosted()
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  return (
    <div className="border border-gold/40 bg-gold/5 rounded-sm p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-eyebrow text-gold-deep">Post to Meta</span>
        <span className={`text-[10px] tracking-[0.16em] uppercase rounded-full px-2 py-0.5 border ${metaConnected ? 'bg-sage/10 text-sage border-sage/40' : 'bg-gold/15 text-gold-deep border-gold/40'}`}>
          {metaConnected ? 'Connected' : 'Not connected'}
        </span>
      </div>
      <div className="relative">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full bg-cream border border-line rounded-sm px-4 py-3 pr-10 text-base text-charcoal focus:outline-none focus:border-gold leading-relaxed" placeholder="Write a Facebook / Instagram post. Keep it warm and clinical." />
        <MicButton onText={(t) => setMessage((v) => appendText(v, t))} className="absolute right-3 top-3" />
      </div>
      <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full bg-cream border border-line rounded-sm px-4 py-2.5 text-sm mt-2" placeholder="Optional link (a treatment page or blog post)" />
      {error && <p className="text-sm text-clay mt-2">{error}</p>}
      {note && <p className="text-sm text-sage mt-2">{note}</p>}
      <button onClick={post} disabled={busy || !message.trim()} className="btn btn-primary mt-3 disabled:opacity-50" style={{ minHeight: 40 }}>
        <span className="inline-flex items-center gap-2"><Send size={15} strokeWidth={1.75} /> {busy ? 'Working…' : metaConnected ? 'Post to Meta' : 'Save draft'}</span>
      </button>
    </div>
  )
}

function AdLogger({ onLogged }: { onLogged: () => void }) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [busy, setBusy] = useState(false)

  async function log() {
    if (!title.trim()) return
    setBusy(true)
    const res = await fetch('/api/staff/assistant/marketing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'ad', title, detail }),
    })
    if (res.ok) { setTitle(''); setDetail(''); onLogged() }
    setBusy(false)
  }

  return (
    <div className="border border-line/50 bg-cream-soft rounded-sm p-4 space-y-2">
      <div className="relative">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 pr-10 text-sm" placeholder="Advert name, e.g. Facebook lead ad, May" />
        <MicButton onText={(t) => setTitle((v) => appendText(v, t))} className="absolute right-2.5 top-1/2 -translate-y-1/2" />
      </div>
      <div className="relative">
        <input value={detail} onChange={(e) => setDetail(e.target.value)} className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 pr-10 text-sm" placeholder="Spend, audience, notes (optional)" />
        <MicButton onText={(t) => setDetail((v) => appendText(v, t))} className="absolute right-2.5 top-1/2 -translate-y-1/2" />
      </div>
      <button onClick={log} disabled={busy || !title.trim()} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 36 }}>{busy ? 'Logging…' : 'Log advert'}</button>
    </div>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="bg-cream-soft border border-line/40 rounded-sm px-3 py-3 text-center">
      <div className="font-display italic text-3xl leading-none text-charcoal">{n}</div>
      <div className="text-eyebrow text-ink-soft mt-1.5">{label}</div>
    </div>
  )
}

function Section({ title, icon: Icon, href, cta, children }: { title: string; icon: typeof Mail; href?: string; cta?: string; children: React.ReactNode }) {
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

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-3">{children}</p>
}
