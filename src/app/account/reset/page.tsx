import type { Metadata } from 'next'
import ResetPassword from './ResetPassword'

export const metadata: Metadata = {
  title: 'Set your password',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return <ResetPassword />
}
