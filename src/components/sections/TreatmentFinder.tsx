'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { treatments, type Treatment } from '@/lib/treatments'

type Answers = {
  concern?: 'lines' | 'volume' | 'skin' | 'unsure'
  needle?: 'fine' | 'cautious' | 'avoid'
  budget?: 'under-150' | '150-300' | '300-plus'
}

const concernOptions: { value: NonNullable<Answers['concern']>; label: string; hint: string }[] = [
  { value: 'lines', label: 'Fine lines or wrinkles', hint: 'Forehead, frown, crow’s feet' },
  { value: 'volume', label: 'Lost volume or contour', hint: 'Cheeks, lips, under-eyes, jawline' },
  { value: 'skin', label: 'Skin quality or texture', hint: 'Hydration, laxity, glow' },
  { value: 'unsure', label: 'Not sure yet', hint: 'Help me decide at consultation' },
]

const needleOptions: { value: NonNullable<Answers['needle']>; label: string; hint?: string }[] = [
  { value: 'fine', label: "I'm fine with injections" },
  { value: 'cautious', label: 'A bit cautious, but open' },
  { value: 'avoid', label: 'I’d prefer to avoid injections', hint: 'Where possible' },
]

const budgetOptions: { value: NonNullable<Answers['budget']>; label: string; hint?: string }[] = [
  { value: 'under-150', label: 'Under £150' },
  { value: '150-300', label: '£150 – £300' },
  { value: '300-plus', label: '£300+' },
]

const bySlug = Object.fromEntries(treatments.map((t) => [t.slug, t])) as Record<string, Treatment>

function recommend(a: Answers): string[] {
  // Two recommended slugs. Logic is deliberately permissive — point at the
  // best two starting points and let consultation refine.
  const set = new Set<string>()

  if (a.needle === 'avoid') {
    set.add('micro-needling')
    set.add('cryopen')
  }

  if (a.concern === 'lines') {
    if (a.needle !== 'avoid') set.add('anti-wrinkle-injections')
    set.add('profhilo')
  }
  if (a.concern === 'volume') {
    if (a.needle !== 'avoid') set.add('dermal-filler')
    set.add('harmonyca')
  }
  if (a.concern === 'skin') {
    set.add('profhilo')
    set.add('micro-needling')
  }
  if (a.concern === 'unsure') {
    set.add('profhilo')
    set.add('anti-wrinkle-injections')
  }

  // Budget filtering — soft. If under £150 and we have a cheaper option, prefer it.
  if (a.budget === 'under-150') {
    set.add('micro-needling')
  }
  if (a.budget === '300-plus' && a.concern === 'volume') {
    set.add('harmonyca')
  }

  const ordered = Array.from(set).filter((s) => bySlug[s]).slice(0, 2)
  // Fallbacks if logic produced fewer than 2.
  if (ordered.length < 2) {
    for (const t of treatments) {
      if (!ordered.includes(t.slug)) ordered.push(t.slug)
      if (ordered.length === 2) break
    }
  }
  return ordered.slice(0, 2)
}

export default function TreatmentFinder() {
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)

  const total = 3
  const progressPct = step === 3 ? 100 : Math.round((step / total) * 100)
  const recs = step === 3 ? recommend(answers).map((s) => bySlug[s]).filter(Boolean) : []

  const reset = () => {
    setAnswers({})
    setStep(0)
  }

  return (
    <section className="bg-cream-soft py-10 md:py-14">
      <div className="max-w-[1100px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="md:col-span-4">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Not sure where to start?</div>
            <h2 className="font-display italic text-charcoal" style={{ fontSize: 'clamp(28px, 3vw, 38px)', lineHeight: 1.15, fontWeight: 400 }}>
              Three quick questions.
            </h2>
            <p className="mt-5 text-body text-ink-soft max-w-sm leading-relaxed">
              A starting point, not a diagnosis. Your plan is shaped properly in the free consultation.
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="bg-cream border border-line/30 rounded-md p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-eyebrow text-stone">
                  {step < 3 ? `Step ${step + 1} of ${total}` : 'Suggested starting points'}
                </div>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-eyebrow text-stone hover:text-gold-deep transition-colors"
                  >
                    <RotateCcw size={11} strokeWidth={1.75} />
                    <span>Start over</span>
                  </button>
                )}
              </div>
              <div className="h-px mb-6 relative" style={{ background: 'rgba(217, 205, 190, 0.6)' }}>
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: '#A8895E' }}
                />
              </div>

              {step === 0 && (
                <div>
                  <h3 className="font-display italic text-charcoal mb-5" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 400 }}>
                    What&rsquo;s your main concern?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {concernOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => { setAnswers((a) => ({ ...a, concern: o.value })); setStep(1) }}
                        className="text-left border border-line/40 hover:border-gold hover:bg-cream-soft transition-colors rounded-sm p-4"
                      >
                        <div className="text-charcoal font-medium" style={{ fontSize: 15 }}>{o.label}</div>
                        <div className="text-stone mt-1" style={{ fontSize: 12 }}>{o.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h3 className="font-display italic text-charcoal mb-5" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 400 }}>
                    How do you feel about needles?
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {needleOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => { setAnswers((a) => ({ ...a, needle: o.value })); setStep(2) }}
                        className="text-left border border-line/40 hover:border-gold hover:bg-cream-soft transition-colors rounded-sm p-4"
                      >
                        <div className="text-charcoal font-medium" style={{ fontSize: 15 }}>{o.label}</div>
                        {o.hint && <div className="text-stone mt-1" style={{ fontSize: 12 }}>{o.hint}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="font-display italic text-charcoal mb-5" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 400 }}>
                    Comfortable budget per visit?
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {budgetOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => { setAnswers((a) => ({ ...a, budget: o.value })); setStep(3) }}
                        className="text-left border border-line/40 hover:border-gold hover:bg-cream-soft transition-colors rounded-sm p-4"
                      >
                        <div className="text-charcoal font-medium" style={{ fontSize: 14 }}>{o.label}</div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 text-stone" style={{ fontSize: 12, lineHeight: 1.5 }}>
                    The consultation itself is always free. Treatment cost is quoted in writing before anything is booked.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-charcoal text-body-lg max-w-xl mb-7 leading-relaxed">
                    Two good starting points. Bernadette will confirm what&rsquo;s actually right for you at your free consultation.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recs.map((t) => (
                      <Link key={t.slug} href={t.href} className="group block border border-line/40 hover:border-gold transition-colors rounded-sm p-5 bg-cream-soft">
                        <div className="text-eyebrow text-gold mb-2">{t.tagline}</div>
                        <h4 className="font-display text-charcoal" style={{ fontSize: 20, fontWeight: 500 }}>{t.name}</h4>
                        <p className="text-stone mt-2" style={{ fontSize: 12.5, lineHeight: 1.55 }}>{t.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-eyebrow text-charcoal">{t.price}</span>
                          <ArrowUpRight size={16} className="text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
