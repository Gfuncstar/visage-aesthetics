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
  {
    slug: 'facial-volume-loss',
    href: '/conditions/facial-volume-loss',
    name: 'Facial volume loss',
    alternateNames: ['Ozempic face', 'loss of facial volume', 'sunken cheeks', 'gaunt face after weight loss', 'hollow cheeks', 'volume loss with age'],
    metaTitle: 'Facial Volume Loss & "Ozempic Face" Treatment, Braintree Essex | Visage Aesthetics',
    metaDescription:
      'Restore lost facial volume — including the gaunt "Ozempic face" after rapid weight loss — with reversible hyaluronic acid dermal filler in Braintree, Essex. Nurse-led, conservatively dosed. Bernadette Tobin RGN, MSc. From £110.',
    h1: 'How do you restore facial volume?',
    answer:
      'Lost facial volume is restored with hyaluronic acid (HA) dermal filler, placed in small amounts to gently re-support the cheeks, tear troughs and jawline so the face looks rested rather than hollow. At Visage Aesthetics it is done conservatively — 0.5ml to 1ml at a time, built slowly over visits — by a registered nurse, and because HA filler is fully reversible, nothing is permanent.',
    whatItIs:
      'As we age we lose fat, collagen and bone support in the face, and the cheeks, temples and under-eyes can begin to look hollow or tired. Rapid weight loss — including from GLP-1 medication such as Ozempic, where it is often nicknamed "Ozempic face" — can bring the same change on much faster. The result is a gaunt, deflated look that ages the face more than lines do.',
    howWeTreat:
      'We restore volume with HA dermal filler, a gel that physically supports the tissue and is slowly metabolised over 9 to 18 months. The approach is deliberately conservative: small amounts, placed precisely in the cheeks, tear troughs, jawline or marionette area, built up gradually rather than all at once. Because HA is fully reversible — it can be dissolved within 24 to 48 hours if needed — it is the safest cosmetic injectable available. For broader skin quality alongside volume, we may also discuss Profhilo or HarmonyCa at consultation. We only proceed when it is genuinely the right call.',
    treatmentName: 'Dermal Filler',
    treatmentSlug: 'dermal-filler',
    treatmentHref: '/treatments/dermal-filler',
    priceFrom: 'From £110',
    whoItsFor: [
      'People whose cheeks, temples or under-eyes have started to look hollow or tired.',
      'Anyone who has lost facial fullness after rapid or significant weight loss.',
      'Those on GLP-1 medication (e.g. Ozempic, Mounjaro) noticing a gaunt, deflated face.',
      'Clients who want a natural, reversible result built gradually — not an overfilled look.',
    ],
    faqs: [
      {
        question: 'What is "Ozempic face"?',
        answer:
          '"Ozempic face" is the nickname for the gaunt, hollow or deflated look some people develop after rapid weight loss on GLP-1 medication such as Ozempic or Mounjaro. The weight comes off the face as well as the body, and the loss of fat support can make the cheeks and under-eyes look sunken. Restoring a little volume with dermal filler is a common, reversible way to soften that change.',
      },
      {
        question: 'Will filler make me look overdone?',
        answer:
          'Not the way it is done here. The whole approach at Visage is conservative — 0.5ml to 1ml at a time, placed to support the tissue rather than inflate it, and built slowly across visits. Many clients actually come to us to dissolve and rebalance over-treatment done elsewhere. The aim is for you to look rested, not filled.',
      },
      {
        question: 'How long does it last, and is it reversible?',
        answer:
          'Hyaluronic acid filler lasts roughly 9 to 18 months depending on the product and area, with lips dissolving faster than cheeks. Crucially it is fully reversible: if you are unhappy with the result, or in the rare event of a complication, it can be dissolved within 24 to 48 hours using an enzyme called hyaluronidase. We do not use permanent or semi-permanent fillers.',
      },
      {
        question: 'Is filler the only option for a gaunt face?',
        answer:
          'No, and at consultation we will talk through what actually suits you. Filler restores structural volume; Profhilo and HarmonyCa work more on overall skin quality and collagen. Sometimes the right answer is a combination, and sometimes it is to do less than you came in for. If filler is not right for you, we will say so.',
      },
    ],
  },
  {
    slug: 'acne-scarring',
    href: '/conditions/acne-scarring',
    name: 'Acne scarring & uneven skin texture',
    alternateNames: ['acne scars', 'acne scarring', 'uneven skin texture', 'rolling scars', 'enlarged pores', 'textured skin', 'collagen induction therapy'],
    metaTitle: 'Acne Scarring & Skin Texture Treatment (Micro-Needling), Braintree | Visage Aesthetics',
    metaDescription:
      'Improve the appearance of acne scarring and uneven skin texture with medical micro-needling (collagen induction) in Braintree, Essex. Nurse-led, course-based. Bernadette Tobin RGN, MSc. From £80.',
    h1: 'How do you treat acne scarring?',
    answer:
      'The appearance of acne scarring and uneven skin texture is improved with medical-grade micro-needling (collagen induction therapy), which creates thousands of controlled micro-channels that trigger new collagen and elastin. At Visage Aesthetics it is done as a course of three sessions, four weeks apart, by a registered nurse, with results that build gradually over the following months — no surgery or laser.',
    whatItIs:
      'Acne can settle but leave the skin textured behind it — rolling or pitted scars, enlarged pores and an uneven surface that makeup catches on. This is different from active, inflamed acne: it is the structural change left in the skin afterwards. Micro-needling is one of the few non-surgical treatments that can meaningfully remodel that texture.',
    howWeTreat:
      'We use a medical-grade micro-needling device — not a beauty-counter dermaroller — because the depth, speed and consistency of the needles are what determine the clinical result and your safety. Each session creates controlled micro-channels that prompt the skin to rebuild collagen and elastin. We recommend three sessions, four weeks apart, and collagen continues to develop for three to six months after the course. It pairs particularly well with Profhilo for clients wanting maximum skin-quality improvement. If your acne is still active or inflamed, we will talk about settling that first — sometimes with your GP — before texture work begins.',
    treatmentName: 'Micro-Needling',
    treatmentSlug: 'micro-needling',
    treatmentHref: '/treatments/micro-needling',
    priceFrom: 'From £80',
    whoItsFor: [
      'People left with rolling or pitted scars after acne has settled.',
      'Anyone with uneven skin texture, enlarged pores or a rough surface.',
      'Clients wanting to improve skin quality without surgery or laser.',
      'Those happy to commit to a short course, since results build gradually.',
    ],
    faqs: [
      {
        question: 'Does micro-needling get rid of acne scars completely?',
        answer:
          'It improves their appearance rather than erasing them. Over a course, the new collagen softens the edges of rolling and shallow scars, evens out texture and refines pores, so skin looks smoother and more uniform. Deep, ice-pick scarring may need to be managed in combination with other approaches, which we will discuss honestly at consultation.',
      },
      {
        question: 'Can I have it if my acne is still active?',
        answer:
          'Micro-needling is for the texture and scarring left behind, not for treating active, inflamed acne — and needling over an active breakout is not advisable. If your acne is still flaring, we will talk about settling it first, sometimes alongside your GP, and then focus on texture once the skin is calm.',
      },
      {
        question: 'How many sessions will I need and when will I see results?',
        answer:
          'We usually recommend three sessions, four weeks apart, to give collagen time to build between treatments. You will often notice some radiance within a week of each session, but the meaningful texture change develops gradually — collagen keeps forming for three to six months after the course finishes.',
      },
      {
        question: 'Is there any downtime?',
        answer:
          'Very little. Most people have some redness, a little like mild sunburn, for 24 to 48 hours afterwards. We send full written aftercare, and because the device is medical-grade and used at a controlled depth, the risk of bruising or pigmentation problems is kept low.',
      },
    ],
  },
]

export const getCondition = (slug: string) => conditions.find((c) => c.slug === slug)
