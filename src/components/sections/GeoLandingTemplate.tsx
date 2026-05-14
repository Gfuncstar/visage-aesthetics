import Link from 'next/link'
import { ArrowUpRight, Check, MapPin, Award as AwardIcon } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { BOOKING_LINK_PROPS } from '@/lib/booking'
import { geoPages } from '@/lib/geo-pages'
import { getGoogleReviews } from '@/lib/google-reviews'
import { AWARD } from '@/lib/award'

export type GeoLandingProps = {
  /** URL slug, used in canonicals and breadcrumbs */
  slug: string
  /** Town this landing page targets, e.g. "Braintree" */
  town: string
  /** Treatment focus, usually "Botox" or "Anti-Wrinkle Injections" */
  treatment: string
  /** Distance/travel summary, e.g. "Less than 1 mile away" */
  travel: string
  /** A line about why locals choose Visage */
  positioningLine: string
  /** Three short reasons to come to Visage from this town */
  reasons: { title: string; body: string }[]
  /** Two-line price summary used in hero, e.g. "From £150 / 1 area" */
  priceFrom: string
  /** ISO postcode area (e.g. "CM7 9BL") */
  postcode: string
  /** Treatment hub link (where deeper info lives) */
  treatmentHref: string
  /** Local FAQs */
  faqs: { question: string; answer: string }[]
  /** Surrounding villages / districts to show as 'serving' */
  alsoServes: string[]
}

export default async function GeoLandingTemplate({
  slug, town, treatment, travel, positioningLine, reasons, priceFrom, postcode, treatmentHref, faqs, alsoServes,
}: GeoLandingProps) {
  const url = `https://www.vaclinic.co.uk/${slug}`
  const reviews = await getGoogleReviews()

  // Lateral links: same treatment family, different towns
  const currentEntry = geoPages.find((g) => g.slug === slug)
  const lateralTowns = currentEntry
    ? geoPages.filter((g) => g.treatmentSlug === currentEntry.treatmentSlug && g.slug !== slug)
    : []

  const provider: Record<string, unknown> = {
    '@type': 'MedicalBusiness',
    name: 'Visage Aesthetics',
    url: 'https://www.vaclinic.co.uk/',
    telephone: '+44 7931 395246',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '17A Friars Lane',
      addressLocality: 'Braintree',
      addressRegion: 'Essex',
      postalCode: 'CM7 9BL',
      addressCountry: 'GB',
    },
    areaServed: { '@type': 'City', name: town },
  }
  if (reviews.live && reviews.total > 0) {
    provider.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviews.rating.toFixed(1),
      reviewCount: reviews.total,
      bestRating: '5',
      worstRating: '1',
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
          { '@type': 'ListItem', position: 2, name: `${treatment} ${town}`, item: url },
        ],
      },
      {
        '@type': 'MedicalProcedure',
        name: `${treatment} in ${town}`,
        description: `${treatment} for clients in ${town}, performed by Bernadette Tobin RGN, MSc at Visage Aesthetics.`,
        bodyLocation: 'Face',
        procedureType: 'https://schema.org/NoninvasiveProcedure',
        url,
        provider,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="relative bg-cream text-charcoal pt-20 md:pt-24 pb-6 md:pb-10 overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li><Link href="/" className="hover:text-gold">Home</Link></li>
                <li aria-hidden className="opacity-40">/</li>
                <li aria-current="page" className="text-charcoal/80">{treatment} {town}</li>
              </ol>
            </nav>
            <div className="text-eyebrow text-gold mb-3 inline-flex items-center gap-2">
              <MapPin size={12} /> Winner · Best Non-Surgical Aesthetics Clinic 2026, Essex
            </div>
            <h1 className="font-display italic text-hero text-charcoal">{treatment} in {town}.</h1>
            <p className="mt-5 text-body-lg text-ink-soft max-w-xl">{positioningLine}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a {...BOOKING_LINK_PROPS} className="btn btn-primary btn-block sm:btn-md:auto">
                Book free consultation <ArrowUpRight size={16} />
              </a>
              <span className="btn btn-ghost-dark btn-block sm:btn-md:auto pointer-events-none">{priceFrom}</span>
            </div>
            <Link
              href={AWARD.detailPath}
              className="mt-6 inline-flex items-center gap-2 text-gold hover:text-gold-deep transition-colors group"
              style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
            >
              <AwardIcon size={13} strokeWidth={1.5} />
              <span className="border-b border-transparent group-hover:border-current pb-0.5 transition-colors">
                Officially awarded · Best Non-Surgical Aesthetics Clinic 2026, Essex
              </span>
            </Link>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-line/30 rounded-md p-7 bg-cream-soft">
              <div className="text-eyebrow text-gold mb-2">Travel time</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.2 }}>{travel}</div>
              <span className="block w-12 h-px bg-gold my-5" />
              <div className="text-eyebrow text-stone mb-2">Clinic address</div>
              <a href="https://maps.google.com/?q=CM7+9BL" target="_blank" rel="noopener noreferrer" className="font-display italic text-charcoal hover:text-gold transition-colors block" style={{ fontSize: 18, lineHeight: 1.4 }}>
                17A Friars Lane<br/>Braintree, Essex {postcode}
              </a>
              <p className="mt-5 text-stone text-[13px]">Discreet entrance, free on-site parking. Strictly by appointment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY VISAGE FOR THIS TOWN */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">Why clients in {town} choose Visage</div>
          <h2 className="font-display text-h1 text-charcoal max-w-2xl">A quieter alternative.</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {reasons.map((r) => (
              <div key={r.title} className="border border-line/30 rounded-md p-7 bg-cream">
                <Check size={20} strokeWidth={1.5} className="text-gold mb-4" />
                <h3 className="font-display italic text-charcoal" style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 500 }}>{r.title}</h3>
                <p className="mt-3 text-body text-ink-soft leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREDENTIALS / EEAT BLOCK */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Performed by</div>
            <h2 className="font-display text-h1 text-charcoal">Bernadette Tobin.</h2>
            <p className="mt-4 text-body-lg text-ink-soft">RGN · MSc Advanced Practice (Level 7)</p>
          </div>
          <div className="md:col-span-7 space-y-4 text-body-lg text-ink-soft leading-relaxed">
            <p>
              Aesthetics in the UK remains an unregulated industry, anyone can legally inject. {town} clients
              who want medical reassurance choose Visage because every treatment is performed by a registered
              nurse with two decades of clinical experience and the highest postgraduate nursing qualification
              available (MSc, Level 7).
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
              <li className="flex items-start gap-2"><Check size={16} className="text-gold mt-1 shrink-0" /> NMC PIN 05G1755E</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-gold mt-1 shrink-0" /> MSc Advanced Practice</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-gold mt-1 shrink-0" /> Royal College of Nursing</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-gold mt-1 shrink-0" /> 20+ years clinical experience</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-gold mt-1 shrink-0" /> Best Non-Surgical Aesthetics Clinic 2026, Essex</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-gold mt-1 shrink-0" /> Full medical indemnity insured</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-6 md:py-9">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">{town} FAQs</div>
          <h2 className="font-display text-h1 text-charcoal mb-10">Common questions.</h2>
          <div className="grid gap-px bg-line/40 border border-line/40">
            {faqs.map((f) => (
              <details key={f.question} className="group bg-cream open:bg-cream-soft transition-colors">
                <summary className="cursor-pointer flex items-start justify-between gap-4 p-5 md:p-7 list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-display italic text-charcoal" style={{ fontSize: 20, lineHeight: 1.3, fontWeight: 500 }}>{f.question}</span>
                  <span className="text-gold text-[20px] mt-1 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-7 md:px-7 md:pb-8 text-body text-ink-soft leading-relaxed max-w-prose">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* AREAS SERVED */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 text-center">
          <div className="text-eyebrow text-gold mb-3">Also serving</div>
          <h2 className="font-display text-h2 text-charcoal mb-6">Clients travel to Friars Lane from across the county.</h2>
          <p className="text-body-lg text-ink-soft max-w-2xl mx-auto">
            {alsoServes.join(' · ')}
          </p>
          <div className="mt-8">
            <Link href={treatmentHref} className="btn btn-secondary btn-md:auto">
              <span>Full {treatment.toLowerCase()} information</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SAME TREATMENT, OTHER TOWNS — lateral geo links */}
      {lateralTowns.length > 0 && (
        <section className="py-6 md:py-9">
          <div className="max-w-[1100px] mx-auto px-5 md:px-8">
            <div className="text-eyebrow text-gold mb-3">{treatment} for other towns</div>
            <h2 className="font-display text-h2 text-charcoal mb-8">{treatment} pages by location.</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-line/30 border border-line/30">
              {lateralTowns.map((g) => (
                <Link
                  key={g.slug}
                  href={g.href}
                  className="bg-cream hover:bg-cream-soft transition-colors p-5 md:p-6 group"
                >
                  <div className="font-display text-charcoal" style={{ fontSize: 18, lineHeight: 1.25, fontWeight: 400 }}>
                    {g.anchor}
                  </div>
                  <div className="mt-2 text-stone" style={{ fontSize: 12, lineHeight: 1.4 }}>{g.travelLine}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <BookingCTA />
    </>
  )
}
