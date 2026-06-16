import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import OpeningHours from './OpeningHours'

export const metadata: Metadata = {
  title: 'Opening hours',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function OpeningHoursPage() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  return <OpeningHours />
}
