import type { Metadata } from 'next'
import Link from 'next/link'
import Quiz from './Quiz'

const SITE = 'https://www.vaclinic.co.uk'
const PATH = '/course/rags-to-reputation/quiz'
const COURSE_PATH = '/course/rags-to-reputation'
const PRICE = '299'

const ENROL_EMAIL =
  'mailto:info@vaclinic.co.uk' +
  '?subject=' + encodeURIComponent('Enrolment — Rags to Reputation course (£299)') +
  '&body=' + encodeURIComponent(
    "Hi Bernadette,\n\nI'd like to enrol on the Rags to Reputation course (£299). Please send me the enrolment and payment details.\n\nMy name:\nMy profession / registration (NMC, GMC, GDC, GPhC or other):\nWhere I practise:\n\nThank you."
  )

export const metadata: Metadata = {
  title: 'Rags to Reputation — Free Compliance Knowledge Check | Visage Aesthetics',
  description:
    'A free 15-question knowledge check on UK aesthetics compliance in 2026 — prescribing law, CQC, the four-nations licensing picture, consent, advertising rules and complications. Test yourself, then go deeper in the Rags to Reputation course.',
  alternates: { canonical: PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Free UK Aesthetics Compliance Knowledge Check — Rags to Reputation',
    description:
      'Fifteen questions on the current UK rules for aesthetics practitioners, grounded in government and regulator sources. Instant scoring and explanations.',
    url: `${SITE}${PATH}`,
    type: 'website',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'Rags to Reputation', item: `${SITE}${COURSE_PATH}` },
    { '@type': 'ListItem', position: 3, name: 'Knowledge check', item: `${SITE}${PATH}` },
  ],
}

export default function QuizPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-8 md:pb-10 relative overflow-hidden">
        <div className="max-w-[860px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-6">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li><Link href={COURSE_PATH} className="hover:text-gold">Rags to Reputation</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Knowledge check</li>
            </ol>
          </nav>

          <span className="hairline mb-7 bg-gold" />
          <p className="eyebrow text-gold mb-4">Free knowledge check · 15 questions</p>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            How compliant is your aesthetics practice?
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl leading-relaxed">
            Fifteen questions on the current UK rules — prescribing law, CQC, the four-nations
            licensing picture, consent, advertising and complications. Every answer is grounded in
            government and regulator sources and reviewed June 2026. You&apos;ll get an instant score and
            an explanation for each question. Nothing is recorded; it&apos;s for your own benefit.
          </p>
        </div>
      </section>

      {/* Quiz */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <Quiz />
        </div>
      </section>

      {/* Enrol CTA */}
      <section style={{ background: '#1F1B1A', color: '#F5F0EC', padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[820px] mx-auto">
          <div className="section-num mb-8" style={{ color: 'rgba(245, 240, 236, 0.55)' }}>
            <span className="hairline" style={{ background: 'rgba(245, 240, 236, 0.4)' }} />
            Go deeper
          </div>
          <h2 className="text-h1" style={{ color: '#F5F0EC' }}>This is the surface. The course is the depth.</h2>
          <p className="mt-8 max-w-xl" style={{ color: 'rgba(245, 240, 236, 0.7)', fontSize: 17, lineHeight: 1.7 }}>
            The full Rags to Reputation course covers all of this — and far more — across twelve modules,
            with templates, checklists and a licence-readiness self-audit. £{PRICE}, self-paced, with a
            certificate and recordable CPD.
          </p>
          <div className="mt-12 flex flex-col md:flex-row gap-4">
            <a href={ENROL_EMAIL} className="btn btn-primary btn-md:auto">
              <span>Enrol — £{PRICE}</span>
              <span className="btn-arrow">→</span>
            </a>
            <Link href={COURSE_PATH} className="btn btn-ghost-dark btn-md:auto">
              <span>See the full curriculum</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
