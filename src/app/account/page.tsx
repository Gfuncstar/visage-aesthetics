import type { Metadata } from 'next'
import Account from './Account'

export const metadata: Metadata = {
  title: 'Your appointments',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  return <Account />
}
