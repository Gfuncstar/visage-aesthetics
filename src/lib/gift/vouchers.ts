// Helpers for gift vouchers: a readable, unambiguous code and money formatting.
// Storage goes through the shared db wrapper (gift_vouchers table).

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion

export type VoucherStatus = 'pending' | 'active' | 'redeemed' | 'cancelled'

export type GiftVoucher = {
  id: string
  code: string | null
  amount_pence: number
  balance_pence: number
  buyer_name: string | null
  buyer_email: string | null
  recipient_name: string | null
  recipient_email: string | null
  message: string | null
  status: VoucherStatus
  stripe_session_id: string | null
  created_at: string
  paid_at: string | null
  delivered_at: string | null
  expires_at: string | null
}

export function generateVoucherCode(): string {
  const part = (n: number) =>
    Array.from({ length: n }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
  return `GIFT-${part(4)}-${part(4)}`
}

export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100)
}

export function formatGBP(pence: number): string {
  const pounds = pence / 100
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`
}

// Gift vouchers are valid for 12 months from purchase.
export function voucherExpiry(from = new Date()): string {
  const d = new Date(from)
  d.setMonth(d.getMonth() + 12)
  return d.toISOString()
}
