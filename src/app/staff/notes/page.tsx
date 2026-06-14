import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from './StaffGate'
import PatientNotesForm from './PatientNotesForm'

export const metadata: Metadata = {
  title: 'Patient notes',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function StaffNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; date?: string }>
}) {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  // Prefill from a tapped card on the landing page (?name=&date=), so notes can
  // be written up for that client straight from the home screen.
  const sp = await searchParams
  const prefillName = typeof sp.name === 'string' ? sp.name.slice(0, 200) : ''
  const prefillDate = typeof sp.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : ''
  return <PatientNotesForm prefillName={prefillName} prefillDate={prefillDate} />
}
