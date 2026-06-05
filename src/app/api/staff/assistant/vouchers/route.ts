import { NextResponse } from 'next/server'
import { isAuthedFromRequest } from '@/lib/staff-auth'
import { assistantConfigured, select, update, insert, audit } from '@/lib/assistant/db'
import { type GiftVoucher } from '@/lib/gift/vouchers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normCode(s: string): string {
  return s.trim().toUpperCase().slice(0, 40)
}

function publicView(v: GiftVoucher) {
  return {
    id: v.id,
    code: v.code,
    status: v.status,
    amount_pence: v.amount_pence,
    balance_pence: v.balance_pence,
    recipient_name: v.recipient_name,
    buyer_name: v.buyer_name,
    expires_at: v.expires_at,
  }
}

// GET ?code=... — look up a voucher to show its balance and status.
export async function GET(req: Request) {
  if (!isAuthedFromRequest(req)) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const code = normCode(new URL(req.url).searchParams.get('code') ?? '')
  if (!code) return NextResponse.json({ error: 'Enter a voucher code.' }, { status: 400 })
  try {
    const rows = await select<GiftVoucher>('gift_vouchers', { code: `eq.${code}`, limit: 1 })
    const v = rows[0]
    if (!v) return NextResponse.json({ error: 'No voucher with that code.' }, { status: 404 })
    return NextResponse.json({ voucher: publicView(v) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Lookup failed' }, { status: 502 })
  }
}

// POST { code, amountPence, note } — redeem some of a voucher's balance.
export async function POST(req: Request) {
  if (!isAuthedFromRequest(req)) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const code = normCode(String(b.code ?? ''))
  const amountPence = Math.round(Number(b.amountPence))
  const note = String(b.note ?? '').trim().slice(0, 200)

  if (!code) return NextResponse.json({ error: 'Enter a voucher code.' }, { status: 400 })
  if (!Number.isFinite(amountPence) || amountPence <= 0) return NextResponse.json({ error: 'Enter an amount to redeem.' }, { status: 400 })

  try {
    const rows = await select<GiftVoucher>('gift_vouchers', { code: `eq.${code}`, limit: 1 })
    const v = rows[0]
    if (!v) return NextResponse.json({ error: 'No voucher with that code.' }, { status: 404 })
    if (v.status === 'pending') return NextResponse.json({ error: 'This voucher has not been paid for yet.' }, { status: 409 })
    if (v.status === 'cancelled') return NextResponse.json({ error: 'This voucher has been cancelled.' }, { status: 409 })
    if (v.expires_at && new Date(v.expires_at) < new Date()) return NextResponse.json({ error: 'This voucher has expired.' }, { status: 409 })
    if (amountPence > v.balance_pence) {
      return NextResponse.json({ error: `Only £${(v.balance_pence / 100).toFixed(2)} left on this voucher.` }, { status: 409 })
    }

    const newBalance = v.balance_pence - amountPence
    await update('gift_vouchers', { id: v.id }, {
      balance_pence: newBalance,
      status: newBalance === 0 ? 'redeemed' : 'active',
    })
    await insert('gift_voucher_redemptions', {
      voucher_id: v.id,
      code: v.code,
      amount_pence: amountPence,
      note: note || null,
    })
    await audit('gift_voucher_redeemed', 'gift_voucher', v.id, { amount_pence: amountPence, balance_pence: newBalance })

    return NextResponse.json({ ok: true, balance_pence: newBalance, status: newBalance === 0 ? 'redeemed' : 'active' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not redeem.' }, { status: 502 })
  }
}
