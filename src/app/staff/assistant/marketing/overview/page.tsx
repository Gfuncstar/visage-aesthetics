import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../../notes/StaffGate'
import Marketing from '../Marketing'

export const metadata: Metadata = {
  title: 'Marketing overview',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function MarketingOverviewPage() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  return <Marketing />
}
