/**
 * Canonical clinic NAP (name, address, phone) + hours. Single source of truth
 * so contact details never drift between the Organization schema, the llms.txt
 * directory, metadata and page copy. Mirrors the pattern in award.ts.
 *
 * Anything machine-readable (schema fields, the AI-facing llms.txt block) must
 * cite these constants rather than re-typing the values.
 */

export const CLINIC = {
  name: 'Visage Aesthetics',
  url: 'https://www.vaclinic.co.uk',

  // Address (NAP)
  streetAddress: '17A Friars Lane',
  addressLocality: 'Braintree',
  addressRegion: 'Essex',
  postalCode: 'CM7 9BL',
  addressCountry: 'GB',

  // Geo
  latitude: 51.885914,
  longitude: 0.555411,

  // Contact
  email: 'info@vaclinic.co.uk',
  telephone: '+44 7931 395246',
  /** Digits only — used for wa.me / tel: links */
  whatsapp: '447931395246',

  // Hours
  /** schema.org openingHours microformat */
  openingHoursSchema: ['Tu-Sa 09:00-18:00'],
  /** Human-readable line for prose / llms.txt */
  openingHoursHuman: 'Tuesday–Saturday, 9am–6pm, strictly by appointment',

  /** Single-line postal address for prose / llms.txt */
  get addressLine(): string {
    return `${this.streetAddress}, ${this.addressLocality}, ${this.addressRegion} ${this.postalCode}`
  },
} as const

/** Schema.org PostalAddress — reusable in Organization / LocalBusiness schema. */
export const addressSchema = {
  '@type': 'PostalAddress',
  streetAddress: CLINIC.streetAddress,
  addressLocality: CLINIC.addressLocality,
  addressRegion: CLINIC.addressRegion,
  postalCode: CLINIC.postalCode,
  addressCountry: CLINIC.addressCountry,
}
