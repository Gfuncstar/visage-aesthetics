/**
 * Real before/after photographs from Visage Aesthetics, used under client
 * consent. Each entry is keyed to a treatment slug so the gallery
 * (/results) and TreatmentTemplate can filter by treatment without a
 * second source of truth.
 *
 * The `alt` is the SEO-critical field — written per image with the
 * treatment, area treated and Braintree/Essex location keywords for
 * image search. `caption` is the conservative on-page label.
 *
 * Conservative captioning, no result guarantees. The disclaimer on the
 * /results page does the heavy lifting on expectation-setting.
 */

export type BeforeAfter = {
  /** Stable id, used in DOM keys + JSON-LD @id */
  id: string
  /** Public path under /images/before-after/ */
  src: string
  /** Treatment slug — must match an entry in lib/treatments.ts */
  treatmentSlug: string
  /** Display label shown above the card and in the filter chip */
  treatmentLabel: string
  /** Short, conservative caption — area treated + any course/volume notes */
  caption: string
  /** Full SEO alt text — treatment + area + clinic + city keywords */
  alt: string
  /** Orientation of the before/after split, affects how we frame the card */
  layout: 'side-by-side' | 'top-bottom'
  /** Approximate aspect ratio used by the card */
  aspect: '4/5' | '4/3' | '1/1' | '3/4'
}

export const beforeAfter: BeforeAfter[] = [
  // ── Anti-Wrinkle Injections ──────────────────────────────────────────
  {
    id: 'anti-wrinkle-01',
    src: '/images/before-after/anti-wrinkle-01-crows-feet.png',
    treatmentSlug: 'anti-wrinkle-injections',
    treatmentLabel: 'Anti-Wrinkle',
    caption: 'Crow’s-feet softened. Natural movement preserved.',
    alt: 'Anti-wrinkle injections before and after — crow’s-feet softened around the eye, treated by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Dermal Filler — Lip ──────────────────────────────────────────────
  {
    id: 'lip-filler-01',
    src: '/images/before-after/dermal-filler-lip-01.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Subtle volume restoration. Shape preserved.',
    alt: 'Lip filler before and after — subtle hyaluronic-acid volume restoration with natural lip shape preserved, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'top-bottom',
    aspect: '3/4',
  },
  {
    id: 'lip-filler-02',
    src: '/images/before-after/dermal-filler-lip-02.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Definition added without overfilling.',
    alt: 'Lip filler before and after — definition and border added without overfilling, conservative result by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'top-bottom',
    aspect: '3/4',
  },
  {
    id: 'lip-filler-03',
    src: '/images/before-after/dermal-filler-lip-03.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Conservative first treatment.',
    alt: 'Lip filler before and after — conservative first treatment, 0.5 to 1ml hyaluronic acid by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'top-bottom',
    aspect: '4/5',
  },
  {
    id: 'lip-filler-04',
    src: '/images/before-after/dermal-filler-lip-04.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Even shape, soft volume.',
    alt: 'Lip filler before and after — even shape and soft volume, hyaluronic-acid filler by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'top-bottom',
    aspect: '4/5',
  },
  {
    id: 'lip-filler-05',
    src: '/images/before-after/dermal-filler-lip-05.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Mature lips, hydrated and softly redefined.',
    alt: 'Lip filler before and after on mature lips — hydration and gentle redefinition with hyaluronic acid, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'top-bottom',
    aspect: '3/4',
  },
  {
    id: 'lip-filler-06',
    src: '/images/before-after/dermal-filler-lip-06.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Balanced upper and lower lip ratio.',
    alt: 'Lip filler before and after — balanced upper and lower lip ratio, hyaluronic-acid filler by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Dermal Filler — Tear-trough / face refresh ───────────────────────
  {
    id: 'tear-trough-01',
    src: '/images/before-after/dermal-filler-tear-trough-01.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Tear-trough Filler',
    caption: 'Hollowness softened, eye area refreshed.',
    alt: 'Tear-trough filler before and after — under-eye hollowness softened, eye area refreshed with hyaluronic-acid filler by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'tear-trough-02',
    src: '/images/before-after/dermal-filler-tear-trough-02.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Tear-trough Filler',
    caption: 'Subtle under-eye correction.',
    alt: 'Tear-trough filler before and after — subtle under-eye correction with hyaluronic-acid filler, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'top-bottom',
    aspect: '4/5',
  },
  {
    id: 'tear-trough-03',
    src: '/images/before-after/dermal-filler-tear-trough-03.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Tear-trough Filler',
    caption: 'Rested appearance over four-week review.',
    alt: 'Tear-trough filler four-week review before and after — rested, refreshed eye area by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Profhilo ─────────────────────────────────────────────────────────
  {
    id: 'profhilo-01-jawline',
    src: '/images/before-after/profhilo-01-jawline.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Jawline definition after two-session course.',
    alt: 'Profhilo before and after — jawline definition after a two-session bio-remodelling course, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'profhilo-02-skin-quality',
    src: '/images/before-after/profhilo-02-skin-quality.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Skin quality, hydration and tone improvement.',
    alt: 'Profhilo before and after — skin quality, hydration and tone improvement on the cheek, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'profhilo-03-jawline',
    src: '/images/before-after/profhilo-03-jawline.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Lower-face firming. Two sessions, four weeks apart.',
    alt: 'Profhilo before and after — lower-face firming after two sessions four weeks apart, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'profhilo-04-neck',
    src: '/images/before-after/profhilo-04-neck.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Neck remodelling course.',
    alt: 'Profhilo neck before and after — bio-remodelling course on the neck, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'profhilo-05-jaw-neck',
    src: '/images/before-after/profhilo-05-jaw-neck.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Jawline and neck, two-session course.',
    alt: 'Profhilo before and after on jawline and neck — two-session bio-remodelling course, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'profhilo-06-neck-creping',
    src: '/images/before-after/profhilo-06-neck-creping.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Neck creping visibly improved.',
    alt: 'Profhilo before and after — neck creping visibly improved after bio-remodelling, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'profhilo-07-overall-face',
    src: '/images/before-after/profhilo-07-overall-face.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Overall facial skin quality and glow.',
    alt: 'Profhilo before and after — overall facial skin quality, glow and luminosity improved after a Profhilo course, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Micro-Needling ───────────────────────────────────────────────────
  {
    id: 'micro-needling-01-clarity',
    src: '/images/before-after/micro-needling-01-clarity.png',
    treatmentSlug: 'micro-needling',
    treatmentLabel: 'Micro-Needling',
    caption: 'Skin clarity and tone evened.',
    alt: 'Micro-needling before and after — skin clarity and tone evened, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'micro-needling-02-texture',
    src: '/images/before-after/micro-needling-02-texture.png',
    treatmentSlug: 'micro-needling',
    treatmentLabel: 'Micro-Needling',
    caption: 'Texture refinement, course of three.',
    alt: 'Micro-needling before and after — skin texture refinement over a three-session course, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    id: 'micro-needling-03-pigmentation',
    src: '/images/before-after/micro-needling-03-pigmentation.png',
    treatmentSlug: 'micro-needling',
    treatmentLabel: 'Micro-Needling',
    caption: 'Pigmentation fading over a three-session course.',
    alt: 'Micro-needling before and after — pigmentation fading and skin clarity improved over a three-session course, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'top-bottom',
    aspect: '3/4',
  },

  // ── CryoPen ──────────────────────────────────────────────────────────
  {
    id: 'cryopen-01-lesion',
    src: '/images/before-after/cryopen-01-lesion.png',
    treatmentSlug: 'cryopen',
    treatmentLabel: 'CryoPen',
    caption: 'Benign skin lesion removed in a single session.',
    alt: 'CryoPen before and after — benign skin lesion removed in a single cryotherapy session, by Bernadette Tobin RGN, MSc at Visage Aesthetics, Braintree, Essex.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
]

/** Return all before/after entries for a given treatment slug. */
export function beforeAfterByTreatment(slug: string): BeforeAfter[] {
  return beforeAfter.filter((b) => b.treatmentSlug === slug)
}

/** Unique treatment labels present in the gallery, in the order they appear. */
export function availableTreatmentLabels(): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const b of beforeAfter) {
    if (!seen.has(b.treatmentLabel)) {
      seen.add(b.treatmentLabel)
      out.push(b.treatmentLabel)
    }
  }
  return out
}
