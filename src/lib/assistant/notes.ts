// Builders for the two finished outputs of the write-up tool:
//   1. a structured clinical note (factual, deterministic)
//   2. a warm aftercare email draft (assembled from the treatment-type copy)
// Both are returned as plain text/fields and are editable before being saved
// or sent. Nothing here invents clinical advice — aftercare is the general,
// pre-approved copy from treatment-types.ts.

import { getTreatmentType, type UnitType } from './treatment-types'
import { ukDate } from './format'

export type WriteUpInput = {
  clientName: string
  treatmentTypeId: string
  date: string // ISO YYYY-MM-DD
  product: string
  batchNumber: string
  expiry: string
  areas: { area: string; dose: number }[]
  unit: UnitType
  technique: string
  consent: boolean
  reviewDate: string // ISO or ''
  notes: string
  /** What the client came in to discuss (used for the consultation follow-up). */
  interest?: string
}

export function totalDose(areas: { dose: number }[]): number {
  return areas.reduce((sum, a) => sum + (Number(a.dose) || 0), 0)
}

function unitLabel(unit: UnitType): string {
  return unit === 'units' ? 'units' : unit === 'ml' ? 'ml' : ''
}

/** A structured clinical note suitable for the patient record. */
export function buildClinicalNote(input: WriteUpInput): string {
  const t = getTreatmentType(input.treatmentTypeId)
  const name = t?.name ?? input.treatmentTypeId
  const u = unitLabel(input.unit)
  const lines: string[] = []

  lines.push(`Treatment: ${name}`)
  lines.push(`Date: ${ukDate(input.date)}`)
  if (input.product) lines.push(`Product: ${input.product}`)
  if (input.batchNumber || input.expiry) {
    lines.push(`Batch / expiry: ${[input.batchNumber, input.expiry].filter(Boolean).join(' / ')}`)
  }

  if (input.areas.length > 0) {
    lines.push('')
    lines.push('Areas treated:')
    for (const a of input.areas) {
      const dosePart = u ? ` — ${a.dose} ${u}` : ''
      lines.push(`  • ${a.area}${dosePart}`)
    }
    if (u) lines.push(`Total: ${totalDose(input.areas)} ${u}`)
  }

  if (input.technique) {
    lines.push('')
    lines.push(`Technique: ${input.technique}`)
  }

  lines.push('')
  lines.push(`Consent: ${input.consent ? 'Obtained and recorded' : 'NOT recorded'}`)
  if (input.reviewDate) lines.push(`Review / next session: ${ukDate(input.reviewDate)}`)

  if (input.notes) {
    lines.push('')
    lines.push('Notes:')
    lines.push(input.notes)
  }

  return lines.join('\n')
}

export type AftercareEmail = {
  subject: string
  headline: string
  body: string
}

/** A warm, on-brand aftercare email draft for the client. */
export function buildAftercareEmail(input: WriteUpInput): AftercareEmail {
  const t = getTreatmentType(input.treatmentTypeId)
  const friendly = friendlyTreatmentName(t?.name ?? input.treatmentTypeId)
  const firstName = (input.clientName.trim().split(/\s+/)[0] || '').trim()
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,'

  const aftercare = t?.aftercare ?? []
  const followUp = t?.followUp ?? ''

  const paras: string[] = []
  paras.push(greeting)
  paras.push(
    `Thank you for coming in today for your ${friendly}. It was lovely to see you. Here is a quick reminder of how to look after the area over the next few days.`,
  )
  if (aftercare.length > 0) {
    paras.push(aftercare.map((point) => `- ${point}`).join('\n'))
  }
  if (followUp) paras.push(followUp)
  paras.push(
    'If anything does not feel right, or you are at all worried, please contact me. I would always rather hear from you.',
  )

  return {
    subject: `Your aftercare from Visage Aesthetics`,
    headline: `Looking after your ${friendly}`,
    body: paras.join('\n\n'),
  }
}

function friendlyTreatmentName(name: string): string {
  // Strip the parenthetical clinical qualifier for the patient-facing email.
  const base = name.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  return base.toLowerCase()
}

/** Clean a free-text "what they came for" into a phrase to drop into a sentence. */
function friendlyInterest(text: string): string {
  return text
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\bconsultations?\b/gi, '')
    .replace(/\bconsults?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * A warm follow-up email after a consultation. Prefilled with their name, the
 * date, and what they came in to discuss; with a clearly marked space for what
 * was actually discussed (the clinician's notes), which only the clinician can
 * fill in. Editable before it is copied or sent. No clinical claims here.
 */
export function buildConsultationEmail(input: WriteUpInput): AftercareEmail {
  const firstName = (input.clientName.trim().split(/\s+/)[0] || '').trim()
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,'
  const came = friendlyInterest(input.interest ?? '')
  const t = getTreatmentType(input.treatmentTypeId)
  const followUp = t?.followUp ?? ''
  const when = ukDate(input.date)

  const paras: string[] = []
  paras.push(greeting)
  paras.push(
    came
      ? `Thank you for coming in${when ? ` on ${when}` : ''} to talk through ${came}. It was lovely to meet you and to have the time to understand what you are hoping to achieve.`
      : `Thank you for coming in${when ? ` on ${when}` : ''} for your consultation. It was lovely to meet you and to have the time to understand what you are hoping to achieve.`,
  )

  paras.push('**What we discussed**')
  paras.push(
    input.notes?.trim() ||
      '[Add a short, friendly summary of what we talked through, what I recommended, and any next steps.]',
  )

  if (followUp) paras.push(followUp)
  paras.push(
    'If anything comes to mind after today, or you have any questions at all, please do get in touch. There is no rush and no pressure, take whatever time you need.',
  )

  return {
    subject: came ? `Following up on your ${came} consultation` : 'Following up on your consultation',
    headline: 'Thank you for coming in',
    body: paras.join('\n\n'),
  }
}

/** The right client email for a write-up: consultation follow-up, or aftercare. */
export function buildClientEmail(input: WriteUpInput): AftercareEmail {
  return input.treatmentTypeId === 'consultation'
    ? buildConsultationEmail(input)
    : buildAftercareEmail(input)
}
