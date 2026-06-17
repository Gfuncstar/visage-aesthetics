import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import VideoBandUSP from '@/components/sections/VideoBandUSP'
import TreatmentFinder from '@/components/sections/TreatmentFinder'
import { treatments } from '@/lib/treatments'
import { conditions } from '@/lib/conditions'
import { BOOKING_URL } from '@/lib/booking'

export const metadata: Metadata = {
  title: 'Treatments | Visage Aesthetics',
  description: 'Non-surgical aesthetic treatments at Visage Aesthetics, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Anti-wrinkle, dermal filler, Profhilo, HarmonyCa, micro-needling, AQUALYX and more — performed in a private, discreet clinic on Friars Lane, Braintree. One client at a time.',
}

export default function TreatmentsPage() {
  return (
    <>
      <section className="relative bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-6">What we offer</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            A considered menu of non-surgical treatments.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            I perform every treatment myself, as a registered nurse with an MSc in Advanced Practice. Each one starts with a free consultation so we can plan exactly what suits you.
          </p>
        </div>
      </section>

      <TreatmentFinder />

      <VideoBandUSP
        eyebrow="How we begin"
        heading="Every treatment starts with a free consultation."
        subline="Forty-five unhurried minutes in the room, with the diary blocked off. You leave with a written plan and a price &mdash; never with a sale."
        cta={{ label: 'Book a consultation', href: BOOKING_URL }}
        desktopSrc="/video/usp/imagine-71ed1d19.mp4"
        mobileSrc="/video/usp/imagine-71ed1d19.mp4"
      />

      <section className="py-5 md:py-8">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="divide-y divide-taupe-dark/25 border-t border-b border-line/25">
            {treatments.map((t, i) => (
              <Link
                key={t.slug}
                href={t.href}
                className="group grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 py-8 md:py-10 items-center"
              >
                <div className="md:col-span-1 text-eyebrow text-ink-soft">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="md:col-span-3 relative aspect-[4/3] md:aspect-square rounded-md overflow-hidden">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="(min-width: 768px) 25vw, 90vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="md:col-span-5">
                  <h2 className="font-display text-2xl md:text-3xl text-charcoal group-hover:text-gold transition-colors">
                    {t.name}
                  </h2>
                  <p className="text-eyebrow text-gold mt-1">{t.tagline}</p>
                  <p className="mt-3 text-sm md:text-body text-ink-soft leading-relaxed">{t.description}</p>
                </div>
                <div className="md:col-span-3 flex md:justify-end items-center gap-5">
                  <span className="text-sm text-charcoal">{t.price}</span>
                  <span className="w-10 h-10 inline-flex items-center justify-center border border-line/40 group-hover:border-gold group-hover:bg-gold/5 rounded-sm transition-colors">
                    <ArrowUpRight size={16} strokeWidth={1.5} className="text-gold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CONDITIONS WE TREAT — condition-led answer pages */}
      <section className="bg-cream-soft py-7 md:py-10">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <span className="hairline hairline-left mb-6" />
          <div className="text-eyebrow text-gold mb-3">Conditions we treat</div>
          <h2 className="font-display text-h1 text-charcoal max-w-2xl">Looking for help with something specific?</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-line/30 border border-line/30">
            {conditions.map((c) => (
              <Link key={c.slug} href={c.href} className="group bg-cream hover:bg-cream-soft transition-colors p-6 md:p-7">
                <h3 className="font-display text-xl text-charcoal group-hover:text-gold transition-colors">{c.name}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{c.h1}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-gold" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
                  Read more <ArrowUpRight size={13} strokeWidth={1.5} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
