import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { geoPages, type GeoPage } from '@/lib/geo-pages'
import { AWARD } from '@/lib/award'

export const metadata: Metadata = {
  title: 'Locations We Serve | Visage Aesthetics, Braintree (Essex)',
  description: 'Visage Aesthetics is on Friars Lane in central Braintree. Clients travel from Chelmsford, Colchester, Halstead, Witham, Maldon, Sudbury, Great Dunmow and across Essex for Botox, dermal filler and Profhilo. Town-by-town pages with travel times and FAQs.',
  alternates: { canonical: '/locations' },
  openGraph: {
    title: 'Locations We Serve | Visage Aesthetics',
    description: 'Town-by-town pages with travel times, postcodes and local FAQs across Essex.',
    url: 'https://www.vaclinic.co.uk/locations',
  },
}

const TREATMENT_GROUPS: { label: string; key: GeoPage['treatmentSlug']; blurb: string; href: string }[] = [
  {
    label: 'Botox / Anti-Wrinkle',
    key: 'anti-wrinkle-injections',
    blurb: 'Botulinum toxin to relax movement lines on the forehead, brow and around the eyes. From £120.',
    href: '/treatments/anti-wrinkle-injections',
  },
  {
    label: 'Lip & Dermal Filler',
    key: 'dermal-filler',
    blurb: 'Hyaluronic acid filler for lips, cheeks, jawline, chin and tear troughs. Fully reversible. From £110.',
    href: '/treatments/dermal-filler',
  },
  {
    label: 'Profhilo',
    key: 'profhilo',
    blurb: 'Authentic IBSA Profhilo skin bio-remodelling — hydration, bounce and glow, never volume. From £180.',
    href: '/treatments/profhilo',
  },
]

const SITE = 'https://www.vaclinic.co.uk'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Locations', item: `${SITE}/locations` },
      ],
    },
    {
      '@type': 'CollectionPage',
      name: 'Locations We Serve — Visage Aesthetics',
      url: `${SITE}/locations`,
      description: 'Geographic pages for the towns Visage Aesthetics clients travel from, with travel times and local FAQs.',
      provider: {
        '@type': 'MedicalBusiness',
        '@id': `${SITE}/#org`,
        name: 'Visage Aesthetics',
        url: SITE,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '17A Friars Lane',
          addressLocality: 'Braintree',
          addressRegion: 'Essex',
          postalCode: 'CM7 9BL',
          addressCountry: 'GB',
        },
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: geoPages.length,
        itemListElement: geoPages.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE}${g.href}`,
          name: g.anchor,
        })),
      },
    },
  ],
}

export default function LocationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="relative bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Locations</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-gold mb-3 inline-flex items-center gap-2">
            <MapPin size={12} /> Across Essex &amp; South Suffolk
          </div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            Locations we serve.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            The clinic itself is on Friars Lane in central Braintree (CM7 9BL). Clients travel
            from Chelmsford, Colchester, Halstead, Witham, Maldon, Sudbury, Great Dunmow and across
            the county. Each town below has its own page with travel times, surrounding-area lists
            and local FAQs.
          </p>
          <Link
            href={AWARD.detailPath}
            className="mt-7 inline-flex items-center gap-2 text-gold hover:text-gold-deep transition-colors group"
            style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
          >
            <span className="border-b border-transparent group-hover:border-current pb-0.5 transition-colors">
              Officially awarded · {AWARD.shortName}
            </span>
          </Link>
        </div>
      </section>

      {/* GROUPED LISTS — by treatment */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {TREATMENT_GROUPS.map((group) => {
            const pages = geoPages.filter((g) => g.treatmentSlug === group.key)
            return (
              <div key={group.key} className="border border-line/30 rounded-md bg-cream-soft p-7 md:p-8">
                <div className="text-eyebrow text-gold mb-3">{group.label}</div>
                <h2 className="font-display italic text-charcoal" style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 500 }}>
                  {group.label} by town.
                </h2>
                <p className="mt-4 text-body text-ink-soft leading-relaxed">{group.blurb}</p>
                <ul className="mt-6 grid gap-y-2.5">
                  {pages.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={g.href}
                        className="group flex items-baseline justify-between gap-3 py-2 border-b border-line/30 hover:border-gold/60 transition-colors"
                      >
                        <span className="text-charcoal text-[15px] leading-tight group-hover:text-gold-deep transition-colors">
                          {g.anchor}
                        </span>
                        <span className="text-stone text-[11px] tracking-[0.08em] whitespace-nowrap">
                          {g.travelLine.split(' · ')[0]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-line/30">
                  <Link
                    href={group.href}
                    className="inline-flex items-center gap-2 text-gold hover:text-gold-deep transition-colors group"
                    style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
                  >
                    <span className="border-b border-transparent group-hover:border-current pb-0.5 transition-colors">
                      Full {group.label.toLowerCase()} information
                    </span>
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* TRAVEL NOTE */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Travelling here</div>
            <h2 className="font-display text-h1 text-charcoal">Friars Lane, central Braintree.</h2>
          </div>
          <div className="md:col-span-7 text-body-lg text-ink-soft leading-relaxed space-y-5">
            <p>
              The clinic is at 17A Friars Lane in the heart of Braintree (CM7 9BL), five minutes&apos;
              walk from the town centre with free on-site parking and a discreet entrance.
            </p>
            <p>
              Most clients drive: under 15 minutes from Witham, Halstead or Coggeshall; 20 minutes
              from Chelmsford, Sudbury, Great Dunmow; 25 minutes from Colchester or Maldon. The A12
              and A120 are the main routes in.
            </p>
            <p>
              Strictly by appointment, one client in the room at a time. If your town isn&apos;t
              listed above, you&apos;re still welcome — we&apos;ve simply built pages for the towns
              we see clients from most often.
            </p>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
