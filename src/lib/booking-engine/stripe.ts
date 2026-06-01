// Minimal Stripe Checkout via the REST API (no SDK dependency, matching the
// codebase's fetch-based style). Only active when STRIPE_SECRET_KEY is set, so
// the deposit feature is pre-built and switches on the moment a key is added.

const SITE = 'https://www.vaclinic.co.uk'
const DEFAULT_DEPOSIT_PENCE = 5000 // £50 when a service has no explicit deposit

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function depositPence(serviceDeposit: number): number {
  const fromService = Math.round((serviceDeposit || 0) * 100)
  return fromService > 0 ? fromService : DEFAULT_DEPOSIT_PENCE
}

/** Create a Checkout Session for a booking deposit. Returns the hosted URL. */
export async function createDepositCheckout(input: {
  amountPence: number
  serviceName: string
  manageToken: string
  email?: string | null
}): Promise<string | null> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null

  const form = new URLSearchParams()
  form.set('mode', 'payment')
  form.set('success_url', `${SITE}/book/confirm?token=${input.manageToken}&session_id={CHECKOUT_SESSION_ID}`)
  form.set('cancel_url', `${SITE}/book-online`)
  if (input.email) form.set('customer_email', input.email)
  form.set('line_items[0][quantity]', '1')
  form.set('line_items[0][price_data][currency]', 'gbp')
  form.set('line_items[0][price_data][unit_amount]', String(input.amountPence))
  form.set('line_items[0][price_data][product_data][name]', `Deposit: ${input.serviceName}`)
  form.set('metadata[manage_token]', input.manageToken)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })
  if (!res.ok) throw new Error(`Stripe error (${res.status}): ${(await res.text()).slice(0, 200)}`)
  const data = (await res.json()) as { url?: string }
  return data.url ?? null
}

/** Whether a Checkout Session has been paid (used on the deposit return). */
export async function checkoutSessionPaid(sessionId: string): Promise<boolean> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return false
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) return false
  const data = (await res.json()) as { payment_status?: string }
  return data.payment_status === 'paid'
}
