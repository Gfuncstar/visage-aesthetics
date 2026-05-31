import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Check, PackageSearch } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import { assistantConfigured } from '@/lib/assistant/db'
import { stockReview } from '@/lib/assistant/stock'
import { ukDate } from '@/lib/assistant/format'
import MarkOrdered from './MarkOrdered'
import ClientChip from './ClientChip'

export const metadata: Metadata = {
  title: 'What to order',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function StockPage() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  const configured = assistantConfigured()
  const review = configured ? await stockReview() : null
  const todayISO = new Date().toISOString().slice(0, 10)

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <Link href="/staff/assistant" className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4">
          <ArrowLeft size={14} strokeWidth={1.75} /> Assistant
        </Link>
        <div className="eyebrow text-gold mb-2">Assistant &nbsp;·&nbsp; Stock &amp; reorder</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">What do I need to order?</h1>
        <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
          Who&apos;s booked in over the next two weeks, what each needs, and what to order, all in one place.
          Order before 3pm for next-day delivery.
        </p>

        {!configured && (
          <div className="mt-8 border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3">
            Connect the clinic database to see this.
          </div>
        )}

        {review && review.urgentItems.length > 0 && (
          <div className="mt-8 border border-clay/50 bg-clay/10 rounded-sm px-5 py-4">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle size={16} strokeWidth={1.75} className="text-clay" />
              <span className="text-eyebrow text-clay">Order now</span>
            </div>
            <p className="text-sm text-charcoal leading-relaxed">
              {review.beforeCutoff
                ? <>Order <span className="font-medium">before 3pm today</span> for tomorrow&apos;s clients: </>
                : <>It&apos;s past the 3pm cutoff, so order first thing tomorrow for: </>}
              <span className="font-medium">{review.urgentItems.join(', ')}</span>.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {!review || review.lines.length === 0 ? (
            <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
              Nothing booked in the next two weeks that needs ordering. You&apos;re clear.
            </p>
          ) : (
            review.lines.map((l) => (
              <div key={l.key} className={`border rounded-sm p-4 ${l.needOrder ? 'border-gold/50 bg-gold/5' : 'border-line/40 bg-cream-soft'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <PackageSearch size={16} strokeWidth={1.75} className="text-gold-deep" />
                      <span className="text-base font-medium text-charcoal">{l.item}</span>
                    </div>
                    <div className="text-sm text-ink-soft mt-1">
                      <span className="text-charcoal font-medium">{l.upcoming}</span> booked · next {ukDate(l.soonestDate)}
                      {l.daysUntil <= 1 ? ' (tomorrow)' : ''}
                    </div>
                  </div>
                  {l.needOrder ? (
                    <span className="text-xs eyebrow text-clay border border-clay/40 bg-clay/10 rounded-sm px-2 py-1 shrink-0">Order</span>
                  ) : l.ordered ? (
                    <span className="text-xs eyebrow text-sage border border-sage/40 bg-sage/10 rounded-sm px-2 py-1 shrink-0 inline-flex items-center gap-1"><Check size={11} strokeWidth={2.5} /> Ordered</span>
                  ) : (
                    <span className="text-xs eyebrow text-sage border border-sage/40 bg-sage/10 rounded-sm px-2 py-1 shrink-0 inline-flex items-center gap-1"><Check size={11} strokeWidth={2.5} /> In stock</span>
                  )}
                </div>

                <div className="text-sm text-stone mt-2">{l.stockNote}</div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[...l.clients]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((c, i) => {
                      const days = Math.round(
                        (new Date(`${c.date}T00:00:00`).getTime() - new Date(`${todayISO}T00:00:00`).getTime()) / 86400000,
                      )
                      return (
                        <ClientChip key={`${c.name}-${c.date}-${i}`} itemKey={l.key} name={c.name} date={c.date} ordered={c.ordered} days={days} />
                      )
                    })}
                </div>

                {(l.needOrder || l.ordered) && (
                  <div className="mt-3 flex items-center justify-end">
                    <MarkOrdered itemKey={l.key} ordered={l.ordered} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-ink-soft mt-6 leading-relaxed">
          Stock shown is what&apos;s been logged from supplier deliveries (photograph or paste an order to add it).
          Quantities are your judgement; this just flags what&apos;s booked so nothing&apos;s missed.
        </p>
      </div>
    </section>
  )
}
