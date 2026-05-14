/**
 * Canonical award strings. Single source of truth so the award name never
 * drifts between pages, schema and metadata. Anything Google indexes about
 * the award (titles, schema fields, OG copy) should pull from this file.
 *
 * Layout / display copy can still vary length for design, but anything that
 * must be machine-readable or consistent for E-E-A-T cites these constants.
 */

export const AWARD = {
  /** Full canonical name used in schema and titles */
  fullName: 'Best Non-Surgical Aesthetics Clinic 2026, Essex',
  /**
   * Always use the full name. shortName kept for legacy callers and
   * points at fullName intentionally — every public-facing reference
   * must carry the complete, specific claim. This is the differentiator
   * vs. competitors who claim "award-winning" without an actual award.
   */
  shortName: 'Best Non-Surgical Aesthetics Clinic 2026, Essex',
  /** Awarding body name */
  awardingBody: 'Health, Beauty & Wellness Awards',
  /** Verifiable public listing on the awarding body's site */
  verificationUrl: 'https://lux-life.digital/winners/vaclinic/',
  /** Year of the award */
  year: 2026,
  /** Category */
  category: 'Best Non-Surgical Aesthetics Clinic',
  /** Region the award applies to */
  region: 'Essex',
  /** The canonical detail page on this site */
  detailPath: '/awards/best-non-surgical-clinic-essex-2026',
  /** One-line trust-strip copy used near CTAs sitewide */
  ctaLine: 'Winner — Best Non-Surgical Aesthetics Clinic 2026, Essex',
}

/** Schema.org Award object — reusable across Organization, Person, etc. */
export const awardSchema = {
  '@type': 'Award',
  name: AWARD.fullName,
  category: AWARD.category,
  dateCreated: String(AWARD.year),
  url: `https://www.vaclinic.co.uk${AWARD.detailPath}`,
  issuedBy: {
    '@type': 'Organization',
    name: AWARD.awardingBody,
    url: AWARD.verificationUrl,
  },
  areaServed: { '@type': 'AdministrativeArea', name: AWARD.region },
}
