import type { Metadata } from 'next'
import Link from 'next/link'
import { Award as AwardIcon, Mail, Phone, MapPin } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { BOOKING_LINK_PROPS } from '@/lib/booking'
import { AWARD } from '@/lib/award'

export const metadata: Metadata = {
  title: 'Press & Media | Visage Aesthetics, Braintree',
  description:
    'Press and media information for Visage Aesthetics, the nurse-led clinic in Braintree named Best Non-Surgical Aesthetics Clinic 2026, Essex. Facts, approved boilerplate, spokesperson and media contact.',
  alternates: { canonical: '/press' },
  openGraph: {
    title: 'Press & Media | Visage Aesthetics',
    description:
      'Media information for Visage Aesthetics, Braintree. Award details, approved boilerplate, spokesperson and contact.',
    url: 'https://www.vaclinic.co.uk/press',
  },
}

const SHORT_BOILERPLATE =
  'Visage Aesthetics is a nurse-led, non-surgical aesthetics clinic in Braintree, Essex, named Best Non-Surgical Aesthetics Clinic 2026, Essex by the Health, Beauty & Wellness Awards.'

const MEDIUM_BOILERPLATE =
  'Visage Aesthetics is a small, nurse-led aesthetics clinic on Friars Lane in Braintree, Essex. Founded by registered nurse and prescriber Bernadette Tobin, it offers natural, subtle non-surgical treatments built on safety and honest advice. In 2026 it was named Best Non-Surgical Aesthetics Clinic, Essex by the Health, Beauty & Wellness Awards.'

const LONG_BOILERPLATE =
  'Visage Aesthetics is a nurse-led, non-surgical aesthetics clinic on Friars Lane in Braintree, Essex. It was founded by Bernadette Tobin, a Registered General Nurse, Independent Nurse Prescriber and MSc Advanced Practice graduate, who wanted to offer aesthetic treatments the medically responsible way: led by clinical training, not trends. The clinic offers anti-wrinkle injections, dermal and lip filler, Profhilo, skin treatments and more, always starting with a proper consultation and an honest opinion. In 2026 it was named Best Non-Surgical Aesthetics Clinic, Essex by the Health, Beauty & Wellness Awards.'

const FOUNDER_BIO =
  'Bernadette Tobin is the founder and lead nurse prescriber at Visage Aesthetics in Braintree, Essex. A Registered General Nurse with an MSc in Advanced Practice and Independent Nurse Prescriber status, she brings a senior clinical background to non-surgical aesthetics. She is known for a careful, honest approach: natural results, real consultations, and a willingness to tell patients when a treatment is not right for them.'

const interviewTopics = [
  'Non-surgical aesthetics safety, and why the field is largely unregulated',
  'What to ask before booking any aesthetic treatment',
  'The rise of nurse-led clinics',
  'Seasonal skin and treatment advice',
  'Being named Best Non-Surgical Aesthetics Clinic 2026, Essex',
]

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Press', item: 'https://www.vaclinic.co.uk/press' },
      ],
    },
  ],
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-cream border border-line/40 rounded-md p-5 md:p-6">
      <div className="text-eyebrow text-gold mb-3">{label}</div>
      <p className="text-body text-ink-soft leading-relaxed select-all">{text}</p>
    </div>
  )
}

export default function PressPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Press</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-gold mb-3">Press &amp; media</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            Information for journalists and editors.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Everything you need to write about Visage Aesthetics, the nurse-led clinic in Braintree
            named Best Non-Surgical Aesthetics Clinic 2026, Essex. For interviews, images or anything
            else, please get in touch using the details below.
          </p>
        </div>
      </section>

      {/* AT A GLANCE */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">At a glance</div>
          <h2 className="font-display text-h1 text-charcoal mb-8">The clinic, in brief.</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line/40 border border-line/40">
            {[
              ['What it is', 'A small, nurse-led, non-surgical aesthetics clinic, by appointment.'],
              ['Where', '17A Friars Lane, Braintree, Essex, CM7 9BL'],
              ['Founder', 'Bernadette Tobin, Registered General Nurse and Independent Nurse Prescriber, MSc Advanced Practice'],
              ['Area served', 'Braintree and surrounding Essex towns, including Witham, Halstead, Chelmsford, Colchester, Maldon, Great Dunmow and Sudbury'],
              ['Founded on', 'Safety, honest advice and natural, subtle results'],
              ['Recognition', 'Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)'],
            ].map(([term, def]) => (
              <div key={term} className="bg-cream p-5 md:p-6">
                <dt className="text-eyebrow text-stone mb-2">{term}</dt>
                <dd className="text-body text-charcoal">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* THE AWARD */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">The award</div>
            <h2 className="font-display text-h1 text-charcoal">Best Non-Surgical Aesthetics Clinic 2026, Essex.</h2>
          </div>
          <div className="md:col-span-7 space-y-5 text-body-lg text-ink-soft leading-relaxed">
            <p>
              In 2026, Visage Aesthetics was named Best Non-Surgical Aesthetics Clinic, Essex by the
              Health, Beauty &amp; Wellness Awards, an industry-judged programme recognising clinics that
              demonstrate clinical excellence, exceptional client care, and ethical, conservative practice.
            </p>
            <p>
              Please refer to the award in full as &ldquo;Best Non-Surgical Aesthetics Clinic 2026, Essex,
              awarded by the Health, Beauty &amp; Wellness Awards&rdquo;.
            </p>
            <a
              href={AWARD.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase font-medium border-b border-stone/40 pb-1 hover:border-gold hover:text-gold transition-colors"
            >
              <AwardIcon size={14} />
              View the verified listing
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* BOILERPLATE */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">Approved copy</div>
          <h2 className="font-display text-h1 text-charcoal mb-3">Boilerplate, ready to use.</h2>
          <p className="text-body text-ink-soft max-w-2xl mb-8">
            Please use one of these as written. Tap to select the text you need.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <CopyBlock label="Short" text={SHORT_BOILERPLATE} />
            <CopyBlock label="Medium (around 50 words)" text={MEDIUM_BOILERPLATE} />
            <CopyBlock label="Long (around 90 words)" text={LONG_BOILERPLATE} />
            <CopyBlock label="Founder bio" text={FOUNDER_BIO} />
          </div>
        </div>
      </section>

      {/* SPOKESPERSON */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Spokesperson</div>
            <h2 className="font-display text-h1 text-charcoal">Bernadette Tobin is available for interview.</h2>
            <p className="mt-5 text-body text-ink-soft leading-relaxed">{FOUNDER_BIO}</p>
          </div>
          <div className="md:col-span-7">
            <div className="text-eyebrow text-stone mb-4">Topics she can speak to</div>
            <ul className="space-y-3">
              {interviewTopics.map((t) => (
                <li key={t} className="flex items-start gap-3 text-body text-charcoal">
                  <span className="text-gold mt-1.5 w-4 h-px bg-gold shrink-0" aria-hidden />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-body text-ink-soft leading-relaxed">
              Clinic and founder photography is available on request. Patient before-and-after images
              and stories can be shared only where written consent is held.
            </p>
          </div>
        </div>
      </section>

      {/* MEDIA CONTACT */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="text-eyebrow text-gold mb-3">Media contact</div>
          <h2 className="font-display text-h1 text-charcoal mb-8">Get in touch.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line/40 border border-line/40">
            <a href="mailto:info@vaclinic.co.uk" className="bg-cream p-6 flex items-center gap-4 hover:bg-cream-soft transition-colors">
              <Mail size={20} className="text-gold shrink-0" strokeWidth={1.6} />
              <span className="text-body text-charcoal">info@vaclinic.co.uk</span>
            </a>
            <a href="tel:+447931395246" className="bg-cream p-6 flex items-center gap-4 hover:bg-cream-soft transition-colors">
              <Phone size={20} className="text-gold shrink-0" strokeWidth={1.6} />
              <span className="text-body text-charcoal">07931 395246</span>
            </a>
            <a href="https://www.instagram.com/visageaestheticclinic" target="_blank" rel="noopener noreferrer" className="bg-cream p-6 flex items-center gap-4 hover:bg-cream-soft transition-colors">
              <span className="text-gold shrink-0"><InstagramIcon size={20} /></span>
              <span className="text-body text-charcoal">@visageaestheticclinic</span>
            </a>
            <a href="https://maps.google.com/?q=CM7+9BL" target="_blank" rel="noopener noreferrer" className="bg-cream p-6 flex items-center gap-4 hover:bg-cream-soft transition-colors">
              <MapPin size={20} className="text-gold shrink-0" strokeWidth={1.6} />
              <span className="text-body text-charcoal">17A Friars Lane, Braintree, Essex, CM7 9BL</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[820px] mx-auto px-5 md:px-8 text-center">
          <span className="hairline mb-6 inline-block bg-gold" />
          <h2 className="font-display text-h2 text-charcoal">Writing about local aesthetics?</h2>
          <p className="mt-5 text-body-lg text-ink-soft">
            We are happy to help with a quote, an expert view, or a local angle. For readers who want to
            book, every treatment at Visage Aesthetics starts with an honest consultation.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:info@vaclinic.co.uk" className="btn btn-primary">
              <span>Contact us</span>
              <span className="btn-arrow">→</span>
            </a>
            <a {...BOOKING_LINK_PROPS} className="btn btn-secondary">
              <span>Book a consultation</span>
              <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
