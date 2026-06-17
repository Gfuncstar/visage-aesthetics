import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { BOOKING_LINK_PROPS } from '@/lib/booking'
import { referencesForTreatment } from '@/lib/treatment-references'
import type { Condition } from '@/lib/conditions'

const SITE = 'https://www.vaclinic.co.uk'

export default function ConditionTemplate({ condition }: { condition: Condition }) {
  const url = `${SITE}${condition.href}`
  const references = referencesForTreatment(condition.treatmentSlug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: condition.name, item: url },
        ],
      },
      {
        '@type': 'MedicalWebPage',
        name: condition.h1,
        description: condition.answer,
        url,
        inLanguage: 'en-GB',
        about: {
          '@type': 'MedicalCondition',
          name: condition.name,
          alternateName: condition.alternateNames,
          possibleTreatment: {
            '@type': 'MedicalProcedure',
            name: condition.treatmentName,
            url: `${SITE}${condition.treatmentHref}`,
            procedureType: 'https://schema.org/NoninvasiveProcedure',
          },
        },
        citation: references.map((r) => ({
          '@type': 'CreativeWork',
          name: r.title,
          url: r.url,
          publisher: { '@type': 'Organization', name: r.publisher },
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: condition.faqs.map((f) => ({
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

      {/* HERO — answer-first */}
      <section className="relative bg-cream text-charcoal pt-20 md:pt-24 pb-6 md:pb-10 overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li><Link href="/" className="hover:text-gold">Home</Link></li>
                <li aria-hidden className="opacity-40">/</li>
                <li aria-current="page" className="text-charcoal/80">{condition.name}</li>
              </ol>
            </nav>
            <h1 className="font-display italic text-hero text-charcoal max-w-2xl">{condition.h1}</h1>
            <p className="mt-6 text-body-lg text-ink-soft max-w-xl leading-relaxed">{condition.answer}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a {...BOOKING_LINK_PROPS} className="btn btn-primary btn-block sm:btn-md:auto">
                Book free consultation <ArrowUpRight size={16} />
              </a>
              <Link href={condition.treatmentHref} className="btn btn-ghost-dark btn-block sm:btn-md:auto">
                {condition.treatmentName} · {condition.priceFrom}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-line/30 rounded-md p-7 bg-cream-soft">
              <div className="text-eyebrow text-gold mb-2">Performed by</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}>Bernadette Tobin</div>
              <p className="mt-1 text-stone text-[13px]">RGN · MSc Advanced Practice (Level 7)</p>
              <span className="block w-12 h-px bg-gold my-5" />
              <ul className="space-y-2 text-charcoal text-sm">
                <li className="flex items-start gap-2"><Check size={15} className="text-gold mt-0.5 shrink-0" /> NMC-registered nurse (PIN 05G1755E)</li>
                <li className="flex items-start gap-2"><Check size={15} className="text-gold mt-0.5 shrink-0" /> 20+ years clinical experience</li>
                <li className="flex items-start gap-2"><Check size={15} className="text-gold mt-0.5 shrink-0" /> Free, no-obligation consultation</li>
                <li className="flex items-start gap-2"><Check size={15} className="text-gold mt-0.5 shrink-0" /> Friars Lane, Braintree · strictly by appointment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">In plain English</div>
            <h2 className="font-display text-h1 text-charcoal">What it is.</h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-body-lg text-ink-soft leading-relaxed">{condition.whatItIs}</p>
          </div>
        </div>
      </section>

      {/* HOW WE TREAT */}
      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">How we treat it</div>
            <h2 className="font-display text-h1 text-charcoal">The treatment.</h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-body-lg text-ink-soft leading-relaxed">{condition.howWeTreat}</p>
            <Link href={condition.treatmentHref} className="mt-6 inline-flex btn btn-secondary btn-md:auto">
              <span>Full {condition.treatmentName} information</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Who it&apos;s for</div>
            <h2 className="font-display text-h1 text-charcoal">Is it right for me?</h2>
          </div>
          <div className="md:col-span-8">
            <ul className="space-y-4">
              {condition.whoItsFor.map((w) => (
                <li key={w} className="flex items-start gap-4 pb-4 border-b border-line/30">
                  <Check size={18} strokeWidth={1.75} className="text-gold mt-1 shrink-0" />
                  <span className="text-charcoal text-body-lg leading-snug">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">Common questions</div>
          <h2 className="font-display text-h1 text-charcoal mb-10">{condition.name} FAQs.</h2>
          <div className="grid gap-px bg-line/40 border border-line/40">
            {condition.faqs.map((f) => (
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

      {/* REFERENCES */}
      {references.length > 0 && (
        <section className="py-6 md:py-9">
          <div className="max-w-[1100px] mx-auto px-5 md:px-8">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">References &amp; further reading</div>
            <h2 className="font-display text-h2 text-charcoal max-w-2xl">Independent, regulated sources.</h2>
            <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {references.map((r) => (
                <li key={r.url} className="border-b border-line/30 pb-4">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-start gap-2 text-charcoal hover:text-gold-deep transition-colors"
                  >
                    <ArrowUpRight size={15} strokeWidth={1.5} className="text-gold mt-1 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span className="text-body leading-snug">
                      {r.title}
                      <span className="block text-stone mt-1" style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.publisher}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-7 text-stone" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
              External links are provided for information only and do not imply endorsement. This page is general information, not a substitute for individual medical advice. Always discuss your own circumstances at consultation.
            </p>
          </div>
        </section>
      )}

      <BookingCTA />
    </>
  )
}
