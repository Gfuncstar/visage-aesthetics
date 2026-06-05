import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../../notes/StaffGate'
import CouponSender from './CouponSender'

export const metadata: Metadata = {
  title: 'Send a coupon',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function CouponPage() {
  if (!(await isStaffAuthed())) return <StaffGate />

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-24">
        <div className="eyebrow text-gold mb-2">Receptionist &nbsp;·&nbsp; Coupons</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Send a coupon.
        </h1>
        <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">
          Set the code and the amount, and send a client a branded discount voucher straight to their inbox.
        </p>
        <div className="mt-8">
          <CouponSender />
        </div>
      </div>
    </section>
  )
}
