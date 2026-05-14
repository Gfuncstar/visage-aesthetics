import type { Metadata } from 'next'
import Link from 'next/link'
import { Award as AwardIcon, ArrowUpRight, Check } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { BOOKING_LINK_PROPS } from '@/lib/booking'
import { AWARD, awardSchema } from '@/lib/award'

export const metadata: Metadata = {
  title: 'Best Non-Surgical Aesthetics Clinic 2026, Essex | Visage Aesthetics',
  description: `Visage Aesthetics, Braintree was officially awarded ${AWARD.fullName} by the ${AWARD.awardingBody}. The verified listing, judging criteria, and what the recognition means for clients choosing a clinic.`,
  alternates: { canonical: AWARD.detailPath },
  openGraph: {
    title: `${AWARD.fullName} | Visage Aesthetics`,
    description: `Verified winner of ${AWARD.fullName}, awarded by the ${AWARD.awardingBody}.`,
    url: `https://www.vaclinic.co.uk${AWARD.detailPath}`,
    images: [{ url: `/og?title=${encodeURIComponent('Best Non-Surgical Aesthetics Clinic 2026, Essex')}&eyebrow=${encodeURIComponent('Verified Winner · 2026')}`, width: 1200, height: 630, alt: AWARD.fullName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${AWARD.fullName} | Visage Aesthetics`,
    description: `Officially awarded by the ${AWARD.awardingBody}.`,
    images: [`/og?title=${encodeURIComponent('Best Non-Surgical Aesthetics Clinic 2026, Essex')}&eyebrow=${encodeURIComponent('Verified Winner · 2026')}`],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Awards', item: 'https://www.vaclinic.co.uk/awards' },
        { '@type': 'ListItem', position: 3, name: AWARD.fullName, item: `https://www.vaclinic.co.uk${AWARD.detailPath}` },
      ],
    },
    {
      ...awardSchema,
      description:
        'Awarded across Essex for clinical excellence in non-surgical aesthetic treatments. Recognises medically led practice, conservative dosing, exceptional client care, and ethical, evidence-based work.',
      recipient: {
        '@type': 'Person',
        '@id': 'https://www.vaclinic.co.uk/#bernadette',
        name: 'Bernadette Tobin',
        jobTitle: 'Registered Nurse, MSc Advanced Practice',
        url: 'https://www.vaclinic.co.uk/about',
        worksFor: {
          '@type': 'MedicalBusiness',
          name: 'Visage Aesthetics',
          url: 'https://www.vaclinic.co.uk/',
        },
      },
      about: {
        '@type': 'MedicalBusiness',
        '@id': 'https://www.vaclinic.co.uk/#org',
        name: 'Visage Aesthetics',
        url: 'https://www.vaclinic.co.uk/',
      },
    },
  ],
}

const criteria = [
  {
    label: 'Clinical excellence',
    body: 'Recognises clinics where every treatment is performed by a medically registered practitioner held to a professional regulator. Visage is run by a registered nurse with NMC PIN 05G1755E and an MSc in Advanced Practice (Level 7).',
  },
  {
    label: 'Ethical, conservative practice',
    body: 'Clinics judged on whether they routinely turn away unsuitable treatment, dose conservatively, and prioritise the client over the sale. Visage has no consultation fee and no upsell.',
  },
  {
    label: 'Exceptional client care',
    body: 'Strictly one client in the clinic at a time, a written treatment plan before any decision, and a complimentary two-week review included with every appointment.',
  },
  {
    label: 'Evidence-based treatment',
    body: 'Only regulated, traceable products. Authentic IBSA Profhilo. Major brand HA fillers. No relabelling, no semi-permanent or permanent product. Reversal protocols on site.',
  },
]

export default function AwardDetailPage() {
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
              <li><Link href="/awards" className="hover:text-gold">Awards</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Best Non-Surgical Aesthetics Clinic 2026, Essex</li>
            </ol>
          </nav>
          <div className="inline-flex items-center gap-3 mb-6 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold">
            <AwardIcon size={14} />
            <span className="text-[11px] tracking-[0.24em] uppercase font-medium">Verified winner · 2026</span>
          </div>
          <h1 className="font-display italic text-hero text-charcoal max-w-4xl">
            Best Non-Surgical Aesthetics Clinic 2026, Essex.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Awarded by the {AWARD.awardingBody}. An industry-judged programme recognising clinics
            demonstrating clinical excellence, exceptional client care, and ethical, conservative
            practice. The award is verifiable on the awarding body&apos;s public winners listing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a {...BOOKING_LINK_PROPS} className="btn btn-primary">
              Book with the awarded clinic <ArrowUpRight size={16} />
            </a>
            <a
              href={AWARD.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <span>View verified listing</span>
              <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* TROPHY */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <article
            className="relative overflow-hidden rounded-md p-8 md:p-14 text-cream"
            style={{ background: 'linear-gradient(160deg, #C09F6E 0%, #A8895E 55%, #8E7245 100%)' }}
          >
            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
              <div className="md:col-span-7">
                <div className="text-[11px] tracking-[0.24em] uppercase font-medium mb-5 text-cream/80">Officially awarded</div>
                <h2 className="font-display italic" style={{ fontSize: 'clamp(34px, 5vw, 56px)', lineHeight: 1.05, fontWeight: 500 }}>
                  Best Non-Surgical
                  <br />
                  Aesthetics Clinic
                  <br />
                  <span className="opacity-90">Essex 2026</span>
                </h2>
                <p className="mt-7 max-w-md text-cream/85 leading-relaxed">
                  Awarded to Bernadette Tobin RGN, MSc and Visage Aesthetics by the
                  &nbsp;<strong className="font-medium">{AWARD.awardingBody}</strong>. An industry-judged programme,
                  not self-styled.
                </p>
              </div>
              <div className="md:col-span-5">
                <div className="bg-cream/10 border border-cream/30 rounded-md p-6">
                  <div className="text-[10px] tracking-[0.24em] uppercase text-cream/70 mb-3">Verifiable at</div>
                  <a
                    href={AWARD.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display italic text-cream block break-words hover:text-cream/90 transition-colors"
                    style={{ fontSize: 18, lineHeight: 1.4 }}
                  >
                    lux-life.digital/winners/vaclinic/
                  </a>
                  <p className="mt-4 text-cream/70 text-[12px]">
                    The awarding body maintains a public listing of every winner. Click through to verify the citation directly.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* JUDGING CRITERIA */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Judging criteria</div>
            <h2 className="font-display text-h1 text-charcoal">What the panel looks at.</h2>
            <p className="mt-5 text-body text-ink-soft max-w-sm">
              Industry awards in aesthetics vary in rigour. The {AWARD.awardingBody} programme
              specifically weighs medical credentials, ethical practice and demonstrable outcomes.
            </p>
          </div>
          <div className="md:col-span-8 space-y-6">
            {criteria.map((c) => (
              <div key={c.label} className="border-l-2 border-gold pl-5 md:pl-7">
                <h3 className="font-display italic text-charcoal" style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 500 }}>
                  {c.label}
                </h3>
                <p className="mt-2 text-body text-ink-soft leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THIS MATTERS TO CLIENTS */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Why it matters</div>
            <h2 className="font-display text-h1 text-charcoal">&ldquo;Award-winning&rdquo; isn&apos;t the same as winning a named award.</h2>
          </div>
          <div className="md:col-span-7 space-y-5 text-body-lg text-ink-soft leading-relaxed">
            <p>
              Aesthetics in the UK remains an unregulated industry. Many clinics describe themselves
              as &ldquo;award-winning&rdquo; on the strength of a single online voting badge, a
              participation certificate, or a marketing programme that asks for a fee.
            </p>
            <p>
              The {AWARD.awardingBody} is independently judged by industry peers. The winners
              listing is public and verifiable. Visage Aesthetics is named, by full clinic name, in
              that listing for 2026 in the {AWARD.category} category for {AWARD.region}.
            </p>
            <p>
              For someone choosing where to have an aesthetic treatment, that distinction is the difference
              between a marketing claim and a third-party verified standard.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT IT MEANS IN PRACTICE */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">In practice</div>
          <h2 className="font-display text-h1 text-charcoal mb-10">What the recognition reflects.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[
              { t: 'NMC-registered nurse', b: 'PIN 05G1755E. Accountable to a regulator. Verifiable on the public register.' },
              { t: 'MSc Level 7', b: 'The highest postgraduate nursing qualification in the UK. Most local injectors are Level 4-5.' },
              { t: '20+ years clinical', b: 'Two decades of NHS and private practice before injecting. The clinical instinct that experience builds is the part that doesn\'t show on a price list.' },
              { t: 'One client at a time', b: 'Strictly by appointment, no shared waiting room, no upsell, written treatment plan before any decision.' },
            ].map((c) => (
              <div key={c.t} className="border border-line/30 rounded-md p-6 bg-cream">
                <Check size={18} strokeWidth={1.5} className="text-gold mb-3" />
                <h3 className="font-display italic text-charcoal" style={{ fontSize: 19, lineHeight: 1.2, fontWeight: 500 }}>{c.t}</h3>
                <p className="mt-2 text-body text-ink-soft leading-relaxed">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
