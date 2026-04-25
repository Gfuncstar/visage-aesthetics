'use client'

import { useState } from 'react'
import Image from 'next/image'
import BookingCTA from '@/components/sections/BookingCTA'

const filters = ['All', 'Anti-Wrinkle', 'Dermal Filler', 'Profhilo', 'Lip Filler', 'AQUALYX', 'Micro-Needling']

const gallery = [
  { src: '/images/treatment-1.jpg', treatment: 'Anti-Wrinkle', age: 'Client, late 30s', note: 'Forehead and frown lines softened. Natural movement preserved.' },
  { src: '/images/treatment-2.jpg', treatment: 'Lip Filler', age: 'Client, mid 30s', note: '0.7ml restoring shape and a subtle pout.' },
  { src: '/images/treatment-3.jpg', treatment: 'Profhilo', age: 'Client, early 40s', note: 'Two-session course. Improved hydration and skin quality.' },
  { src: '/images/treatment-4.jpg', treatment: 'Dermal Filler', age: 'Client, mid 40s', note: 'Subtle cheek revolumisation. 1ml total.' },
  { src: '/images/profhilo.jpg', treatment: 'Profhilo', age: 'Client, early 50s', note: 'Skin remodelling on face and neck.' },
  { src: '/images/anti-wrinkle.jpg', treatment: 'Anti-Wrinkle', age: 'Client, late 40s', note: 'Three-area treatment. 4-month interval.' },
  { src: '/images/dermal-filler.jpg', treatment: 'Dermal Filler', age: 'Client, mid 30s', note: 'Tear-trough correction with HA filler.' },
  { src: '/images/micro-needling.jpg', treatment: 'Micro-Needling', age: 'Client, early 30s', note: 'Course of three for acne scarring.' },
  { src: '/images/aqualyx.jpg', treatment: 'AQUALYX', age: 'Client, mid 40s', note: 'Submental fat reduction. Three-session course.' },
  { src: '/images/treatment-1.jpg', treatment: 'Lip Filler', age: 'Client, late 20s', note: 'Subtle lip enhancement. Conservative first treatment.' },
  { src: '/images/treatment-2.jpg', treatment: 'Anti-Wrinkle', age: 'Client, early 40s', note: 'Forehead and crow&apos;s feet treatment.' },
  { src: '/images/treatment-3.jpg', treatment: 'Profhilo', age: 'Client, mid 50s', note: 'Hands and decolletage treatment course.' },
]

export default function ResultsPage() {
  const [filter, setFilter] = useState<string>('All')
  const visible = filter === 'All' ? gallery : gallery.filter((g) => g.treatment === filter)
  return (
    <>
      <section className="bg-cream text-charcoal pt-32 md:pt-44 pb-16 md:pb-24 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-5">Results</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Real results. Real clients.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Every photograph here is from a treatment carried out at Visage Aesthetics, shared with full client consent. Results vary between individuals. The intention is always subtle and balanced.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="flex flex-wrap gap-2 mb-10 md:mb-12">
            {filters.map((f) => (
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
            {visible.map((card, i) => (
              <div key={i} className="bg-cream-soft border border-line/25 rounded-md overflow-hidden">
                <div className="relative aspect-[4/5]">
                  <Image src={card.src} alt={`${card.treatment} result`} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 90vw" className="object-cover" />
                  <div className="absolute top-3 left-3 bg-charcoal/80 text-charcoal text-eyebrow px-2.5 py-1 rounded-sm">
                    {card.treatment}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-charcoal">{card.age}</p>
                  <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{card.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-cream-soft border border-gold/30 rounded-md p-5 md:p-6">
            <p className="text-sm text-ink-soft leading-relaxed">
              <strong className="text-charcoal">Disclaimer:</strong> Results vary between individuals. All photographs are taken at Visage Aesthetics with full patient consent. They represent outcomes for specific individuals and cannot be guaranteed for every client.
            </p>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
