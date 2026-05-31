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
