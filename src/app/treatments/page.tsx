import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { treatments } from '@/lib/treatments'

export const metadata: Metadata = {
  title: 'Treatments | Aesthetic Treatments in Braintree, Essex',
  description: 'Non-surgical aesthetic treatments at Visage Aesthetics, Braintree Essex: anti-wrinkle, dermal filler, Profhilo, HarmonyCa, micro-needling, AQUALYX and more.',
}

export default function TreatmentsPage() {
  return (
    <>
      <section className="relative bg-cream text-charcoal pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-6">What we offer</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            A considered menu of non-surgical treatments.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Every treatment is performed by Bernadette Tobin, registered nurse and MSc Advanced Practice. Each one starts with a free consultation so we can plan exactly what suits you.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
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

      <BookingCTA />
    </>
  )
}
