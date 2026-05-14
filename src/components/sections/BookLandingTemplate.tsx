import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Check, MessageCircle, Phone } from 'lucide-react'
import { BOOKING_LINK_PROPS, whatsappLink } from '@/lib/booking'
import { AWARD } from '@/lib/award'
import { getGoogleReviews } from '@/lib/google-reviews'

export type BookLandingProps = {
  /** URL slug, e.g. "botox" */
  slug: string
  /** Treatment name displayed throughout, e.g. "Botox", "Lip Filler", "Profhilo", "Free Consultation" */
  treatment: string
  /** Big H1 headline, treatment-specific */
  heroHeadline: string
  /** One-line sell underneath the H1 */
  heroSubhead: string
  /** Display price line, e.g. "From £120 / 1 area" or empty for consultation page */
  priceLine?: string
  /** 3 short bullets explaining why this clinic */
  trustBullets: string[]
  /** Top objection FAQs (3-4 ideal) */
  faqs: { question: string; answer: string }[]
  /** Pre-filled WhatsApp message */
  whatsappMessage: string
}

export default async function BookLandingTemplate({
  slug,
  treatment,
  heroHeadline,
  heroSubhead,
  priceLine,
  trustBullets,
  faqs,
  whatsappMessage,
}: BookLandingProps) {
  const reviews = await getGoogleReviews()
  const url = `https://www.vaclinic.co.uk/book/${slug}`

  // Schema for the landing page — keep it light. The MedicalBusiness
  // provider node is the same canonical entity (@id matches home).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: heroHeadline,
        isPartOf: { '@id': 'https://www.vaclinic.co.uk/#website' },
        about: { '@id': 'https://www.vaclinic.co.uk/#org' },
      },
      faqs.length > 0
        ? {
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }
        : null,
    ].filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="bg-cream pt-24 md:pt-28 pb-10 md:pb-14 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[860px] mx-auto px-5 md:px-8 relative text-center">
          <Link
            href={AWARD.detailPath}
            className="inline-block mb-7"
            aria-label={`Verified winner: ${AWARD.fullName}`}
          >
            <Image
              src="/images/award-badge.png"
              alt={`Visage Aesthetics, ${AWARD.fullName}`}
              width={280}
              height={280}
              sizes="140px"
              priority
              fetchPriority="high"
              className="mx-auto"
              style={{
                width: 140,
                height: 'auto',
                filter: 'drop-shadow(0 2px 4px rgba(31, 27, 26, 0.18)) drop-shadow(0 12px 24px rgba(31, 27, 26, 0.22))',
              }}
            />
          </Link>
          <div className="text-eyebrow text-gold mb-4">
            Winner — {AWARD.fullName}
          </div>
          <h1 className="font-display italic text-hero text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            {heroHeadline}
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-xl mx-auto">{heroSubhead}</p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <a
              {...BOOKING_LINK_PROPS}
              className="btn btn-primary"
              style={{ minWidth: 280 }}
            >
              <span>Book your free consultation</span>
              <ArrowUpRight size={16} />
            </a>
            {priceLine && (
              <div className="text-stone text-[13px] tracking-[0.06em]">{priceLine} · No consultation fee</div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <a
                href={whatsappLink(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-charcoal hover:text-gold-deep transition-colors border-b border-charcoal/40 hover:border-gold pb-1"
                style={{ fontSize: 13 }}
              >
                <MessageCircle size={15} strokeWidth={1.5} />
                <span>Ask on WhatsApp</span>
              </a>
              <span aria-hidden className="text-stone/40">·</span>
              <a
                href="tel:+447931395246"
                className="inline-flex items-center gap-2 text-charcoal hover:text-gold-deep transition-colors border-b border-charcoal/40 hover:border-gold pb-1"
                style={{ fontSize: 13 }}
              >
                <Phone size={14} strokeWidth={1.5} />
                <span>+44 7931 395246</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-8 md:py-10 bg-cream-soft border-y border-line/30">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          <div>
            <div className="font-display italic text-charcoal" style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 500 }}>
              {reviews.live && reviews.total > 0 ? reviews.rating.toFixed(1) : '5.0'}★
            </div>
            <div className="text-stone text-[11px] tracking-[0.18em] uppercase mt-2">Google rating</div>
          </div>
          <div>
            <div className="font-display italic text-charcoal" style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 500 }}>
              MSc
            </div>
            <div className="text-stone text-[11px] tracking-[0.18em] uppercase mt-2">Level 7 nurse</div>
          </div>
          <div>
            <div className="font-display italic text-charcoal" style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 500 }}>
              20+
            </div>
            <div className="text-stone text-[11px] tracking-[0.18em] uppercase mt-2">Years clinical</div>
          </div>
          <div>
            <div className="font-display italic text-charcoal" style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 500 }}>
              NMC
            </div>
            <div className="text-stone text-[11px] tracking-[0.18em] uppercase mt-2">PIN 05G1755E</div>
          </div>
        </div>
      </section>

      {/* WHY VISAGE */}
      <section className="py-10 md:py-14">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <h2 className="font-display text-h2 text-charcoal text-center mb-10 md:mb-12" style={{ fontSize: 'clamp(28px, 4.2vw, 40px)' }}>
            Why choose Visage for {treatment.toLowerCase()}.
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {trustBullets.map((b) => (
              <li key={b} className="border border-line/30 rounded-md p-6 bg-cream">
                <Check size={20} strokeWidth={1.5} className="text-gold mb-4" />
                <p className="text-charcoal text-body leading-relaxed">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-6 md:py-10 bg-cream-soft">
          <div className="max-w-[760px] mx-auto px-5 md:px-8">
            <h2 className="font-display text-h2 text-charcoal text-center mb-8 md:mb-10" style={{ fontSize: 'clamp(26px, 3.6vw, 34px)' }}>
              Questions before you book.
            </h2>
            <div className="grid gap-px bg-line/40 border border-line/40">
              {faqs.map((f) => (
                <details key={f.question} className="group bg-cream open:bg-cream-soft transition-colors">
                  <summary className="cursor-pointer flex items-start justify-between gap-4 p-5 md:p-6 list-none [&::-webkit-details-marker]:hidden">
                    <span className="font-display italic text-charcoal" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 500 }}>
                      {f.question}
                    </span>
                    <span className="text-gold text-[20px] mt-1 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-5 pb-6 md:px-6 md:pb-7 text-body text-ink-soft leading-relaxed max-w-prose">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-12 md:py-16 text-center">
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <h2 className="font-display italic text-charcoal" style={{ fontSize: 'clamp(28px, 4.4vw, 44px)', lineHeight: 1.1, fontWeight: 500 }}>
            Ready when you are.
          </h2>
          <p className="mt-5 text-body-lg text-ink-soft max-w-xl mx-auto">
            Free, unhurried consultation with Bernadette. Strictly by appointment, one client in the clinic at a time.
            No pressure to decide on the day.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <a {...BOOKING_LINK_PROPS} className="btn btn-primary" style={{ minWidth: 280 }}>
              <span>Book your free consultation</span>
              <ArrowUpRight size={16} />
            </a>
            <Link
              href={AWARD.detailPath}
              className="mt-3 inline-flex items-center gap-2 text-gold hover:text-gold-deep transition-colors"
              style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
            >
              <span>Winner · {AWARD.fullName}</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
