import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import Preflight from './Preflight'

export const metadata: Metadata = {
  title: 'Go-live readiness',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function PreflightPage() {
  const authed = await isStaffAuthed()
  return authed ? <Preflight /> : <StaffGate />
}
