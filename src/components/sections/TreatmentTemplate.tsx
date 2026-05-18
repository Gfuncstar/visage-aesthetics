import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Check, X, Star } from 'lucide-react'
import GoogleG from '@/components/ui/GoogleG'
import Accordion, { type AccordionItem } from '@/components/ui/Accordion'
import BookingCTA from '@/components/sections/BookingCTA'
import VideoBandUSP from '@/components/sections/VideoBandUSP'
import { pickUspVideo } from '@/lib/usp-videos'
import { PRIVACY_FAQ } from '@/lib/privacy-faq'
import { beforeAfterByTreatment } from '@/lib/before-after'
import Watermark from '@/components/ui/Watermark'
import { treatments, type Treatment } from '@/lib/treatments'
import { BOOKING_LINK_PROPS } from '@/lib/booking'
import { geoPages } from '@/lib/geo-pages'
import { getGoogleReviews } from '@/lib/google-reviews'

export type TreatmentImage = { src: string; alt: string; width: number; height: number }

export type TreatmentPageProps = {
  treatment: Treatment
  oneLineBenefit: string
  overview: string
  benefits: string[]
  suitableFor: string[]
  notSuitableFor: string[]
  expect: { before: string; during: string; after: string }
  pricingNote: string
  faqs: AccordionItem[]
  practitionerNote: string
  /** Optional supporting image rendered between Overview and Benefits */
  imageAfterOverview?: TreatmentImage
  /** Optional supporting image rendered between Pricing and FAQ */
  imageAfterPricing?: TreatmentImage
}

export default async function TreatmentTemplate({
  treatment,
  oneLineBenefit,
  overview,
  benefits,
  suitableFor,
  notSuitableFor,
  expect,
  pricingNote,
  faqs,
  practitionerNote,
  imageAfterOverview,
  imageAfterPricing,
}: TreatmentPageProps) {
  const related = treatments.filter((t) => t.slug !== treatment.slug).slice(0, 3)
  const reviews = await getGoogleReviews()
  // Prepend the privacy FAQ so every treatment page leads with the
  // discretion USP, and the FAQPage schema below picks it up too.
  const allFaqs = [PRIVACY_FAQ, ...faqs]

  // Real before/after pairs for this exact treatment, if we have any.
  // Trimmed to 3 for the treatment page so it doesn't dominate the layout —
  // the /results gallery shows the full pool.
  const treatmentResults = beforeAfterByTreatment(treatment.slug).slice(0, 3)

  // Pick a real Google review deterministically per treatment slug, so each
  // page rotates through the verified review pool with the same review
  // pinned to the same treatment build-to-build.
  const reviewIndex = (() => {
    let h = 0
    for (let i = 0; i < treatment.slug.length; i++) h = (h * 31 + treatment.slug.charCodeAt(i)) | 0
    return Math.abs(h) % Math.max(1, reviews.reviews.length)
  })()
  const pulledReview = reviews.reviews[reviewIndex]

  // Geo pages that target this exact treatment family
  const travellingFrom = geoPages.filter((g) => g.treatmentSlug === treatment.slug)

  const provider: Record<string, unknown> = {
    '@type': 'MedicalBusiness',
    name: 'Visage Aesthetics',
    url: 'https://www.vaclinic.co.uk/',
    telephone: '+44 7931 395246',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '17A Friars Lane',
      addressLocality: 'Braintree',
      postalCode: 'CM7 9BL',
      addressCountry: 'GB',
    },
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
          { '@type': 'ListItem', position: 2, name: 'Treatments', item: 'https://www.vaclinic.co.uk/treatments' },
          { '@type': 'ListItem', position: 3, name: treatment.name, item: `https://www.vaclinic.co.uk${treatment.href}` },
        ],
      },
      {
        '@type': 'MedicalProcedure',
        name: treatment.name,
        description: oneLineBenefit,
        howPerformed: overview,
        bodyLocation: 'Face',
        procedureType: 'https://schema.org/NoninvasiveProcedure',
        url: `https://www.vaclinic.co.uk${treatment.href}`,
        image: `https://www.vaclinic.co.uk${treatment.image}`,
        offers: {
          '@type': 'Offer',
          price: treatment.price.replace(/[^\d]/g, ''),
          priceCurrency: 'GBP',
          priceSpecification: { '@type': 'PriceSpecification', price: treatment.price, priceCurrency: 'GBP' },
          availability: 'https://schema.org/InStock',
          url: `https://www.vaclinic.co.uk${treatment.href}`,
        },
        provider,
      },
      {
        '@type': 'Service',
        serviceType: treatment.name,
        name: `${treatment.name} at Visage Aesthetics`,
        description: oneLineBenefit,
        url: `https://www.vaclinic.co.uk${treatment.href}`,
        provider: provider,
        areaServed: [
          { '@type': 'City', name: 'Braintree' },
          { '@type': 'City', name: 'Chelmsford' },
          { '@type': 'City', name: 'Colchester' },
          { '@type': 'AdministrativeArea', name: 'Essex' },
        ],
        offers: {
          '@type': 'Offer',
          price: treatment.price.replace(/[^\d]/g, ''),
          priceCurrency: 'GBP',
          priceSpecification: { '@type': 'PriceSpecification', price: treatment.price, priceCurrency: 'GBP' },
          availability: 'https://schema.org/InStock',
          url: `https://www.vaclinic.co.uk${treatment.href}`,
        },
      },
      allFaqs.length > 0 ? {
        '@type': 'FAQPage',
        mainEntity: allFaqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      } : null,
    ].filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* HERO */}
      <section className="relative bg-cream text-charcoal pt-20 md:pt-24 pb-4 md:pb-8 overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center relative">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li><Link href="/" className="hover:text-gold">Home</Link></li>
                <li aria-hidden className="opacity-40">/</li>
                <li><Link href="/treatments" className="hover:text-gold">Treatments</Link></li>
                <li aria-hidden className="opacity-40">/</li>
                <li aria-current="page" className="text-charcoal/80">{treatment.name}</li>
              </ol>
            </nav>
            <h1 className="font-display italic text-hero text-charcoal">{treatment.name}.</h1>
            <p className="mt-5 text-body-lg text-ink-soft max-w-xl">{oneLineBenefit}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a {...BOOKING_LINK_PROPS} className="btn btn-primary btn-block sm:btn-md:auto">Book free consultation <ArrowUpRight size={16} /></a>
              <span className="btn btn-ghost-dark btn-block sm:btn-md:auto pointer-events-none">
                {treatment.price}
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-md overflow-hidden">
              <Image
                src={treatment.image}
                alt={`${treatment.name} at Visage Aesthetics, Braintree, performed by Bernadette Tobin RGN, MSc`}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO BAND — medical-led USP, clip varies per treatment.
          Placed immediately after the hero so the cinematic CTA sits
          high above the fold on every treatment page. */}
      <VideoBandUSP
        eyebrow={`${treatment.name} at Visage`}
        heading="A medical decision, taken slowly."
        subline={`Your ${treatment.name.toLowerCase()} plan is shaped in a free consultation by a registered nurse with an MSc in Advanced Practice. We only proceed when it's genuinely the right call.`}
        cta={{ label: 'About Bernadette', href: '/about' }}
        desktopSrc={pickUspVideo(treatment.slug)}
        mobileSrc={pickUspVideo(treatment.slug)}
      />

      {/* OVERVIEW */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Overview</div>
            <h2 className="font-display text-h1 text-charcoal">What it is, in plain English.</h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-body-lg text-ink-soft leading-relaxed">{overview}</p>
          </div>
        </div>
      </section>

      {/* OPTIONAL SUPPORTING IMAGE (between Overview and Benefits) */}
      {imageAfterOverview && (
        <section className="pt-2 pb-6 md:pb-9">
          <div className="max-w-[1280px] mx-auto px-5 md:px-8">
            <div className="relative w-full overflow-hidden rounded-md">
              <Image
                src={imageAfterOverview.src}
                alt={imageAfterOverview.alt}
                width={imageAfterOverview.width}
                height={imageAfterOverview.height}
                sizes="(min-width: 1280px) 1200px, 92vw"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS */}
      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Benefits</div>
            <h2 className="font-display text-h1 text-charcoal">Why clients choose it.</h2>
          </div>
          <div className="md:col-span-8">
            <ul className="space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-4 pb-4 border-b border-line/30">
                  <Check size={18} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                  <span className="text-charcoal text-body-lg leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* RECENT RESULTS — real before/after photos for this treatment.
          Modest 2-3 tile strip; full pool sits on /results. */}
      {treatmentResults.length > 0 && (
        <section className="py-6 md:py-9">
          <div className="max-w-[1280px] mx-auto px-5 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
              <div>
                <span className="hairline hairline-left mb-6" />
                <div className="text-eyebrow text-gold mb-3">Recent results</div>
                <h2 className="font-display text-h1 text-charcoal">A look at our work.</h2>
              </div>
              <Link href="/results" className="text-gold hover:text-gold-deep transition-colors self-start md:self-end" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
                Full gallery &nbsp;→
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {treatmentResults.map((b) => {
                const aspect =
                  b.aspect === '4/5' ? 'aspect-[4/5]' :
                  b.aspect === '4/3' ? 'aspect-[4/3]' :
                  b.aspect === '1/1' ? 'aspect-square' : 'aspect-[3/4]'
                return (
                  <figure key={b.src} className="bg-cream-soft border border-line/25 rounded-md overflow-hidden">
                    <div className={`relative w-full ${aspect}`}>
                      <Image
                        src={b.src}
                        alt={`${b.treatmentLabel} before and after at Visage Aesthetics`}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 90vw"
                        className="object-cover"
                      />
                      <span
                        aria-hidden
                        className="absolute top-3 right-3 bg-cream/85 text-charcoal px-2 py-1 rounded-sm"
                        style={{ fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 500, textTransform: 'uppercase' }}
                      >
                        Before / After
                      </span>
                      <Watermark />
                    </div>
                    <figcaption className="p-5">
                      <p className="text-sm text-charcoal leading-snug">{b.caption}</p>
                      <p className="mt-2 text-stone" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
                        {b.treatmentLabel} &nbsp;·&nbsp; Consented
                      </p>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
            <p className="mt-7 text-stone" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              All photographs taken at Visage Aesthetics with full client consent. Results vary between individuals.
            </p>
          </div>
        </section>
      )}

      {/* CLIENT VOICE — real Google review, rotated deterministically per slug. */}
      {pulledReview && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1100px] mx-auto px-5 md:px-8">
            <blockquote className="text-center">
              <span className="block w-10 h-px bg-gold mx-auto mb-7" aria-hidden />
              <div className="inline-flex items-center gap-1 mb-5" aria-label={`${pulledReview.rating} out of 5 stars`}>
                {Array.from({ length: Math.round(pulledReview.rating) }).map((_, i) => (
                  <Star key={i} size={15} strokeWidth={0} className="text-gold" fill="currentColor" />
                ))}
              </div>
              <p className="font-display italic text-charcoal max-w-3xl mx-auto" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', lineHeight: 1.35, fontWeight: 400, letterSpacing: '-0.005em' }}>
                &ldquo;{pulledReview.text}&rdquo;
              </p>
              <footer className="mt-7 inline-flex items-center gap-2 text-eyebrow text-stone">
                <span className="text-charcoal" style={{ fontWeight: 500 }}>{pulledReview.author}</span>
                {pulledReview.relativeTime && <span aria-hidden>&middot;</span>}
                {pulledReview.relativeTime && <span>{pulledReview.relativeTime}</span>}
                <span aria-hidden>&middot;</span>
                <a
                  href={reviews.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-gold-deep transition-colors"
                  aria-label="Read all reviews on Google"
                >
                  <GoogleG size={11} />
                  <span>Verified Google review</span>
                </a>
              </footer>
            </blockquote>
          </div>
        </section>
      )}

      {/* SUITABLE / NOT SUITABLE */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="border border-line/30 rounded-md p-7 md:p-9">
            <div className="text-eyebrow text-gold mb-3">Who it&apos;s for</div>
            <h3 className="font-display text-2xl text-charcoal mb-6">Suitable candidates</h3>
            <ul className="space-y-3">
              {suitableFor.map((s) => (
                <li key={s} className="flex items-start gap-3 text-charcoal">
                  <Check size={16} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                  <span className="text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-cream text-charcoal rounded-md p-7 md:p-9">
            <div className="text-eyebrow text-stone mb-3">Who it&apos;s not for</div>
            <h3 className="font-display text-2xl text-charcoal mb-6">Not suitable if</h3>
            <ul className="space-y-3">
              {notSuitableFor.map((s) => (
                <li key={s} className="flex items-start gap-3 text-ink-soft">
                  <X size={16} strokeWidth={1.75} className="text-stone mt-1 shrink-0" />
                  <span className="text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-12">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">What to expect</div>
            <h2 className="font-display text-h1 text-charcoal">Before, during, and after.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {(['before', 'during', 'after'] as const).map((stage) => (
              <div key={stage} className="bg-cream border border-line/25 rounded-md p-7">
                <div className="text-eyebrow text-gold mb-3 capitalize">{stage}</div>
                <p className="text-charcoal text-body leading-relaxed">{expect[stage]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S DIFFERENT HERE — Visage vs typical high-street comparison */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-10 md:mb-12">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">What&rsquo;s different here</div>
            <h2 className="font-display text-h1 text-charcoal">Why this isn&rsquo;t a high-street treatment.</h2>
          </div>
          <div className="border border-line/30 rounded-md overflow-hidden bg-cream">
            <div className="grid grid-cols-[1fr_1fr] md:grid-cols-[1.4fr_1fr_1fr] divide-x divide-y" style={{ borderColor: '#D9CDBE' }}>
              <div className="hidden md:block px-5 py-3 bg-cream-soft text-eyebrow text-stone">In the room</div>
              <div className="hidden md:block px-5 py-3 bg-cream-soft text-eyebrow text-gold">Visage</div>
              <div className="hidden md:block px-5 py-3 bg-cream-soft text-eyebrow text-stone">Typical high-street clinic</div>
              {([
                { label: 'Who treats you', visage: 'Registered nurse, MSc Advanced Practice', other: 'Often non-medical, lightly trained' },
                { label: 'Consultation', visage: 'Free, 45 min, no deposit, no pressure', other: 'Charged or rushed, deposit up-front' },
                { label: 'Privacy', visage: 'One client at a time, discreet entrance, no shopfront', other: 'Salon chair, foot traffic, walk-ins' },
                { label: 'Plan', visage: 'Evidence-based, declined if not right for you', other: 'Product-led upsell on the day' },
              ]).map((row) => (
                <div key={row.label} className="contents">
                  <div className="px-5 py-4 md:py-5 col-span-2 md:col-span-1 bg-cream-soft md:bg-cream font-display italic text-charcoal" style={{ fontSize: 17, lineHeight: 1.25, fontWeight: 400 }}>
                    {row.label}
                  </div>
                  <div className="px-5 py-4 md:py-5 text-charcoal text-sm leading-relaxed" style={{ background: 'rgba(168, 137, 94, 0.06)' }}>
                    <span className="md:hidden block text-eyebrow text-gold mb-1">Visage</span>
                    {row.visage}
                  </div>
                  <div className="px-5 py-4 md:py-5 text-ink-soft text-sm leading-relaxed">
                    <span className="md:hidden block text-eyebrow text-stone mb-1">Typical clinic</span>
                    {row.other}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-7">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Investment</div>
            <h2 className="font-display text-h1 text-charcoal">{treatment.price}</h2>
            <p className="mt-5 text-body-lg text-ink-soft max-w-xl">{pricingNote}</p>
          </div>
          <div className="md:col-span-5">
            <div className="card-dark text-charcoal">
              <div className="text-eyebrow text-stone mb-3">Free consultation</div>
              <p className="text-body text-ink-soft mb-6">
                Every treatment begins with a no-obligation consultation. We talk through your goals, your medical history and what&apos;s realistic, before any decision is made.
              </p>
              <a {...BOOKING_LINK_PROPS} className="btn btn-primary btn-block">Book free consultation <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* OPTIONAL SUPPORTING IMAGE (between Pricing and FAQ) */}
      {imageAfterPricing && (
        <section className="py-6 md:py-9">
          <div className="max-w-[1280px] mx-auto px-5 md:px-8">
            <div className="relative w-full overflow-hidden rounded-md">
              <Image
                src={imageAfterPricing.src}
                alt={imageAfterPricing.alt}
                width={imageAfterPricing.width}
                height={imageAfterPricing.height}
                sizes="(min-width: 1280px) 1200px, 92vw"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Questions</div>
            <h2 className="font-display text-h1 text-charcoal">{treatment.name} FAQs.</h2>
          </div>
          <div className="md:col-span-8">
            <Accordion items={allFaqs} defaultOpen={0} />
          </div>
        </div>
      </section>

      {/* TRAVELLING FROM — geo landing pages for this treatment */}
      {travellingFrom.length > 0 && (
        <section className="py-6 md:py-9">
          <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-4">
              <span className="hairline hairline-left mb-6" />
              <div className="text-eyebrow text-gold mb-3">Travelling from?</div>
              <h2 className="font-display text-h1 text-charcoal">{treatment.name} by town.</h2>
              <p className="mt-5 text-body text-ink-soft max-w-sm">
                Town-specific pages with travel times, postcodes, surrounding-area lists and local FAQs.
              </p>
            </div>
            <div className="md:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-line/30 border border-line/30">
                {travellingFrom.map((g) => (
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
          </div>
        </section>
      )}

      {/* BERNADETTE'S NOTE */}
      <section className="py-6 md:py-9">
        <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
          <span className="hairline mb-8 inline-block" />
          <div className="text-eyebrow text-gold mb-3">A note from Bernadette</div>
          <blockquote className="font-display italic text-h2 text-charcoal leading-snug">
            &ldquo;{practitionerNote}&rdquo;
          </blockquote>
          <p className="mt-6 text-eyebrow text-ink-soft">Bernadette Tobin · RN, MSc</p>
        </div>
      </section>

      {/* RELATED */}
      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">
            <div>
              <span className="hairline hairline-left mb-6" />
              <div className="text-eyebrow text-gold mb-3">Related treatments</div>
              <h2 className="font-display text-h1 text-charcoal">You might also consider.</h2>
            </div>
            <Link href="/treatments" className="hidden md:inline-flex btn btn-ghost-light">
              All treatments <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {related.map((r) => (
              <Link key={r.slug} href={r.href} className="group bg-cream border border-line/25 rounded-md overflow-hidden hover:border-gold/60 transition-colors">
                <div className="relative aspect-[4/3]">
                  <Image src={r.image} alt={`${r.name} treatment at Visage Aesthetics, Braintree`} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover" />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-display text-xl text-charcoal">{r.name}</h3>
                  <p className="text-eyebrow text-gold mt-1">{r.tagline}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-ink-soft">{r.price}</span>
                    <ArrowUpRight size={16} strokeWidth={1.5} className="text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
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
