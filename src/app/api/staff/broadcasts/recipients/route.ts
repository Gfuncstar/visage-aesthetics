import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { customers } from '@/lib/customers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  return NextResponse.json({ count: customers.length })
}
