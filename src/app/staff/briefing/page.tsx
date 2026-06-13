import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../notes/StaffGate'
import { buildBriefing } from '@/lib/assistant/briefing'
import BriefingPlayer from './BriefingPlayer'

export const metadata: Metadata = {
  title: 'The briefing',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function BriefingPage() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  const briefing = await buildBriefing()
  return <BriefingPlayer briefing={briefing} />
}
