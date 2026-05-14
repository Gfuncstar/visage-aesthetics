import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Lip Filler in Sudbury, from £110 | Visage Aesthetics',
  description: "Subtle, balanced lip filler for Sudbury and South Suffolk clients at Visage Aesthetics, Braintree, 20 minutes via the A131. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. From £110.",
  alternates: { canonical: '/sudbury-lip-filler' },
  openGraph: {
    title: 'Lip Filler for Sudbury Clients | Visage Aesthetics',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Nurse-led lip filler 20 minutes from Sudbury. From £110.',
    url: 'https://www.vaclinic.co.uk/sudbury-lip-filler',
  },
}

export default function SudburyLipFiller() {
  return (
    <GeoLandingTemplate
      slug="sudbury-lip-filler"
      town="Sudbury"
      treatment="Lip Filler"
      travel="20 minutes via the A131, free on-site parking"
      positioningLine="Naturally balanced lip filler twenty minutes from Sudbury. Performed by an awarded registered nurse with twenty years of clinical experience. The opposite of the high-street experience."
      reasons={[
        { title: 'Closer than most Suffolk options', body: "Twenty minutes via the A131. Free on-site parking, a discreet entrance, no shared waiting room. Many Sudbury and Long Melford clients prefer the trip to crossing into a busier Suffolk town." },
        { title: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Nurse-led', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. NMC registered, MSc Advanced Practice (Level 7). Twenty years of clinical experience behind every appointment." },
        { title: 'Conservative, reversible', body: "0.5ml or 1ml at a time, never more in one sitting. Hyaluronic acid filler with built-in lidocaine, fully dissolvable if you change your mind." },
      ]}
      priceFrom="From £110 / 0.5ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'How long is the drive from Sudbury?',
          answer: 'Twenty minutes via the A131. Free parking on Friars Lane. Closer than driving into Bury St Edmunds, and a far calmer experience than the busier Suffolk salons.',
        },
        {
          question: 'How much does lip filler cost?',
          answer: 'Lip filler at Visage starts from £110 for 0.5ml and £200 for 1ml. No consultation fee, no hidden booking charge. Full pricing on /pricing.',
        },
        {
          question: 'Will my lips look natural?',
          answer: 'That is the entire approach at Visage. Conservative dosing, two-week review, hyaluronic acid filler. Most Sudbury clients tell us friends and family say "you look well" rather than "what have you had done".',
        },
        {
          question: 'Is lip filler reversible?',
          answer: 'Yes. We use hyaluronic acid filler exclusively, dissolvable with hyaluronidase if needed. One of the safest cosmetic injectables available.',
        },
        {
          question: 'How long does it last?',
          answer: 'Typically 9 to 12 months. The product gradually metabolises, so lips return smoothly to baseline rather than deflating overnight.',
        },
      ]}
      alsoServes={['Long Melford', 'Glemsford', 'Cavendish', 'Lavenham', 'Bures', 'Boxford', 'Great Cornard']}
    />
  )
}
