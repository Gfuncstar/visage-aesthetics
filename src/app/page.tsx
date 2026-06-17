import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollScrubHero from '@/components/sections/ScrollScrubHero'
import BookingCTA from '@/components/sections/BookingCTA'
import GoogleReviews from '@/components/sections/GoogleReviews'
import VideoBandUSP from '@/components/sections/VideoBandUSP'
import Accordion from '@/components/ui/Accordion'
import Image from 'next/image'
import Watermark from '@/components/ui/Watermark'
import { treatments } from '@/lib/treatments'
import { getGoogleReviews } from '@/lib/google-reviews'
import { SAME_AS } from '@/lib/clinic'
import { BOOKING_URL } from '@/lib/booking'
import { beforeAfterByIds } from '@/lib/before-after'

export const metadata: Metadata = {
  title: 'Visage Aesthetics | Winner — Best Non-Surgical Clinic 2026, Essex',
  description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards). Private, discreet nurse-led clinic on Friars Lane, Braintree — no signage, private parking, one client at a time. Botox, filler and Profhilo by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Free consultation, strictly by appointment.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.vaclinic.co.uk/',
    siteName: 'Visage Aesthetics',
    title: 'Visage Aesthetics | Winner — Best Non-Surgical Clinic 2026, Essex',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Private, discreet nurse-led clinic on Friars Lane, Braintree — no signage, private parking, one client at a time.',
    images: [{ url: '/images/og-home.jpg', width: 1200, height: 630, alt: 'Visage Aesthetics, Awarded Best Non-Surgical Clinic Essex 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visage Aesthetics | Winner — Best Non-Surgical Clinic 2026, Essex',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Private, discreet nurse-led clinic — no signage, one client at a time.',
    images: ['/images/og-home.jpg'],
  },
}

// Hand-picked before/afters for the homepage Results strip. Add or
// swap ids here when fresh photos land — the catalogue lives in
// src/lib/before-after.ts.
const HOMEPAGE_RESULTS_IDS = ['profhilo-01-jawline', 'anti-wrinkle-01', 'lip-filler-02'] as const
// IDs that should only appear on mobile (hidden at md+). Keep desktop
// layout balanced — currently the lip filler quality isn't quite the
// standard the bigger desktop frames deserve.
const MOBILE_ONLY_RESULT_IDS: ReadonlySet<string> = new Set(['lip-filler-02'])

export default async function Home() {
  const reviews = await getGoogleReviews()
  const homeResults = beforeAfterByIds(HOMEPAGE_RESULTS_IDS)

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.vaclinic.co.uk/#website',
        url: 'https://www.vaclinic.co.uk/',
        name: 'Visage Aesthetics',
        alternateName: ['Visage Aesthetics Braintree', 'VA Clinic'],
        publisher: { '@id': 'https://www.vaclinic.co.uk/#org' },
        inLanguage: 'en-GB',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.vaclinic.co.uk/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
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
        medicalSpecialty: 'Aesthetic Medicine',
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
        openingHoursSpecification: [{
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '18:00',
          description: 'Strictly by appointment',
        }],
        sameAs: SAME_AS,
        hasMap: 'https://maps.google.com/?q=CM7+9BL',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'Reservations',
            url: BOOKING_URL,
            areaServed: 'GB',
            availableLanguage: 'en',
          },
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: '+44 7931 395246',
            email: 'info@vaclinic.co.uk',
            areaServed: 'GB',
            availableLanguage: 'en',
          },
        ],
        location: {
          '@type': 'Place',
          name: 'Visage Aesthetics, Friars Lane',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '17A Friars Lane',
            addressLocality: 'Braintree',
            addressRegion: 'Essex',
            postalCode: 'CM7 9BL',
            addressCountry: 'GB',
          },
          geo: { '@type': 'GeoCoordinates', latitude: 51.885914, longitude: 0.555411 },
          hasMap: 'https://maps.google.com/?q=CM7+9BL',
        },
        award: [
          'Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)',
          'Educator of the Year 2026, Nominee (Beauty & Aesthetics Awards)',
        ],
        founder: {
          '@type': 'Person',
          '@id': 'https://www.vaclinic.co.uk/#bernadette',
          name: 'Bernadette Tobin',
          jobTitle: 'Founder & Lead Practitioner',
          honorificSuffix: 'RGN, MSc',
          worksFor: { '@id': 'https://www.vaclinic.co.uk/#org' },
          hasCredential: [
            { '@type': 'EducationalOccupationalCredential', credentialCategory: 'professional registration', name: 'NMC Registered Nurse', identifier: '05G1755E' },
            { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'MSc Advanced Practice (Level 7)' },
          ],
          award: [
            'Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)',
            'Educator of the Year 2026, Nominee (Beauty & Aesthetics Awards)',
          ],
        },
        ...(reviews.total > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: reviews.rating.toFixed(1),
                reviewCount: reviews.total,
                bestRating: '5',
                worstRating: '1',
              },
              review: reviews.reviews.slice(0, 3).map((r) => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: r.author },
                reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
                reviewBody: r.text,
                itemReviewed: { '@id': 'https://www.vaclinic.co.uk/#org' },
              })),
            }
          : {}),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Visage Aesthetics treatment menu',
          itemListElement: treatments.map((t) => {
            const numericPrice = t.price.replace(/[^\d]/g, '')
            return {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: t.name,
                description: t.tagline,
                url: `https://www.vaclinic.co.uk${t.href}`,
                procedureType: 'https://schema.org/NoninvasiveProcedure',
              },
              ...(numericPrice
                ? {
                    price: numericPrice,
                    priceSpecification: { '@type': 'PriceSpecification', price: t.price, priceCurrency: 'GBP' },
                  }
                : {}),
              priceCurrency: 'GBP',
              url: `https://www.vaclinic.co.uk${t.href}`,
              availability: 'https://schema.org/InStock',
            }
          }),
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <ScrollScrubHero />

      {/* GOOGLE REVIEWS, replaces the founder Vision section */}
      <GoogleReviews />

      {/* APPROACH */}
      <div style={{ paddingTop: 'var(--section-y)' }}>
        <div className="max-w-[1280px] mx-auto" style={{ paddingLeft: 'var(--pad-x)', paddingRight: 'var(--pad-x)' }}>
          <div className="section-num reveal mb-10">02 &nbsp; Approach</div>
        </div>
      </div>

      <VideoBandUSP
        eyebrow="Founder · RGN, MSc"
        heading="Bernadette Tobin."
        subline="MSc Advanced Practice. NMC registered, 20+ years clinical. Accredited aesthetic practitioner."
        cta={{ label: 'About Bernadette', href: '/about' }}
        desktopSrc="/video/approach.mp4"
        mobileSrc="/video/approach.mp4"
      />

      <section style={{ padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-5">
              <h2 className="text-h1 text-charcoal reveal">A different kind of clinic.</h2>
            </div>
            <div className="md:col-span-7 reveal">
              <p className="text-body-lg">
                A small, private clinic on Friars Lane, quiet by design, with a single appointment in the room at a time. No conveyor belt, no hard sell. Every treatment plan begins with a proper consultation, and only goes ahead if it&apos;s genuinely right for you.
              </p>
              <ul className="brand-bullets reveal-stagger mt-10">
                <li>Medically led, ethically delivered</li>
                <li>Bespoke treatment planning</li>
                <li>Premium product partners</li>
                <li>Strictly private , one client at a time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AWARD VIDEO BAND */}
      <VideoBandUSP
        eyebrow="Officially recognised"
        heading="Best Non-Surgical Aesthetics Clinic 2026, Essex."
        subline="Awarded by the Health, Beauty &amp; Wellness Awards. A private, nurse-led clinic on Friars Lane, Braintree, strictly by appointment."
        cta={{ label: 'See the award', href: '/awards/best-non-surgical-clinic-essex-2026' }}
        desktopSrc="/video/usp/imagine-f16e4fcd.mp4"
        mobileSrc="/video/usp/imagine-f16e4fcd.mp4"
      />

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
                  <div className="mt-3 text-gold" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>{t.price}</div>
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

      {/* RESULTS — hand-picked before/afters. Swap IDs in HOMEPAGE_RESULTS_IDS above. */}
      {homeResults.length > 0 && (
        <section style={{ padding: 'var(--section-y) var(--pad-x)' }}>
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-14">
              <div>
                <div className="section-num reveal mb-6">04 &nbsp; Results</div>
                <h2 className="text-h1 text-charcoal reveal max-w-2xl">A small selection.</h2>
                <p className="text-body-lg reveal mt-6 max-w-xl">
                  Real client photographs, taken at Visage Aesthetics with full consent. Conservative and natural, by intention.
                </p>
              </div>
              <Link
                href="/results"
                className="text-gold hover:text-gold-deep transition-colors self-start md:self-end"
                style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
              >
                Full gallery &nbsp;→
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6 reveal-stagger">
              {homeResults.map((b) => {
                const aspect =
                  b.aspect === '4/5' ? 'aspect-[4/5]' :
                  b.aspect === '4/3' ? 'aspect-[4/3]' :
                  b.aspect === '1/1' ? 'aspect-square' : 'aspect-[3/4]'
                const treatmentHref = treatments.find((t) => t.slug === b.treatmentSlug)?.href
                const mobileOnly = MOBILE_ONLY_RESULT_IDS.has(b.id)
                const tile = (
                  <figure className="bg-cream-soft border border-line/25 rounded-md overflow-hidden h-full flex flex-col group-hover:border-gold/60 transition-colors">
                    <div className={`relative w-full ${aspect}`}>
                      <Image
                        src={b.src}
                        alt={b.alt}
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
                      <Watermark />
                    </div>
                    <figcaption className="p-5 flex-1 flex flex-col">
                      <p className="text-sm text-charcoal leading-snug">{b.caption}</p>
                      <p className="mt-2 text-stone" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
                        Photographed at Visage &nbsp;·&nbsp; Consented
                      </p>
                      {treatmentHref && (
                        <span
                          className="mt-3 inline-flex items-center gap-1.5 text-gold group-hover:text-gold-deep transition-colors"
                          style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
                        >
                          Read about {b.treatmentLabel.toLowerCase()} <span aria-hidden>→</span>
                        </span>
                      )}
                    </figcaption>
                  </figure>
                )
                const visibilityClass = mobileOnly ? 'md:hidden' : ''
                return treatmentHref ? (
                  <Link
                    key={b.id}
                    href={treatmentHref}
                    aria-label={`${b.alt} Read about ${b.treatmentLabel}.`}
                    className={`block group focus:outline-none focus:ring-2 focus:ring-gold rounded-md ${visibilityClass}`}
                  >
                    {tile}
                  </Link>
                ) : (
                  <div key={b.id} className={`group ${visibilityClass}`}>{tile}</div>
                )
              })}
            </div>
            <p className="mt-8 text-stone" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              All photographs taken at Visage Aesthetics with full client consent. Results vary between individuals.
            </p>
          </div>
        </section>
      )}

      {/* VISIT — privacy band leads, map + address follow */}
      <div style={{ paddingTop: 'var(--section-y)' }}>
        <div className="max-w-[1280px] mx-auto" style={{ paddingLeft: 'var(--pad-x)', paddingRight: 'var(--pad-x)' }}>
          <div className="section-num reveal mb-10">05 &nbsp; Visit</div>
        </div>
      </div>

      <VideoBandUSP
        eyebrow="Privacy by design"
        heading="Off-street. Off-camera. Out of sight."
        subline="No signage on the building. Behind electric gates, with private parking set back from Friars Lane and out of view. You walk in through a discreet entrance &mdash; and there&rsquo;s never another client in the clinic at the same time."
        desktopSrc="/video/usp/imagine-f8fd119c.mp4"
        mobileSrc="/video/usp/imagine-f8fd119c.mp4"
      />

      <section style={{ padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
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

      {/* WHERE WE TREAT — single line referring to the /locations hub */}
      <section style={{ padding: 'calc(var(--section-y) * 0.4) var(--pad-x)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-4 reveal">
            <div className="flex items-baseline gap-4">
              <span className="section-num" style={{ marginBottom: 0 }}>06 &nbsp; Where we treat</span>
            </div>
            <p className="text-stone text-[13px] leading-relaxed max-w-xl">
              On Friars Lane, central Braintree. Clients travel from Braintree, Chelmsford,
              Halstead, Witham, Colchester, Maldon, Sudbury, Great Dunmow and across Essex.{' '}
              <Link href="/locations" className="text-gold hover:text-gold-deep border-b border-current pb-0.5 transition-colors whitespace-nowrap">
                See all locations →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* WHY NURSE-LED MATTERS */}
      <section style={{ background: '#EFE8E0', padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="section-num reveal mb-12">07 &nbsp; Why nurse-led matters</div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-5">
              <h2 className="text-h1 text-charcoal reveal">The training behind the treatment.</h2>
            </div>
            <div className="md:col-span-7 reveal">
              <p className="text-body-lg">
                Aesthetics is a medical field, even when the results look soft and natural. A registered nurse with an MSc in Advanced Practice has spent years inside the NHS before ever picking up a needle for cosmetic work. That means a deep understanding of anatomy, pharmacology, infection control, and how to manage the rare moments when something needs careful clinical judgement.
              </p>
              <p className="text-body-lg mt-6">
                I am NMC registered and accountable to a regulator. My training is Level 7, the same academic level as a master&apos;s degree, with assessed clinical practice. Non-medical practitioners, however skilled with a needle, do not work to the same framework.
              </p>
              <p className="text-body-lg mt-6">
                It shows in the small things. A proper medical history. Honest conversations about what a product can and cannot do. Knowing when to recommend a treatment, and just as importantly, when to recommend nothing at all.
              </p>
              <p className="text-body-lg mt-6">
                You are not buying a syringe of filler. You are buying the years of clinical experience that sit behind the decision to use it, or not.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* YOUR FIRST CONSULTATION */}
      <section style={{ padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="section-num reveal mb-12">08 &nbsp; Your first consultation</div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-5">
              <h2 className="text-h1 text-charcoal reveal">Calm, unhurried, no pressure.</h2>
            </div>
            <div className="md:col-span-7 reveal">
              <p className="text-body-lg">
                Every new client begins with a free consultation. It runs for around forty-five minutes, in the treatment room, with the door closed and the diary blocked off. There is only one appointment in the clinic at a time, so the space is yours.
              </p>
              <p className="text-body-lg mt-6">
                We start with a chat. What you have noticed, what you would like to soften or refresh, and what you absolutely do not want to change. Photographs are taken in good light, with your permission, so we can look at your face properly together.
              </p>
              <p className="text-body-lg mt-6">
                I&apos;ll then talk you through what is realistic. Sometimes that means a single, small treatment. Sometimes it means a plan staged over a few months. Sometimes it means skincare first, and a return visit in the new year.
              </p>
              <p className="text-body-lg mt-6">
                You are never asked to decide on the day. There is no upsell, no countdown, no booking pressure. You leave with a written plan and a price, and you take whatever time you need.
              </p>
              <p className="text-body-lg mt-6">
                If it is not the right fit, we will say so. That is the point of the consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#EFE8E0', padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="section-num reveal mb-12">09 &nbsp; FAQ</div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-5">
              <h2 className="text-h1 text-charcoal reveal">The questions we hear most often.</h2>
            </div>
            <div className="md:col-span-7 reveal">
              <Accordion
                defaultOpen={0}
                items={[
                  {
                    question: 'Will anyone see me arriving?',
                    answer:
                      "No. I deliberately designed the clinic this way. We sit back from Friars Lane, behind electric gates, with private parking entirely out of view from the road — your car can't be seen from the street. There is no signage on the building, no shopfront, no waiting room window. You walk straight through a discreet entrance, the door closes behind you, and you are the only client in the clinic. Many of my clients tell me Visage is the most private clinic they have ever used. That is by design, not by accident.",
                  },
                  {
                    question: 'How much does treatment cost?',
                    answer:
                      "Prices start at £80 for micro-needling and £110 for dermal filler, and you can see the full list on the Prices page. The consultation is always free. I will never pressure you to book on the day, and you will always be quoted in writing before anything is decided. If something is not worth the money for you, I will tell you.",
                  },
                  {
                    question: 'Does it hurt?',
                    answer:
                      "Most of my clients describe it as a small, brief pinch. I use topical numbing cream for filler work, and the products themselves contain a local anaesthetic. Anti-wrinkle injections use a very fine needle and are usually finished in a few minutes. If you are particularly anxious about needles, tell me at consultation and we will plan around it.",
                  },
                  {
                    question: 'What is the recovery like?',
                    answer:
                      "Plan for a quiet evening. Tiny pinpricks, mild swelling and the occasional bruise are normal for twenty-four to forty-eight hours. Most of my clients are back at work the next day, with light makeup if they prefer. I send you home with proper written aftercare, and you can WhatsApp me directly if anything is worrying you.",
                  },
                  {
                    question: 'When will I see results?',
                    answer:
                      "Filler is visible immediately and settles fully over about two weeks. Anti-wrinkle injections take three to fourteen days to reach their full effect. Profhilo and skin treatments build gradually over four to eight weeks. I prefer slow, conservative results that no one else can quite put their finger on.",
                  },
                  {
                    question: 'Who is not suitable?',
                    answer:
                      "If you are under 18, I will not treat you. If you are pregnant or breastfeeding, I will not treat you. There is no negotiation on that, and I would rather you knew it now than after a deposit. I also decline to treat clients with certain active skin or autoimmune conditions. If a treatment is not right for you on the day, I will say so at consultation. That is the whole point of the consultation.",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <BookingCTA sectionNumber="10" />
    </>
  )
}
