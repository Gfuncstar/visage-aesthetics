import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import AgentsDashboard from './AgentsDashboard'

export const metadata: Metadata = {
  title: 'Agents',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const authed = await isStaffAuthed()
  return authed ? <AgentsDashboard /> : <StaffGate />
}
