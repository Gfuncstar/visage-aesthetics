'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, FileText } from 'lucide-react'

export type SendableForm = { id: string; name: string }

// One card per consent form, for sending a form OUTSIDE the booking system —
// e.g. when a client did not complete it before their appointment. Each card
// gives a "Copy link" to paste into a message/email and an "Open" to preview
// the form. The link is the same for everyone (generic per form); submissions
// land under "Completed forms" below, matched by the name the client types.
export default function FormSendCards({ forms }: { forms: SendableForm[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function linkFor(id: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/consent/form/${id}`
  }

  async function copy(id: string) {
    try {
      await navigator.clipboard.writeText(linkFor(id))
      setCopiedId(id)
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000)
    } catch {
      /* clipboard unavailable — the Open button still works */
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {forms.map((f) => (
        <div key={f.id} className="bg-cream-soft border border-line/40 rounded-sm p-4 sm:p-5 flex flex-col">
          <div className="inline-flex w-10 h-10 rounded-full bg-charcoal text-cream items-center justify-center mb-3">
            <FileText size={16} strokeWidth={1.75} />
          </div>
          <h3 className="font-display italic text-lg text-charcoal leading-tight">{f.name}</h3>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => copy(f.id)}
              className="inline-flex items-center gap-1.5 text-xs text-charcoal border border-line/50 hover:border-gold rounded-sm px-3 py-2 transition-colors min-h-[40px]"
            >
              {copiedId === f.id ? (
                <>
                  <Check size={14} strokeWidth={2} className="text-sage" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={1.75} /> Copy link
                </>
              )}
            </button>
            <a
              href={`/consent/form/${f.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-gold-deep rounded-sm px-3 py-2 transition-colors min-h-[40px]"
            >
              <ExternalLink size={14} strokeWidth={1.75} /> Open
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
