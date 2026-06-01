// SMS via the Twilio REST API (no SDK dependency, matching the fetch-based
// style used for Stripe and PostgREST). Only active when the Twilio env vars
// are set, so texting is pre-built and switches on the moment credentials and
// a sender are added.
//
// Required env to switch on:
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_FROM                 (a Twilio number)  OR
//   TWILIO_MESSAGING_SERVICE_SID

export function smsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID),
  )
}

/** Best-effort UK mobile to E.164 (+44…). */
export function toE164(phone: string | null | undefined): string | null {
  if (!phone) return null
  const trimmed = phone.trim()
  if (trimmed.startsWith('+')) return '+' + trimmed.slice(1).replace(/\D/g, '')
  const d = trimmed.replace(/\D/g, '')
  if (!d) return null
  if (d.startsWith('0')) return `+44${d.slice(1)}`
  if (d.startsWith('44')) return `+${d}`
  if (d.length === 10) return `+44${d}` // mobile missing its leading 0
  return `+${d}`
}

/** Send an SMS. Returns true if Twilio accepted it. Never throws. */
export async function sendSms(to: string | null, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return false
  const e164 = toE164(to)
  if (!e164) return false

  const form = new URLSearchParams()
  form.set('To', e164)
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) form.set('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID)
  else form.set('From', process.env.TWILIO_FROM as string)
  form.set('Body', body)

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
    if (!res.ok) {
      console.error('[sms] Twilio error', res.status, (await res.text()).slice(0, 200))
      return false
    }
    return true
  } catch (err) {
    console.error('[sms] send threw', err)
    return false
  }
}
