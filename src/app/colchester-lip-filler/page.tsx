import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Lip Filler in Colchester, from £110 | Visage Aesthetics',
  description: "Subtle, balanced lip filler for Colchester clients at Visage Aesthetics, Braintree, 25 minutes away. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £110.",
  alternates: { canonical: '/colchester-lip-filler' },
  openGraph: {
    title: 'Lip Filler for Colchester Clients | Visage Aesthetics',
    description: 'Officially awarded nurse-led lip filler 25 minutes from Colchester. From £110.',
    url: 'https://www.vaclinic.co.uk/colchester-lip-filler',
  },
}

export default function ColchesterLipFiller() {
  return (
    <GeoLandingTemplate
      slug="colchester-lip-filler"
      town="Colchester"
      treatment="Lip Filler"
      travel="25 minutes from central Colchester, free on-site parking"
      positioningLine="Naturally balanced lip filler twenty-five minutes from Colchester. Performed by an awarded registered nurse with twenty years of clinical experience. The opposite of a high-street salon."
      reasons={[
        { title: 'Worth the 25-minute drive', body: "Free parking, one client in the room at a time, no salon vibe. Many Colchester clients tell us the drive is the easiest part of the experience." },
        { title: 'Awarded nurse-led clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. RGN, MSc Advanced Practice (Level 7), twenty years of clinical experience. Most Colchester injectors are Level 4-5." },
        { title: 'Conservative, fully reversible', body: "0.5ml or 1ml at a time. Hyaluronic acid only, fully dissolvable. Reversal product on site. No permanent or semi-permanent filler at Visage." },
      ]}
      priceFrom="From £110 / 0.5ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'How long is the drive from Colchester?',
          answer: 'About twenty-five minutes via the A12 and A120. Free on-site parking. Many Colchester clients arrive after over-treatment at busier salons and prefer the quiet of a single-client private clinic.',
        },
        {
          question: 'How much does lip filler cost?',
          answer: 'Lip filler at Visage is £110 for 0.5ml and £200 for 1ml. The consultation is free. Transparent pricing across the site, see /pricing for the full table.',
        },
        {
          question: 'Will I look obviously done?',
          answer: 'Not if dosed correctly. We start at 0.5ml, review at two weeks, and only add if needed. The aim is "your lips on a good day", not someone else\'s lips on yours.',
        },
        {
          question: 'Is lip filler reversible?',
          answer: 'Yes. Hyaluronic acid filler can be dissolved with hyaluronidase if you change your mind or experience a complication. We use only HA filler for exactly this reason.',
        },
        {
          question: 'How long does it last?',
          answer: 'Typically 9 to 12 months. Lips dissolve faster than cheeks because they move constantly. The product gradually metabolises rather than disappearing in one go.',
        },
      ]}
      alsoServes={['Stanway', 'Marks Tey', 'Lexden', 'Tiptree', 'West Bergholt', 'Wivenhoe', 'Highwoods']}
    />
  )
}
