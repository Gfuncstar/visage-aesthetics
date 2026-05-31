import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import OrdersLog from './OrdersLog'

export const metadata: Metadata = {
  title: 'Orders & expenses',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const authed = await isStaffAuthed()
  return authed ? <OrdersLog /> : <StaffGate />
}
