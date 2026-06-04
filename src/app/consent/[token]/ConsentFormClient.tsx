'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import type { ConsentField, ConsentForm } from '@/lib/consent/forms'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

type AnswerMap = Record<string, string | string[]>

function initialAnswers(form: ConsentForm, clientName: string): AnswerMap {
  const out: AnswerMap = {}
  const [first, ...rest] = clientName.trim().split(/\s+/)
  for (const f of form.fields) {
    if (f.type === 'heading' || f.type === 'info') continue
    if (f.type === 'multi-choice') out[f.label] = []
    else if (f.label === 'First Name') out[f.label] = first || ''
    else if (f.label === 'Last Name') out[f.label] = rest.join(' ')
    else out[f.label] = ''
  }
  return out
}

export default function ConsentFormClient({
  form,
  submitUrl,
  clientName = '',
  serviceName,
}: {
  form: ConsentForm
  /** Where the completed form is POSTed (per-booking or standalone). */
  submitUrl: string
  clientName?: string
  /** The booked treatment, when this form is tied to an appointment. */
  serviceName?: string | null
}) {
  const [answers, setAnswers] = useState<AnswerMap>(() => initialAnswers(form, clientName))
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function setValue(label: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [label]: value }))
  }

  function toggleMulti(label: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[label]) ? (prev[label] as string[]) : []
      const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option]
      return { ...prev, [label]: next }
    })
  }

  async function submit() {
    setError(null)
    if (!agreed) {
      setError('Please tick the box at the bottom to confirm before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, agreed: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not save your form. Please try again.')
        return
      }
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <section className="bg-cream text-charcoal min-h-screen">
        <div className="max-w-xl mx-auto px-5 md:px-8 py-24 text-center">
          <div className="inline-flex w-12 h-12 rounded-full bg-gold text-charcoal items-center justify-center mb-5">
            <Check size={20} strokeWidth={1.75} />
          </div>
          <h1 className="font-display italic text-charcoal text-3xl md:text-4xl">Thank you.</h1>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Your form has been sent to the clinic. There is nothing more to do before your appointment.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-24">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics &nbsp;·&nbsp; Before your appointment</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">{form.name}</h1>
        <p className="text-ink-soft mt-3 leading-relaxed">
          {serviceName ? (
            <>
              For your <span className="text-charcoal">{serviceName}</span> appointment. Please read the
              information below and complete the form. It takes a couple of minutes and saves time when you arrive.
            </>
          ) : (
            <>
              Please read the information below and complete the form. It takes a couple of minutes and saves time
              when you arrive.
            </>
          )}
        </p>

        {/* Verbatim information / preamble */}
        <div className="mt-6 border border-line/40 bg-cream-soft rounded-sm p-4 max-h-72 overflow-y-auto">
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{form.intro}</p>
        </div>

        <div className="mt-8 space-y-6">
          {form.fields.map((field, i) => (
            <Field
              key={`${field.label}-${i}`}
              field={field}
              value={answers[field.label]}
              onText={(v) => setValue(field.label, v)}
              onToggleMulti={(opt) => toggleMulti(field.label, opt)}
            />
          ))}
        </div>

        {/* Declaration — tick to agree (matches Ovatu) */}
        <div className="mt-8 border-t border-line/40 pt-6">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <span
              className={`inline-flex w-6 h-6 mt-0.5 rounded-sm border items-center justify-center shrink-0 transition-colors ${
                agreed ? 'bg-gold border-gold text-charcoal' : 'border-line bg-cream'
              }`}
            >
              {agreed && <Check size={14} strokeWidth={2.5} />}
            </span>
            <input type="checkbox" className="sr-only" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span className="text-sm text-charcoal leading-relaxed">{form.declaration}</span>
          </label>
        </div>

        {error && (
          <div className="mt-4 border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3">{error}</div>
        )}

        <div className="mt-6">
          <button type="button" onClick={submit} disabled={submitting} className="btn btn-primary btn-block disabled:opacity-50">
            {submitting ? 'Sending…' : 'Submit my form'}
          </button>
          <p className="text-xs text-ink-soft text-center mt-3">
            Sent securely to the clinic and stored with your record.
          </p>
        </div>
      </div>
    </section>
  )
}

function Field({
  field,
  value,
  onText,
  onToggleMulti,
}: {
  field: ConsentField
  value: string | string[] | undefined
  onText: (v: string) => void
  onToggleMulti: (option: string) => void
}) {
  if (field.type === 'heading') {
    return <h2 className="font-display italic text-2xl text-charcoal pt-4">{field.label}</h2>
  }
  if (field.type === 'info') {
    return <p className="text-sm text-ink-soft leading-relaxed">{field.label}</p>
  }

  const labelEl = (
    <span className="text-eyebrow text-ink-soft mb-2 block">
      {field.label}
      {field.required && <span className="text-gold"> *</span>}
    </span>
  )

  if (field.type === 'long-text') {
    return (
      <div>
        {labelEl}
        <textarea rows={4} className={inputClass} value={(value as string) || ''} onChange={(e) => onText(e.target.value)} />
        {field.helper && <p className="text-xs text-stone mt-1">{field.helper}</p>}
      </div>
    )
  }

  if (field.type === 'yes-no' || field.type === 'single-choice') {
    const options = field.options ?? (field.type === 'yes-no' ? ['Yes', 'No'] : [])
    return (
      <div>
        {labelEl}
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const on = value === opt
            return (
              <label
                key={opt}
                className={`border rounded-sm px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  on ? 'bg-gold border-gold text-charcoal' : 'border-line/50 bg-cream-soft text-ink-soft hover:border-gold/60'
                }`}
              >
                <input type="radio" className="sr-only" name={field.label} checked={on} onChange={() => onText(opt)} />
                {opt}
              </label>
            )
          })}
        </div>
        {field.helper && <p className="text-xs text-stone mt-1.5">{field.helper}</p>}
      </div>
    )
  }

  if (field.type === 'multi-choice') {
    const selected = Array.isArray(value) ? value : []
    return (
      <div>
        {labelEl}
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((opt) => {
            const on = selected.includes(opt)
            return (
              <label
                key={opt}
                className={`border rounded-full px-3 py-1.5 cursor-pointer text-sm transition-colors ${
                  on ? 'bg-gold border-gold text-charcoal' : 'border-line/50 bg-cream-soft text-ink-soft hover:border-gold/60'
                }`}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => onToggleMulti(opt)} />
                {opt}
              </label>
            )
          })}
        </div>
        {field.helper && <p className="text-xs text-stone mt-1.5">{field.helper}</p>}
      </div>
    )
  }

  // Text-like inputs
  const inputType = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
  return (
    <div>
      {labelEl}
      <input type={inputType} className={inputClass} value={(value as string) || ''} onChange={(e) => onText(e.target.value)} />
      {field.helper && <p className="text-xs text-stone mt-1">{field.helper}</p>}
    </div>
  )
}
