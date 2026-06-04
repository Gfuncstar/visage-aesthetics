import type { Metadata } from 'next'
import { Award, BarChart3, Mail } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import { isSimpleView } from '@/lib/staff-prefs'
import StaffGate from '../../notes/StaffGate'
import Hub from '@/components/staff/Hub'

export const metadata: Metadata = {
  title: 'Marketing',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const cards = [
  { href: '/staff/assistant/marketing/overview', title: 'Overview', description: 'What has gone out: blogs, emails, social and ads, plus post to Meta.', Icon: BarChart3, advanced: true },
  { href: '/staff/broadcasts', title: 'Email broadcasts', description: 'Compose and send a branded email to your patient list.', Icon: Mail },
  { href: '/staff/assistant/visibility', title: 'Awards & press', description: 'Free awards to enter and press to reply to.', Icon: Award, advanced: true },
]

export default async function MarketingHub() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  const simple = await isSimpleView()
  const visible = simple ? cards.filter((c) => !c.advanced) : cards
  return (
    <Hub
      eyebrow="Marketing"
      title="Getting the clinic seen."
      intro="The marketing arm: everything going out, in one place."
      cards={visible}
    />
  )
}
