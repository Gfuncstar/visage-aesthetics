import type { Metadata } from 'next'
import Link from 'next/link'
import { Award as AwardIcon } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { BOOKING_LINK_PROPS } from '@/lib/booking'

export const metadata: Metadata = {
  title: 'Awards & Recognition | Visage Aesthetics, Braintree',
  description: "Visage Aesthetics — Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards). An award-winning nurse-led clinic in Braintree run by Bernadette Tobin RGN, MSc.",
  alternates: { canonical: '/awards' },
  openGraph: {
    title: 'Best Non-Surgical Aesthetics Clinic 2026, Essex',
    description: 'Visage Aesthetics has been awarded Best Non-Surgical Aesthetics Clinic 2026 — Essex at the Health, Beauty & Wellness Awards.',
    url: 'https://www.vaclinic.co.uk/awards',
  },
}

type AwardEntry = {
  year: number
  name: string
  category: string
  region: string
  awardingBody: string
  awardingBodyUrl?: string
  description: string
}

const awards: AwardEntry[] = [
  {
    year: 2026,
    name: 'Best Non-Surgical Aesthetics Clinic 2026 — Essex',
    category: 'Best Non-Surgical Aesthetics Clinic',
    region: 'Essex',
    awardingBody: 'Health, Beauty & Wellness Awards',
    description:
      "Recognised across the county for naturally subtle, medically led aesthetic treatments. The award celebrates clinics that demonstrate clinical excellence, exceptional client care, and a commitment to ethical, conservative practice.",
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Awards', item: 'https://www.vaclinic.co.uk/awards' },
      ],
    },
    ...awards.map((a) => ({
      '@type': 'Award',
      name: a.name,
      awardedTo: {
        '@type': 'Person',
        name: 'Bernadette Tobin',
        jobTitle: 'Registered Nurse, MSc Advanced Practice',
        url: 'https://www.vaclinic.co.uk/about',
        worksFor: {
          '@type': 'MedicalBusiness',
          name: 'Visage Aesthetics',
          url: 'https://www.vaclinic.co.uk/',
        },
      },
      category: a.category,
      dateCreated: `${a.year}`,
      description: a.description,
      issuedBy: {
        '@type': 'Organization',
        name: a.awardingBody,
      },
      areaServed: { '@type': 'AdministrativeArea', name: a.region },
    })),
  ],
}

export default function AwardsPage() {
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
              <li aria-current="page" className="text-charcoal/80">Awards</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-gold mb-3">Recognition</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            An award-winning nurse-led clinic.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Recognised across Essex for naturally subtle results, medically led care, and a refusal
            to treat aesthetics as anything less than a clinical discipline.
          </p>
        </div>
      </section>

      {/* HERO AWARD */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <article
            className="relative overflow-hidden rounded-md p-8 md:p-14 text-cream"
            style={{ background: 'linear-gradient(160deg, #C09F6E 0%, #A8895E 55%, #8E7245 100%)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center relative">
              <div className="md:col-span-7">
                <div className="inline-flex items-center gap-3 mb-6 px-3 py-1.5 bg-cream/10 border border-cream/30 rounded-full">
                  <AwardIcon size={14} />
                  <span className="text-[11px] tracking-[0.24em] uppercase font-medium">Awarded 2026</span>
                </div>
                <h2 className="font-display italic" style={{ fontSize: 'clamp(34px, 5vw, 56px)', lineHeight: 1.05, fontWeight: 500 }}>
                  Best Non-Surgical
                  <br />
                  Aesthetics Clinic
                  <br />
                  <span className="opacity-90">Essex 2026</span>
                </h2>
                <p className="mt-7 max-w-md text-cream/85 leading-relaxed">
                  Awarded by the <strong className="font-medium">Health, Beauty &amp; Wellness Awards</strong> —
                  an industry-judged programme recognising clinics demonstrating clinical excellence,
                  exceptional client care, and ethical, conservative practice.
                </p>
                <p className="mt-5 text-cream/70 text-[13px] tracking-[0.06em]">
                  &ldquo;What started as a vision has grown into something I care so deeply about.
                  Every client who&apos;s trusted me, every bit of support, every late night and early
                  morning. I&apos;m beyond grateful.&rdquo;
                </p>
                <p className="mt-2 text-eyebrow text-cream/60">— Bernadette Tobin, Founder</p>
              </div>
              <div className="md:col-span-5">
                <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center">
                  <div className="text-center px-6 py-10">
                    <div className="text-cream/70 text-[10px] tracking-[0.32em] uppercase mb-4">Awarded</div>
                    <div className="font-display italic mb-3" style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 600 }}>
                      Best Non-Surgical
                      <br />
                      Aesthetics Clinic
                    </div>
                    <div className="w-12 h-px bg-cream/40 mx-auto my-5" />
                    <div className="text-cream/70 text-[11px] tracking-[0.32em] uppercase">2026 &nbsp;·&nbsp; Essex</div>
                    <div className="mt-8 text-cream/60 text-[10px] tracking-[0.2em] uppercase">Health, Beauty &amp; Wellness Awards</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Why it matters</div>
            <h2 className="font-display text-h1 text-charcoal">A vote for conservative, medically led care.</h2>
          </div>
          <div className="md:col-span-7 space-y-5 text-body-lg text-ink-soft leading-relaxed">
            <p>
              Aesthetics in the UK remains an unregulated industry — anyone, with any level of training,
              can legally inject. Awards judged by industry peers help clients distinguish clinics that
              hold themselves to a clinical standard from those that don&apos;t.
            </p>
            <p>
              Visage Aesthetics is run by a registered nurse with an MSc in Advanced Practice (Level 7)
              and over twenty years of clinical experience. Every consultation is unhurried. Every
              treatment plan starts with a clinical assessment. And we never treat for the sake of
              treating — if something isn&apos;t in your best interest, we&apos;ll say so.
            </p>
            <p>
              Being named Best Non-Surgical Aesthetics Clinic in Essex is recognition of that approach,
              and a quiet vote of confidence from the people who trust us.
            </p>
          </div>
        </div>
      </section>

      {/* AWARDS LIST */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">All recognition</div>
          <h2 className="font-display text-h1 text-charcoal mb-10">Awards &amp; nominations.</h2>
          <ul className="grid gap-px bg-line/40 border border-line/40">
            {awards.map((a) => (
              <li key={`${a.year}-${a.name}`} className="bg-cream p-6 md:p-8">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="text-eyebrow text-gold mb-2">{a.year} &nbsp;·&nbsp; {a.region}</div>
                    <h3 className="font-display italic text-charcoal" style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 500 }}>
                      {a.name}
                    </h3>
                    <p className="mt-3 text-body text-ink-soft max-w-2xl">{a.description}</p>
                    <p className="mt-4 text-eyebrow text-stone">Awarded by {a.awardingBody}</p>
                  </div>
                  <AwardIcon className="text-gold mt-1 shrink-0" size={28} strokeWidth={1.4} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[820px] mx-auto px-5 md:px-8 text-center">
          <span className="hairline mb-6 inline-block bg-gold" />
          <h2 className="font-display text-h2 text-charcoal">Experience the award-winning approach.</h2>
          <p className="mt-5 text-body-lg text-ink-soft">
            Free, unhurried consultation. No pressure. No upselling. Just an honest clinical conversation
            about what&apos;s right for you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a {...BOOKING_LINK_PROPS} className="btn btn-primary">
              <span>Book a consultation</span>
              <span className="btn-arrow">→</span>
            </a>
            <Link href="/about" className="btn btn-secondary">
              <span>About Bernadette</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
