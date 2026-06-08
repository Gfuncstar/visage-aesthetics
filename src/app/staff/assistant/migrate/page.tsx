import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import Migrate from './Migrate'

export const metadata: Metadata = {
  title: 'Bring bookings across',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function MigratePage() {
  const authed = await isStaffAuthed()
  return authed ? <Migrate /> : <StaffGate />
}
