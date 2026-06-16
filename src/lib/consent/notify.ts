// Emails Bernadette when a client completes a consent form, with a button to
// read the submission. Best-effort: never throws into the submission flow.

import { Resend } from 'resend'
import { consentSubmittedEmail } from '@/lib/booking-email'

const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'
const NOTIFY_EMAIL = process.env.BOOKING_NOTIFY_EMAIL ?? 'bernadette.parsons@outlook.com'

export async function notifyConsentSubmitted(input: {
  submissionId: string
  clientName: string
  serviceName?: string | null
  formName: string
}): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return
    const mail = consentSubmittedEmail(input)
    await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      replyTo: REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })
  } catch (err) {
    console.error('[consent] submit notification failed', err)
  }
}
