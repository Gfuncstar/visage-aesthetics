import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/map-my-mole' },
  title: 'Map My Mole | Visage Aesthetics',
  description:
    'Have a concerning mole or skin lesion reviewed by a UK consultant dermatologist within 24 hours. Medical-grade dermoscopy at Visage Aesthetics, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. £90 per mole.',
}

export default function Page() {
  const treatment = getTreatment('map-my-mole')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="A concerning mole reviewed by a UK consultant dermatologist within 24 hours, without the GP wait list."
      overview="Map My Mole is a digital mole-review service that gives you direct access to UK consultant dermatologists, used at Visage Aesthetics for any mole or skin lesion you would like a clinical opinion on. The process is simple: at your appointment we use a medical-grade DE-300 dermatoscope, the same imaging device dermatologists use in hospital clinics, to capture high-resolution images of any mole or lesion you are concerned about. Those images are then submitted through the Map My Mole platform for review by a UK-based consultant dermatologist, who returns a written report within 24 hours in most cases. The report tells you whether the lesion is benign, whether it warrants monitoring, or whether you should be seen in person by a dermatologist or your GP for further investigation. Early detection is everything in skin cancer outcomes, melanoma in particular has a 99%+ five-year survival rate when caught in its earliest stage, dropping rapidly when caught later. NHS dermatology waiting lists in much of the UK now exceed 18 weeks for non-urgent referrals, so a 24-hour expert opinion fills a meaningful gap. Map My Mole is recommended by insurers and used by aesthetic clinics, pharmacies, private GPs and other healthcare partners across the UK. Importantly: this service is dermatologist-reviewed, not AI-screened. A real consultant looks at every submission. The £90 fee covers the dermatoscope imaging, platform submission, expert review and your written report. Most appointments take 15-20 minutes per mole. If you have multiple moles you would like reviewed we can do them all in the same appointment, pricing is per mole."
      benefits={[
        'Direct access to a UK consultant dermatologist for a written opinion within 24 hours.',
        'Medical-grade DE-300 dermatoscope imaging, the same device used in NHS dermatology clinics.',
        'Skips the 18+ week NHS dermatology waiting list for non-urgent referrals.',
        'Reviewed by a real consultant, not AI screening.',
        'Written report you can share with your GP or specialist if onward referral is needed.',
        'Recommended by insurers, accepted by most private medical insurance policies.',
        'Quick 15-20 minute appointment per mole.',
        'Multiple moles can be reviewed in one appointment.',
        'Performed at Visage by an NMC-registered nurse with MSc Advanced Practice (Level 7).',
      ]}
      suitableFor={[
        'Anyone with a new mole or skin lesion that has appeared recently.',
        'Existing moles that have changed in size, shape, colour or texture.',
        'Moles that itch, bleed, crust over or have started to feel different.',
        'People with a personal or family history of skin cancer.',
        'Anyone with significant sun exposure, particularly with fair skin.',
        'Clients waiting on an NHS dermatology referral who want an interim expert opinion.',
        'People seeking peace of mind without a long wait, a "is this normal?" check.',
        'Travellers wanting their skin checked after extended sun exposure.',
      ]}
      notSuitableFor={[
        'Lesions that are actively bleeding, infected or rapidly changing, these need urgent in-person assessment, not photo-review.',
        'Children under 18 (referred to specialist paediatric dermatology services).',
        'Lesions inside the mouth, in the ear canal, or in other areas the dermatoscope cannot reach safely.',
        'People who have already had a recent dermatologist review of the same lesion (unless seeking a second opinion).',
      ]}
      expect={{
        before:
          'Make a list of any moles or lesions you would like reviewed. Take note of any change in colour, size, shape, itchiness or bleeding. Avoid applying makeup, fake tan or thick moisturiser to the area on the day of your appointment, as it interferes with imaging.',
        during:
          'I will examine each mole or lesion you have flagged, then capture high-resolution images using the medical-grade DE-300 dermatoscope. The imaging itself is non-invasive, the dermatoscope is held against the skin with a small amount of contact gel. Each image takes seconds. We submit the images to the Map My Mole platform during the appointment.',
        after:
          'You will receive your written dermatologist report by email within 24 hours in most cases (occasionally up to 72 hours during peak demand). The report explains the dermatologist\'s opinion in plain English and recommends any next steps. If onward referral is needed, you can take the report to your GP or specialist directly.',
      }}
      pricingNote="£90 per mole, including the dermatoscope imaging, platform submission, consultant dermatologist review and your written report. Multiple moles can be reviewed in the same appointment, billed per mole. There is no consultation fee. See /pricing for the full transparent table."
      faqs={[
        {
          question: 'How fast will I get my results?',
          answer:
            'Most reports are returned within 24 hours of the images being submitted, with a minority taking up to 72 hours during peak demand. The dermatologist provides a written report explaining their opinion and any recommended next steps. You will receive it by email and we keep a copy on file at Visage.',
        },
        {
          question: 'Is this a real dermatologist or AI?',
          answer:
            'Every Map My Mole submission is reviewed by a UK consultant dermatologist, a real person, with full GMC registration and specialist dermatology training. AI-only screening tools exist on the market and are useful for some applications, but for any lesion that might be cancerous a human consultant opinion is the standard. That is what you get here.',
        },
        {
          question: 'How is this different from a GP appointment?',
          answer:
            'Your GP can examine a mole and refer you onward if they have concerns, but most GPs are not specialist dermatologists. NHS dermatology waiting lists for non-urgent referrals frequently exceed 18 weeks. Map My Mole gives you a written consultant dermatologist opinion within 24 hours. If the consultant thinks you need in-person specialist review, the report supports that referral and can speed it up.',
        },
        {
          question: 'What signs should I look out for in a mole?',
          answer:
            'The standard rule of thumb is the "ABCDE" check: A symmetry (one half not matching the other), B order (irregular or jagged edges), C olour (multiple shades or unusual colours), D iameter (larger than 6mm, about the size of a pencil eraser), E volution (changing in any way over weeks or months). Any of these warrants review. Itching, bleeding, crusting or pain in a mole is also worth getting checked. If in doubt, book.',
        },
        {
          question: 'Will my insurance cover this?',
          answer:
            'Map My Mole is recommended by insurers and accepted under most private medical insurance policies that include skin/dermatology cover. Check with your insurer first, we can provide an itemised invoice for reimbursement, but cannot bill insurers directly.',
        },
        {
          question: 'Can I have multiple moles reviewed in one appointment?',
          answer:
            'Yes. Pricing is £90 per mole, so a 3-mole review is £270. We allow 15-20 minutes per mole; for multiple moles we book a longer appointment. If you are unsure how many moles you would like reviewed, come in and we can discuss it as part of the assessment.',
        },
        {
          question: 'What happens if the dermatologist is concerned?',
          answer:
            'If the consultant flags a mole as concerning, the platform triggers an automatic callback and the dermatologist will recommend you see your GP or a specialist for in-person assessment. We help you understand the report and, where appropriate, contact your GP on your behalf to expedite the referral. The written report supports a 2-week-wait suspected cancer referral if that is the recommendation.',
        },
        {
          question: 'Why is this offered at an aesthetics clinic?',
          answer:
            'Aesthetic practitioners spend a great deal of time examining clients\' skin in detail. Many of the moles flagged through Map My Mole nationally are spotted opportunistically during aesthetic consultations. Offering the service formally means anyone, whether they are an existing aesthetics client or not, can access an expert mole opinion quickly. It is also a natural fit for the medically-led approach at Visage.',
        },
      ]}
      practitionerNote="I am a registered nurse, not a dermatologist, and that is precisely why this service exists. My role is to capture the images correctly and submit them. The opinion that matters is the consultant dermatologist's. What I bring is fast appointment access, careful clinical examination, and a clear explanation of the report when it comes back."
    />
  )
}
