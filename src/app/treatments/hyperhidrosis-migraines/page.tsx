import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/hyperhidrosis-migraines' },
  title: 'Hyperhidrosis & Migraines | Awarded Best Clinic Essex 2026',
  description:
    'Botulinum toxin treatment for excessive sweating and chronic migraine prevention. Visage Aesthetics, Braintree, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex.',
}

export default function Page() {
  const treatment = getTreatment('hyperhidrosis-migraines')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Medical-grade botulinum toxin used to calm excessive sweating and prevent chronic migraine attacks."
      overview="The same botulinum toxin used for cosmetic anti-wrinkle treatment has powerful, well-evidenced medical uses for hyperhidrosis (excessive sweating of the underarms, palms or soles) and chronic migraine. For sweating, the injections temporarily block the chemical signal that triggers the sweat glands, dramatically reducing perspiration in the treated area for around six months. For migraine, a series of injections across set points on the head, neck and shoulders can prevent attacks from starting, with NICE-recognised benefit for adults experiencing fifteen or more headache days a month. Both treatments are genuinely life-changing for the right candidates."
      benefits={[
        'Significantly reduces underarm, palm or sole sweating for around six months.',
        'Prevents chronic migraine attacks in suitable candidates.',
        'Restores confidence in clothing, social and work settings.',
        'Reduces reliance on antiperspirants, pads and rescue medication.',
        'Backed by strong clinical evidence for both indications.',
        'Often the first treatment that finally works after years of trying everything else.',
      ]}
      suitableFor={[
        'Diagnosed hyperhidrosis that has not responded to topical treatments.',
        'Chronic migraine sufferers with fifteen or more headache days per month.',
        'Adults whose symptoms genuinely interfere with daily life.',
        'GP-referred patients welcomed and notes shared with consent.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Anyone with neuromuscular conditions such as myasthenia gravis.',
        'Active infection, rash or broken skin in the planned treatment area.',
        'Allergy to botulinum toxin or any of its ingredients.',
      ]}
      expect={{
        before:
          'A detailed medical consultation including symptom history and previous treatments tried. Avoid antiperspirants on the day for sweating treatment.',
        during:
          'A series of small injections placed across the treatment area. Underarms take around 15 minutes; the migraine protocol takes 25 to 30 minutes.',
        after:
          'Effects build gradually over one to two weeks. Avoid heavy exercise, saunas and very hot showers for 24 hours, then resume normal life.',
      }}
      pricingNote="From \u00a3350 per session, depending on the area treated and the dose required. Some private medical insurers contribute towards the cost; I am happy to provide an itemised invoice for your claim."
      faqs={[
        {
          question: 'How is this different from cosmetic anti-wrinkle treatment?',
          answer:
            'The product is the same, but the dose, the placement and the goal are completely different. Cosmetic treatment uses small doses to soften facial expression. The medical protocols use considerably more product, distributed across the underarms, palms or, for migraine, around thirty injection points across the head, neck and shoulders. The technique requires specific medical training, which is why I recommend seeing a registered nurse or doctor with experience in both indications rather than a general aesthetic clinic.',
        },
        {
          question: 'How long does it last?',
          answer:
            'For hyperhidrosis, most clients see the benefit lasting around six months, occasionally longer in palms and soles. For migraine, the protocol is repeated every twelve weeks, which is the schedule that most clinical trials supported. Many clients notice the migraine benefit building over the first two cycles rather than peaking after a single session, so I usually recommend committing to two consecutive treatments before judging whether it is right for you. After that, the pattern of treatment can be tailored.',
        },
        {
          question: 'Do I need a GP referral?',
          answer:
            'A referral is not required, but it is welcomed and often helpful. For chronic migraine in particular, a letter from your GP or neurologist confirming your diagnosis and medication history allows me to fit any treatment alongside your wider care rather than in isolation. With your consent I will share clinical notes back. If you do not have a referral, that is fine: bring as much detail as you can about previous treatments, headache diaries and current medication so we can build the same picture together.',
        },
        {
          question: 'Will my insurance cover the treatment?',
          answer:
            'Some private medical insurers will contribute towards botulinum toxin treatment for diagnosed chronic migraine and severe hyperhidrosis, particularly when other treatments have failed and a clinical letter supports the request. Cover varies enormously by policy and provider, so I always recommend speaking with your insurer first and asking specifically about procedure codes for botulinum toxin. I provide a fully itemised invoice that you can submit for reimbursement.',
        },
        {
          question: 'How effective is it?',
          answer:
            'For underarm hyperhidrosis the published response rate sits at around 80 to 90 percent of clients seeing significant improvement, often a dramatic reduction in sweating within two weeks. For chronic migraine, well-designed trials show roughly half of suitable candidates experience a meaningful drop in headache days, with some seeing eight or more migraine-free days per month back. It is not a guaranteed cure, but for the right candidate it is one of the most effective interventions available.',
        },
      ]}
      practitionerNote="These are the appointments that remind me why I do this work. When a patient who has not raised their arms in public for ten years walks out smiling, or a migraine sufferer reports their first clear weekend in a year, the impact is on a different scale to anything cosmetic."
    />
  )
}
