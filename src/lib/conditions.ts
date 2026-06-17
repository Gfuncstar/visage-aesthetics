/**
 * Condition-led answer pages.
 *
 * Purpose (AEO): condition queries ("how to stop excessive sweating",
 * "botox for chronic migraines", "should I get a mole checked") don't map
 * cleanly onto a treatment page. These pages answer the condition question
 * first, then route to the treatment that addresses it. Each is the canonical
 * landing page for its intent cluster.
 *
 * Every fact here is sourced from the matching treatment in src/lib/treatments.ts
 * (hyperhidrosis-migraines, map-my-mole) — no new clinical claims are made.
 */
export type ConditionFaq = { question: string; answer: string }

export type Condition = {
  slug: string
  href: string
  /** The condition itself, e.g. "Excessive sweating (hyperhidrosis)" */
  name: string
  /** Synonyms a searcher might use — feeds MedicalCondition.alternateName */
  alternateNames: string[]
  metaTitle: string
  metaDescription: string
  /** Answer-first H1 — phrased as the question a searcher asks */
  h1: string
  /** Direct answer, sits in the first 150 words */
  answer: string
  /** Plain-English "what it is" */
  whatItIs: string
  /** How Visage treats it, linking to the treatment page */
  howWeTreat: string
  /** The treatment that addresses this condition */
  treatmentName: string
  treatmentSlug: string
  treatmentHref: string
  priceFrom: string
  whoItsFor: string[]
  faqs: ConditionFaq[]
}

export const conditions: Condition[] = [
  {
    slug: 'excessive-sweating',
    href: '/conditions/excessive-sweating',
    name: 'Excessive sweating (hyperhidrosis)',
    alternateNames: ['hyperhidrosis', 'excessive underarm sweating', 'sweaty armpits', 'axillary hyperhidrosis'],
    metaTitle: 'Excessive Sweating (Hyperhidrosis) Treatment Braintree, Essex | Visage Aesthetics',
    metaDescription:
      'Nurse-led treatment for excessive sweating (hyperhidrosis) in Braintree, Essex. Botulinum toxin injections reduce underarm sweating for several months. Bernadette Tobin RGN, MSc. From £200.',
    h1: 'How do you treat excessive sweating?',
    answer:
      'Excessive sweating (hyperhidrosis) can be treated with small injections of botulinum toxin into the affected area — most commonly the underarms — which temporarily switch off the overactive sweat glands. At Visage Aesthetics the treatment is carried out by a registered nurse, takes around 20 minutes, and typically keeps sweating under control for four to seven months before a top-up is needed.',
    whatItIs:
      'Hyperhidrosis is sweating well beyond what the body needs to regulate temperature. It is common, harmless in itself, but can be genuinely distressing — ruined shirts, social anxiety, constant planning around it. The underarms, palms, soles and forehead are the usual sites. For many people antiperspirants are not enough, and that is where a medical treatment can help.',
    howWeTreat:
      'We treat hyperhidrosis with botulinum toxin, the same well-studied medicine used for anti-wrinkle treatment, injected in a grid across the affected area. It blocks the nerve signal that tells the sweat glands to activate. Results begin within a few days, reach full effect at about two weeks, and last several months. The treatment is assessed first in a free consultation, where we confirm it is the right option for you and take a full medical history.',
    treatmentName: 'Hyperhidrosis & Migraines',
    treatmentSlug: 'hyperhidrosis-migraines',
    treatmentHref: '/treatments/hyperhidrosis-migraines',
    priceFrom: 'From £200',
    whoItsFor: [
      'Adults whose underarm sweating is not controlled by strong antiperspirants.',
      'People whose sweating affects their clothing, work or social confidence.',
      'Anyone wanting a non-surgical option before considering anything more invasive.',
      'Those who have ruled out an underlying medical cause with their GP.',
    ],
    faqs: [
      {
        question: 'How long does treatment for excessive sweating last?',
        answer:
          'Most clients find one treatment controls underarm sweating for four to seven months, sometimes longer. The effect wears off gradually, and you simply return for a top-up when you notice it returning. There is no obligation to treat on a fixed schedule.',
      },
      {
        question: 'Is the sweating treatment painful?',
        answer:
          'The injections are very superficial and use fine needles, so most people describe it as a series of small pinches rather than pain. We can apply a topical numbing cream to the underarms beforehand if you would prefer. The whole appointment takes around 20 minutes.',
      },
      {
        question: 'Will it stop me sweating everywhere?',
        answer:
          'No, and that is by design. The treatment only reduces sweating in the specific area injected — usually the underarms. Your body still regulates its temperature normally everywhere else. It is a targeted reduction, not a shutdown.',
      },
      {
        question: 'Should I see my GP first?',
        answer:
          'If your excessive sweating came on suddenly, happens mainly at night, or affects your whole body, it is worth seeing your GP to rule out an underlying cause first. For long-standing, localised sweating — typically the underarms — botulinum toxin is a recognised and effective option, and we will discuss your history fully at consultation.',
      },
    ],
  },
  {
    slug: 'chronic-migraine',
    href: '/conditions/chronic-migraine',
    name: 'Chronic migraine',
    alternateNames: ['chronic migraines', 'migraine prevention', 'botox for migraines'],
    metaTitle: 'Botulinum Toxin for Chronic Migraine Prevention, Braintree Essex | Visage Aesthetics',
    metaDescription:
      'Nurse-led botulinum toxin treatment for chronic migraine prevention in Braintree, Essex, for suitable candidates. Bernadette Tobin RGN, MSc. Assessed at a free consultation. From £200.',
    h1: 'Can Botox help with chronic migraines?',
    answer:
      'For people with chronic migraine — headache on 15 or more days a month — botulinum toxin injected across set points in the forehead, temples, scalp and neck can reduce how often migraines happen. It is a recognised preventative option (NICE recommends botulinum toxin type A for chronic migraine in suitable adults) and at Visage it is always assessed first in a consultation to confirm you are a candidate.',
    whatItIs:
      'Chronic migraine is migraine occurring on at least 15 days a month, with at least eight of those being migraine days, for more than three months. It is different from occasional or tension headache, and it can be genuinely disabling. Botulinum toxin is not a treatment for ordinary headaches — it is specifically a preventative option for people living with chronic migraine.',
    howWeTreat:
      'Treatment follows the established preventative protocol: a series of small botulinum toxin injections placed across defined points around the head and neck. It works by dampening the nerve signals involved in migraine. Benefit builds over the first weeks and is reviewed across cycles. Because this is a medical preventative — not a cosmetic treatment — we take a careful history at consultation, and we will be honest if we think it is not the right path for you or that your GP or a neurologist should be involved first.',
    treatmentName: 'Hyperhidrosis & Migraines',
    treatmentSlug: 'hyperhidrosis-migraines',
    treatmentHref: '/treatments/hyperhidrosis-migraines',
    priceFrom: 'From £200',
    whoItsFor: [
      'Adults diagnosed with chronic migraine (15+ headache days a month).',
      'People who have tried, and not had enough benefit from, standard preventative medication.',
      'Those wanting a nurse-led, carefully assessed option close to home in Essex.',
    ],
    faqs: [
      {
        question: 'Is botulinum toxin for migraine the same as Botox for wrinkles?',
        answer:
          'It is the same active medicine, but used in a completely different way. For chronic migraine it is injected across a defined set of points around the head and neck following an established preventative protocol, at different doses and locations from anti-wrinkle treatment. The goal is to reduce migraine frequency, not to change how you look.',
      },
      {
        question: 'Does it work for ordinary or occasional headaches?',
        answer:
          'No. Botulinum toxin is only recognised as a preventative for chronic migraine — broadly, migraine on 15 or more days a month. It is not a treatment for tension headaches or occasional migraine. We will talk through whether your pattern fits at consultation.',
      },
      {
        question: 'How quickly will I notice a difference?',
        answer:
          'Migraine prevention builds gradually. Many people notice a reduction in frequency over the first few weeks, and the benefit is usually assessed across treatment cycles rather than after a single session. We review honestly at each stage and only continue where there is a clear benefit.',
      },
      {
        question: 'Do I need a referral?',
        answer:
          'You do not need a formal referral to be assessed, but chronic migraine is a medical diagnosis. If you have not been diagnosed, or your headaches have changed recently, we may suggest your GP or a neurologist is involved first. Your safety comes before treatment.',
      },
    ],
  },
  {
    slug: 'mole-check',
    href: '/conditions/mole-check',
    name: 'Mole and skin lesion check',
    alternateNames: ['mole check', 'mole mapping', 'skin lesion check', 'changing mole', 'mole screening'],
    metaTitle: 'Mole & Skin Lesion Check, Consultant Dermatologist Review | Visage Aesthetics',
    metaDescription:
      'Worried about a mole? Have it reviewed by a UK consultant dermatologist within 24 hours using medical-grade dermoscopy. Mole and skin lesion checks at Visage Aesthetics, Braintree. £90 per mole.',
    h1: 'When should I get a mole checked?',
    answer:
      'You should get a mole checked if it has changed in size, shape or colour, has an irregular or uneven border, is more than one colour, is larger than 6mm, or is itching, bleeding or crusting. At Visage Aesthetics a concerning mole or skin lesion can be reviewed by a UK consultant dermatologist within 24 hours, using medical-grade dermoscopy — for £90 per mole, without waiting for a routine referral.',
    whatItIs:
      'Most moles are completely harmless. But changes in a mole can occasionally be the first sign of skin cancer, including melanoma, and the earlier any concern is looked at, the better. A useful self-check is the ABCDE guide: Asymmetry, Border irregularity, Colour variation, Diameter over 6mm, and Evolving (changing over time). If a mole ticks any of those, it is worth having it looked at properly.',
    howWeTreat:
      'Our Map My Mole service gives you fast, specialist reassurance. We photograph the lesion with medical-grade dermoscopy and a UK consultant dermatologist reviews the images, usually within 24 hours, with a clear written outcome and a recommendation on whether anything further is needed. It does not replace urgent NHS care — if something needs immediate attention we will tell you to act on it — but it removes the anxious wait for routine reassurance.',
    treatmentName: 'Map My Mole',
    treatmentSlug: 'map-my-mole',
    treatmentHref: '/treatments/map-my-mole',
    priceFrom: '£90 per mole',
    whoItsFor: [
      'Anyone who has noticed a mole change in size, shape or colour.',
      'People with a new lesion, or one that itches, bleeds or will not heal.',
      'Those who want specialist reassurance without waiting for a routine referral.',
      'Anyone with a family history of skin cancer who wants to keep an eye on things.',
    ],
    faqs: [
      {
        question: 'What are the warning signs to look for in a mole?',
        answer:
          'Use the ABCDE check: Asymmetry (one half unlike the other), Border that is ragged or uneven, Colour that varies or is very dark, Diameter larger than 6mm, and Evolving — any change over time in size, shape, colour, or new itching, bleeding or crusting. Any of these is a reason to have the mole reviewed.',
      },
      {
        question: 'How quickly will I get a result?',
        answer:
          'A UK consultant dermatologist usually reviews your dermoscopy images within 24 hours, and you receive a clear written outcome with a recommendation on whether any further action is needed. The point of the service is to remove the anxious wait.',
      },
      {
        question: 'Is this a substitute for seeing my GP or NHS care?',
        answer:
          'No. It is a fast specialist review for reassurance and triage, not emergency care. If a lesion looks urgent, we will tell you to seek NHS care straight away rather than wait. If you have a mole you are seriously worried about right now, please also contact your GP.',
      },
      {
        question: 'How much does a mole check cost?',
        answer:
          'A Map My Mole review is £90 per mole, which covers the medical-grade dermoscopy imaging and the consultant dermatologist’s written review. There is no separate consultation fee to have a lesion looked at.',
      },
    ],
  },
]

export const getCondition = (slug: string) => conditions.find((c) => c.slug === slug)
