import { NextResponse } from 'next/server'
import { assistantConfigured } from '@/lib/assistant/db'
import { listBookableServices } from '@/lib/booking-engine/availability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public: the services a client can book online.
export async function GET() {
  if (!assistantConfigured()) return NextResponse.json({ services: [], configured: false })
  try {
    const services = await listBookableServices()
    return NextResponse.json({ services, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}
