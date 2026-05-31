import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import MoneyDashboard from './MoneyDashboard'

export const metadata: Metadata = {
  title: 'Profit & accountant pack',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function MoneyPage() {
  const authed = await isStaffAuthed()
  return authed ? <MoneyDashboard /> : <StaffGate />
}
