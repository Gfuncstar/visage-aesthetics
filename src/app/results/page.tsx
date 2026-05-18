import type { Metadata } from 'next'
import BookingCTA from '@/components/sections/BookingCTA'
import ResultsGallery from './ResultsGallery'
import { beforeAfter } from '@/lib/before-after'
import { treatments } from '@/lib/treatments'

const SITE = 'https://www.vaclinic.co.uk'
const PAGE_URL = `${SITE}/results`
const OG_IMAGE = `${SITE}${beforeAfter[0]?.src ?? '/images/og-home.jpg'}`

export const metadata: Metadata = {
  title: 'Before & After Results | Visage Aesthetics, Braintree',
  description:
    'Real before-and-after photographs of treatments performed at Visage Aesthetics, Braintree — anti-wrinkle, dermal filler, lip filler, tear-trough, Profhilo, micro-needling and CryoPen. All photographs taken with full client consent by Bernadette Tobin RGN, MSc. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex.',
  alternates: { canonical: '/results' },
  keywords: [
    'before and after aesthetics essex',
    'lip filler before and after braintree',
    'profhilo before and after essex',
    'tear trough filler before and after',
    'anti-wrinkle before and after braintree',
    'micro-needling before and after essex',
    'cryopen mole removal before and after',
    'visage aesthetics results',
    'nurse-led aesthetics before and after',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Visage Aesthetics',
    title: 'Before & After Results | Visage Aesthetics, Braintree',
    description:
      'Real consented before-and-after photographs of treatments performed at Visage Aesthetics, Braintree, by Bernadette Tobin RGN, MSc.',
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Before and after results at Visage Aesthetics, Braintree' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Before & After Results | Visage Aesthetics, Braintree',
    description: 'Consented before-and-after photographs from a nurse-led clinic in Braintree, Essex.',
    images: [OG_IMAGE],
  },
}

export default function ResultsPage() {
  // ── JSON-LD: ImageGallery wraps each image as ImageObject, with the
  //    creator + provider so Google attributes the images to the clinic.
  //    Each ImageObject points back to the relevant treatment page via
  //    `subjectOf`, which strengthens the topical link sitewide.
  const treatmentHrefBySlug = Object.fromEntries(treatments.map((t) => [t.slug, t.href]))

  const galleryJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Results', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ImageGallery',
        '@id': `${PAGE_URL}#gallery`,
        name: 'Before and After Results — Visage Aesthetics, Braintree',
        description:
          'Real consented before-and-after photographs of non-surgical aesthetic treatments at Visage Aesthetics, performed by Bernadette Tobin RGN, MSc.',
        url: PAGE_URL,
        isPartOf: { '@id': `${SITE}/#website` },
        author: { '@type': 'Person', name: 'Bernadette Tobin', '@id': `${SITE}/#bernadette` },
        publisher: { '@id': `${SITE}/#org` },
        numberOfItems: beforeAfter.length,
        about: Array.from(new Set(beforeAfter.map((b) => b.treatmentSlug))).map((slug) => ({
          '@type': 'MedicalProcedure',
          name: treatments.find((t) => t.slug === slug)?.name ?? slug,
          url: `${SITE}${treatmentHrefBySlug[slug] ?? ''}`,
        })),
        image: beforeAfter.map((b) => ({
          '@type': 'ImageObject',
          '@id': `${PAGE_URL}#${b.id}`,
          contentUrl: `${SITE}${b.src}`,
          url: `${SITE}${b.src}`,
          name: `${b.treatmentLabel} before and after — ${b.caption.replace(/[.!?]$/, '')}`,
          description: b.alt,
          caption: b.caption,
          representativeOfPage: false,
          creditText: 'Visage Aesthetics',
          copyrightNotice: '© Visage Aesthetics. All rights reserved.',
          creator: { '@type': 'Person', name: 'Bernadette Tobin', '@id': `${SITE}/#bernadette` },
          copyrightHolder: { '@id': `${SITE}/#org` },
          acquireLicensePage: PAGE_URL,
          contentLocation: { '@type': 'Place', name: 'Visage Aesthetics, Friars Lane, Braintree' },
          locationCreated: { '@id': `${SITE}/#org` },
          license: PAGE_URL,
          subjectOf: treatmentHrefBySlug[b.treatmentSlug]
            ? { '@type': 'MedicalProcedure', url: `${SITE}${treatmentHrefBySlug[b.treatmentSlug]}` }
            : undefined,
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }} />

      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><a href="/" className="hover:text-gold">Home</a></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Results</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-stone mb-3">Before &amp; After</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Real results. Real clients.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Every photograph here is from a treatment carried out at Visage Aesthetics, Braintree, shared with full client consent. Treatments are performed by Bernadette Tobin RGN, MSc — awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Conservative and natural by intention. Results vary between individuals.
          </p>
        </div>
      </section>

      <section className="py-7 md:py-10" aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">Filterable before and after gallery</h2>
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <ResultsGallery />

          <div className="mt-10 bg-cream-soft border border-gold/30 rounded-md p-5 md:p-6">
            <p className="text-sm text-ink-soft leading-relaxed">
              <strong className="text-charcoal">Disclaimer:</strong> All photographs are taken at Visage Aesthetics with full patient consent. They represent outcomes for specific individuals and cannot be guaranteed for every client. Treatment plans are tailored at consultation and only proceed when clinically appropriate.
            </p>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
