import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Lip Filler in Maldon, from £110 | Visage Aesthetics',
  description: "Subtle, balanced lip filler for Maldon clients at Visage Aesthetics, Braintree, 25 minutes via the A414. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £110.",
  alternates: { canonical: '/maldon-lip-filler' },
  openGraph: {
    title: 'Lip Filler for Maldon Clients | Visage Aesthetics',
    description: 'Officially awarded nurse-led lip filler 25 minutes from Maldon. From £110.',
    url: 'https://www.vaclinic.co.uk/maldon-lip-filler',
  },
}

export default function MaldonLipFiller() {
  return (
    <GeoLandingTemplate
      slug="maldon-lip-filler"
      town="Maldon"
      treatment="Lip Filler"
      travel="25 minutes via the A414, free on-site parking"
      positioningLine="Naturally balanced lip filler twenty-five minutes from Maldon. Performed by an awarded registered nurse with twenty years of clinical experience."
      reasons={[
        { title: 'A short drive across the county', body: "Twenty-five minutes via the A414. Free parking on Friars Lane, discreet entrance, strictly one client at a time." },
        { title: 'Officially awarded nurse-led care', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. NMC registered, MSc Advanced Practice (Level 7), twenty years of clinical experience." },
        { title: 'Conservative, fully reversible', body: "0.5ml or 1ml at a time. Hyaluronic acid only, dissolvable with hyaluronidase. Reversal product on site." },
      ]}
      priceFrom="From £110 / 0.5ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'How long is the drive from Maldon?',
          answer: 'Twenty-five minutes via the A414 and A12. Free parking on Friars Lane. Many Maldon clients combine the trip with shopping or lunch in central Braintree.',
        },
        {
          question: 'How much does lip filler cost in Braintree?',
          answer: 'Lip filler at Visage starts from £110 for 0.5ml and £200 for 1ml. No consultation fee, no booking pressure.',
        },
        {
          question: 'Will my lips look obvious?',
          answer: 'Not if treatment is done conservatively. We start small, review at two weeks, and only add if you want more. The aim is "your lips on a good day".',
        },
        {
          question: 'Is lip filler reversible?',
          answer: 'Yes. Hyaluronic acid filler is dissolvable with hyaluronidase. We keep reversal product on site for both elective dissolution and emergency use.',
        },
        {
          question: 'How long does it last?',
          answer: 'Typically 9 to 12 months. The product metabolises gradually so lips return to baseline smoothly rather than deflating.',
        },
      ]}
      alsoServes={['Heybridge', 'Tollesbury', 'Tolleshunt D\'Arcy', 'Goldhanger', 'Wickham Bishops', 'Hatfield Peverel']}
    />
  )
}
