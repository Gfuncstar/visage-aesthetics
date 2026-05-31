// Pushes a treatment write-up into the EXISTING patient-notes Google Sheet, so
// the clinical note lands in the same place staff already review notes. This
// reuses the same Apps Script webhook the Patient Notes form posts to. It is
// best-effort: a sheet failure does not block saving to the clinic database.

import type { WriteUpInput } from './notes'
import { getTreatmentType } from './treatment-types'
import { totalDose } from './notes'

export type SheetResult = { ok: boolean; error?: string }

export async function pushNoteToSheet(
  input: WriteUpInput,
  clinicalNote: string,
): Promise<SheetResult> {
  const url = process.env.STAFF_NOTES_WEBHOOK_URL
  const sharedSecret = process.env.STAFF_NOTES_WEBHOOK_SECRET
  if (!url || !sharedSecret) {
    return { ok: false, error: 'Sheet webhook not configured' }
  }

  const t = getTreatmentType(input.treatmentTypeId)
  const unit = input.unit === 'units' ? 'units' : input.unit === 'ml' ? 'ml' : ''
  const dosage = input.areas
    .map((a) => `${a.area} ${a.dose}${unit ? ` ${unit}` : ''}`)
    .join(', ')
  const specificArea = input.areas.map((a) => a.area).join(', ')

  const payload = {
    secret: sharedSecret,
    name: input.clientName,
    dateOfTreatment: input.date,
    treatment: t?.name ?? input.treatmentTypeId,
    specificArea,
    productUsed: input.product,
    lotNoExp: [input.batchNumber, input.expiry].filter(Boolean).join(' / '),
    dosage: unit && input.areas.length ? `${dosage} (total ${totalDose(input.areas)} ${unit})` : dosage,
    beforePhotosTaken: '',
    problemsNoted: '',
    aftercareProvided: 'Yes',
    additionalNotes: clinicalNote,
    emergencyContactProvided: 'Yes',
    dateSigned: input.date,
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      redirect: 'follow',
    })
    const text = await res.text()
    const knownError =
      text.includes('Script function not found') ||
      text.includes('TypeError') ||
      text.includes('ReferenceError')
    let parsed: { ok?: boolean } | null = null
    try {
      parsed = JSON.parse(text)
    } catch {
      /* Apps Script may return HTML redirect chrome */
    }
    if (!res.ok || parsed?.ok === false || knownError) {
      return { ok: false, error: 'Sheet rejected the note' }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Sheet error' }
  }
}
