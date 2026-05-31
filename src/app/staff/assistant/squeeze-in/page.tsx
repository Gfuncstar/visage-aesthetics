import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import SqueezeIn from './SqueezeIn'

export const metadata: Metadata = {
  title: 'Squeeze-in',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function SqueezeInPage() {
  const authed = await isStaffAuthed()
  return authed ? <SqueezeIn /> : <StaffGate />
}
