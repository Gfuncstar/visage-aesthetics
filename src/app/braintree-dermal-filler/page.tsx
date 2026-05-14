import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Dermal Filler in Braintree, from £110 | Visage Aesthetics',
  description: "Cheek, jawline, chin and tear-trough dermal filler in Braintree, Essex by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Hyaluronic acid, fully reversible.",
  alternates: { canonical: '/braintree-dermal-filler' },
  openGraph: {
    title: 'Dermal Filler in Braintree | Visage Aesthetics',
    description: 'Officially awarded nurse-led dermal filler on Friars Lane, Braintree. Cheek, jaw, chin and tear-trough.',
    url: 'https://www.vaclinic.co.uk/braintree-dermal-filler',
  },
}

export default function BraintreeDermalFiller() {
  return (
    <GeoLandingTemplate
      slug="braintree-dermal-filler"
      town="Braintree"
      treatment="Dermal Filler"
      travel="On the doorstep, Friars Lane, central Braintree (CM7 9BL)"
      positioningLine="Naturally balanced cheek, jaw, chin and tear-trough filler in central Braintree. Performed by a registered nurse with twenty years' clinical experience. Subtle restoration, not transformation."
      reasons={[
        { title: 'Beyond lips', body: "Cheek volume, jawline definition, chin balance and tear-trough shadows are about anatomy, not enhancement. This is filler used as architecture, holding up the face you already have." },
        { title: 'Conservative, reversible', body: "1ml at a time, never more in one sitting. Hyaluronic acid only, fully dissolvable with hyaluronidase. We keep reversal product on site. No permanent or semi-permanent filler at Visage." },
        { title: 'Awarded local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. Cannula-led technique where it improves safety. NMC registered, MSc Advanced Practice (Level 7)." },
      ]}
      priceFrom="From £200 / 1ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'What dermal filler areas do you treat in Braintree?',
          answer: 'Cheeks, jawline, chin, tear troughs, nasolabial folds, marionette lines and non-surgical rhinoplasty. Lips are covered on a dedicated page. Each area is dosed and placed individually, never a one-size-fits-all approach.',
        },
        {
          question: 'How much does dermal filler cost in Braintree?',
          answer: 'Cheek filler £200 per ml. Jawline and chin £250 per ml. Tear troughs from £250. See /pricing for the full transparent table. The consultation is free and no fee is taken until you decide to proceed.',
        },
        {
          question: 'Will my face look obvious or pillow-like?',
          answer: "Not if dosed correctly, which is the entire approach at Visage. We aim for restoration, not augmentation. Most Braintree clients arrive worried about the over-filled look they have seen elsewhere; we dose gently and review at two weeks. If you wanted dramatic, this is probably not your clinic.",
        },
        {
          question: 'Is dermal filler reversible?',
          answer: 'Yes. We use only hyaluronic acid (HA) filler, which can be dissolved with hyaluronidase if you change your mind or experience a complication. Reversal product is kept on site for both elective dissolution and emergency use. Permanent and semi-permanent fillers do not have this safety net, which is why we do not use them.',
        },
        {
          question: 'How long does dermal filler last?',
          answer: 'Typically 12 to 18 months in cheeks, jawline and tear troughs. The product gradually metabolises rather than disappearing, so the area returns smoothly to baseline. Lips dissolve faster (9 to 12 months) because they move more.',
        },
        {
          question: 'Do you use cannula or needle?',
          answer: 'Both, depending on the area. Cheeks and tear troughs are usually cannula (lower bruising and vascular risk). Jawline and chin are usually needle for placement accuracy. We choose the safer technique for each area, not the cheaper one.',
        },
      ]}
      alsoServes={['Bocking', 'Rayne', 'Coggeshall', 'Cressing', 'Felsted', 'Great Notley', 'High Garrett', 'Black Notley']}
    />
  )
}
