'use client'

import { usePathname } from 'next/navigation'

// Hides marketing chrome (e.g. the Footer) across the staff back end.
export default function HideOnStaff({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/staff')) return null
  return <>{children}</>
}
