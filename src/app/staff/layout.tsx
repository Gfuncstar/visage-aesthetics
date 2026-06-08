import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import { isSimpleView } from '@/lib/staff-prefs'
import StaffNav from './StaffNav'
import StaffTopBar from './StaffTopBar'
import SimpleViewToggle from './SimpleViewToggle'

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
  if (!authed) return <>{children}</>
  const simple = await isSimpleView()
  return (
    <>
      {/* Top nav makes the section you're in obvious, then a slim Simple/Full
          view switch, then the breadcrumb bar for in-section context. */}
      <div className="bg-cream" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        <StaffNav viewToggle={<SimpleViewToggle initialSimple={simple} compact />} />
        <StaffTopBar />
        {children}
      </div>
    </>
  )
}
