import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import Visibility from './Visibility'

export const metadata: Metadata = {
  title: 'Awards & press',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function VisibilityPage() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  return <Visibility />
}
