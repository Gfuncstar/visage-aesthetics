'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, LogOut, Mail, RotateCcw, Send, X } from 'lucide-react'
import MicButton, { appendText } from '@/components/ui/MicButton'

type Item = {
  markKey: string
  clientName: string
  firstName: string
  treatmentGroup: string
  treatmentLabel: string
  lastService: string
  lastDate: string
  dueDate: string
  monthsSince: number
  overdueDays: number
  phone: string | null
  email: string | null
  draft: string
}

function waLink(phone: string | null, message: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (digits.length < 7) return null
  const intl = digits.startsWith('0') ? `44${digits.slice(1)}` : digits
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`
}

function dueLabel(overdueDays: number): { text: string; urgent: boolean } {
  if (overdueDays <= 0) return { text: `Due in ${Math.abs(overdueDays)} day${Math.abs(overdueDays) === 1 ? '' : 's'}`, urgent: false }
  if (overdueDays <= 30) return { text: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`, urgent: true }
  const months = Math.round(overdueDays / 30)
  return { text: `${months} month${months === 1 ? '' : 's'} overdue`, urgent: true }
}

export default function Rebook() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/staff/assistant/rebook')
    if (res.ok) {
      const d = await res.json()
      setItems(d.items ?? [])
      setConfigured(d.configured !== false)
    }
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function mark(markKey: string, action: 'contacted' | 'dismissed') {
    setItems((prev) => prev.filter((i) => i.markKey !== markKey))
    await fetch('/api/staff/assistant/rebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markKey, action }),
    })
  }

  function removeLocal(markKey: string) {
    setItems((prev) => prev.filter((i) => i.markKey !== markKey))
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Reception &nbsp;·&nbsp; Rebooking</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Who&apos;s due back.</h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Clients about due for their next visit, most overdue first, each with a message ready to send.
              Anyone already booked in is left off the list.
            </p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="eyebrow text-gold mb-3">Due back ({items.length})</div>

        {!configured ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
            The clinic database is not connected, so there is nothing to show yet.
          </p>
        ) : loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
            Nobody&apos;s due right now. As clients pass their recall window they&apos;ll appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((i) => (
              <RebookCard key={i.markKey} i={i} onMark={mark} onSent={removeLocal} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function RebookCard({
  i,
  onMark,
  onSent,
}: {
  i: Item
  onMark: (k: string, a: 'contacted' | 'dismissed') => void
  onSent: (k: string) => void
}) {
  const [msg, setMsg] = useState(i.draft)
  const [copied, setCopied] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [emailErr, setEmailErr] = useState<string | null>(null)
  const wa = waLink(i.phone, msg)
  const due = dueLabel(i.overdueDays)

  async function copyMsg() {
    try {
      await navigator.clipboard.writeText(msg)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard blocked */
    }
  }

  async function sendEmail() {
    setEmailing(true)
    setEmailErr(null)
    try {
      const res = await fetch('/api/staff/assistant/rebook/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markKey: i.markKey }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setEmailErr(d.error || 'Could not send.')
        setEmailing(false)
        return
      }
      onSent(i.markKey)
    } catch {
      setEmailErr('Network error.')
      setEmailing(false)
    }
  }

  return (
    <div className="border border-line/40 bg-cream-soft rounded-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-medium text-charcoal">{i.clientName}<span className="text-ink-soft font-normal"> · {i.treatmentLabel}</span></div>
          <div className="text-sm text-stone mt-0.5">Last in {i.monthsSince} month{i.monthsSince === 1 ? '' : 's'} ago ({i.lastService})</div>
        </div>
        <button onClick={() => onMark(i.markKey, 'dismissed')} className="text-stone hover:text-clay shrink-0" aria-label="Not now"><X size={16} strokeWidth={1.75} /></button>
      </div>

      <div className="mt-3">
        <span className={`inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 ${due.urgent ? 'bg-clay/10 text-clay border border-clay/30' : 'bg-cream border border-line/40 text-stone'}`}>
          <RotateCcw size={12} strokeWidth={1.75} /> {due.text}
        </span>
      </div>

      <label className="text-eyebrow text-ink-soft mt-3 mb-1.5 block">Message to send (edit if you like)</label>
      <div className="relative">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={3}
          className="w-full bg-cream border border-line/40 rounded-sm px-3 py-2.5 pr-10 text-sm text-charcoal focus:outline-none focus:border-gold leading-relaxed"
        />
        <MicButton onText={(t) => setMsg((v) => appendText(v, t))} className="absolute right-2.5 top-2.5" />
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ minHeight: 38 }}>
            <span className="inline-flex items-center gap-2"><Send size={14} strokeWidth={1.75} /> Send on WhatsApp</span>
          </a>
        )}
        {i.email && (
          <button onClick={sendEmail} disabled={emailing} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>
            <span className="inline-flex items-center gap-2"><Mail size={14} strokeWidth={1.75} /> {emailing ? 'Sending…' : 'Send email'}</span>
          </button>
        )}
        <button onClick={copyMsg} className="btn btn-secondary" style={{ minHeight: 38 }}>
          <span className="inline-flex items-center gap-2"><Copy size={14} strokeWidth={1.75} /> {copied ? 'Copied' : 'Copy message'}</span>
        </button>
        <button onClick={() => onMark(i.markKey, 'contacted')} className="btn ml-auto" style={{ minHeight: 38 }}>
          <span className="inline-flex items-center gap-2"><Check size={14} strokeWidth={2} /> Contacted</span>
        </button>
      </div>
      <div className="mt-2 min-h-[16px]">
        {i.email ? (
          <span className="text-xs text-stone">Branded email goes to {i.email}</span>
        ) : (
          <span className="text-xs text-stone">No email on file, use WhatsApp or copy</span>
        )}
        {emailErr && <span className="text-xs text-clay ml-2">{emailErr}</span>}
      </div>
    </div>
  )
}
