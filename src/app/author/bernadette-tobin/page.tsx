import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { blogPostsByDate } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Bernadette Tobin RGN, MSc, Author Profile & Articles',
  description: "Bernadette Tobin: registered nurse, MSc Advanced Practice (Level 7), founder of Visage Aesthetics. NMC PIN 05G1755E. Best Non-Surgical Aesthetics Clinic 2026, Essex. Educator of the Year 2026 nominee. All published articles in one place.",
  alternates: { canonical: '/author/bernadette-tobin' },
  openGraph: {
    title: 'Bernadette Tobin RGN, MSc, Author Profile',
    description: 'Officially awarded aesthetic nurse, MSc Advanced Practice, NMC PIN 05G1755E. All articles by Bernadette in one place.',
    url: 'https://www.vaclinic.co.uk/author/bernadette-tobin',
  },
}

const SITE = 'https://www.vaclinic.co.uk'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Author', item: `${SITE}/author/bernadette-tobin` },
        { '@type': 'ListItem', position: 3, name: 'Bernadette Tobin', item: `${SITE}/author/bernadette-tobin` },
      ],
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE}/author/bernadette-tobin#profile`,
      url: `${SITE}/author/bernadette-tobin`,
      name: 'Bernadette Tobin RGN, MSc',
      mainEntity: {
        '@type': 'Person',
        '@id': `${SITE}/author/bernadette-tobin#person`,
        name: 'Bernadette Tobin',
        givenName: 'Bernadette',
        familyName: 'Tobin',
        jobTitle: 'Registered Nurse, MSc Advanced Practice',
        description:
          'Registered Nurse (NMC PIN 05G1755E) with MSc Advanced Practice (Level 7) and 20+ years clinical experience. Founder of Visage Aesthetics, Braintree, Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards). Educator of the Year 2026, Nominee (Beauty & Aesthetics Awards).',
        url: `${SITE}/author/bernadette-tobin`,
        image: `${SITE}/images/bernadette-portrait.jpg`,
        identifier: [{ '@type': 'PropertyValue', propertyID: 'NMC PIN', value: '05G1755E' }],
        memberOf: [
          { '@type': 'Organization', name: 'Nursing and Midwifery Council', url: 'https://www.nmc.org.uk/' },
          { '@type': 'Organization', name: 'Royal College of Nursing', url: 'https://www.rcn.org.uk/' },
        ],
        hasCredential: [
          { '@type': 'EducationalOccupationalCredential', credentialCategory: 'professional registration', name: 'NMC Registered Nurse', identifier: '05G1755E' },
          { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'MSc Advanced Practice (Level 7)' },
        ],
        award: [
          'Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)',
          'Educator of the Year 2026, Nominee (Beauty & Aesthetics Awards)',
        ],
        worksFor: {
          '@type': 'MedicalBusiness',
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
        knowsAbout: [
          'Aesthetic medicine',
          'Anti-wrinkle injections',
          'Dermal filler',
          'Profhilo',
          'HarmonyCa',
          'Micro-needling',
          'AQUALYX',
          'Hyperhidrosis treatment',
          'Advanced clinical practice',
          'Nurse-led aesthetics',
        ],
      },
    },
    {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: blogPostsByDate.length,
      itemListElement: blogPostsByDate.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  ],
}

const FORMAT_DATE = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default function AuthorPage() {
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
              <li><Link href="/blog" className="hover:text-gold">Blog</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Bernadette Tobin</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-gold mb-3">Author profile</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            Bernadette Tobin RGN, MSc.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl leading-relaxed">
            Registered nurse with an MSc in Advanced Practice (Level 7) and over twenty years of clinical
            experience. Founder of Visage Aesthetics on Friars Lane, Braintree, winner of Best Non-Surgical
            Aesthetics Clinic 2026, Essex (Health, Beauty &amp; Wellness Awards) and a 2026 nominee for
            Educator of the Year.
          </p>
        </div>
      </section>

      {/* CREDENTIALS STRIP */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="border border-line/40 rounded-md p-5 bg-cream">
              <div className="text-eyebrow text-stone mb-1.5">NMC PIN</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>05G1755E</div>
              <div className="mt-1 text-stone text-[11px] tracking-[0.06em]">Verifiable on the NMC register</div>
            </div>
            <div className="border border-line/40 rounded-md p-5 bg-cream">
              <div className="text-eyebrow text-stone mb-1.5">Qualification</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>MSc Level 7</div>
              <div className="mt-1 text-stone text-[11px] tracking-[0.06em]">Advanced Practice</div>
            </div>
            <div className="border border-line/40 rounded-md p-5 bg-cream">
              <div className="text-eyebrow text-stone mb-1.5">Member</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>RCN</div>
              <div className="mt-1 text-stone text-[11px] tracking-[0.06em]">Royal College of Nursing</div>
            </div>
            <div className="border border-line/40 rounded-md p-5 bg-cream">
              <div className="text-eyebrow text-stone mb-1.5">Experience</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>20+ years</div>
              <div className="mt-1 text-stone text-[11px] tracking-[0.06em]">Clinical practice</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="border border-gold/40 rounded-md p-5 bg-cream">
              <div className="text-eyebrow text-gold mb-1.5">2026 Award</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2 }}>Best Non-Surgical Aesthetics Clinic, Essex</div>
              <div className="mt-1 text-stone text-[11px] tracking-[0.06em]">Health, Beauty &amp; Wellness Awards</div>
            </div>
            <div className="border border-line/40 rounded-md p-5 bg-cream">
              <div className="text-eyebrow text-stone mb-1.5">2026 Nominee</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2 }}>Educator of the Year</div>
              <div className="mt-1 text-stone text-[11px] tracking-[0.06em]">Beauty &amp; Aesthetics Awards</div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-6 md:py-9">
        <div className="max-w-[820px] mx-auto px-5 md:px-8">
          <span className="hairline hairline-left mb-6" />
          <div className="text-eyebrow text-gold mb-3">About</div>
          <h2 className="font-display text-h2 text-charcoal mb-6">A clinical career, applied to aesthetics.</h2>
          <div className="space-y-5 text-body-lg text-ink-soft leading-relaxed">
            <p>
              Bernadette qualified as a registered nurse over twenty years ago. Her career has spanned
              acute medical wards, community nursing and advanced clinical practice, culminating in an
              MSc in Advanced Practice, the highest postgraduate qualification a UK nurse can hold.
            </p>
            <p>
              She came into aesthetics later, and deliberately. Years of clinical practice had made it
              clear that aesthetics is, fundamentally, a medical field. It deserves the same rigour, the
              same consent process, the same clinical care, even when the procedure is cosmetic. That
              philosophy is the thread running through every article, every consultation, and every
              treatment plan at Visage Aesthetics.
            </p>
            <p>
              The articles below are written personally by Bernadette. No marketing teams, no ghost
              writers. The voice you read on the blog is the voice you will hear if you come in for a
              consultation: calm, clinical, conservative, honest about the industry&apos;s problems as
              well as its possibilities. <Link href="/about/qualifications" className="underline decoration-gold/40 hover:decoration-gold-deep text-charcoal">Full qualifications reference here.</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
            <div>
              <div className="text-eyebrow text-gold mb-3">Articles by Bernadette</div>
              <h2 className="font-display text-h2 text-charcoal">All articles, newest first.</h2>
            </div>
            <div className="text-stone text-[12px] tracking-[0.18em] uppercase">
              {blogPostsByDate.length} articles
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {blogPostsByDate.map((post) => (
              <article key={post.slug} className="border border-line/30 rounded-md p-6 md:p-7 bg-cream flex flex-col">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-eyebrow text-gold">{post.category}</span>
                  <span aria-hidden className="text-stone/40">·</span>
                  <time dateTime={post.datePublished} className="text-stone text-[11px] tracking-[0.06em]">
                    {FORMAT_DATE(post.datePublished)}
                  </time>
                </div>
                <h3 className="font-display italic text-charcoal mb-3" style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 500 }}>
                  {post.title}
                </h3>
                <p className="text-body text-ink-soft leading-relaxed mb-6 flex-1">{post.excerpt}</p>
                <div className="mt-auto pt-5 border-t border-line/30 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] text-stone">
                    <Clock size={12} strokeWidth={1.5} /> {post.readTime}
                  </span>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-gold text-[12px] font-medium hover:gap-2 transition-all">
                    Read <ArrowUpRight size={13} strokeWidth={1.75} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
