/**
 * Real before/after photographs from Visage Aesthetics, used under client
 * consent. Each entry is keyed to a treatment slug so the gallery
 * (/results) and TreatmentTemplate can filter by treatment without a
 * second source of truth.
 *
 * Conservative captioning, no result guarantees. The disclaimer on the
 * /results page does the heavy lifting on expectation-setting.
 */

export type BeforeAfter = {
  /** Public path under /images/before-after/ */
  src: string
  /** Treatment slug — must match an entry in lib/treatments.ts */
  treatmentSlug: string
  /** Display label shown above the card and in the filter chip */
  treatmentLabel: string
  /** Short, conservative caption — area treated + any course/volume notes */
  caption: string
  /** Orientation of the before/after split, affects how we frame the card */
  layout: 'side-by-side' | 'top-bottom'
  /** Approximate aspect ratio used by the card */
  aspect: '4/5' | '4/3' | '1/1' | '3/4'
}

export const beforeAfter: BeforeAfter[] = [
  // ── Anti-Wrinkle Injections ──────────────────────────────────────────
  {
    src: '/images/before-after/anti-wrinkle-01-crows-feet.png',
    treatmentSlug: 'anti-wrinkle-injections',
    treatmentLabel: 'Anti-Wrinkle',
    caption: 'Crow’s-feet softened. Natural movement preserved.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Dermal Filler — Lip ──────────────────────────────────────────────
  {
    src: '/images/before-after/dermal-filler-lip-01.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Subtle volume restoration. Shape preserved.',
    layout: 'top-bottom',
    aspect: '3/4',
  },
  {
    src: '/images/before-after/dermal-filler-lip-02.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Definition added without overfilling.',
    layout: 'top-bottom',
    aspect: '3/4',
  },
  {
    src: '/images/before-after/dermal-filler-lip-03.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Conservative first treatment.',
    layout: 'top-bottom',
    aspect: '4/5',
  },
  {
    src: '/images/before-after/dermal-filler-lip-04.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Even shape, soft volume.',
    layout: 'top-bottom',
    aspect: '4/5',
  },
  {
    src: '/images/before-after/dermal-filler-lip-05.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Mature lips, hydrated and softly redefined.',
    layout: 'top-bottom',
    aspect: '3/4',
  },
  {
    src: '/images/before-after/dermal-filler-lip-06.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Lip Filler',
    caption: 'Balanced upper and lower lip ratio.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Dermal Filler — Tear-trough / face refresh ───────────────────────
  {
    src: '/images/before-after/dermal-filler-tear-trough-01.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Tear-trough Filler',
    caption: 'Hollowness softened, eye area refreshed.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/dermal-filler-tear-trough-02.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Tear-trough Filler',
    caption: 'Subtle under-eye correction.',
    layout: 'top-bottom',
    aspect: '4/5',
  },
  {
    src: '/images/before-after/dermal-filler-tear-trough-03.png',
    treatmentSlug: 'dermal-filler',
    treatmentLabel: 'Tear-trough Filler',
    caption: 'Rested appearance over four-week review.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Profhilo ─────────────────────────────────────────────────────────
  {
    src: '/images/before-after/profhilo-01-jawline.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Jawline definition after two-session course.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/profhilo-02-skin-quality.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Skin quality, hydration and tone improvement.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/profhilo-03-jawline.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Lower-face firming. Two sessions, four weeks apart.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/profhilo-04-neck.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Neck remodelling course.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/profhilo-05-jaw-neck.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Jawline and neck, two-session course.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/profhilo-06-neck-creping.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Neck creping visibly improved.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/profhilo-07-overall-face.png',
    treatmentSlug: 'profhilo',
    treatmentLabel: 'Profhilo',
    caption: 'Overall facial skin quality and glow.',
    layout: 'side-by-side',
    aspect: '4/3',
  },

  // ── Micro-Needling ───────────────────────────────────────────────────
  {
    src: '/images/before-after/micro-needling-01-clarity.png',
    treatmentSlug: 'micro-needling',
    treatmentLabel: 'Micro-Needling',
    caption: 'Skin clarity and tone evened.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/micro-needling-02-texture.png',
    treatmentSlug: 'micro-needling',
    treatmentLabel: 'Micro-Needling',
    caption: 'Texture refinement, course of three.',
    layout: 'side-by-side',
    aspect: '4/3',
  },
  {
    src: '/images/before-after/micro-needling-03-pigmentation.png',
    treatmentSlug: 'micro-needling',
    treatmentLabel: 'Micro-Needling',
    caption: 'Pigmentation fading over a three-session course.',
    layout: 'top-bottom',
    aspect: '3/4',
  },

  // ── CryoPen ──────────────────────────────────────────────────────────
  {
    src: '/images/before-after/cryopen-01-lesion.png',
    treatmentSlug: 'cryopen',
    treatmentLabel: 'CryoPen',
    caption: 'Benign skin lesion removed in a single session.',
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
