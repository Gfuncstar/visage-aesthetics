import type { Metadata } from 'next'
import BookLandingTemplate from '@/components/sections/BookLandingTemplate'

export const metadata: Metadata = {
  title: 'Free Aesthetics Consultation in Essex | Winner — Best Non-Surgical Clinic 2026',
  description: 'Book a free, unhurried aesthetics consultation at Visage Aesthetics, Braintree. Winner of Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc.',
  alternates: { canonical: '/book/free-consultation' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Free Consultation — Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex',
    description: 'Honest clinical conversation. No pressure. No upselling.',
    url: 'https://www.vaclinic.co.uk/book/free-consultation',
    images: [{
      url: '/og?title=Free+Aesthetics+Consultation&eyebrow=Winner+2026+Best+Non-Surgical+Clinic',
      width: 1200,
      height: 630,
      alt: 'Book a free aesthetics consultation at Visage Aesthetics, Braintree',
    }],
  },
}

export default function BookConsultationPage() {
  return (
    <BookLandingTemplate
      slug="free-consultation"
      treatment="aesthetics"
      heroHeadline="Free consultation with the winner of Essex 2026."
      heroSubhead="A calm, unhurried, clinical conversation about what's right for you — including when the right answer is no treatment at all. Winner of Best Non-Surgical Aesthetics Clinic 2026, Essex."
      priceLine="Always free · No booking deposit"
      trustBullets={[
        'Around 45 minutes, in the treatment room, with the door closed and the diary blocked off. Strictly one client in the clinic at a time.',
        'Performed by an NMC-registered nurse (PIN 05G1755E) with MSc Advanced Practice (Level 7) and 20+ years clinical experience.',
        'No upsell, no countdown, no booking pressure. You leave with a written plan and a price, and you take whatever time you need.',
      ]}
      faqs={[
        {
          question: "What happens at the consultation?",
          answer: "We start with a chat about what you've noticed, what you would like to soften or refresh, and what you absolutely don't want to change. Photos with consent, an honest assessment, a written treatment plan and a price. No pressure to decide on the day.",
        },
        {
          question: 'Is the consultation really free?',
          answer: 'Yes. Always. No booking fee, no deposit, no obligation to proceed.',
        },
        {
          question: 'What if I don\'t need treatment?',
          answer: 'Then I will say so. Sometimes the right answer is skincare first and a return visit in the new year. Sometimes it is nothing at all. The point of a free consultation is to give you the honest version, not a sales pitch.',
        },
        {
          question: 'Which treatments are covered?',
          answer: "Anti-wrinkle (Botox), dermal and lip filler, Profhilo, HarmonyCa, micro-needling, AQUALYX, CryoPen, hyperhidrosis Botox, vitamin B12, men's aesthetics, and a consultant-dermatologist mole review service. We discuss what's right for your concern, not what's on a sales sheet.",
        },
        {
          question: 'Why does the award matter?',
          answer: "Aesthetics in the UK is largely unregulated. The Health, Beauty & Wellness Awards are independently judged by industry peers. Visage Aesthetics was named Best Non-Surgical Aesthetics Clinic 2026 for Essex — verifiable on the awarding body's public winners listing.",
        },
      ]}
      whatsappMessage="Hi, I'd like to ask about a free consultation at Visage Aesthetics."
    />
  )
}
