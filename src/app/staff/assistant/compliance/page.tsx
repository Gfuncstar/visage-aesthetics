import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import ComplianceBot from './ComplianceBot'

export const metadata: Metadata = {
  title: 'Compliance',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function CompliancePage() {
  const authed = await isStaffAuthed()
  return authed ? <ComplianceBot /> : <StaffGate />
}
