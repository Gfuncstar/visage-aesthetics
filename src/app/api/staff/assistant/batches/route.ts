import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Batch = {
  id: string
  product_name: string
  batch_number: string
  expiry: string | null
  quantity_in: number
  quantity_used: number
  created_at: string
}

// GET /api/staff/assistant/batches?product=Botox
// Returns the most recent batch for a product (for auto-filling the write-up),
// or all batches when no product is given (for recall/traceability).
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ batches: [], latest: null, configured: false })
  }
  const product = new URL(req.url).searchParams.get('product')?.trim() ?? ''
  try {
    const query: Record<string, string | number> = { order: 'created_at.desc', limit: 50 }
    if (product) {
      // Match on the first meaningful word, e.g. "Botox (Allergan)" -> "botox".
      const token = product.toLowerCase().replace(/\(.*?\)/g, '').trim().split(/\s+/)[0]
      if (token && token.length >= 3) query.product_name = `ilike.*${token}*`
    }
    const batches = await select<Batch>('batches', query)
    return NextResponse.json({ batches, latest: batches[0] ?? null, configured: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not load batches'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
