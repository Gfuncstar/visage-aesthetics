import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from './StaffGate'
import PatientNotesForm from './PatientNotesForm'

export const metadata: Metadata = {
  title: 'Patient notes',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function StaffNotesPage() {
  const authed = await isStaffAuthed()
  return authed ? <PatientNotesForm /> : <StaffGate />
}
