import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'CryoPen Skin Lesion Removal | Visage Aesthetics',
  description:
    'CryoPen cryotherapy for skin tags, warts, milia, age spots and benign lesions. Visage Aesthetics, Braintree, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex.',
  path: '/treatments/cryopen',
  ogTitle: 'CryoPen Skin Lesion Removal',
  eyebrow: 'Nurse-led treatment',
})

export default function Page() {
  const treatment = getTreatment('cryopen')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Targeted cryotherapy that removes benign skin lesions in seconds with little to no scarring."
      overview="CryoPen is a precise medical cryotherapy device that delivers a fine jet of nitrous oxide directly to a skin lesion, freezing it at the cellular level so the body can clear it naturally over the following days. It is fast, controlled and highly accurate, which makes it ideal for skin tags, warts, verrucas, milia, cherry angiomas and age spots. Unlike older freezing methods, CryoPen affects only the lesion itself and very little of the surrounding skin, so healing is quick and scarring is rare. Most lesions clear in one session and many appointments are completed in under 15 minutes from start to finish."
      benefits={[
        'Removes skin tags, warts, milia, cherry angiomas and age spots.',
        'Highly precise, with minimal effect on surrounding skin.',
        'Most lesions clear in a single short session.',
        'Quick walk-in walk-out treatment, often under 15 minutes.',
        'No anaesthetic injection, no stitches, no surgical scar.',
        'Suitable for face, neck, hands and body.',
      ]}
      suitableFor={[
        'Confirmed benign skin tags, warts, verrucas and milia.',
        'Cosmetic age spots, cherry angiomas and pigmented lesions.',
        'Adults and teenagers with parental consent.',
        'Anyone wanting a quick, scar-free alternative to surgical removal.',
      ]}
      notSuitableFor={[
        'Any undiagnosed or changing skin lesion (must be assessed first).',
        'Lesions immediately around the eye without specialist referral.',
        'Pregnant women, depending on lesion type and location.',
        'Active infection, broken skin or known cold sensitivity at the site.',
      ]}
      expect={{
        before:
          'A short consultation to assess the lesion and confirm it is suitable for CryoPen. If anything looks suspicious I will refer you to a dermatologist before doing anything.',
        during:
          'A precise jet of cold gas is applied to the lesion in short bursts of around five to thirty seconds. You will feel a sharp cold sting that fades quickly.',
        after:
          'A small blister, scab or darker patch forms over the lesion and falls away naturally over one to three weeks. Keep the area dry for 24 hours.',
      }}
      pricingNote="From \u00a380 for a single lesion, with discounted pricing for additional lesions treated in the same appointment. Larger or more stubborn lesions occasionally need a second session four weeks later, which is included in the original fee."
      faqs={[
        {
          question: 'Does the treatment hurt?',
          answer:
            'You will feel a sharp cold sting while the gas is being applied, similar to holding ice firmly against the skin, that lasts only as long as the freeze itself, usually five to thirty seconds. Most clients describe it as uncomfortable rather than painful and find it very manageable without anaesthetic. The treated area can feel tender or itchy for an hour or two afterwards, then settles. Children and teenagers are usually more concerned about the noise of the device than the actual sensation.',
        },
        {
          question: 'How many sessions will I need?',
          answer:
            'Most lesions clear in a single session, particularly skin tags, milia and cherry angiomas. Stubborn warts and verrucas, and larger pigmented spots, can occasionally need a second session four weeks later once the first treatment has fully healed. I will tell you honestly at consultation what to expect, including any lesion that may need more than one go. The follow-up session, if needed, is usually included in the original quote rather than charged separately.',
        },
        {
          question: 'What is the aftercare?',
          answer:
            'Keep the area dry for the first 24 hours, then wash gently as normal. A small blister or scab usually forms within a day and should be left completely alone, no picking, no scrubbing and no creams unless advised. The scab falls away naturally over one to three weeks, revealing fresh skin underneath. SPF 30 or higher on the area for the following month helps prevent any temporary darkening, particularly on the face and hands.',
        },
        {
          question: 'How is CryoPen different from surgical removal?',
          answer:
            'Surgical removal involves a local anaesthetic injection, a scalpel and stitches, with a small permanent scar at the site. CryoPen needs no injection, leaves no incision and rarely scars when used on appropriate lesions. The trade-off is that surgery sends the lesion off for laboratory analysis, which CryoPen cannot do. That is why I will always refer any lesion that looks even slightly suspicious for surgical removal and biopsy rather than treating it cosmetically.',
        },
        {
          question: 'What lesions can be treated?',
          answer:
            'Skin tags, common warts, verrucas, milia, cherry angiomas, seborrhoeic keratoses, age spots and small areas of sun-related pigmentation all respond well to CryoPen. Moles, irregular pigmented lesions and anything that has changed in size, shape or colour are not suitable for cosmetic treatment until they have been properly assessed, usually by a GP or dermatologist. If you are unsure, bring photos and any relevant history to your consultation and I will guide you on the safest next step.',
        },
      ]}
      practitionerNote="The most important part of any lesion appointment is the assessment, not the treatment. I would much rather send you for a dermatology opinion you did not strictly need than treat something cosmetically that should have been biopsied. Safety first, every time."
    />
  )
}
