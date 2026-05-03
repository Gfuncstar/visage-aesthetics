import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox Maldon | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections for Maldon clients at Visage Aesthetics, Braintree, 25 minutes via the A414. Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £120.",
  alternates: { canonical: '/maldon-botox' },
  openGraph: {
    title: 'Botox for Maldon Clients | Visage Aesthetics, Braintree',
    description: 'Award-winning nurse-led Botox 25 minutes from Maldon. From £120.',
    url: 'https://www.vaclinic.co.uk/maldon-botox',
  },
}

export default function MaldonBotox() {
  return (
    <GeoLandingTemplate
      slug="maldon-botox"
      town="Maldon"
      treatment="Botox"
      travel="25 minutes from Maldon via the A414 / B1018"
      positioningLine="Maldon does not have many nurse-led aesthetics clinics. Visage is a 25-minute drive, Best Non-Surgical Aesthetics Clinic 2026, Essex, and the closest award-winning option for clients along the Blackwater estuary."
      reasons={[
        { title: 'Closest award-winning clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. Most Maldon-area aesthetic options are beauty-counter setups; Visage is medically-led with twenty years of clinical experience." },
        { title: 'Worth the 25-minute drive', body: "Free on-site parking on Friars Lane. One client in the room at a time. The drive is quieter than the Maldon High Street parking circuit." },
        { title: 'Conservative, never overdone', body: "Many Maldon clients arrive after over-treatment elsewhere. We start small. We listen. We dose to the muscle, not the area." },
      ]}
      priceFrom="From £120 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How far is Visage from Maldon?',
          answer: 'About 25 minutes by car via the A414 then B1018 northbound. Free on-site parking, no Maldon High Street meters.',
        },
        {
          question: 'Why come to Visage from Maldon?',
          answer: "It is the closest award-winning aesthetics clinic to Maldon. I hold an MSc in Advanced Practice (Level 7), rare in Essex aesthetics. Most local options are Level 4-5 trained or beauty-led. Many Maldon clients drive past several closer clinics to get here for that reason.",
        },
        {
          question: 'How much does Botox cost?',
          answer: '£120 for one area, £170 for two, £220 for three. Free consultation included. See /pricing for the full transparent price table.',
        },
        {
          question: 'Will it look natural?',
          answer: 'Yes, that is the entire approach. Conservative dosing, full expression preserved. Most clients return to work and find that colleagues notice they look "well-rested" rather than "different".',
        },
        {
          question: 'How long do results last?',
          answer: 'Typically 3 to 4 months for most clients. Most Maldon clients return every 12-16 weeks once they find their rhythm. There is no obligation to book on a fixed schedule.',
        },
        {
          question: 'How quickly can I be seen?',
          answer: 'Most consultations available within the same week. Strictly private, one appointment at a time, no shared waiting room.',
        },
      ]}
      alsoServes={['Heybridge', 'Burnham-on-Crouch', 'Tollesbury', 'Goldhanger', 'Tolleshunt D\'Arcy', 'Wickham Bishops', 'Hatfield Peverel', 'Great Totham']}
    />
  )
}
