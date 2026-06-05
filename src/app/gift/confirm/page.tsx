import type { Metadata } from 'next'
import GiftConfirm from './GiftConfirm'

export const metadata: Metadata = {
  title: 'Your gift voucher | Visage Aesthetics',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function GiftConfirmPage() {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-20 md:pt-28 pb-24 text-center">
        <GiftConfirm />
      </div>
    </section>
  )
}
