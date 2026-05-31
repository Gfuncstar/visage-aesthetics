import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { graphConfigured, inboxConnection } from '@/lib/assistant/graph-inbox'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Tells the Orders UI whether the inbox can be connected and whether it is.
export async function GET() {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!graphConfigured()) {
    return NextResponse.json({ configurable: false, connected: false, account: null })
  }
  const conn = await inboxConnection()
  return NextResponse.json({ configurable: true, ...conn })
}
