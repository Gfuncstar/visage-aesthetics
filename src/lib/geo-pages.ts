/**
 * Canonical registry of geo (treatment × town) landing pages.
 *
 * Single source of truth for:
 *  - The "Where we treat" section on the homepage
 *  - The geo column in the footer
 *  - Lateral "same treatment, other towns" links on each geo page
 *  - "Travelling from?" cards on treatment hubs
 *  - The sitemap
 *
 * `anchor` is the exact text Google should see as the link's anchor — use the
 * phrase you want that page to rank for ("Botox Braintree", not "click here").
 */
export type GeoPage = {
  slug: string
  href: string
  town: string
  treatment: string
  /** Treatment family key, used to group geo pages by treatment hub */
  treatmentSlug: 'anti-wrinkle-injections' | 'dermal-filler' | 'profhilo'
  anchor: string
  /** Approx drive time from the clinic in central Braintree */
  travelLine: string
}

export const geoPages: GeoPage[] = [
  // Botox / anti-wrinkle
  { slug: 'braintree-botox',     href: '/braintree-botox',     town: 'Braintree',     treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Braintree',     travelLine: 'On the doorstep · CM7' },
  { slug: 'chelmsford-botox',    href: '/chelmsford-botox',    town: 'Chelmsford',    treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Chelmsford',    travelLine: '20 min drive · CM1/CM2' },
  { slug: 'colchester-botox',    href: '/colchester-botox',    town: 'Colchester',    treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Colchester',    travelLine: '25 min drive · CO1' },
  { slug: 'halstead-botox',      href: '/halstead-botox',      town: 'Halstead',      treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Halstead',      travelLine: '15 min drive · CO9' },
  { slug: 'witham-botox',        href: '/witham-botox',        town: 'Witham',        treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Witham',        travelLine: '15 min drive · CM8' },
  { slug: 'maldon-botox',        href: '/maldon-botox',        town: 'Maldon',        treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Maldon',        travelLine: '25 min drive · CM9' },
  { slug: 'sudbury-botox',       href: '/sudbury-botox',       town: 'Sudbury',       treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Sudbury',       travelLine: '20 min drive · CO10' },
  { slug: 'great-dunmow-botox',  href: '/great-dunmow-botox',  town: 'Great Dunmow',  treatment: 'Botox',     treatmentSlug: 'anti-wrinkle-injections', anchor: 'Botox Great Dunmow',  travelLine: '20 min drive · CM6' },

  // Lip filler / dermal filler
  { slug: 'braintree-lip-filler',    href: '/braintree-lip-filler',    town: 'Braintree',    treatment: 'Lip Filler',     treatmentSlug: 'dermal-filler', anchor: 'Lip Filler Braintree',     travelLine: 'On the doorstep · CM7' },
  { slug: 'chelmsford-lip-filler',   href: '/chelmsford-lip-filler',   town: 'Chelmsford',   treatment: 'Lip Filler',     treatmentSlug: 'dermal-filler', anchor: 'Lip Filler Chelmsford',    travelLine: '20 min drive · CM1/CM2' },
  { slug: 'halstead-lip-filler',     href: '/halstead-lip-filler',     town: 'Halstead',     treatment: 'Lip Filler',     treatmentSlug: 'dermal-filler', anchor: 'Lip Filler Halstead',      travelLine: '15 min drive · CO9' },
  { slug: 'witham-lip-filler',       href: '/witham-lip-filler',       town: 'Witham',       treatment: 'Lip Filler',     treatmentSlug: 'dermal-filler', anchor: 'Lip Filler Witham',        travelLine: '15 min drive · CM8' },
  { slug: 'colchester-lip-filler',   href: '/colchester-lip-filler',   town: 'Colchester',   treatment: 'Lip Filler',     treatmentSlug: 'dermal-filler', anchor: 'Lip Filler Colchester',    travelLine: '25 min drive · CO1' },
  { slug: 'maldon-lip-filler',       href: '/maldon-lip-filler',       town: 'Maldon',       treatment: 'Lip Filler',     treatmentSlug: 'dermal-filler', anchor: 'Lip Filler Maldon',        travelLine: '25 min drive · CM9' },
  { slug: 'sudbury-lip-filler',      href: '/sudbury-lip-filler',      town: 'Sudbury',      treatment: 'Lip Filler',     treatmentSlug: 'dermal-filler', anchor: 'Lip Filler Sudbury',       travelLine: '20 min drive · CO10' },
  { slug: 'braintree-dermal-filler', href: '/braintree-dermal-filler', town: 'Braintree',    treatment: 'Dermal Filler',  treatmentSlug: 'dermal-filler', anchor: 'Dermal Filler Braintree',  travelLine: 'On the doorstep · CM7' },

  // Profhilo
  { slug: 'braintree-profhilo',     href: '/braintree-profhilo',     town: 'Braintree',     treatment: 'Profhilo', treatmentSlug: 'profhilo', anchor: 'Profhilo Braintree',     travelLine: 'On the doorstep · CM7' },
  { slug: 'chelmsford-profhilo',    href: '/chelmsford-profhilo',    town: 'Chelmsford',    treatment: 'Profhilo', treatmentSlug: 'profhilo', anchor: 'Profhilo Chelmsford',    travelLine: '20 min drive · CM1/CM2' },
  { slug: 'halstead-profhilo',      href: '/halstead-profhilo',      town: 'Halstead',      treatment: 'Profhilo', treatmentSlug: 'profhilo', anchor: 'Profhilo Halstead',      travelLine: '15 min drive · CO9' },
  { slug: 'witham-profhilo',        href: '/witham-profhilo',        town: 'Witham',        treatment: 'Profhilo', treatmentSlug: 'profhilo', anchor: 'Profhilo Witham',        travelLine: '15 min drive · CM8' },
  { slug: 'colchester-profhilo',    href: '/colchester-profhilo',    town: 'Colchester',    treatment: 'Profhilo', treatmentSlug: 'profhilo', anchor: 'Profhilo Colchester',    travelLine: '25 min drive · CO1' },
  { slug: 'great-dunmow-profhilo',  href: '/great-dunmow-profhilo',  town: 'Great Dunmow',  treatment: 'Profhilo', treatmentSlug: 'profhilo', anchor: 'Profhilo Great Dunmow',  travelLine: '20 min drive · CM6' },
]

export const geoPagesByTreatment = (treatmentSlug: GeoPage['treatmentSlug']) =>
  geoPages.filter((g) => g.treatmentSlug === treatmentSlug)

export const otherTownsForTreatment = (currentSlug: string, treatmentSlug: GeoPage['treatmentSlug']) =>
  geoPagesByTreatment(treatmentSlug).filter((g) => g.slug !== currentSlug)
