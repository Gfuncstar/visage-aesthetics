'use client'

import { useState } from 'react'
import Image from 'next/image'
import BookingCTA from '@/components/sections/BookingCTA'
import { beforeAfter, availableTreatmentLabels } from '@/lib/before-after'

const FILTER_ALL = 'All'

const aspectClass: Record<string, string> = {
  '4/5': 'aspect-[4/5]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
}

export default function ResultsPage() {
  const labels = [FILTER_ALL, ...availableTreatmentLabels()]
  const [filter, setFilter] = useState<string>(FILTER_ALL)
  const visible = filter === FILTER_ALL ? beforeAfter : beforeAfter.filter((b) => b.treatmentLabel === filter)

  return (
    <>
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-5">Results</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Real results. Real clients.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Every photograph here is from a treatment carried out at Visage Aesthetics, shared with full client consent. Conservative and natural by intention — and results vary between individuals.
          </p>
        </div>
      </section>

      <section className="py-7 md:py-10">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="flex flex-wrap gap-2 mb-10 md:mb-12">
            {labels.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-eyebrow px-4 py-2 rounded-sm border transition-colors ${
                  filter === f
                    ? 'bg-gold text-charcoal border-gold'
                    : 'bg-transparent text-charcoal border-line/30 hover:border-gold hover:text-gold'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {visible.map((b) => (
              <figure key={b.src} className="bg-cream-soft border border-line/25 rounded-md overflow-hidden">
                <div className={`relative w-full ${aspectClass[b.aspect] ?? 'aspect-[4/3]'}`}>
                  <Image
                    src={b.src}
                    alt={`${b.treatmentLabel} before and after at Visage Aesthetics, Braintree`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 90vw"
                    className="object-cover"
                  />
                  <span
                    className="absolute top-3 left-3 bg-charcoal/85 text-cream text-eyebrow px-2.5 py-1 rounded-sm"
                    style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 500 }}
                  >
                    {b.treatmentLabel}
                  </span>
                  <span
                    aria-hidden
                    className="absolute top-3 right-3 bg-cream/85 text-charcoal px-2 py-1 rounded-sm"
                    style={{ fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 500, textTransform: 'uppercase' }}
                  >
                    Before / After
                  </span>
                </div>
                <figcaption className="p-5">
                  <p className="text-sm text-charcoal leading-snug">{b.caption}</p>
                  <p className="mt-2 text-stone" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
                    Photographed at Visage · Consented
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 bg-cream-soft border border-gold/30 rounded-md p-5 md:p-6">
            <p className="text-sm text-ink-soft leading-relaxed">
              <strong className="text-charcoal">Disclaimer:</strong> All photographs are taken at Visage Aesthetics with full patient consent. They represent outcomes for specific individuals and cannot be guaranteed for every client. Treatment plans are tailored at consultation and only proceed when clinically appropriate.
            </p>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
