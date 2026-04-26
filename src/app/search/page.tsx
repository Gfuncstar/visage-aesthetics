import type { Metadata } from 'next'
import Link from 'next/link'
import { searchSite } from '@/lib/search-index'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search treatments, blog articles, locations and pages across Visage Aesthetics, Braintree.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true },
}

type SearchParams = Promise<{ q?: string }>

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const results = query ? searchSite(query) : []

  return (
    <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-12 md:pb-16">
      <div className="max-w-[860px] mx-auto px-5 md:px-8">
        <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li><Link href="/" className="hover:text-gold">Home</Link></li>
            <li aria-hidden className="opacity-40">/</li>
            <li aria-current="page" className="text-charcoal/80">Search</li>
          </ol>
        </nav>
        <span className="hairline mb-6 inline-block bg-gold" />
        <h1 className="font-display italic text-h1 text-charcoal">Search the site.</h1>

        <form method="GET" action="/search" className="mt-8 flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Try ‘profhilo’, ‘botox braintree’, ‘aftercare’"
            aria-label="Search Visage Aesthetics"
            className="flex-1 border border-line/40 rounded-sm px-4 py-3 text-charcoal placeholder:text-stone bg-cream-soft focus:outline-none focus:border-gold"
          />
          <button type="submit" className="btn btn-primary !px-5">
            <span>Search</span>
          </button>
        </form>

        {query && (
          <p className="mt-5 text-stone text-[12px] tracking-[0.06em]">
            {results.length} result{results.length === 1 ? '' : 's'} for <strong className="text-charcoal">&ldquo;{query}&rdquo;</strong>
          </p>
        )}

        {results.length > 0 && (
          <ul className="mt-8 grid gap-4">
            {results.map((r) => (
              <li key={r.url} className="border border-line/30 rounded-md p-5 hover:border-gold/60 transition-colors">
                <div className="text-eyebrow text-gold mb-2">{r.category}</div>
                <Link href={r.url} className="font-display italic text-charcoal hover:text-gold-deep transition-colors block" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}>
                  {r.title}
                </Link>
                <p className="mt-2 text-body text-ink-soft leading-relaxed">{r.description}</p>
                <div className="mt-2 text-stone text-[11px] tracking-[0.06em]">{r.url}</div>
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && (
          <div className="mt-8 border border-line/30 rounded-md p-7 bg-cream-soft text-center">
            <p className="text-body-lg text-ink-soft">No matches for that query.</p>
            <p className="mt-3 text-body text-stone">Try the <Link href="/treatments" className="underline decoration-gold/40 text-charcoal">treatments index</Link> or the <Link href="/blog" className="underline decoration-gold/40 text-charcoal">blog</Link>.</p>
          </div>
        )}

        {!query && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 text-body text-ink-soft">
            <div>
              <div className="text-eyebrow text-gold mb-2">Popular searches</div>
              <ul className="space-y-1.5">
                {['botox', 'lip filler', 'profhilo', 'pricing', 'consultation', 'aftercare', 'awards'].map((t) => (
                  <li key={t}>
                    <Link href={`/search?q=${encodeURIComponent(t)}`} className="text-charcoal hover:text-gold transition-colors underline decoration-gold/30">
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-eyebrow text-gold mb-2">Or explore directly</div>
              <ul className="space-y-1.5">
                <li><Link href="/treatments" className="text-charcoal hover:text-gold transition-colors">All treatments</Link></li>
                <li><Link href="/pricing" className="text-charcoal hover:text-gold transition-colors">Transparent pricing</Link></li>
                <li><Link href="/about/qualifications" className="text-charcoal hover:text-gold transition-colors">Qualifications</Link></li>
                <li><Link href="/awards" className="text-charcoal hover:text-gold transition-colors">Awards</Link></li>
                <li><Link href="/blog" className="text-charcoal hover:text-gold transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
