import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { treatments } from '@/lib/treatments'
import { BOOKING_LINK_PROPS } from '@/lib/booking'

export const metadata: Metadata = {
  title: 'Treatment Prices | Visage Aesthetics',
  description: "Transparent prices at Visage Aesthetics, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Anti-wrinkle from £120, dermal filler from £110, Profhilo from £180, micro-needling from £80. Free consultation, no pressure — in a private, discreet clinic with no signage, private parking and one client at a time.",
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Treatment Prices | Visage Aesthetics',
    description: 'Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Transparent prices, free consultation, no pressure — private, discreet clinic.',
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
      { area: '1 area', price: '£120', duration: '15 min' },
      { area: '2 areas', price: '£170', duration: '20 min' },
      { area: '3 areas', price: '£220', duration: '25 min' },
    ],
  },
  {
    treatment: 'Dermal Filler',
    href: '/treatments/dermal-filler',
    options: [
      { area: 'Lip filler (0.5ml)', price: '£110', duration: '30 min' },
      { area: 'Lip filler (1ml)', price: '£200', duration: '30 min' },
      { area: 'Cheek filler (1ml)', price: '£200', duration: '30 min' },
      { area: 'Jawline / chin (1ml)', price: '£250', duration: '40 min' },
    ],
  },
  {
    treatment: 'Profhilo',
    href: '/treatments/profhilo',
    options: [
      { area: 'Single session (2ml)', price: '£180', duration: '30 min' },
      { area: 'Course of two', price: '£380', duration: '30 min × 2' },
    ],
  },
  {
    treatment: 'HarmonyCa',
    href: '/treatments/harmonyca',
    options: [
      { area: 'Treatment session', price: '£500', duration: '60 min' },
    ],
  },
  {
    treatment: 'Micro-Needling',
    href: '/treatments/micro-needling',
    options: [
      { area: 'Single session', price: '£80', duration: '60 min' },
      { area: 'Single session with Exosomes', price: '£150', duration: '45 min' },
      { area: 'Course of three', price: '£240', duration: '60 min × 3' },
      { area: 'Course of three with Exosomes', price: '£400', duration: '45 min × 3' },
    ],
  },
  {
    treatment: 'AQUALYX (fat dissolving)',
    href: '/treatments/aqualyx',
    options: [
      { area: 'Per area, single session', price: 'Per consultation', duration: '30 min' },
      { area: 'Course of three (per area)', price: 'Per consultation', duration: '30 min × 3' },
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
      { area: 'Underarms (both)', price: '£290', duration: '30 min' },
      { area: 'Migraine prevention', price: 'From £200', duration: '30 min' },
    ],
  },
  {
    treatment: 'Vitamin B12',
    href: '/treatments/vitamin-b12',
    options: [
      { area: 'Single injection', price: '£30', duration: '10 min' },
      { area: 'Course of four', price: '£100', duration: '10 min × 4' },
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
  {
    treatment: 'Map My Mole',
    href: '/treatments/map-my-mole',
    options: [
      { area: 'Per mole assessment', price: '£90', duration: '20 min' },
    ],
  },
]

// Build an OfferCatalog of every treatment × option pair, with structured
// PriceSpecification per option. Replaces the previous single PriceSpecification
// stub so individual price points are eligible for rich-result surfacing.
const parsePrice = (s: string) => {
  const m = s.match(/\d+/)
  return m ? m[0] : ''
}

const offerCatalog = {
  '@type': 'OfferCatalog',
  name: 'Visage Aesthetics treatment menu',
  url: 'https://www.vaclinic.co.uk/pricing',
  itemListElement: rows.flatMap((row) =>
    row.options.map((o) => {
      const numericPrice = parsePrice(o.price)
      const offer: Record<string, unknown> = {
        '@type': 'Offer',
        name: `${row.treatment} — ${o.area}`,
        itemOffered: {
          '@type': 'MedicalProcedure',
          name: row.treatment,
          url: `https://www.vaclinic.co.uk${row.href}`,
          procedureType: 'https://schema.org/NoninvasiveProcedure',
        },
        url: `https://www.vaclinic.co.uk${row.href}`,
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
      }
      if (numericPrice) {
        offer.price = numericPrice
        offer.priceSpecification = {
          '@type': 'PriceSpecification',
          price: o.price,
          priceCurrency: 'GBP',
        }
      }
      return offer
    })
  ),
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Prices', item: 'https://www.vaclinic.co.uk/pricing' },
      ],
    },
    {
      '@type': 'CollectionPage',
      name: 'Visage Aesthetics, Treatment Prices',
      url: 'https://www.vaclinic.co.uk/pricing',
      mainEntity: offerCatalog,
      provider: {
        '@type': 'MedicalBusiness',
        '@id': 'https://www.vaclinic.co.uk/#org',
        name: 'Visage Aesthetics',
        url: 'https://www.vaclinic.co.uk/',
      },
    },
  ],
}

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
            consultation, and only goes ahead if it&apos;s genuinely right for you.
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
              <p className="text-body text-ink-soft">Every consultation is free. We discuss what you want, what&apos;s realistic, and what won&apos;t work, before you commit to anything.</p>
            </div>
            <div className="border border-line/30 rounded-md p-6">
              <div className="text-eyebrow text-gold mb-3">Two-week review</div>
              <p className="text-body text-ink-soft">Anti-wrinkle treatments include a complimentary review at two weeks to fine-tune any unevenness, included in the price.</p>
            </div>
            <div className="border border-line/30 rounded-md p-6">
              <div className="text-eyebrow text-gold mb-3">No pressure</div>
              <p className="text-body text-ink-soft">If a treatment isn&apos;t in your best interest, I will say so. We don&apos;t upsell. We don&apos;t package. We don&apos;t pressure.</p>
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
