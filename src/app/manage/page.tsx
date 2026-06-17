import type { Metadata } from 'next'
import ManageRequest from './ManageRequest'

export const metadata: Metadata = {
  title: 'Manage your appointment',
  description: 'Change or cancel your Visage Aesthetics appointment — enter your email and we will send you a private link straight to your appointments, no password needed.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default function ManagePage() {
  return <ManageRequest />
}
