import type { Metadata } from 'next'
import { Check, X, Clock, AlertCircle } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'Aftercare | Awarded Best Clinic Essex 2026',
  description: 'Aftercare guidance for aesthetic treatments at Visage Aesthetics, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Anti-wrinkle, dermal filler, Profhilo, micro-needling and more.',
}

const dos = [
  'Drink plenty of water for the first 48 hours.',
  'Sleep on your back the first night where possible.',
  'Stick to gentle skincare for 24 hours.',
  'Apply a cool compress if there is mild swelling.',
  'Take paracetamol if needed for any tenderness.',
]

const donts = [
  'No alcohol for 24 hours after treatment.',
  'No exercise, hot showers or saunas for 24 hours.',
  'No facials, massage or facial treatments for 2 weeks.',
  'No make-up for 12 hours after injectables.',
  'No flying for 48 hours after Profhilo or filler.',
]

const callIf = [
  'Severe or worsening pain not relieved by paracetamol.',
  'Skin discoloration in the treated area beyond a normal bruise.',
  'Vision changes (extremely rare but treated as urgent).',
  'Asymmetry that has not settled after 14 days.',
]

export default function AftercarePage() {
  return (
    <>
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-8 md:pb-12 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-5">After your treatment</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Aftercare, simply explained.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Every client receives written aftercare by email after their appointment. This page is the standard guidance, alongside any treatment-specific notes I&apos;ve given you.
          </p>
        </div>
      </section>

      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="border border-line/30 rounded-md p-7 md:p-9">
            <div className="text-eyebrow text-gold mb-3">Please do</div>
            <h2 className="font-display text-2xl text-charcoal mb-6">In the first 48 hours</h2>
            <ul className="space-y-3">
              {dos.map((d) => (
                <li key={d} className="flex items-start gap-3 text-charcoal">
                  <Check size={16} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                  <span className="text-sm leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-cream text-charcoal rounded-md p-7 md:p-9">
            <div className="text-eyebrow text-stone mb-3">Please avoid</div>
            <h2 className="font-display text-2xl text-charcoal mb-6">In the first 24 hours</h2>
            <ul className="space-y-3">
              {donts.map((d) => (
                <li key={d} className="flex items-start gap-3 text-ink-soft">
                  <X size={16} strokeWidth={1.75} className="text-stone mt-1 shrink-0" />
                  <span className="text-sm leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">When to expect what</div>
            <h2 className="font-display text-h1 text-charcoal">A timeline.</h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4 items-start">
                <Clock size={18} strokeWidth={1.5} className="text-gold mt-1 shrink-0" />
                <div>
                  <div className="text-charcoal font-medium">Day 0 to 3</div>
                  <p className="text-sm text-ink-soft mt-1">Possible mild swelling, redness or small bruising. Settles quickly with rest and water.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <Clock size={18} strokeWidth={1.5} className="text-gold mt-1 shrink-0" />
                <div>
                  <div className="text-charcoal font-medium">Day 3 to 7</div>
                  <p className="text-sm text-ink-soft mt-1">Anti-wrinkle results begin to appear. Filler settles into its final shape. Bruising fades.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <Clock size={18} strokeWidth={1.5} className="text-gold mt-1 shrink-0" />
                <div>
                  <div className="text-charcoal font-medium">Day 14</div>
                  <p className="text-sm text-ink-soft mt-1">Full results visible. We schedule a complimentary review at this point if needed.</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <div className="bg-cream border border-gold/30 rounded-md p-7">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle size={18} className="text-gold mt-0.5 shrink-0" />
                <div className="text-eyebrow text-gold">When to contact me</div>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed mb-5">
                Please contact me directly if you experience any of the following. I am always reachable in the days after your treatment.
              </p>
              <ul className="space-y-3">
                {callIf.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-charcoal">
                    <span className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0" />
                    <span className="text-sm leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:info@vaclinic.co.uk" className="mt-6 btn btn-primary btn-block">
                Email Bernadette
              </a>
            </div>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
