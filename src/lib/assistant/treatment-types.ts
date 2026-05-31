// Treatment-type definitions for the write-up tool.
//
// Each type defines its product list, area presets, unit and standard aftercare
// copy. Aftercare text is deliberately GENERAL and is always editable by the
// clinician before anything is saved or sent — it is not clinical dosing advice
// or a medical claim. Voice is calm, clinical, British English, with no
// em-dashes and no marketing language.

export type UnitType = 'units' | 'ml' | 'none'

export type TreatmentType = {
  id: string
  name: string
  unit: UnitType
  /** Common products for this treatment (editable free text in the form). */
  products: string[]
  /** Tappable area presets that add a dose row. */
  areas: string[]
  /** General aftercare points shown to the client. */
  aftercare: string[]
  /** Default follow-up line ("review" or "next session"). */
  followUp: string
  /** Suggested gap to the review/next session, in days (for the review_date default). */
  followUpDays: number | null
}

export const TREATMENT_TYPES: TreatmentType[] = [
  {
    id: 'anti-wrinkle',
    name: 'Anti-wrinkle (botulinum toxin)',
    unit: 'units',
    products: ['Botox (Allergan)', 'Azzalure', 'Bocouture'],
    areas: ['Forehead', 'Frown (glabella)', "Crow's feet (left)", "Crow's feet (right)", 'Bunny lines', 'Brow lift', 'Masseter (left)', 'Masseter (right)', 'Lip flip', 'Chin', 'Neck (platysma)'],
    aftercare: [
      'Stay upright for four hours and avoid lying down or pressing on the treated areas.',
      'Do not rub or massage the area for the rest of the day.',
      'Avoid strenuous exercise, alcohol, saunas and very hot environments for 24 hours.',
      'Gentle movement of the treated muscles in the first hour is fine.',
      'The effect settles in over two weeks. Lines soften gradually rather than all at once.',
      'A small amount of redness or a few pinprick marks are normal and usually fade within an hour or two.',
    ],
    followUp: 'I will see you for a two-week review to check the result and make any small adjustments.',
    followUpDays: 14,
  },
  {
    id: 'dermal-filler',
    name: 'Dermal filler',
    unit: 'ml',
    products: ['Juvederm', 'Restylane'],
    areas: ['Lips', 'Cheeks (left)', 'Cheeks (right)', 'Nasolabial folds', 'Marionette lines', 'Chin', 'Jawline (left)', 'Jawline (right)', 'Tear trough (left)', 'Tear trough (right)'],
    aftercare: [
      'Some swelling, tenderness and small bruises are normal for the first few days, particularly with lips.',
      'Avoid touching or massaging the area unless I have shown you otherwise.',
      'Avoid strenuous exercise, alcohol, saunas and very hot environments for 24 to 48 hours.',
      'Keep the area clean and avoid make-up over the injection points for the rest of the day.',
      'Stay well hydrated and sleep slightly elevated for the first night or two if you can.',
      'The final result settles over two to four weeks as any swelling resolves.',
    ],
    followUp: 'If you would like a review once the swelling has settled, let me know and we will arrange it at around two weeks.',
    followUpDays: 14,
  },
  {
    id: 'skin-booster',
    name: 'Skin booster (Profhilo)',
    unit: 'ml',
    products: ['Profhilo'],
    areas: ['Face (left)', 'Face (right)', 'Neck (left)', 'Neck (right)', 'Décolletage', 'Hands'],
    aftercare: [
      'Small raised bumps at the injection points are expected and usually settle within 24 hours.',
      'Avoid touching, massaging or applying make-up over the points for the rest of the day.',
      'Avoid strenuous exercise, alcohol, saunas and very hot environments for 24 hours.',
      'Keep the skin clean and well moisturised.',
      'Results build gradually over the following weeks as the skin remodels.',
    ],
    followUp: 'Profhilo works as a course. I would recommend your next session in around four weeks.',
    followUpDays: 28,
  },
  {
    id: 'polynucleotides',
    name: 'Polynucleotides',
    unit: 'ml',
    products: ['Polynucleotides'],
    areas: ['Under eyes (left)', 'Under eyes (right)', 'Face (left)', 'Face (right)', 'Neck', 'Décolletage'],
    aftercare: [
      'Small bumps or mild swelling at the points are normal and usually settle within a day or two.',
      'Avoid touching or massaging the area and skip make-up over the points for the rest of the day.',
      'Avoid strenuous exercise, alcohol, saunas and very hot environments for 24 hours.',
      'Keep the skin clean and well hydrated.',
      'Results build gradually over the course of treatment.',
    ],
    followUp: 'This is best done as a course. I would suggest your next session in around three to four weeks.',
    followUpDays: 28,
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    unit: 'none',
    products: ['Microneedling (with serum)'],
    areas: ['Full face', 'Cheeks', 'Forehead', 'Neck', 'Décolletage', 'Targeted area'],
    aftercare: [
      'Your skin may feel warm and look flushed, similar to mild sunburn, for the first 24 to 48 hours.',
      'Use only gentle, recommended products and avoid active ingredients (retinol, acids, vitamin C) for a few days.',
      'Avoid make-up for the rest of the day and apply SPF daily while the skin recovers.',
      'Avoid strenuous exercise, saunas, swimming and very hot environments for 24 to 48 hours.',
      'Do not pick or exfoliate. Let any dryness or light flaking settle on its own.',
    ],
    followUp: 'Microneedling works best as a course. I would suggest your next session in around four weeks.',
    followUpDays: 28,
  },
  {
    id: 'chemical-peel',
    name: 'Chemical peel',
    unit: 'none',
    products: ['Chemical peel'],
    areas: ['Full face', 'Cheeks', 'Forehead', 'Neck', 'Décolletage', 'Targeted area'],
    aftercare: [
      'Some redness, tightness and light flaking over the next few days is normal.',
      'Do not pick or peel the skin. Let it shed naturally.',
      'Avoid active ingredients (retinol, acids, vitamin C), exfoliation and make-up for a few days.',
      'Apply SPF every day and avoid direct sun while the skin recovers.',
      'Avoid strenuous exercise, saunas and very hot environments for 24 to 48 hours.',
    ],
    followUp: 'Peels work best as a course. I would suggest your next session in around three to four weeks.',
    followUpDays: 28,
  },
  {
    id: 'consultation',
    name: 'Consultation',
    unit: 'none',
    products: [],
    areas: [],
    aftercare: [
      'Thank you for coming in for a consultation.',
      'There is no aftercare needed. Take your time to consider what we discussed.',
      'If you have any questions before deciding, you are welcome to get in touch.',
    ],
    followUp: 'Whenever you are ready to go ahead, get in touch and we will find a time that suits you.',
    followUpDays: null,
  },
]

export function getTreatmentType(id: string): TreatmentType | undefined {
  return TREATMENT_TYPES.find((t) => t.id === id)
}

/** Best-effort map from an Ovatu service name to one of our treatment types. */
export function matchTreatmentType(serviceName: string): string | null {
  const s = (serviceName || '').toLowerCase()
  if (!s) return null
  if (/botox|anti.?wrinkle|toxin|azzalure|bocouture|wrinkle|line|hyperhidrosis|sweat|masseter|jaw/.test(s)) return 'anti-wrinkle'
  if (/profhilo|booster|bio.?remodel/.test(s)) return 'skin-booster'
  if (/polynucleotide|pn|plinest|nucleofill/.test(s)) return 'polynucleotides'
  if (/filler|lip|cheek|tear.?trough|jawline|chin|nasolabial|harmonyca|juvederm|restylane/.test(s)) return 'dermal-filler'
  if (/needling|microneedl|skin.?pen|dermapen|collagen induction/.test(s)) return 'microneedling'
  if (/peel|chemical/.test(s)) return 'chemical-peel'
  if (/consult|review|chat/.test(s)) return 'consultation'
  return null
}
