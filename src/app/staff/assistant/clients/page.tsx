import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import ClientRecord from './ClientRecord'

export const metadata: Metadata = {
  title: 'Client records',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const authed = await isStaffAuthed()
  return authed ? <ClientRecord /> : <StaffGate />
}
