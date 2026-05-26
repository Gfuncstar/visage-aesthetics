'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Eye,
  FlaskConical,
  ImagePlus,
  LogOut,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

const textareaClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold leading-relaxed'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Cta = 'book' | 'contact' | 'none'
type Audience = 'customers' | 'manual'

type Result =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'ok'; message: string }
  | { kind: 'error'; message: string }

function countRecipients(raw: string): { valid: number; invalid: number } {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
  const seen = new Set<string>()
  let valid = 0
  let invalid = 0
  for (const t of tokens) {
    const lower = t.toLowerCase()
    if (EMAIL_RE.test(lower)) {
      if (!seen.has(lower)) {
        seen.add(lower)
        valid++
      }
    } else {
      invalid++
    }
  }
  return { valid, invalid }
}

export default function BroadcastComposer() {
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [cta, setCta] = useState<Cta>('book')
  const [audience, setAudience] = useState<Audience>('customers')
  const [recipients, setRecipients] = useState('')
  const [testEmail, setTestEmail] = useState('')

  const [topic, setTopic] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [draftError, setDraftError] = useState<string | null>(null)
  const [imageQuery, setImageQuery] = useState<string | null>(null)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [customerCount, setCustomerCount] = useState<number | null>(null)

  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [result, setResult] = useState<Result>({ kind: 'idle' })

  useEffect(() => {
    fetch('/api/staff/broadcasts/recipients')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.count === 'number') setCustomerCount(d.count)
      })
      .catch(() => {})
  }, [])

  const manualCounts = useMemo(() => countRecipients(recipients), [recipients])

  const audienceCount =
    audience === 'customers' ? (customerCount ?? 0) : manualCounts.valid

  async function generateDraft() {
    if (!topic.trim()) {
      setDraftError('Type a topic first.')
      return
    }
    setDraftError(null)
    setDrafting(true)
    try {
      const res = await fetch('/api/staff/broadcasts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setDraftError(data.error || 'Could not draft. Try a different topic.')
        return
      }
      const draft = data.draft as {
        subject: string
        preheader: string
        headline: string
        body: string
        imageQuery: string
      }
      setSubject(draft.subject)
      setPreheader(draft.preheader)
      setHeadline(draft.headline)
      setBody(draft.body)
      setImageQuery(draft.imageQuery)
    } catch {
      setDraftError('Could not reach the drafting service.')
    } finally {
      setDrafting(false)
    }
  }

  function openImageSearch() {
    const query = (imageQuery || topic).trim()
    if (!query) return
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function uploadImage(file: File) {
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/staff/broadcasts/upload-image', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError(data.error || 'Could not upload image.')
        return
      }
      setImageUrl(data.url)
    } catch {
      setUploadError('Network error while uploading.')
    } finally {
      setUploading(false)
    }
  }

  async function fetchPreview() {
    setShowPreview(true)
    setPreviewHtml(null)
    try {
      const res = await fetch('/api/staff/broadcasts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          preheader,
          headline,
          imageUrl: imageUrl || '',
          cta,
        }),
      })
      const html = await res.text()
      setPreviewHtml(html)
    } catch {
      setPreviewHtml(
        '<p style="font-family:sans-serif;color:#A8895E;padding:20px;">Could not build preview.</p>',
      )
    }
  }

  async function sendTest() {
    if (!testEmail) {
      setResult({ kind: 'error', message: 'Add a test address first.' })
      return
    }
    setResult({ kind: 'busy' })
    try {
      const res = await fetch('/api/staff/broadcasts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'test',
          subject,
          preheader,
          headline,
          imageUrl: imageUrl || '',
          body,
          cta,
          testEmail,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult({ kind: 'error', message: data.error || 'Could not send test.' })
        return
      }
      setResult({ kind: 'ok', message: `Test sent to ${testEmail}.` })
    } catch {
      setResult({ kind: 'error', message: 'Network error while sending test.' })
    }
  }

  async function sendBroadcast() {
    if (audienceCount === 0) {
      setResult({ kind: 'error', message: 'No recipients selected.' })
      return
    }
    const label =
      audience === 'customers'
        ? `all ${audienceCount} customers`
        : `${audienceCount} recipient${audienceCount === 1 ? '' : 's'}`
    const ok = window.confirm(`Send to ${label}? This cannot be undone.`)
    if (!ok) return

    setResult({ kind: 'busy' })
    try {
      const res = await fetch('/api/staff/broadcasts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'send',
          subject,
          preheader,
          headline,
          imageUrl: imageUrl || '',
          body,
          cta,
          audience,
          recipients: audience === 'manual' ? recipients : '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult({ kind: 'error', message: data.error || 'Could not send broadcast.' })
        return
      }
      const failures = Array.isArray(data.failures) ? data.failures.length : 0
      const msg = failures
        ? `Sent ${data.sent}/${data.total}. ${failures} batch(es) failed — check server logs.`
        : `Sent to ${data.sent}/${data.total} recipients.`
      setResult({ kind: failures ? 'error' : 'ok', message: msg })
    } catch {
      setResult({ kind: 'error', message: 'Network error while sending.' })
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const canSend = subject.trim().length > 0 && (body.trim().length > 0 || headline.trim().length > 0)

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-16 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <Link
              href="/staff"
              className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4"
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              Staff
            </Link>
            <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Broadcasts</div>
            <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">
              Compose a broadcast.
            </h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Build a beautiful email and send it to your patient list. Always preview and send a test to yourself first.
            </p>
          </div>
          <button
            onClick={signOut}
            className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2"
            aria-label="Sign out"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          <div className="space-y-7">
            {/* 0. AI draft */}
            <div className="border border-gold/40 bg-gold/5 rounded-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} strokeWidth={1.75} className="text-gold-deep" />
                <span className="text-eyebrow text-gold-deep">Start with a topic</span>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed mb-3">
                Type what you want to say in a sentence. I&apos;ll write a first draft in your voice, you edit it.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !drafting && topic.trim()) {
                      e.preventDefault()
                      void generateDraft()
                    }
                  }}
                  className={inputClass}
                  placeholder="e.g. A spring offer on Profhilo for existing patients"
                  maxLength={600}
                />
                <button
                  type="button"
                  onClick={generateDraft}
                  disabled={drafting || !topic.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed sm:shrink-0"
                  style={{ minHeight: 48, padding: '0 24px' }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles size={14} strokeWidth={1.75} />
                    {drafting ? 'Writing…' : 'Write draft'}
                  </span>
                </button>
              </div>
              {draftError && (
                <p className="text-xs text-gold-deep mt-2">{draftError}</p>
              )}
              {imageQuery && !draftError && (
                <div className="mt-3 pt-3 border-t border-gold/20 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-ink-soft">
                    Suggested image: <span className="text-charcoal">&ldquo;{imageQuery}&rdquo;</span>
                  </p>
                  <button
                    type="button"
                    onClick={openImageSearch}
                    className="eyebrow text-gold-deep hover:text-charcoal transition-colors inline-flex items-center gap-1.5"
                  >
                    <Search size={12} strokeWidth={1.75} />
                    Open in Google Images
                  </button>
                </div>
              )}
            </div>

            {/* 1. Image */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="text-eyebrow text-ink-soft">
                  1 &nbsp;·&nbsp; Header image
                </label>
                {(imageQuery || topic.trim()) && !imageUrl && (
                  <button
                    type="button"
                    onClick={openImageSearch}
                    className="text-xs eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-1.5"
                  >
                    <Search size={12} strokeWidth={1.75} />
                    Find a photo on Google
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void uploadImage(file)
                  e.target.value = ''
                }}
              />
              {imageUrl ? (
                <div className="relative border border-line/40 rounded-sm overflow-hidden bg-cream-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Header"
                    className="block w-full max-h-72 object-cover"
                  />
                  <div className="flex items-center justify-between px-4 py-3 border-t border-line/40">
                    <span className="text-xs text-ink-soft truncate">{imageUrl}</span>
                    <button
                      onClick={() => setImageUrl(null)}
                      className="text-xs eyebrow text-stone hover:text-gold-deep flex items-center gap-1"
                    >
                      <X size={12} strokeWidth={1.75} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border border-dashed border-line bg-cream-soft hover:border-gold hover:bg-cream-deep transition-colors rounded-sm py-12 px-5 text-center disabled:opacity-50"
                >
                  <ImagePlus size={28} strokeWidth={1.25} className="mx-auto text-stone mb-3" />
                  <div className="text-sm text-charcoal font-medium">
                    {uploading ? 'Uploading…' : 'Click to upload an image'}
                  </div>
                  <div className="text-xs text-ink-soft mt-1">
                    JPG, PNG, WEBP or GIF · max 5 MB
                  </div>
                </button>
              )}
              {uploadError && (
                <p className="text-xs text-gold-deep mt-2">{uploadError}</p>
              )}
              <p className="text-xs text-ink-soft mt-2 leading-relaxed">
                Only use images you have permission to use (your own photos, or stock photos with the right licence).
              </p>
            </div>

            {/* 2. Headline */}
            <div>
              <label htmlFor="headline" className="text-eyebrow text-ink-soft mb-2 block">
                2 &nbsp;·&nbsp; Headline
              </label>
              <input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className={inputClass}
                placeholder="A short, beautiful sentence — e.g. A spring treat for our patients"
                maxLength={200}
              />
            </div>

            {/* 3. Body */}
            <div>
              <label htmlFor="body" className="text-eyebrow text-ink-soft mb-2 block">
                3 &nbsp;·&nbsp; Body
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className={textareaClass}
                placeholder={`Write what you'd say in a normal email.\n\nLeave a blank line between paragraphs.`}
                maxLength={20000}
              />
              <p className="text-xs text-ink-soft mt-2 leading-relaxed">
                Optional formatting: <code>**bold**</code>, <code>*italic*</code>,{' '}
                <code>[link text](url)</code>, <code>&gt; pullquote</code>,{' '}
                <code>---</code> for a divider line.
              </p>
            </div>

            {/* 4. Button */}
            <div>
              <label className="text-eyebrow text-ink-soft mb-2 block">
                4 &nbsp;·&nbsp; Button at the end
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <CtaOption
                  selected={cta === 'book'}
                  onClick={() => setCta('book')}
                  icon={<Calendar size={16} strokeWidth={1.75} />}
                  label="Book a consultation"
                  hint="vaclinic.co.uk/book"
                />
                <CtaOption
                  selected={cta === 'contact'}
                  onClick={() => setCta('contact')}
                  icon={<MessageCircle size={16} strokeWidth={1.75} />}
                  label="Contact me"
                  hint="vaclinic.co.uk/contact"
                />
                <CtaOption
                  selected={cta === 'none'}
                  onClick={() => setCta('none')}
                  icon={<X size={16} strokeWidth={1.75} />}
                  label="No button"
                  hint="Skip the button"
                />
              </div>
            </div>

            {/* 5. Subject */}
            <div>
              <label htmlFor="subject" className="text-eyebrow text-ink-soft mb-2 block">
                5 &nbsp;·&nbsp; Subject line
              </label>
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="What people see in their inbox"
                maxLength={200}
              />
              <input
                id="preheader"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                className={`${inputClass} mt-2`}
                placeholder="Inbox preview text (optional) — shown after the subject line"
                maxLength={200}
              />
            </div>

            {/* 6. Recipients */}
            <div>
              <label className="text-eyebrow text-ink-soft mb-2 block">
                6 &nbsp;·&nbsp; Who to send it to
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <CtaOption
                  selected={audience === 'customers'}
                  onClick={() => setAudience('customers')}
                  icon={<Users size={16} strokeWidth={1.75} />}
                  label={customerCount !== null ? `My customers (${customerCount})` : 'My customers'}
                  hint="Cliniko list, cleaned"
                />
                <CtaOption
                  selected={audience === 'manual'}
                  onClick={() => setAudience('manual')}
                  icon={<MessageCircle size={16} strokeWidth={1.75} />}
                  label="Paste in addresses"
                  hint="For one-offs or tests"
                />
              </div>
              {audience === 'manual' && (
                <>
                  <textarea
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    rows={4}
                    className={textareaClass}
                    placeholder={`jane@example.com\nmark@example.com`}
                  />
                  <div className="text-xs text-ink-soft mt-2">
                    {manualCounts.valid > 0 && (
                      <span className="text-charcoal font-medium">
                        {manualCounts.valid} valid recipient{manualCounts.valid === 1 ? '' : 's'}
                      </span>
                    )}
                    {manualCounts.invalid > 0 && (
                      <span className="text-gold-deep ml-3">
                        {manualCounts.invalid} could not be parsed
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-cream-soft border border-line/40 rounded-sm p-6">
              <div className="eyebrow text-gold mb-3">Step 1 &nbsp;·&nbsp; Preview</div>
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                See exactly what the email will look like.
              </p>
              <button
                type="button"
                onClick={fetchPreview}
                disabled={!body.trim() && !headline.trim()}
                className="btn btn-secondary btn-block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-3">
                  <Eye size={14} strokeWidth={1.75} />
                  Open preview
                </span>
                <span className="btn-arrow">→</span>
              </button>
            </div>

            <div className="bg-cream-soft border border-line/40 rounded-sm p-6">
              <div className="eyebrow text-gold mb-3">Step 2 &nbsp;·&nbsp; Send a test</div>
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                Email this exact draft to yourself first.
              </p>
              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className={`${inputClass} mb-3`}
                placeholder="you@example.com"
                type="email"
              />
              <button
                type="button"
                onClick={sendTest}
                disabled={!canSend || !testEmail || result.kind === 'busy'}
                className="btn btn-secondary btn-block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-3">
                  <FlaskConical size={14} strokeWidth={1.75} />
                  Send test
                </span>
                <span className="btn-arrow">→</span>
              </button>
            </div>

            <div className="bg-charcoal text-cream rounded-sm p-6">
              <div className="eyebrow text-gold-soft mb-3">Step 3 &nbsp;·&nbsp; Send broadcast</div>
              <p className="text-sm text-cream/80 leading-relaxed mb-4">
                Each recipient gets a personal email. They never see anyone else&apos;s address.
              </p>
              <button
                type="button"
                onClick={sendBroadcast}
                disabled={!canSend || audienceCount === 0 || result.kind === 'busy'}
                className="btn btn-primary btn-block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-3">
                  <Send size={14} strokeWidth={1.75} />
                  {result.kind === 'busy'
                    ? 'Sending…'
                    : audienceCount > 0
                      ? `Send to ${audienceCount}`
                      : 'Send broadcast'}
                </span>
                <span className="btn-arrow">→</span>
              </button>
            </div>

            {result.kind === 'ok' && (
              <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 flex items-start gap-3">
                <Check size={16} strokeWidth={1.75} className="text-gold-deep mt-0.5 shrink-0" />
                <span>{result.message}</span>
              </div>
            )}
            {result.kind === 'error' && (
              <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 flex items-start gap-3">
                <AlertCircle size={16} strokeWidth={1.75} className="text-gold-deep mt-0.5 shrink-0" />
                <span>{result.message}</span>
              </div>
            )}
          </aside>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 bg-charcoal/70 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-cream w-full max-w-2xl h-[90vh] overflow-hidden flex flex-col rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-line/40 shrink-0">
              <div className="eyebrow text-gold">Preview</div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-stone hover:text-charcoal text-2xl leading-none"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-cream-soft">
              {previewHtml === null ? (
                <div className="p-10 text-center text-ink-soft text-sm">Building preview…</div>
              ) : (
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml}
                  className="block w-full h-full border-0 bg-cream"
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function CtaOption({
  selected,
  onClick,
  icon,
  label,
  hint,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border rounded-sm px-4 py-3 transition-colors ${
        selected
          ? 'border-gold bg-gold/10 text-charcoal'
          : 'border-line/40 bg-cream-soft hover:border-gold/60 text-charcoal'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className={selected ? 'text-gold-deep' : 'text-stone'}>{icon}</span>
        {label}
      </div>
      <div className="text-xs text-ink-soft mt-1 ml-6">{hint}</div>
    </button>
  )
}
