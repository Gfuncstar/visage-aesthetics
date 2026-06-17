/**
 * Independent clinical references / further reading per treatment.
 *
 * Purpose (AEO + E-E-A-T): treatment pages make safety and mechanism claims.
 * Linking each claim-set to a recognised, independent authority (NHS, MHRA,
 * NICE, the British Association of Dermatologists, the JCCP) is the single
 * strongest signal of citation authority — it shows the advice is grounded in
 * sources answer engines already trust, rather than asserted in isolation.
 *
 * These are deliberately stable, top-level authority pages (not deep links
 * that rot). Each is genuine "further reading", not a claim of endorsement.
 *
 * Keyed by treatment slug. Falls back to DEFAULT_REFERENCES where a slug has
 * no specific entry, so every treatment page carries credible references.
 */
export type TreatmentReference = {
  /** Display title — the body and what it covers */
  title: string
  /** Canonical URL on the authority's own domain */
  url: string
  /** The issuing authority, used as the publisher in schema.org citation */
  publisher: string
}

/** Sources relevant to almost every injectable/aesthetic treatment. */
export const DEFAULT_REFERENCES: TreatmentReference[] = [
  {
    title: 'Joint Council for Cosmetic Practitioners — choosing a safe practitioner',
    url: 'https://www.jccp.org.uk/',
    publisher: 'Joint Council for Cosmetic Practitioners (JCCP)',
  },
  {
    title: 'Nursing and Midwifery Council — check a nurse on the register',
    url: 'https://www.nmc.org.uk/registration/search-the-register/',
    publisher: 'Nursing and Midwifery Council (NMC)',
  },
]

const NHS_BOTOX: TreatmentReference = {
  title: 'NHS — botulinum toxin (Botox) injections: what to consider and risks',
  url: 'https://www.nhs.uk/conditions/cosmetic-procedures/botox-injections/',
  publisher: 'NHS',
}

const NHS_FILLER: TreatmentReference = {
  title: 'NHS — dermal fillers: what to consider, risks and aftercare',
  url: 'https://www.nhs.uk/conditions/cosmetic-procedures/dermal-fillers/',
  publisher: 'NHS',
}

const MHRA_BOTULINUM: TreatmentReference = {
  title: 'MHRA — botulinum toxin is a prescription-only medicine (POM)',
  url: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency',
  publisher: 'Medicines and Healthcare products Regulatory Agency (MHRA)',
}

/** Per-treatment overrides. Anything not listed uses DEFAULT_REFERENCES. */
export const TREATMENT_REFERENCES: Record<string, TreatmentReference[]> = {
  'anti-wrinkle-injections': [NHS_BOTOX, MHRA_BOTULINUM, ...DEFAULT_REFERENCES],
  'dermal-filler': [NHS_FILLER, ...DEFAULT_REFERENCES],
  profhilo: [NHS_FILLER, ...DEFAULT_REFERENCES],
  'skin-booster': [NHS_FILLER, ...DEFAULT_REFERENCES],
  harmonyca: [NHS_FILLER, ...DEFAULT_REFERENCES],
  'mens-aesthetics': [NHS_BOTOX, NHS_FILLER, ...DEFAULT_REFERENCES],
  'hyperhidrosis-migraines': [
    {
      title: 'NHS — excessive sweating (hyperhidrosis): causes and treatment',
      url: 'https://www.nhs.uk/conditions/excessive-sweating-hyperhidrosis/',
      publisher: 'NHS',
    },
    {
      title: 'NICE TA260 — botulinum toxin type A for preventing chronic migraine',
      url: 'https://www.nice.org.uk/guidance/ta260',
      publisher: 'National Institute for Health and Care Excellence (NICE)',
    },
    MHRA_BOTULINUM,
    ...DEFAULT_REFERENCES,
  ],
  'map-my-mole': [
    {
      title: 'British Association of Dermatologists — moles and melanoma skin cancer',
      url: 'https://www.bad.org.uk/pils/melanoma-in-situ/',
      publisher: 'British Association of Dermatologists (BAD)',
    },
    {
      title: 'NHS — skin cancer (melanoma): the ABCDE signs to check a mole',
      url: 'https://www.nhs.uk/conditions/melanoma-skin-cancer/',
      publisher: 'NHS',
    },
  ],
  cryopen: [
    {
      title: 'NHS — skin tags, warts and other benign skin lesions',
      url: 'https://www.nhs.uk/conditions/skin-tags/',
      publisher: 'NHS',
    },
    ...DEFAULT_REFERENCES,
  ],
  aqualyx: [NHS_FILLER, ...DEFAULT_REFERENCES],
  'micro-needling': [
    {
      title: 'NHS — acne: treatment options and scarring',
      url: 'https://www.nhs.uk/conditions/acne/',
      publisher: 'NHS',
    },
    {
      title: 'British Association of Dermatologists — patient information leaflets',
      url: 'https://www.bad.org.uk/patient-information-leaflets/',
      publisher: 'British Association of Dermatologists (BAD)',
    },
    ...DEFAULT_REFERENCES,
  ],
}

/** Resolve the reference list for a treatment, always returning something. */
export function referencesForTreatment(slug: string): TreatmentReference[] {
  return TREATMENT_REFERENCES[slug] ?? DEFAULT_REFERENCES
}
