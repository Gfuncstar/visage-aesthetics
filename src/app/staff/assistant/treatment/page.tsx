import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import TreatmentTool from './TreatmentTool'

export const metadata: Metadata = {
  title: 'Treatment write-up',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function TreatmentPage() {
  const authed = await isStaffAuthed()
  return authed ? <TreatmentTool /> : <StaffGate />
}
