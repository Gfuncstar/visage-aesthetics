import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you were looking for could not be found. Browse treatments or get in touch.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <section className="bg-cream text-charcoal min-h-[70vh] flex items-center">
      <div className="max-w-[820px] mx-auto px-5 md:px-8 py-24 text-center">
        <span className="hairline mb-8 inline-block bg-gold" />
        <div className="text-eyebrow text-stone mb-4">404 &nbsp;·&nbsp; Page not found</div>
        <h1 className="font-display italic text-h1 text-charcoal">
          That page seems to have wandered off.
        </h1>
        <p className="mt-6 text-body-lg text-ink-soft max-w-xl mx-auto">
          The link may be old, or the page may have moved. From here you can head back to the home page,
          browse the full list of treatments, or send a message and we&apos;ll point you in the right direction.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">
            <span>Back to home</span>
            <span className="btn-arrow">→</span>
          </Link>
          <Link href="/treatments" className="btn btn-secondary">
            <span>View all treatments</span>
            <span className="btn-arrow">→</span>
          </Link>
        </div>
        <div className="mt-10 text-stone text-[12px] tracking-[0.18em] uppercase">
          Or get in touch &nbsp;·&nbsp;{' '}
          <a href="mailto:info@vaclinic.co.uk" className="underline decoration-gold/40 hover:decoration-gold-deep">
            info@vaclinic.co.uk
          </a>
        </div>
      </div>
    </section>
  )
}
