import type { Metadata } from 'next'
import { CalendarClock, CalendarDays, ConciergeBell, FileCheck2, RotateCcw, Ticket } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import Hub from '@/components/staff/Hub'

export const metadata: Metadata = {
  title: 'Receptionist',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const cards = [
  { href: '/staff/assistant/reception/desk', title: 'Front desk', description: 'Today, just-booked, reminders and a voice command desk.', Icon: ConciergeBell },
  { href: '/staff/assistant/diary', title: 'Diary', description: 'The book: appointments, statuses, block time.', Icon: CalendarDays },
  { href: '/staff/assistant/squeeze-in', title: 'Squeeze-in', description: 'Fit someone in: best gap + to-book list.', Icon: CalendarClock },
  { href: '/staff/assistant/rebook', title: "Who's due back", description: 'Clients due a top-up, with a message ready.', Icon: RotateCcw },
  { href: '/staff/assistant/reception/coupon', title: 'Send a coupon', description: 'Email a client a branded discount voucher — set the code and amount.', Icon: Ticket },
  { href: '/staff/assistant/consent', title: 'Consent forms', description: 'Send a form, preview it, and read what comes back.', Icon: FileCheck2 },
]

export default async function ReceptionHub() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  return (
    <Hub
      eyebrow="Receptionist"
      title="The front desk."
      intro="Online booking, the diary, reminders, the waitlist and rebooking, all in one place."
      cards={cards}
      banner={
        <div className="border border-gold/40 bg-gold/5 rounded-sm px-4 py-3 text-sm text-charcoal leading-relaxed">
          <span className="font-medium text-gold-deep">Paused, in standby.</span> This mirrors the live Ovatu diary so you can see it working. It is not taking real bookings yet, and nothing is sent to clients. It goes live only on your say-so.
        </div>
      }
    />
  )
}
