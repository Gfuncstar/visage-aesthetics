import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffNav from './StaffNav'

// The staff area is installable as a home-screen app (PWA): "Add to Home
// Screen" gives a Visage icon that opens straight into the Assistant, full
// screen. Scoped to /staff so it never affects the public marketing site.
export const metadata: Metadata = {
  title: 'Staff',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  manifest: '/staff.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Visage Assistant',
    statusBarStyle: 'black-translucent',
  },
}

export const dynamic = 'force-dynamic'

// A persistent, mobile-first bottom navigation bar is shown once signed in, so
// moving between Home, Reception, Marketing and Assistant is always one tap and
// the current section is clearly highlighted.
export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const authed = await isStaffAuthed()
  return (
    <>
      {children}
      {authed && <StaffNav />}
    </>
  )
}
