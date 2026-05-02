import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Stethoscope, ShieldCheck, Award, BookOpen, Heart, FileCheck } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'Qualifications & Credentials | Bernadette Tobin RGN, MSc',
  description: "Full credential reference for Bernadette Tobin RGN, MSc Advanced Practice (Level 7). NMC PIN 05G1755E, Royal College of Nursing member, 20+ years clinical. Best Non-Surgical Aesthetics Clinic 2026, Essex.",
  alternates: { canonical: '/about/qualifications' },
  openGraph: {
    title: 'Qualifications & Credentials | Bernadette Tobin RGN, MSc',
    description: 'Full credential reference for Bernadette Tobin, registered nurse, MSc Advanced Practice (Level 7), NMC PIN 05G1755E.',
    url: 'https://www.vaclinic.co.uk/about/qualifications',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vaclinic.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.vaclinic.co.uk/about' },
        { '@type': 'ListItem', position: 3, name: 'Qualifications', item: 'https://www.vaclinic.co.uk/about/qualifications' },
      ],
    },
    {
      '@type': 'Person',
      name: 'Bernadette Tobin',
      jobTitle: 'Registered Nurse, MSc Advanced Practice',
      url: 'https://www.vaclinic.co.uk/about/qualifications',
      identifier: [{ '@type': 'PropertyValue', propertyID: 'NMC PIN', value: '05G1755E' }],
      memberOf: [
        { '@type': 'Organization', name: 'Nursing and Midwifery Council', url: 'https://www.nmc.org.uk/' },
        { '@type': 'Organization', name: 'Royal College of Nursing', url: 'https://www.rcn.org.uk/' },
      ],
      hasCredential: [
        { '@type': 'EducationalOccupationalCredential', credentialCategory: 'professional registration', name: 'NMC Registered Nurse', identifier: '05G1755E' },
        { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'MSc Advanced Practice (Level 7)' },
        { '@type': 'EducationalOccupationalCredential', credentialCategory: 'continuing professional development', name: 'Aesthetic Injectables, Advanced Techniques' },
      ],
      worksFor: { '@type': 'MedicalBusiness', name: 'Visage Aesthetics', url: 'https://www.vaclinic.co.uk/' },
      award: [
        'Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)',
        'Educator of the Year 2026, Nominee (Beauty & Aesthetics Awards)',
      ],
    },
  ],
}

const sections: { Icon: typeof GraduationCap; title: string; lines: string[] }[] = [
  {
    Icon: Stethoscope,
    title: 'Professional registration',
    lines: [
      'Registered General Nurse (RGN), Nursing and Midwifery Council',
      'NMC PIN: 05G1755E',
      'Verifiable on the NMC public register at nmc.org.uk',
      'Continuous live registration since the start of clinical practice',
    ],
  },
  {
    Icon: GraduationCap,
    title: 'Academic qualifications',
    lines: [
      'MSc Advanced Practice (Level 7), the highest postgraduate level a UK nurse can hold',
      'BSc, undergraduate nursing qualification',
      'Postgraduate certifications across aesthetic injectables, advanced facial anatomy, and complications management',
    ],
  },
  {
    Icon: ShieldCheck,
    title: 'Professional bodies',
    lines: [
      'Member of the Royal College of Nursing (RCN), the largest nursing union and professional body in the UK',
      'Active continuing professional development (CPD) record maintained in accordance with NMC revalidation requirements',
    ],
  },
  {
    Icon: BookOpen,
    title: 'Aesthetic training',
    lines: [
      'Advanced injectable techniques across leading regulated product ranges (Allergan, Galderma, IBSA)',
      'Botulinum toxin: forehead, glabellar, periorbital, masseter, hyperhidrosis indications',
      'Dermal filler: lips, cheeks, jawline, tear trough, non-surgical rhinoplasty',
      'Profhilo BAP injection technique',
      'HarmonyCa hybrid injectable training',
      'AQUALYX deoxycholic acid fat dissolving',
      'Micro-needling and skin pen training',
      'CryoPen cryotherapy for benign lesions',
    ],
  },
  {
    Icon: FileCheck,
    title: 'Insurance & accountability',
    lines: [
      'Full medical indemnity insurance through a regulated UK insurer',
      'Documented consent process for every treatment, signed before any product is administered',
      'Adverse event protocols and reversal products kept on site for hyaluronic acid filler',
      'Direct phone access for clients between appointments, never a phone tree, never a holding line',
    ],
  },
  {
    Icon: Award,
    title: 'Recognition',
    lines: [
      'Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)',
      'Educator of the Year 2026, Nominee (Beauty & Aesthetics Awards)',
    ],
  },
  {
    Icon: Heart,
    title: 'Clinical experience',
    lines: [
      '20+ years across acute medical wards, community nursing, and advanced clinical practice',
      'Single-practitioner private clinic model, every consultation, treatment and review is performed personally by Bernadette, never delegated',
      'One client in the room at a time, by appointment only',
    ],
  },
]

export default function QualificationsPage() {
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
              <li><Link href="/about" className="hover:text-gold">About</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Qualifications</li>
            </ol>
          </nav>
          <div className="text-eyebrow text-gold mb-3">Credentials reference</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">
            Qualifications, in detail.
          </h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Aesthetics in the UK is largely unregulated, anyone, with any level of training, can
            legally inject. This page is the full reference for who treats you at Visage, what
            qualifications they hold, and how every claim on this site can be independently verified.
          </p>
        </div>
      </section>

      {/* HEADLINE CARD */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="border border-line/30 bg-cream-soft rounded-md p-7 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-7">
                <div className="text-eyebrow text-gold mb-3">Practitioner</div>
                <h2 className="font-display italic text-charcoal" style={{ fontSize: 'clamp(34px, 4.6vw, 52px)', lineHeight: 1.05, fontWeight: 500 }}>
                  Bernadette Tobin
                </h2>
                <p className="mt-3 text-body-lg text-ink-soft">RGN · MSc Advanced Practice (Level 7)</p>
              </div>
              <div className="md:col-span-5">
                <div className="grid grid-cols-2 gap-3 text-[12px] tracking-[0.18em] uppercase">
                  <div className="border border-line/40 rounded-sm p-3">
                    <div className="text-stone mb-1">NMC PIN</div>
                    <div className="text-charcoal font-medium">05G1755E</div>
                  </div>
                  <div className="border border-line/40 rounded-sm p-3">
                    <div className="text-stone mb-1">Experience</div>
                    <div className="text-charcoal font-medium">20+ years</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL SECTIONS */}
      <section className="py-6 md:py-9">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {sections.map(({ Icon, title, lines }) => (
            <article key={title} className="border border-line/30 rounded-md p-7 bg-cream">
              <Icon size={22} strokeWidth={1.5} className="text-gold mb-4" />
              <h3 className="font-display italic text-charcoal" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.2 }}>{title}</h3>
              <ul className="mt-4 space-y-2 text-body text-ink-soft leading-relaxed">
                {lines.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gold mt-1.5 shrink-0" aria-hidden>·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* VERIFY */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[820px] mx-auto px-5 md:px-8 text-center">
          <span className="hairline mb-6 inline-block bg-gold" />
          <h2 className="font-display text-h2 text-charcoal">Independent verification.</h2>
          <p className="mt-5 text-body-lg text-ink-soft">
            NMC PIN <span className="text-charcoal font-medium">05G1755E</span> can be checked at any
            time on the public NMC register. Insurance documentation, training certificates and
            full CPD records are available on request at consultation, bring identification and
            we will walk through whatever you would like to see.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://www.nmc.org.uk/registration/search-the-register/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <span>Check the NMC register</span>
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
