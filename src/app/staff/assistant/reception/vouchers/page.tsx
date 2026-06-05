import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../../notes/StaffGate'
import IssueVoucher from './IssueVoucher'
import Vouchers from './Vouchers'

export const metadata: Metadata = {
  title: 'Gift vouchers',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function VouchersPage() {
  if (!(await isStaffAuthed())) return <StaffGate />

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-24">
        <div className="eyebrow text-gold mb-2">Receptionist &nbsp;·&nbsp; Gift vouchers</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Gift vouchers.
        </h1>
        <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">
          Send a voucher to anyone at any value, or redeem one against the bill. Vouchers are valid
          for 12 months and can be used over more than one visit.
        </p>

        <div className="mt-8">
          <div className="eyebrow text-gold mb-3">Send a voucher</div>
          <IssueVoucher />
        </div>

        <div className="mt-12 border-t border-line/40 pt-10">
          <div className="eyebrow text-gold mb-3">Redeem a voucher</div>
          <Vouchers />
        </div>
      </div>
    </section>
  )
}
