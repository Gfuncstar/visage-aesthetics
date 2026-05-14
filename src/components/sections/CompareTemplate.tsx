import Link from 'next/link'
import { ArrowUpRight, Check, X } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { BOOKING_LINK_PROPS } from '@/lib/booking'
import { AWARD } from '@/lib/award'

export type CompareSide = {
  /** Display name, e.g. "Botox" or "Profhilo" */
  name: string
  /** Treatment hub URL */
  href: string
  /** One-line summary for the eyebrow */
  tagline: string
  /** What it does (procedure description) */
  whatItDoes: string
  /** Bulleted "best for" points */
  bestFor: string[]
  /** Bulleted "not for" points */
  notFor: string[]
  /** Starting price string, e.g. "From £120" */
  priceFrom: string
  /** Typical duration of effect */
  lasts: string
}

export type CompareTemplateProps = {
  slug: string
  /** Title shown in H1, e.g. "Botox vs Dermal Filler" */
  pageTitle: string
  /** Short intro after H1 */
  intro: string
  left: CompareSide
  right: CompareSide
  /** "When to choose left" guidance */
  chooseLeftWhen: string[]
  /** "When to choose right" guidance */
  chooseRightWhen: string[]
  /** Optional: when to choose both */
  chooseBothWhen?: string[]
  /** FAQs that emit FAQPage schema */
  faqs: { question: string; answer: string }[]
}

export default function CompareTemplate({
  slug, pageTitle, intro, left, right, chooseLeftWhen, chooseRightWhen, chooseBothWhen, faqs,
}: CompareTemplateProps) {
  const url = `https://www.vaclinic.co.uk/compare/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.vaclinic.co.uk/compare' },
          { '@type': 'ListItem', position: 3, name: pageTitle, item: url },
        ],
      },
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: pageTitle,
        description: intro,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: {
          '@type': 'Person',
          '@id': 'https://www.vaclinic.co.uk/author/bernadette-tobin#person',
          name: 'Bernadette Tobin',
          jobTitle: 'Registered Nurse, MSc Advanced Practice',
          url: 'https://www.vaclinic.co.uk/about',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Visage Aesthetics',
          logo: { '@type': 'ImageObject', url: 'https://www.vaclinic.co.uk/icon.png' },
        },
        about: [
          { '@type': 'MedicalProcedure', name: left.name, url: `https://www.vaclinic.co.uk${left.href}` },
          { '@type': 'MedicalProcedure', name: right.name, url: `https://www.vaclinic.co.uk${right.href}` },
        ],
        inLanguage: 'en-GB',
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
      <section className="relative bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li><Link href="/compare" className="hover:text-gold">Compare</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">{pageTitle}</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-gold mb-3">Treatment comparison</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-4xl">{pageTitle}.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">{intro}</p>
        </div>
      </section>

      {/* SIDE-BY-SIDE */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {[left, right].map((side) => (
            <div key={side.name} className="border border-line/30 rounded-md p-7 md:p-9 bg-cream-soft">
              <div className="text-eyebrow text-gold mb-2">{side.tagline}</div>
              <h2 className="font-display italic text-charcoal" style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 500 }}>
                {side.name}
              </h2>
              <p className="mt-5 text-body text-ink-soft leading-relaxed">{side.whatItDoes}</p>
              <dl className="mt-6 grid grid-cols-2 gap-y-3 text-[14px]">
                <dt className="text-stone text-[11px] tracking-[0.18em] uppercase">From</dt>
                <dd className="text-charcoal font-medium">{side.priceFrom}</dd>
                <dt className="text-stone text-[11px] tracking-[0.18em] uppercase">Lasts</dt>
                <dd className="text-charcoal font-medium">{side.lasts}</dd>
              </dl>
              <div className="mt-6">
                <div className="text-eyebrow text-gold mb-3">Best for</div>
                <ul className="space-y-2">
                  {side.bestFor.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-charcoal">
                      <Check size={15} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                      <span className="text-[14px] leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <div className="text-eyebrow text-stone mb-3">Not the right call for</div>
                <ul className="space-y-2">
                  {side.notFor.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-ink-soft">
                      <X size={15} strokeWidth={1.75} className="text-stone mt-1 shrink-0" />
                      <span className="text-[14px] leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-7 pt-6 border-t border-line/30">
                <Link href={side.href} className="inline-flex items-center gap-2 text-gold hover:text-gold-deep transition-colors group">
                  <span className="text-[12px] tracking-[0.18em] uppercase font-medium border-b border-transparent group-hover:border-current pb-0.5 transition-colors">
                    Full {side.name} information
                  </span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHICH ONE */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">Choosing between them</div>
          <h2 className="font-display text-h1 text-charcoal mb-10">Which one do you actually need?</h2>
          <div className={`grid grid-cols-1 ${chooseBothWhen ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5 md:gap-6`}>
            <div className="border border-line/30 rounded-md p-7 bg-cream">
              <div className="text-eyebrow text-gold mb-3">Choose {left.name} when</div>
              <ul className="space-y-3">
                {chooseLeftWhen.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-charcoal">
                    <Check size={15} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                    <span className="text-[14px] leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-line/30 rounded-md p-7 bg-cream">
              <div className="text-eyebrow text-gold mb-3">Choose {right.name} when</div>
              <ul className="space-y-3">
                {chooseRightWhen.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-charcoal">
                    <Check size={15} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                    <span className="text-[14px] leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            {chooseBothWhen && (
              <div className="border border-line/30 rounded-md p-7 bg-cream">
                <div className="text-eyebrow text-gold mb-3">Consider both when</div>
                <ul className="space-y-3">
                  {chooseBothWhen.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-charcoal">
                      <Check size={15} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                      <span className="text-[14px] leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-6 md:py-9">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">FAQ</div>
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

      {/* PRACTITIONER NOTE */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
          <span className="hairline mb-8 inline-block" />
          <div className="text-eyebrow text-gold mb-3">A note from Bernadette</div>
          <p className="font-display italic text-h2 text-charcoal leading-snug">
            &ldquo;The answer to &lsquo;which one&rsquo; almost always begins with sitting in front of someone and looking properly. The consultation is free for a reason.&rdquo;
          </p>
          <p className="mt-6 text-eyebrow text-ink-soft">Bernadette Tobin · RGN, MSc</p>
          <div className="mt-8">
            <a {...BOOKING_LINK_PROPS} className="btn btn-primary">
              <span>Book a free consultation</span>
              <span className="btn-arrow">→</span>
            </a>
          </div>
          <Link
            href={AWARD.detailPath}
            className="mt-6 inline-flex items-center gap-2 text-gold hover:text-gold-deep transition-colors group"
            style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
          >
            <span className="border-b border-transparent group-hover:border-current pb-0.5 transition-colors">
              Officially awarded · {AWARD.shortName}
            </span>
          </Link>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
