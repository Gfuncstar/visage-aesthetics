import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox Sudbury | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections for Sudbury and South Suffolk clients at Visage Aesthetics, Braintree — 25 minutes via the A131. Best Non-Surgical Aesthetics Clinic 2026 — Essex. From £150.",
  alternates: { canonical: '/sudbury-botox' },
  openGraph: {
    title: 'Botox for Sudbury Clients | Visage Aesthetics, Braintree',
    description: 'Award-winning nurse-led Botox 25 minutes from Sudbury. From £150.',
    url: 'https://www.vaclinic.co.uk/sudbury-botox',
  },
}

export default function SudburyBotox() {
  return (
    <GeoLandingTemplate
      slug="sudbury-botox"
      town="Sudbury"
      treatment="Botox"
      travel="25 minutes from Sudbury via the A131 southbound"
      positioningLine="Sudbury sits across the Suffolk border from Essex. Most South Suffolk clients drive south for clinical-grade aesthetics — Visage is the closest award-winning clinic, 25 minutes via the A131."
      reasons={[
        { title: 'Cross the border for better care', body: "South Suffolk has very few medically-led aesthetics clinics. Best Non-Surgical Aesthetics Clinic 2026 — Essex. Worth the short drive across the border." },
        { title: 'Twenty years of clinical experience', body: "Bernadette is an NMC-registered nurse with an MSc in Advanced Practice. Most aesthetic options around Sudbury are beauty-led; Visage is medical." },
        { title: 'Free parking, no Sudbury queue', body: "Friars Lane has free on-site parking. The A131 to Braintree is one straight road. Many Sudbury clients tell us the drive is the easiest part." },
      ]}
      priceFrom="From £150 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How far is Visage from Sudbury?',
          answer: 'About 25 minutes by car via the A131 southbound, depending on traffic. Free on-site parking at the clinic — no need to use Sudbury\'s town-centre car parks.',
        },
        {
          question: 'Why come to Visage from Sudbury?',
          answer: "Closest award-winning aesthetics clinic to South Suffolk. Bernadette is one of very few aesthetic practitioners in the region with an MSc in Advanced Practice (Level 7) — the highest postgraduate nursing qualification.",
        },
        {
          question: 'How much does Botox cost?',
          answer: '£150 for one area, £190 for two, £220 for three. Free consultation included. See /pricing for the full transparent table.',
        },
        {
          question: 'Will it look natural?',
          answer: 'Yes — conservative dosing is the whole approach. Full expression preserved. Most clients tell us colleagues do not notice; only mirrors do.',
        },
        {
          question: 'How long do results last?',
          answer: 'Typically 3 to 4 months. Most Sudbury clients return every 12-16 weeks once they find their rhythm.',
        },
        {
          question: 'How quickly can I be seen?',
          answer: 'Most consultations available within the same week. Strictly private — one appointment at a time.',
        },
      ]}
      alsoServes={['Long Melford', 'Lavenham', 'Cavendish', 'Glemsford', 'Bures', 'Acton', 'Great Cornard', 'Hadleigh']}
    />
  )
}
