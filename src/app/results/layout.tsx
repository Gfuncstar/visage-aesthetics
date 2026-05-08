import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
}

export const viewport: Viewport = {}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
