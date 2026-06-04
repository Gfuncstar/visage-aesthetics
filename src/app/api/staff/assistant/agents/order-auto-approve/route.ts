import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { sendPush } from '@/lib/assistant/push'
import { gbp } from '@/lib/assistant/format'
import type { Order } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

// Thresholds: only auto-approve if the order is from a known supplier,
// has high parse confidence, and is under £500. Intentionally conservative.
const MAX_AUTO_APPROVE_GBP = 500
const MIN_CONFIDENCE = 0.85

async function run() {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }

  const pending = await select<Order>('orders', { status: 'eq.pending', limit: 100 })

  let approved = 0
  let skipped = 0
  let totalValue = 0

  for (const order of pending) {
    const confidence = Number(order.parse_confidence ?? 0)
    const total = Number(order.total ?? 0)
    const eligible =
      confidence >= MIN_CONFIDENCE &&
      total <= MAX_AUTO_APPROVE_GBP &&
      order.supplier_id != null

    if (!eligible) {
      skipped++
      continue
    }

    try {
      await update<Order>('orders', { id: `eq.${order.id}` }, { status: 'confirmed' })
      await audit('auto_approved', 'orders', order.id, {
        supplier: order.supplier_name,
        total: order.total,
        confidence: order.parse_confidence,
      })
      approved++
      totalValue += total
    } catch {
      skipped++
    }
  }

  if (approved > 0) {
    await sendPush({
      title: `${approved} order${approved > 1 ? 's' : ''} auto-approved`,
      body: `Low-value, high-confidence orders confirmed — ${gbp(totalValue)} total`,
      url: '/staff/assistant/orders',
    })
  }

  return NextResponse.json({
    ok: true,
    approved,
    skipped,
    total_value: gbp(totalValue),
  })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
