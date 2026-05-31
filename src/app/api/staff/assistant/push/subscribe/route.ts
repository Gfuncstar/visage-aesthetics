import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { vapidPublicKey, saveSubscription, removeSubscription } from '@/lib/assistant/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — the VAPID public key the browser needs to subscribe.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ publicKey: null })
  return NextResponse.json({ publicKey: await vapidPublicKey() })
}

// POST { endpoint, keys: { p256dh, auth } } — save a device's subscription.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  try {
    const sub = (await req.json()) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json({ error: 'Bad subscription' }, { status: 400 })
    }
    await saveSubscription({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}

// DELETE { endpoint } — remove a subscription.
export async function DELETE(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  try {
    const { endpoint } = (await req.json()) as { endpoint?: string }
    if (endpoint) await removeSubscription(endpoint)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
