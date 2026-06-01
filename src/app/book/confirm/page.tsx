import type { Metadata } from 'next'
import { Suspense } from 'react'
import DepositConfirm from './DepositConfirm'

export const metadata: Metadata = {
  title: 'Confirming your booking | Visage Aesthetics',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <DepositConfirm />
    </Suspense>
  )
}
