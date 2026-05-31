import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import Rebook from './Rebook'

export const metadata: Metadata = {
  title: 'Rebooking',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function RebookPage() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  return <Rebook />
}
