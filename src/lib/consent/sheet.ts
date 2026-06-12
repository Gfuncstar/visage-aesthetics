// Best-effort: push a completed consent submission to the Google Sheet.
//
// The app can't talk to Google Sheets directly, so it POSTs the row to a small
// Google Apps Script web app bound to the sheet (the same pattern the patient
// notes sheet uses). No-op when CONSENT_SHEET_WEBHOOK isn't set, and never
// throws — logging a consent to the sheet must never block saving it.

export async function pushConsentToSheet(row: {
  submittedAt: string
  clientName: string
  email: string | null
  treatment: string | null
  formName: string
  answers: Record<string, string | string[]>
  declaration: string
}): Promise<void> {
  const url = process.env.CONSENT_SHEET_WEBHOOK
  if (!url) return
  const answersText = Object.entries(row.answers || {})
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join(' | ')
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submitted: row.submittedAt,
        client: row.clientName,
        email: row.email ?? '',
        treatment: row.treatment ?? '',
        form: row.formName,
        answers: answersText,
        declaration: row.declaration,
      }),
    })
  } catch (err) {
    console.error('[consent-sheet] push failed', err)
  }
}
