import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../../notes/StaffGate'
import Reception from '../Reception'

export const metadata: Metadata = {
  title: 'Front desk',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function FrontDeskPage() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  return <Reception />
}
