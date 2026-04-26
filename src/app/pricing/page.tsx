import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { treatments } from '@/lib/treatments'
import { BOOKING_LINK_PROPS } from '@/lib/booking'

export const metadata: Metadata = {
  title: 'Treatment Prices | Visage Aesthetics, Braintree',
  description: "Transparent prices for every treatment at Visage Aesthetics, Braintree. Anti-wrinkle from £150, dermal filler from £200, Profhilo from £300. Free consultation, no pressure.",
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Treatment Prices | Visage Aesthetics, Braintree',
    description: 'Transparent prices for every treatment. Free consultation, no pressure.',
    url: 'https://www.vaclinic.co.uk/pricing',
  },
}

type Row = {
  treatment: string
  href: string
  options: { area: string; price: string; duration: string }[]
}

const rows: Row[] = [
  {
    treatment: 'Anti-Wrinkle Injections',
    href: '/treatments/anti-wrinkle-injections',
    options: [
      { area: '1 area', price: '£150', duration: '15 min' },
      { area: '2 areas', price: '£190', duration: '20 min' },
      { area: '3 areas', price: '£220', duration: '25 min' },
    ],
  },
  {
    treatment: 'Dermal Filler',
    href: '/treatments/dermal-filler',
    options: [
      { area: 'Lip filler (0.5ml)', price: '£200', duration: '30 min' },
      { area: 'Lip filler (1ml)', price: '£260', duration: '30 min' },
      { area: 'Cheek filler (1ml)', price: '£280', duration: '30 min' },
      { area: 'Tear trough (1ml)', price: '£320', duration: '40 min' },
      { area: 'Jawline / chin (1ml)', price: '£280', duration: '40 min' },
    ],
  },
  {
    treatment: 'Profhilo',
    href: '/treatments/profhilo',
    options: [
      { area: 'Single session (2ml)', price: '£300', duration: '30 min' },
      { area: 'Course of two', price: '£550', duration: '30 min × 2' },
    ],
  },
  {
    treatment: 'HarmonyCa',
    href: '/treatments/harmonyca',
    options: [
      { area: '1 syringe', price: '£450', duration: '45 min' },
      { area: '2 syringes', price: '£800', duration: '60 min' },
    ],
  },
  {
    treatment: 'Micro-Needling',
    href: '/treatments/micro-needling',
    options: [
      { area: 'Single session', price: '£150', duration: '60 min' },
      { area: 'Course of three', price: '£400', duration: '60 min × 3' },
    ],
  },
  {
    treatment: 'AQUALYX (fat dissolving)',
    href: '/treatments/aqualyx',
    options: [
      { area: 'Per area, single session', price: '£250', duration: '30 min' },
      { area: 'Course of three (per area)', price: '£650', duration: '30 min × 3' },
    ],
  },
  {
    treatment: 'CryoPen',
    href: '/treatments/cryopen',
    options: [
      { area: 'Single small lesion', price: '£80', duration: '15 min' },
      { area: 'Up to three lesions', price: '£140', duration: '20 min' },
    ],
  },
  {
    treatment: 'Hyperhidrosis Treatment',
    href: '/treatments/hyperhidrosis-migraines',
    options: [
      { area: 'Underarms (both)', price: '£350', duration: '30 min' },
      { area: 'Migraine prevention', price: 'From £350', duration: '30 min' },
    ],
  },
  {
    treatment: 'Vitamin B12',
    href: '/treatments/vitamin-b12',
    options: [
      { area: 'Single injection', price: '£35', duration: '10 min' },
      { area: 'Course of four', price: '£120', duration: '10 min × 4' },
    ],
  },
  {
    treatment: "Men's Aesthetics",
    href: '/treatments/mens-aesthetics',
    options: [
      { area: 'Anti-wrinkle (1 area)', price: '£170', duration: '20 min' },
      { area: 'Filler (1ml)', price: '£260', duration: '40 min' },
    ],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'PriceSpecification',
  name: 'Visage Aesthetics — Treatment Prices',
  url: 'https://www.vaclinic.co.uk/pricing',
  priceCurrency: 'GBP',
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
    { '@type': 'ListItem', position: 2, name: 'Prices', item: 'https://www.vaclinic.co.uk/pricing' },
  ],
}

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Prices</li>
            </ol>
          </nav>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Honest, transparent prices.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            No hidden costs. No pressure to upgrade. Every treatment plan starts with a free, unhurried
            consultation — and only goes ahead if it&apos;s genuinely right for you.
          </p>
        </div>
      </section>

      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="grid gap-px bg-line/40 border border-line/40">
            {rows.map((row) => (
              <article key={row.treatment} className="bg-cream p-6 md:p-8">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div>
                    <h2 className="font-display italic text-charcoal" style={{ fontSize: 28, lineHeight: 1.1 }}>
                      {row.treatment}
                    </h2>
                  </div>
                  <Link href={row.href} className="text-eyebrow text-gold hover:text-gold-deep transition-colors inline-flex items-center gap-1">
                    Learn more <ArrowUpRight size={14} />
                  </Link>
                </div>
                <ul className="mt-5 grid gap-y-2 gap-x-6 sm:grid-cols-2">
                  {row.options.map((o, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-2 border-b border-line/30 last:border-b-0">
                      <span className="text-charcoal text-[15px]">{o.area}</span>
                      <span className="flex items-baseline gap-3">
                        <span className="text-stone text-[12px]">{o.duration}</span>
                        <span className="font-display italic text-charcoal" style={{ fontSize: 19, fontWeight: 500 }}>{o.price}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="border border-line/30 rounded-md p-6">
              <div className="text-eyebrow text-gold mb-3">Free consultation</div>
              <p className="text-body text-ink-soft">Every consultation is free. We discuss what you want, what&apos;s realistic, and what won&apos;t work — before you commit to anything.</p>
            </div>
            <div className="border border-line/30 rounded-md p-6">
              <div className="text-eyebrow text-gold mb-3">Two-week review</div>
              <p className="text-body text-ink-soft">Anti-wrinkle treatments include a complimentary review at two weeks to fine-tune any unevenness — included in the price.</p>
            </div>
            <div className="border border-line/30 rounded-md p-6">
              <div className="text-eyebrow text-gold mb-3">No pressure</div>
              <p className="text-body text-ink-soft">If a treatment isn&apos;t in your best interest, Bernadette will say so. We don&apos;t upsell. We don&apos;t package. We don&apos;t pressure.</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <a {...BOOKING_LINK_PROPS} className="btn btn-primary btn-md:auto">
              <span>Book free consultation</span>
              <span className="btn-arrow">→</span>
            </a>
            <Link href="/treatments" className="btn btn-secondary btn-md:auto">
              <span>Explore treatments</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          <p className="mt-10 text-stone text-[12px] tracking-[0.18em] uppercase text-center">
            Prices are guides only &nbsp;·&nbsp; Confirmed at consultation &nbsp;·&nbsp; Last reviewed April 2026
          </p>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}

// keep tree-shaking happy: treatments import is used downstream when generating
// related rows in the future
void treatments
