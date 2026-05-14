import type { Metadata } from 'next'
import BookLandingTemplate from '@/components/sections/BookLandingTemplate'

export const metadata: Metadata = {
  title: 'Book Botox in Essex | Winner — Best Non-Surgical Aesthetics Clinic 2026',
  description: 'Free consultation for Botox / anti-wrinkle injections at Visage Aesthetics, Braintree. Winner of Best Non-Surgical Aesthetics Clinic 2026, Essex. Performed by Bernadette Tobin RGN, MSc.',
  alternates: { canonical: '/book/botox' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Book Botox — Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex',
    description: 'Free consultation. Nurse-led, NMC registered, awarded clinic in Braintree.',
    url: 'https://www.vaclinic.co.uk/book/botox',
    images: [{
      url: '/og?title=Book+Botox+in+Essex&eyebrow=Winner+2026+Best+Non-Surgical+Clinic',
      width: 1200,
      height: 630,
      alt: 'Book Botox at Visage Aesthetics — Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex',
    }],
  },
}

export default function BookBotoxPage() {
  return (
    <BookLandingTemplate
      slug="botox"
      treatment="Botox"
      heroHeadline="Botox by the winner of Essex 2026."
      heroSubhead="Free consultation. Naturally subtle Botox in Braintree by Bernadette Tobin RGN, MSc — winner of Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)."
      priceLine="From £120 / 1 area"
      trustBullets={[
        'Performed by an NMC-registered nurse (PIN 05G1755E) with an MSc in Advanced Practice. Most Essex injectors are Level 4-5.',
        'Conservative dosing, no frozen look. Two-week review included. We start small and refine — never the other way round.',
        'Strictly private — one client in the clinic at a time, free on-site parking on Friars Lane, Braintree.',
      ]}
      faqs={[
        {
          question: 'How much is Botox?',
          answer: '£120 for one area, £170 for two areas, £220 for three areas. No consultation fee, no hidden charges. Pricing is transparent on the /pricing page.',
        },
        {
          question: 'Will I look frozen?',
          answer: "No. The frozen look comes from too much product placed too widely. We dose conservatively and review at two weeks — so you can add a touch if needed, rather than chase a heavy result on day one.",
        },
        {
          question: 'How quickly can I book?',
          answer: 'Most consultations are within the same week. Strictly by appointment — there\'s no waiting room shared with anyone else, your time is yours.',
        },
        {
          question: 'How long does it last?',
          answer: 'Typically 3 to 4 months for most clients. We never push you to rebook before you need to.',
        },
        {
          question: 'Why does the award matter?',
          answer: "Aesthetics in the UK is largely unregulated — anyone can legally inject. The Health, Beauty & Wellness Awards are independently judged by industry peers. Visage Aesthetics was named Best Non-Surgical Aesthetics Clinic 2026 for Essex. The award is verifiable on the awarding body's public listing.",
        },
      ]}
      whatsappMessage="Hi, I'd like to book a free Botox consultation at Visage Aesthetics."
    />
  )
}
