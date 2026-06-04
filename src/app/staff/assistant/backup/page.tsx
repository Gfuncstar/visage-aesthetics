import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import BackupDashboard from './BackupDashboard'

export const metadata: Metadata = {
  title: 'Backup',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function BackupPage() {
  const authed = await isStaffAuthed()
  return authed ? <BackupDashboard /> : <StaffGate />
}
