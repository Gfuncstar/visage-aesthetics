import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'Compare Aesthetic Treatments | Visage Aesthetics, Braintree',
  description: 'Side-by-side comparisons of common aesthetic treatments: Botox vs filler, Profhilo vs dermal filler, Botox vs Profhilo. Honest guidance from an awarded nurse-led clinic, Bernadette Tobin RGN, MSc.',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: 'Compare Aesthetic Treatments | Visage Aesthetics',
    description: 'Side-by-side comparisons of common aesthetic treatments from an awarded nurse-led clinic.',
    url: 'https://www.vaclinic.co.uk/compare',
  },
}

const comparisons = [
  {
    slug: 'botox-vs-filler',
    title: 'Botox vs Dermal Filler',
    summary: 'They are both injectable. They do completely different jobs. Which one (if either) is the right answer for you.',
  },
  {
    slug: 'profhilo-vs-dermal-filler',
    title: 'Profhilo vs Dermal Filler',
    summary: 'Both contain hyaluronic acid. Only one adds volume. A clear, jargon-free guide to choosing between skin quality and structural change.',
  },
  {
    slug: 'botox-vs-profhilo',
    title: 'Botox vs Profhilo',
    summary: 'Botox relaxes muscles. Profhilo improves skin quality. Different treatments, different problems, sometimes both together.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.vaclinic.co.uk/compare' },
      ],
    },
    {
      '@type': 'CollectionPage',
      name: 'Treatment comparisons',
      url: 'https://www.vaclinic.co.uk/compare',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: comparisons.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://www.vaclinic.co.uk/compare/${c.slug}`,
          name: c.title,
        })),
      },
    },
  ],
}

export default function ComparePage() {
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
              <li aria-current="page" className="text-charcoal/80">Compare</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-gold mb-3">Side-by-side</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            Compare aesthetic treatments.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Honest, jargon-free side-by-sides of common aesthetic treatments. The aim is to help
            you arrive at consultation with the right question, not the wrong product in mind.
          </p>
        </div>
      </section>

      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group block border border-line/30 hover:border-gold/60 transition-colors rounded-md p-7 md:p-9 bg-cream-soft"
              >
                <div className="text-eyebrow text-gold mb-3">Comparison</div>
                <h2 className="font-display italic text-charcoal" style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 500 }}>
                  {c.title}
                </h2>
                <p className="mt-4 text-body text-ink-soft leading-relaxed">{c.summary}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-gold">
                  <span className="text-[12px] tracking-[0.18em] uppercase font-medium border-b border-transparent group-hover:border-current pb-0.5 transition-colors">
                    Read comparison
                  </span>
                  <ArrowUpRight size={14} />
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
