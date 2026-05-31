import type { Metadata } from 'next'

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

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
