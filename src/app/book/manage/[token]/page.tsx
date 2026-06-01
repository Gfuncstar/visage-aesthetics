import type { Metadata } from 'next'
import ManageBooking from './ManageBooking'

export const metadata: Metadata = {
  title: 'Manage your booking | Visage Aesthetics',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <ManageBooking token={token} />
}
