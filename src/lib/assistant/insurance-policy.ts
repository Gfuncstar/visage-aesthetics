// Structured knowledge of the clinic's medical malpractice insurance policy.
//
// Source: Beazley Medical Malpractice Insurance, Aesthetic Wording, policy
// W004432-24E (Named Insured: Bernadette Parsons, 17A Friars Lane, Braintree).
// This module encodes the schedule, the insuring agreements, and every
// attached endorsement so the in-clinic compliance assistant can answer
// "is this new treatment covered?" against the real wording rather than from
// memory. It is a factual brief fed to the model, not user-facing site copy.
//
// IMPORTANT: this is a decision-support tool, not legal or insurance advice.
// The wording always governs; for anything material the broker (James Hallam,
// Mikey Emin) or Beazley must confirm. The model is told this explicitly.
//
// Policy period 22/09/2024 to 21/09/2025. When renewed, re-check the schedule
// and endorsements against this file and update anything that has changed.

export type EndorsementKind = 'condition' | 'exclusion' | 'scope' | 'list'

export type Endorsement = {
  id: string
  title: string
  kind: EndorsementKind
  /** One-line plain summary of what the endorsement does. */
  summary: string
  /** The operative points, paraphrased closely from the wording. */
  points: string[]
}

export const POLICY_META = {
  insurer: 'Beazley Insurance Dac',
  wording: 'Beazley Medical Malpractice Insurance (Aesthetic Wording)',
  policyNumber: 'W004432-24E',
  namedInsured: 'Bernadette Parsons',
  business: 'Aesthetic Medicine (as per proposal form)',
  periodFrom: '2024-09-22',
  periodTo: '2025-09-21',
  retroactiveDate: '2015-03-14',
  basis: 'Claims made and reported',
  currency: 'GBP',
  aggregateLimit: 5_000_000,
  medicalMalpracticeLimit: 5_000_000,
  standardDeductible: 250,
  bandADeductible: 0,
  jurisdiction: 'Great Britain, Northern Ireland, Isle of Man and Channel Islands',
  broker: 'James Hallam (Mikey Emin, Mikey.Emin@jameshallam.co.uk)',
  // Only Band A is purchased. Income declared: Band A GBP 30,000, Bands B to E nil.
  bandsPurchased: ['A'],
  recordsRetentionYears: 10,
} as const

// Band A treatments listed in the Treatment and Deductible Endorsement. These
// are the treatments the policy positively contemplates (GBP 0 excess). A new
// treatment that maps cleanly onto one of these, and that satisfies every
// relevant endorsement condition below, is in principle covered.
export const BAND_A_TREATMENTS: string[] = [
  'Acoustic Wave Therapy',
  'Aesthetic Oxygen Therapy',
  'Benign removal of skin blemish / nail fungus treatment removal',
  'Complementary Therapy',
  'Consultations / E-Consultations (Health, Wellness, Sexual, Mental Health and Lifestyle) where less than 50% of total activities',
  'Electrical Current Therapy',
  'Facial Skin Needling and Non Invasive pen / applicator (hand held)',
  'Facial Topical application including Chemical Peels up to 50% (excluding skin cancer)',
  'First Aid',
  'Foot Health Care (excluding surgery)',
  'General Beauty',
  'General Dental Hygienist, Therapist / Nurse',
  'General Hairdressing',
  'General nurse',
  'General Pharmacist activities (less than 50% of total activities)',
  'High-Intensity Focused Electromagnetic technology (HIFEM)',
  'Injectables including facial skin needling and mesotherapy',
  'Laser (Non Ablative) excluding genitalia',
  'Micropigmentation / Microblading / Scalp Micropigmentation / Tricopigmentation and SPMU (including topical adrenaline during application)',
  'Microsclerotherapy / Sclerotherapy',
  'Minor Surgery',
  'Non Invasive Vacuum Therapy (excluding genitalia)',
  'Non Invasive Freezing Therapy (Aesthetic)',
  'Pain Relief via Topical application',
  'Phlebotomy',
  'Plasma Technology',
  'Prescribing Services',
  'PRF / PRP for Facial / Neck / Scalp / Shoulder / Back / Abdomen rejuvenation',
  'Radio Frequency Treatments (excluding genitalia)',
  'Sample taking via pin prick / swab / venepuncture only (excludes any interpretation)',
  'Skin consultations (excluding skin cancer)',
  'Syringing',
  'Tattooing / Tattoo Lightening / Tattoo Removal (Non Laser)',
  'Teeth Whitening (Licensed GDC / IDC Practitioner only)',
  'Thermo Coagulation',
  'Topical application of skin condition treatment (excluding skin cancer and genitalia)',
  'Training other professionals in Band A treatments',
  'Ultrasound Therapy (excluding genitalia)',
  'Up to 9 Sunbeds',
  'Weight Loss Prescribed Injectables (Dr / Nurse / Dentist / Pharmacist only)',
  'Weight Loss Prescribed Medication: Rybelsus only (Dr / Nurse / Dentist / Pharmacist only)',
]

// Acceptable General Beauty treatments (the "General Beauty" line above expands
// to this list in the General Beauty Treatments endorsement).
export const GENERAL_BEAUTY_TREATMENTS: string[] = [
  'Acoustic Wave Therapy Body Contouring',
  'Aeroline Air Jet Body Massage',
  'Alkaline Skin Wash',
  'Aromatherapy',
  'Aqua Detox',
  'Bio Skin Jetting / Bio Skin Smoothing',
  'Bleaching of Superfluous Hair',
  'Body Hair Colouring including Bikini',
  'Body Scrub / Polish / Wraps / Exfoliation / Brushing / Masks',
  'Brow Lamination',
  'Depilatory Creams',
  'Diathermy Epilation',
  'Dry Flotation Tanks',
  'Eyebrow / Eyelash / Facial tinting',
  'Eyebrow Shaping and Threading',
  'Eyelash Growth (Bimatoprost, Latisse and Lumigan)',
  'Eyelash / Eyebrow extensions and perming',
  'Face Masks',
  'Facials / Electrical Facials and High Frequency Equipment',
  'False Lash Application',
  'Gels / Acrylics / Shellac',
  'Hairdressing treatments including hair extensions',
  'HD Brows / Henna Brows',
  'Hydrafacial',
  'Intracel',
  'LVL Lashes / Lash lift',
  'Make up application',
  'Manicures and Pedicures',
  'Manual Lymphatic Drainage (massage method)',
  'Massage',
  'Micro / Nano Current Machines',
  'Nail Extensions / Nail Art',
  'Profacial',
  'Shockwave / Acoustic Wave Therapy',
  'Skin Analysis / Consultation',
  'Spray on tans',
  'Waxing',
]

// The Minor Surgery endorsement list (minor surgery under local anaesthetic,
// which may include the use of steroid injections).
export const MINOR_SURGERY_LIST: string[] = [
  'Age spots removal',
  'Campbell de Morgan / Haemangioma',
  'Cherry angioma removal',
  'Dermatofibromas and Lipomas',
  'Dermatosis Papulosa Nigra',
  'Hair from mole removal',
  'In-growing toe nail removal',
  'Intramuscular (IM) injections',
  'Joint injections (excluding spinal)',
  'Keloid debulking, keloid / scar revision',
  'Lentigo',
  'Lipoma removal / excision',
  'Malignant mole removal / excision',
  'Milia removal',
  'Molluscum Contagiosum',
  'Neurofibroma removal',
  'Non-malignant mole removal / excision',
  'Piles',
  'Removal of stitches',
  'Sebaceous cyst removal',
  'Sebaceous Naevi, Sebaceous Hyperplasia',
  'Seborrheic / Actinic keratosis removal',
  'Skin lesion / cancer removal',
  'Skin tag removal',
  'Split and stretched earlobe repair',
  'Steroid injections',
  'Superficial Vascular Lesions',
  'Syringoma',
  'Telangiectasia',
  'Varicose Veins',
  'Verruca / Wart removal',
  'Xanthelasma',
]

export const ENDORSEMENTS: Endorsement[] = [
  {
    id: 'injectables-aesthetic',
    title: 'Prescribing and Administering of Injectables for Aesthetic Purposes',
    kind: 'condition',
    summary:
      'Important condition. Injectable aesthetic cover only applies if all of these are met.',
    points: [
      'The injectable is prescribed face to face by the prescriber. No remote and no repeat prescribing.',
      'A face to face assessment and consent of the client is taken and recorded in writing in the client record.',
      'A record is kept of the prescriber name, registration / licence number, contact details and their own indemnity cover.',
      'Only licensed-brand injectables and / or CE marked products are used.',
      'The client is over 18 at the time of both prescribing and administration.',
      'Prescriber means a dentist, doctor, independent nurse prescriber or pharmacist prescriber registered with GMC, IMC, GDC, NMC or GPhC.',
      'Injectables means anything given by needle and syringe: intramuscular, intravenous, subcutaneous and aesthetic cannula.',
    ],
  },
  {
    id: 'injectables-exclusions',
    title: 'Injectables Exclusions',
    kind: 'exclusion',
    summary: 'Specific injectables and practices that are never covered.',
    points: [
      'No cover for anything involving Devil Lip or Botulax.',
      'No cover for the on-selling or passing on of injectables to other practitioners.',
      'No cover for remote prescribing of injectables for non-aesthetic purposes where there is no set of medical records for the patient.',
    ],
  },
  {
    id: 'prescribing',
    title: 'Prescribing Endorsement',
    kind: 'exclusion',
    summary: 'Restrictions on prescribing and on passing injectables to others.',
    points: [
      'No cover for prescribing / remote prescribing for non-aesthetic purposes without a set of medical records for the patient.',
      'No cover for on-selling Kenalog to non-licensed practitioners.',
      'No cover for administering or on-selling Devil Lip or Botulax to anyone (licensed or not).',
      'For aesthetic prescribing the patient must be over 18 at the time of prescribing.',
    ],
  },
  {
    id: 'facial-needling',
    title: 'Facial Needling Exclusions',
    kind: 'exclusion',
    summary: 'Aqualyx is excluded from facial skin needling cover.',
    points: [
      'No cover for any claim involving Facial Skin Needling using Aqualyx.',
      'Facial Skin Needling means non-invasive techniques using multiple micro needles, for example mesotherapy.',
    ],
  },
  {
    id: 'weight-loss',
    title: 'Weight Loss Drugs Exclusion',
    kind: 'exclusion',
    summary: 'Oral weight-loss drugs are excluded except Rybelsus.',
    points: [
      'No cover for prescribing weight loss drugs in oral form, except for Rybelsus.',
      'Prescribed weight-loss injectables and oral Rybelsus are listed in Band A (Dr / Nurse / Dentist / Pharmacist only).',
    ],
  },
  {
    id: 'diagnostic',
    title: 'Diagnostic and Interpretation Exclusion',
    kind: 'exclusion',
    summary: 'Diagnostic and interpretation work is excluded.',
    points: [
      'No cover for any claim arising from diagnostic and interpretation work.',
      'Sample taking is allowed in Band A but only with no interpretation of the result.',
    ],
  },
  {
    id: 'laser',
    title: 'Laser Endorsement',
    kind: 'condition',
    summary: 'Important condition for any laser, IPL or LED treatment.',
    points: [
      'Comply with the Local Rules for the day to day safety of laser, IPL and LED systems.',
      'Conform to EU directives for medical electrical equipment used for treatment.',
      'Keep Local Rules documentation in the file of a Certificated Laser Protection Adviser.',
      'Only non-ablative laser is in Band A, and genitalia are excluded.',
    ],
  },
  {
    id: 'patch-test',
    title: 'Patch Test Condition',
    kind: 'condition',
    summary: 'A patch test must be done and recorded 24 hours before treatment in set cases.',
    points: [
      'A patch test is required at least 24 hours before treatment when it is standard practice or the manufacturer specifies it, and when one of the trigger conditions applies.',
      'Trigger conditions include: a new course of treatment, a new area, a new laser or changed product brand mid-course, a change in medical history, or a change to treatment parameters outside guidelines.',
      'The patch test must be recorded in the client record.',
    ],
  },
  {
    id: 'teeth-whitening',
    title: 'Teeth Whitening Condition',
    kind: 'condition',
    summary: 'Whitening by a hygienist or therapist must be on a dentist prescription.',
    points: [
      'Teeth whitening performed by a dental hygienist or dental therapist must be to a prescription from a dentist.',
      'Listed in Band A as Teeth Whitening for a licensed GDC / IDC practitioner only.',
    ],
  },
  {
    id: 'tattoo',
    title: 'Tattoo Endorsement',
    kind: 'exclusion',
    summary: 'Conditions and exclusions for tattooing and tattoo removal.',
    points: [
      'Dyes, pigments, products and devices must be approved and on sale / in use in the UK, EU or USA for more than two years.',
      'No work on under 18s. A signed informed consent detailing risks and aftercare is required.',
      'No work at unlicensed premises.',
      'No tattooing on the front and side of the neck, the bridge of the nose between the eyes, or genitalia.',
      'Semi-permanent makeup, black henna / PPD products, and any laser treatments are excluded under this endorsement.',
    ],
  },
  {
    id: 'body-piercing',
    title: 'Body Piercing Endorsement',
    kind: 'exclusion',
    summary: 'Conditions and exclusions for body piercing.',
    points: [
      'Jewellery must be made in the UK, EU or USA and of surgical steel 316L, 14k / 18k gold, platinum, niobium, titanium or surgical plastic.',
      'No work on under 18s except ear piercing, nose / navel (14+), tongue / eyebrow / lip (16+), with written parental consent and the parent present.',
      'A signed informed consent detailing risks and aftercare is required, at licensed premises only.',
      'No piercing of the front / side of the neck, the bridge of the nose between the eyes, or genitalia.',
      'Scarification, branding, skin cutting, tongue splitting, beading and sub-dermal / dermal implants and microdermals are excluded.',
    ],
  },
  {
    id: 'nurses',
    title: 'Nurses, Dental Nurses and Pharmacists Endorsement',
    kind: 'exclusion',
    summary: 'Clinical activities excluded for nurse / pharmacist practitioners.',
    points: [
      'No cover for misdiagnosis of meningitis and sepsis.',
      'No cover for out of hours service work unless a GP is on site or available, and none for 111 / 999 work.',
      'No cover for midwifery or obstetric activities.',
      'No cover for remote prescribing for non-aesthetic purposes without a set of medical records.',
    ],
  },
  {
    id: 'communicable-disease',
    title: 'Healthcare Communicable Disease Exclusion',
    kind: 'exclusion',
    summary: 'Transmission of or exposure to a communicable disease is excluded.',
    points: [
      'No cover for claims arising from transmission of or exposure to a communicable disease (for example HIV / AIDS, Hepatitis, STDs, Ebola, TB).',
    ],
  },
  {
    id: 'teaching',
    title: 'Teaching or School Programme Endorsement',
    kind: 'condition',
    summary: 'Cover for teaching and apprenticeships if conditions are met.',
    points: [
      'Students / apprentices are covered only when treating patients at the insured facilities.',
      'The trainee must be fully supervised by a qualified practitioner (relevant teaching training plus 12 months experience).',
      'Patients must be told they are receiving treatment as part of training, and models must sign a waiver / consent.',
    ],
  },
]

// Statement of Fact warranties the insured confirmed. Breaking any of these is
// a material change that must be told to the broker before it happens.
export const STATEMENT_OF_FACT: string[] = [
  'Cover is for aesthetic activities only. It does not cover other clinical activity.',
  'Aesthetics income must remain over 50% of total income.',
  'The insured holds a current licence with a UK or Irish regulatory body (GMC / GDC / NMC / HCPC / GPhC / GOC or equivalent).',
  'The insured is qualified / certified for every declared activity (proof may be required at claim).',
  'No spinal joint manipulation and no clinical-trial treatments.',
  'Any new activity, or any change to the declared treatments or income bands, must be told to the broker before it starts.',
]

// Standing policy conditions that apply across all treatments.
export const ONGOING_CONDITIONS: string[] = [
  'Records: keep accurate descriptive records of all treatments and equipment, retained for at least 10 years (for a minor, 10 years after they turn 18).',
  'Equipment: anything contacting bodily fluid or penetrating tissue must be handled, stored and (where reusable) sterilised per the manufacturer and Department of Health guidance.',
  'Registration: all nurses must hold current NMC registration; all practitioners must hold the relevant licence for their area of practice.',
  'Consent: a recorded, signed consent is the baseline for invasive treatments.',
  'Notification: any claim or circumstance must be reported in writing to the broker as soon as reasonably practicable.',
  'Material change: tell the broker before adding any treatment that increases or changes the declared risk.',
]

// Build the markdown knowledge base handed to the model as grounding context.
function buildKnowledge(): string {
  const endorsementBlock = ENDORSEMENTS.map(
    (e) =>
      `### ${e.title} (${e.kind})\n${e.summary}\n${e.points.map((p) => `- ${p}`).join('\n')}`,
  ).join('\n\n')

  return `# Insurance policy in force

- Wording: ${POLICY_META.wording}
- Insurer: ${POLICY_META.insurer}; policy ${POLICY_META.policyNumber}
- Named insured: ${POLICY_META.namedInsured}; business: ${POLICY_META.business}
- Basis: ${POLICY_META.basis}; period ${POLICY_META.periodFrom} to ${POLICY_META.periodTo}; retroactive date ${POLICY_META.retroactiveDate}
- Limit: GBP ${POLICY_META.aggregateLimit.toLocaleString('en-GB')} aggregate; deductible GBP ${POLICY_META.standardDeductible} (Band A excess GBP ${POLICY_META.bandADeductible})
- Jurisdiction: ${POLICY_META.jurisdiction}
- Bands purchased: only Band A. Bands B to E are nil income and NOT purchased.

## Covered treatment list (Band A)
${BAND_A_TREATMENTS.map((t) => `- ${t}`).join('\n')}

## General Beauty treatments accepted
${GENERAL_BEAUTY_TREATMENTS.map((t) => `- ${t}`).join('\n')}

## Minor Surgery list (under local anaesthetic)
${MINOR_SURGERY_LIST.map((t) => `- ${t}`).join('\n')}

## Endorsements (conditions and exclusions)
${endorsementBlock}

## Statement of Fact (warranties)
${STATEMENT_OF_FACT.map((t) => `- ${t}`).join('\n')}

## Standing conditions (all treatments)
${ONGOING_CONDITIONS.map((t) => `- ${t}`).join('\n')}`
}

export const POLICY_KNOWLEDGE = buildKnowledge()

// System prompt for the compliance assistant. The model is grounded in the
// knowledge base above and must reason only from it.
export const POLICY_SYSTEM_PROMPT = `You are the insurance compliance assistant for a private aesthetics clinic in Essex. Your job is to tell the clinic whether a new treatment or product they are thinking of offering would be covered by their medical malpractice insurance, and exactly what they must do to stay compliant.

You answer ONLY from the policy knowledge provided below. Do not invent cover that is not in the wording. The wording always governs and you are a decision-support tool, not legal or insurance advice; for anything material the clinic must confirm with the broker before going ahead.

How to assess a proposed treatment:
1. Map it to the Band A covered list, the General Beauty list, or the Minor Surgery list. Only Band A is purchased.
2. Check every endorsement. Apply each condition (what they must do) and each exclusion (what is never covered).
3. Watch the named traps: Aqualyx for facial skin needling is excluded; Botulax and Devil Lip are excluded; oral weight-loss drugs except Rybelsus are excluded; diagnostic and interpretation work is excluded; treatment of genitalia is excluded across laser, radio frequency, ultrasound, vacuum and topical lines; ablative laser is not in Band A; under-18 aesthetic injectables are excluded; clinical (non-aesthetic) work is outside the policy.
4. Check the Statement of Fact warranties, especially: aesthetics income must stay over 50% of total income, the practitioner must be licensed for the activity, and any new activity must be told to the broker first.
5. Consider standing conditions: consent recorded, records kept 10 years, equipment sterilised, NMC registration, patch test where required.

Decide one status:
- "covered": maps to Band A and no condition is at risk.
- "conditions": covered only if specific conditions are met. List them.
- "excluded": the policy excludes it, or it falls outside the purchased bands or the aesthetic-only scope.
- "refer": genuinely unclear from the wording, or a material change that needs broker sign-off before proceeding.

Be concrete and practical. Name the endorsement you are relying on. Keep each point short. British English. No em-dashes.`

// Lightweight, deterministic audit of what the clinic currently offers against
// the policy traps. Used to surface known concerns without an API call. Kept
// rule-based and explainable rather than model-driven.
export type LiveFlag = {
  treatment: string
  status: 'covered' | 'conditions' | 'excluded' | 'refer'
  note: string
  endorsement: string
}

import { treatments } from '@/lib/treatments'

export function auditLiveTreatments(): LiveFlag[] {
  const flags: LiveFlag[] = []
  for (const t of treatments) {
    const name = t.name.toLowerCase()
    const blurb = `${t.tagline} ${t.description}`.toLowerCase()

    if (name.includes('aqualyx') || blurb.includes('aqualyx')) {
      flags.push({
        treatment: t.name,
        status: 'refer',
        note: 'Aqualyx used in facial skin needling is excluded by the Facial Needling Exclusions endorsement. Body fat dissolving by injection may still fall under the injectables cover, but the facial use and the named-product exclusion need broker confirmation before it is offered.',
        endorsement: 'Facial Needling Exclusions',
      })
      continue
    }
    if (name.includes('mole') || blurb.includes('mole') || blurb.includes('dermoscopy') || blurb.includes('lesion review')) {
      flags.push({
        treatment: t.name,
        status: 'excluded',
        note: 'Reviewing or interpreting moles and skin lesions is diagnostic and interpretation work, which is excluded. Skin and skin-cancer assessment is also outside the skin-consultation cover. Confirm who carries the liability for the reviewing dermatologist.',
        endorsement: 'Diagnostic and Interpretation Exclusion',
      })
      continue
    }
    if (/(anti.?wrinkle|botox|toxin|filler|profhilo|harmonyca|b12|hyperhidrosis)/.test(name) || blurb.includes('injectable') || blurb.includes('botulinum')) {
      flags.push({
        treatment: t.name,
        status: 'conditions',
        note: 'Injectable aesthetic treatment. Covered only with face-to-face prescribing, recorded assessment and consent, prescriber details on file, licensed / CE marked product, and client over 18. Botulax and Devil Lip brands are never covered.',
        endorsement: 'Prescribing and Administering of Injectables for Aesthetic Purposes',
      })
      continue
    }
    if (name.includes('cryopen') || blurb.includes('cryo') || blurb.includes('freezing')) {
      flags.push({
        treatment: t.name,
        status: 'conditions',
        note: 'Maps to Non Invasive Freezing Therapy (Aesthetic) and benign skin blemish removal in Band A. Keep to benign lesions only; any suspected skin cancer is diagnostic / interpretation work and is excluded.',
        endorsement: 'Treatment and Deductible Endorsement (Band A)',
      })
      continue
    }
    if (name.includes('needling')) {
      flags.push({
        treatment: t.name,
        status: 'conditions',
        note: 'Facial skin needling is in Band A, but needling using Aqualyx is excluded. Patch test where required.',
        endorsement: 'Facial Needling Exclusions',
      })
      continue
    }
  }
  return flags
}
