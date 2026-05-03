import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/dermal-filler' },
  title: 'Dermal Filler Braintree | Award-Winning Nurse-Led | Visage Aesthetics',
  description:
    'Subtle, balanced dermal filler in Braintree, Essex. Hyaluronic acid for lips, cheeks and jawline by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). From £110, fully reversible.',
}

export default function Page() {
  const treatment = getTreatment('dermal-filler')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Restore lost volume, refine contour and gently enhance lips with hyaluronic acid filler. Fully reversible, performed by a registered nurse with twenty years' clinical experience."
      overview="Dermal filler is a hyaluronic acid (HA) gel, a sugar molecule that occurs naturally in your skin, joints and connective tissue, placed in a specific layer of tissue where it physically takes up space. It does not stimulate the body to do anything; it simply sits there, holding up the surrounding tissue, until the body slowly metabolises it. The brands used at Visage are the major regulated UK manufacturers, Juvederm, Restylane, Teosyal, Belotero, chosen by viscosity, longevity and licensed indication for the area being treated. Each contains lidocaine for comfort. Treatment lasts 9 to 18 months depending on product and area; lips dissolve faster than cheeks. Critically, HA filler is fully reversible. If you don't like the result, or if a complication occurs, the filler can be dissolved within 24-48 hours using an enzyme called hyaluronidase. We do not work with permanent or semi-permanent fillers at Visage, the reversibility is one of the main reasons HA is the safest cosmetic injectable available. I am a conservative practitioner: 0.5ml or 1ml at a time, never more in one sitting, build slowly. Many of the clients who come to Visage from Chelmsford, Colchester and Halstead have arrived after over-treatment elsewhere; the fix is rarely more product, it's patience and reversal. The clinic was named Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards) for exactly this kind of conservative, medically-led work. Treatment areas include lips (the most popular use), cheeks, tear troughs, jawline and chin, non-surgical rhinoplasty, marionette lines and the nasolabial folds. Each area is dosed and placed individually, no one-size-fits-all approach. Most clients begin with their primary concern only, settle for two weeks, and decide whether to add more at review."
      benefits={[
        'Restores volume in cheeks, tear troughs and jawline that has thinned with age.',
        'Defines and balances lips with subtle, hydrated, natural-looking results.',
        'Smooths nasolabial folds and marionette lines for a less tired appearance.',
        'Non-surgical jawline and chin contouring, a procedure-light alternative to surgery.',
        'Built-in lidocaine for comfort during treatment.',
        'Fully reversible with hyaluronidase if you change your mind or a complication occurs.',
        'Results visible immediately, fully settled within 2 weeks.',
        'Lasts 9 to 18 months depending on the area and product.',
        'Performed by an NMC-registered nurse with MSc Advanced Practice (Level 7).',
      ]}
      suitableFor={[
        'Adults aged 21 and over (we do not treat under-21s for cosmetic purposes).',
        'Anyone wanting subtle volume restoration to areas that have thinned.',
        'Clients seeking lip definition with a 0.5ml or 1ml conservative approach.',
        'People with marionette lines or nasolabial folds wanting less-tired-looking skin.',
        'Anyone considering non-surgical chin or jawline contouring.',
        'Clients seeking an honest second opinion after over-treatment elsewhere.',
        'People bothered by tear-trough shadows that are caused by volume loss (not skin tone).',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Active skin infection, rash or cold sore in or near the treatment area.',
        'Allergy to hyaluronic acid or lidocaine.',
        'Recent (within 4 weeks) facial laser, peels or surgery in the area.',
        'Currently on blood-thinning medication that has not been reviewed with your GP.',
        'History of significant filler complication that needs further investigation first.',
        'Unrealistic expectations, we will say so honestly at consultation.',
      ]}
      expect={{
        before:
          'A free 30-minute consultation: we discuss the area, take a full medical history, examine your facial structure at rest and in expression, photograph with consent, and agree the dose and product. Avoid alcohol and blood-thinning supplements (fish oil, ibuprofen) for 24 hours before to reduce bruising.',
        during:
          'Numbing cream is applied if needed (the products contain lidocaine already). The injection itself takes 15-30 minutes depending on the area. Fine cannulas or needles are used, we choose the safer technique for each area. Most clients describe it as more comfortable than expected.',
        after:
          'Some swelling for 24-48 hours is normal; bruising is possible but not guaranteed. You can return to work the same day for most areas (lips can look briefly fuller). Avoid the gym, sauna, hot yoga, alcohol and dental work for 24 hours. Two-week review included.',
      }}
      pricingNote="Lip filler from £110 (0.5ml) or £200 (1ml). Cheek filler £200 per ml. Jawline £250 per ml. The fee covers your treatment, all product and a complimentary two-week review. There is no consultation fee. See /pricing for the full transparent table."
      faqs={[
        {
          question: 'How much filler should I have for my first time?',
          answer:
            'For most first-time clients we recommend 0.5ml, enough for subtle definition without anyone noticing. After the two-week settle you can decide if you want another 0.5ml. Going slowly is always the right move, especially in lips. Many clients arrive thinking they want 2ml because that is what they have seen on social media; almost all leave at the first appointment with 0.5ml and a follow-up booked for review. The result is more natural and the cost spread is gentler.',
        },
        {
          question: 'Will my lips look obvious or duck-like?',
          answer:
            'Not if treatment is done conservatively, which is the entire approach at Visage. We aim for "your lips on a good day", naturally balanced, hydrated and slightly defined. No tray-table profile, no cartoon shapes, no "duck lips". The duck-lip look comes almost entirely from too much product placed too superficially. We use the right viscosity for the area and dose carefully. If after the two-week review you want a touch more, we can add, but if you arrived thinking you wanted dramatic lips, expect to leave with a more measured plan.',
        },
        {
          question: 'Is filler reversible?',
          answer:
            'Yes, and this is one of the most important features of the products we use. Hyaluronic acid filler can be dissolved using an enzyme called hyaluronidase, usually within 24-48 hours of injection, fully restoring the area to baseline. We keep hyaluronidase on site for both elective dissolution and emergency use. Permanent and semi-permanent fillers do not have this safety net, which is why we do not use them.',
        },
        {
          question: 'How long does dermal filler last?',
          answer:
            "Generally 9 to 12 months in lips and 12 to 18 months in cheeks, jawline and tear troughs. The exact duration depends on the product chosen, the area treated, your metabolism, and how active you are. Lips dissolve faster because they move constantly. Cheeks dissolve slowly because they don't. Filler does not snap back to baseline; it gradually metabolises so your face returns to where it was before treatment, never below.",
        },
        {
          question: 'What is the difference between dermal filler and Profhilo?',
          answer:
            'They are completely different treatments despite both being hyaluronic-acid-based injections. Filler adds volume in a specific area where you have lost fullness or want definition. Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid, improving hydration and texture across the treated area, never volume. Many clients have both, planned together. The /treatments/profhilo page goes into more detail, and /blog/profhilo-vs-dermal-filler compares them in plain English.',
        },
        {
          question: 'Will I bruise?',
          answer:
            'Bruising is possible but not guaranteed. Lips and tear troughs are more prone because of the blood vessels in those areas. We minimise risk by using cannulas where appropriate, avoiding blood thinners 24 hours before, and using ice during treatment. If you have an event coming up, schedule treatment at least 2-3 weeks in advance, we always recommend not having lip filler within two weeks of a wedding or major event.',
        },
        {
          question: 'Are dermal fillers safe?',
          answer:
            'Hyaluronic acid filler from a regulated brand, performed by a qualified medical professional with reversal product on site, is one of the safest cosmetic injectables available. The risk is almost entirely in the practitioner. The most serious complication, vascular occlusion, is rare and treatable when caught quickly, which is why where we inject and how (cannula vs needle) matters more than which brand. The aesthetic industry in the UK is largely unregulated; make sure whoever treats you can show NMC or GMC registration, indemnity insurance, and reversal protocols on site.',
        },
        {
          question: 'Can I have filler if I had filler elsewhere?',
          answer:
            'Yes, but we may want to dissolve old filler first, particularly if it was placed badly, has migrated, or has caused unevenness. We will be honest at consultation about whether starting fresh would give a better result than working over what is there. Many clients who have had treatment elsewhere come for an assessment specifically because they want a cleaner foundation.',
        },
        {
          question: 'Do you treat clients from across Essex?',
          answer:
            'Yes, clients travel to Friars Lane from Chelmsford, Colchester, Halstead, Witham, Maldon, Sudbury and across the county. Dedicated travel pages: /braintree-lip-filler and /chelmsford-lip-filler. Free on-site parking and a discreet entrance.',
        },
      ]}
      practitionerNote="My approach to filler is conservative by default. I would rather start with 0.5ml and add at review than rush to a heavier result. Filler is reversible, but reversal still takes a session and a fee, going slowly first time round saves you both. Subtle, balanced, and reversible. That is the entire job."
    />
  )
}
