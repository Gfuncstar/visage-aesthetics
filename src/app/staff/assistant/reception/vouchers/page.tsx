import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { ukDate } from '@/lib/assistant/format'
import StaffGate from '../../../notes/StaffGate'
import IssueVoucher from './IssueVoucher'
import Vouchers from './Vouchers'

export const metadata: Metadata = {
  title: 'Gift vouchers',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

type RecentVoucher = {
  id: string
  code: string | null
  status: string
  amount_pence: number
  balance_pence: number
  recipient_name: string | null
  recipient_email: string | null
  buyer_name: string | null
  created_at: string
}

const money = (pence: number) => `£${(pence / 100).toFixed(2).replace(/\.00$/, '')}`

export default async function VouchersPage() {
  if (!(await isStaffAuthed())) return <StaffGate />

  const recent: RecentVoucher[] = assistantConfigured()
    ? await select<RecentVoucher>('gift_vouchers', {
        order: 'created_at.desc',
        limit: 25,
        select: 'id,code,status,amount_pence,balance_pence,recipient_name,recipient_email,buyer_name,created_at',
      }).catch(() => [])
    : []
  const issued = recent.filter((v) => v.code)

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-24">
        <div className="eyebrow text-gold mb-2">Receptionist &nbsp;·&nbsp; Gift vouchers</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Gift vouchers.
        </h1>
        <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">
          Send a voucher to anyone at any value, or redeem one against the bill. Every voucher is
          recorded against the recipient&rsquo;s profile.
        </p>

        <div className="mt-8">
          <div className="eyebrow text-gold mb-3">Send a voucher</div>
          <IssueVoucher />
        </div>

        <div className="mt-12 border-t border-line/40 pt-10">
          <div className="eyebrow text-gold mb-3">Issued vouchers</div>
          {issued.length === 0 ? (
            <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
              No vouchers issued yet. Ones you send (or that are bought online) appear here, with their code and who they went to.
            </p>
          ) : (
            <div className="border border-line/40 rounded-sm divide-y divide-line/30 bg-cream-soft">
              {issued.map((v) => (
                <div key={v.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-charcoal font-medium tracking-[0.12em]">{v.code}</div>
                    <div className="text-xs text-stone mt-0.5 truncate">
                      {v.recipient_name || 'Unknown'}{v.recipient_email ? ` · ${v.recipient_email}` : ''} · {ukDate(v.created_at)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-charcoal">{money(v.balance_pence)} <span className="text-stone text-xs">/ {money(v.amount_pence)}</span></div>
                    <div className={`text-xs capitalize ${v.status === 'active' ? 'text-sage' : v.status === 'redeemed' ? 'text-stone' : 'text-gold-deep'}`}>{v.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-line/40 pt-10">
          <div className="eyebrow text-gold mb-3">Redeem a voucher</div>
          <Vouchers />
        </div>
      </div>
    </section>
  )
}
