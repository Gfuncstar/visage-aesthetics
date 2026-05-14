import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox in Great Dunmow, from £120 | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections for Great Dunmow clients at Visage Aesthetics, Braintree, 15 minutes via the A120. Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £120.",
  alternates: { canonical: '/great-dunmow-botox' },
  openGraph: {
    title: 'Botox for Great Dunmow Clients | Visage Aesthetics, Braintree',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Nurse-led Botox 15 minutes from Great Dunmow. From £120.',
    url: 'https://www.vaclinic.co.uk/great-dunmow-botox',
  },
}

export default function GreatDunmowBotox() {
  return (
    <GeoLandingTemplate
      slug="great-dunmow-botox"
      town="Great Dunmow"
      treatment="Botox"
      travel="15 minutes from Great Dunmow via the A120 eastbound"
      positioningLine="Great Dunmow has limited aesthetic options for clients who want medically-led care. Visage is the closest Best Non-Surgical Aesthetics Clinic 2026, Essex winner, a 15-minute drive down the A120."
      reasons={[
        { title: 'Closest Best Non-Surgical Aesthetics Clinic 2026, Essex winner', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. The closest award-recognised clinic for the Great Dunmow, Felsted and Stansted area." },
        { title: 'Fifteen minutes door-to-door', body: "A120 eastbound, free parking on Friars Lane. Quicker and quieter than driving into Stansted or Bishops Stortford for treatment." },
        { title: 'A nurse with an MSc', body: "I hold a Level 7 MSc in Advanced Practice, rare in Essex aesthetics. Most local aestheticians are Level 4-5 trained or beauty-led." },
      ]}
      priceFrom="From £120 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How far is Visage from Great Dunmow?',
          answer: '15 minutes by car via the A120 eastbound. Free on-site parking, quicker and easier than the central Dunmow car park circuit.',
        },
        {
          question: 'Why come to Visage from Great Dunmow?',
          answer: "Closest Best Non-Surgical Aesthetics Clinic 2026, Essex winner. I hold an MSc Advanced Practice (Level 7), rare in Essex aesthetics, where most practitioners are Level 4-5.",
        },
        {
          question: 'How much does Botox cost?',
          answer: '£120 for one area, £170 for two, £220 for three. Free consultation included. Pricing transparent at /pricing.',
        },
        {
          question: 'How quickly can I be seen?',
          answer: 'Most consultations available within the same week. Strictly private, one appointment at a time.',
        },
        {
          question: 'Will the result look natural?',
          answer: 'Yes, that is the whole approach. Conservative dosing, full expression preserved.',
        },
        {
          question: 'How long do results last?',
          answer: 'Typically 3 to 4 months. Most clients return every 12-16 weeks once they find their rhythm.',
        },
      ]}
      alsoServes={['Felsted', 'Hatfield Heath', 'Takeley', 'Thaxted', 'Stansted Mountfitchet', 'Little Easton', 'High Easter', 'Barnston']}
    />
  )
}
