import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollScrubHero from '@/components/sections/ScrollScrubHero'
import BookingCTA from '@/components/sections/BookingCTA'
import GoogleReviews from '@/components/sections/GoogleReviews'
import AutoplayVideo from '@/components/ui/AutoplayVideo'
import { treatments } from '@/lib/treatments'
import { getGoogleReviews } from '@/lib/google-reviews'

export const metadata: Metadata = {
  title: 'Visage Aesthetics | Award-Winning Nurse-Led Clinic, Braintree',
  description: "Best Non-Surgical Aesthetics Clinic 2026 — Essex. Anti-wrinkle, dermal filler, Profhilo and more by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Free consultation, naturally subtle results.",
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.vaclinic.co.uk/',
    siteName: 'Visage Aesthetics',
    title: 'Visage Aesthetics | Naturally yours.',
    description: 'A small, considered aesthetics clinic on Friars Lane, Braintree. Led by Bernadette Tobin, RGN MSc.',
    images: [{ url: '/images/og-home.jpg', width: 1200, height: 630, alt: 'Visage Aesthetics, Braintree' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visage Aesthetics | Naturally yours.',
    description: 'Nurse-led aesthetics clinic, Braintree. Bernadette Tobin RGN, MSc.',
    images: ['/images/og-home.jpg'],
  },
}

export default async function Home() {
  const reviews = await getGoogleReviews()

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.vaclinic.co.uk/#website',
        url: 'https://www.vaclinic.co.uk/',
        name: 'Visage Aesthetics',
        publisher: { '@id': 'https://www.vaclinic.co.uk/#org' },
        inLanguage: 'en-GB',
      },
      {
        '@type': ['Organization', 'MedicalBusiness', 'LocalBusiness'],
        '@id': 'https://www.vaclinic.co.uk/#org',
        name: 'Visage Aesthetics',
        url: 'https://www.vaclinic.co.uk/',
        logo: 'https://www.vaclinic.co.uk/icon.png',
        image: 'https://www.vaclinic.co.uk/images/clinic-wide.jpg',
        telephone: '+44 7931 395246',
        email: 'info@vaclinic.co.uk',
        priceRange: '££',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '17A Friars Lane',
          addressLocality: 'Braintree',
          addressRegion: 'Essex',
          postalCode: 'CM7 9BL',
          addressCountry: 'GB',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 51.885914, longitude: 0.555411 },
        areaServed: [
          { '@type': 'City', name: 'Braintree' },
          { '@type': 'City', name: 'Chelmsford' },
          { '@type': 'City', name: 'Colchester' },
          { '@type': 'AdministrativeArea', name: 'Essex' },
        ],
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '18:00' }],
        sameAs: ['https://www.instagram.com/visageaestheticclinic'],
        award: [
          'Best Non-Surgical Aesthetics Clinic 2026 — Essex (Health, Beauty & Wellness Awards)',
          'Educator of the Year 2026 — Nominee (Beauty & Aesthetics Awards)',
        ],
        hasCredential: [
          { '@type': 'EducationalOccupationalCredential', credentialCategory: 'professional registration', name: 'NMC Registered Nurse', identifier: '05G1755E' },
          { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'MSc Advanced Practice (Level 7)' },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: reviews.rating.toFixed(1),
          reviewCount: reviews.total,
          bestRating: '5',
          worstRating: '1',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Visage Aesthetics treatment menu',
          itemListElement: treatments.map((t) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'MedicalProcedure',
              name: t.name,
              description: t.tagline,
              url: `https://www.vaclinic.co.uk${t.href}`,
              procedureType: 'https://schema.org/NoninvasiveProcedure',
            },
            price: t.price.replace(/[^\d]/g, ''),
            priceCurrency: 'GBP',
            priceSpecification: { '@type': 'PriceSpecification', price: t.price, priceCurrency: 'GBP' },
            url: `https://www.vaclinic.co.uk${t.href}`,
            availability: 'https://schema.org/InStock',
          })),
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <ScrollScrubHero />

      {/* GOOGLE REVIEWS — replaces the founder Vision section */}
      <GoogleReviews />

      {/* APPROACH */}
      <section style={{ padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="section-num reveal mb-12">02 &nbsp; Approach</div>
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-12 md:gap-20 items-start">
            <div className="reveal-image relative aspect-[4/5] md:aspect-[4/5.4] overflow-hidden">
              <AutoplayVideo
                src="/video/approach.mp4"
                poster="/images/clinic-portrait.jpg"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: '55%',
                  background: 'linear-gradient(to top, rgba(245, 240, 236, 0.92) 0%, rgba(245, 240, 236, 0.7) 35%, rgba(245, 240, 236, 0.35) 70%, rgba(245, 240, 236, 0) 100%)',
                }}
              />
              <figcaption
                className="absolute left-5 bottom-6 md:left-7 md:bottom-8 max-w-[320px] md:max-w-[380px]"
                style={{ color: '#1F1B1A', textShadow: '0 1px 2px rgba(245, 240, 236, 0.6)' }}
              >
                <span
                  className="font-display italic block"
                  style={{ fontSize: 'clamp(30px, 3.6vw, 42px)', lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.015em' }}
                >
                  Bernadette Tobin
                </span>
                <span className="block mt-2" style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8895E', fontWeight: 500 }}>
                  Founder &nbsp;·&nbsp; RGN, MSc
                </span>
                <span className="block w-10 h-px bg-gold mt-4 mb-4" aria-hidden />
                <span className="block" style={{ fontSize: 15, lineHeight: 1.55, color: '#1F1B1A' }}>
                  MSc Advanced Practice
                  <br />
                  NMC registered, 20+ years clinical
                  <br />
                  Accredited aesthetic practitioner
                </span>
              </figcaption>
            </div>
            <div>
              <div className="reveal">
                <h2 className="text-h1 text-charcoal">A different kind of clinic.</h2>
                <p className="text-body-lg mt-8 max-w-[540px]">
                  A small, private clinic on Friars Lane — quiet by design, with a single appointment in the room at a time. No conveyor belt, no hard sell. Every treatment plan begins with a proper consultation, and only goes ahead if it&apos;s genuinely right for you.
                </p>
              </div>
              <ul className="brand-bullets reveal-stagger mt-20">
                <li>Medically led, ethically delivered</li>
                <li>Bespoke treatment planning</li>
                <li>Premium product partners</li>
                <li>Strictly private &mdash; one client at a time</li>
              </ul>
              <div className="mt-10">
                <Link href="/about" className="btn btn-secondary">
                  <span>About Bernadette</span>
                  <span className="btn-arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TREATMENTS */}
      <section style={{ background: '#EFE8E0', padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="section-num reveal mb-6">03 &nbsp; Treatments</div>
          <h2 className="text-h1 text-charcoal reveal max-w-3xl">Signature treatments.</h2>
          <p className="text-body-lg reveal mt-6 max-w-2xl">
            Non-surgical, evidence-based aesthetic treatments. Each one starts with a free consultation so we can plan something that genuinely suits you.
          </p>
          <div className="minimal-grid reveal-stagger mt-14">
            {treatments.slice(0, 6).map((t, i) => (
              <Link key={t.slug} href={t.href} className="minimal-card group">
                <div>
                  <div className="eyebrow mb-2">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="text-h3 text-charcoal mb-1.5">{t.name}</h3>
                  <p className="text-[14px]" style={{ color: '#5C4F44', lineHeight: 1.5 }}>{t.tagline}.</p>
                </div>
                <div className="card-arrow" />
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/treatments" className="btn btn-secondary btn-md:auto">
              <span>View all 10 treatments</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section style={{ padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="section-num reveal mb-6">05 &nbsp; Visit</div>
          <h2 className="text-h1 text-charcoal reveal mb-14">Find us.</h2>
          <div className="reveal-image aspect-[16/9] overflow-hidden mb-14 relative">
            <iframe
              title="Visage Aesthetics, 17A Friars Lane, Braintree"
              src="https://www.openstreetmap.org/export/embed.html?bbox=0.5524%2C51.8844%2C0.5584%2C51.8874&layer=mapnik&marker=51.885914%2C0.555411"
              className="w-full h-full"
              style={{ border: 0, filter: 'grayscale(0.35) contrast(0.95) saturate(0.85)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href="https://maps.google.com/?q=CM7+9BL"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase bg-cream/90 text-charcoal hover:bg-cream"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              Open in Google Maps →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
            <div className="reveal pt-6 border-t" style={{ borderColor: '#D9CDBE' }}>
              <div className="eyebrow mb-3">Address</div>
              <a href="https://maps.google.com/?q=CM7+9BL" className="font-display italic text-charcoal block" style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.4 }}>
                17A Friars Lane<br/>Braintree, Essex<br/>CM7 9BL
              </a>
            </div>
            <div className="reveal pt-6 border-t" style={{ borderColor: '#D9CDBE' }}>
              <div className="eyebrow mb-3">Hours</div>
              <p className="font-display italic text-charcoal" style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.4 }}>
                Strictly by appointment.
                <br />
                Discreet entrance and private parking on site.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
