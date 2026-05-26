import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../notes/StaffGate'
import BroadcastComposer from './BroadcastComposer'

export const metadata: Metadata = {
  title: 'Broadcasts',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function BroadcastsPage() {
  const authed = await isStaffAuthed()
  return authed ? <BroadcastComposer /> : <StaffGate />
}
