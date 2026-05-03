import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'
import { blogPostsByDate } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Aesthetics Insights & Advice from a Registered Nurse',
  description: "Honest, evidence-based aesthetic-treatment guidance from Bernadette Tobin RGN, MSc, registered nurse, NMC PIN 05G1755E. New articles every two days. Best Non-Surgical Aesthetics Clinic 2026, Essex.",
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    title: 'Aesthetics Insights from Visage Aesthetics, Braintree',
    description: 'Plain-English notes on aesthetic treatments, written by Bernadette Tobin RGN, MSc.',
    url: 'https://www.vaclinic.co.uk/blog',
  },
}

const SITE = 'https://www.vaclinic.co.uk'

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      ],
    },
    {
      '@type': 'Blog',
      '@id': `${SITE}/blog#blog`,
      name: 'Visage Aesthetics, Insights & Advice',
      description:
        'Plain-English, evidence-based aesthetic-treatment guidance from Bernadette Tobin RGN, MSc, founder of Visage Aesthetics. New posts every 2 days.',
      url: `${SITE}/blog`,
      inLanguage: 'en-GB',
      publisher: {
        '@type': 'Organization',
        '@id': `${SITE}/#org`,
        name: 'Visage Aesthetics',
        url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}/icon.png` },
      },
      author: {
        '@type': 'Person',
        name: 'Bernadette Tobin',
        jobTitle: 'Registered Nurse, MSc Advanced Practice',
        url: `${SITE}/about/qualifications`,
        identifier: { '@type': 'PropertyValue', propertyID: 'NMC PIN', value: '05G1755E' },
      },
      blogPost: blogPostsByDate.map((p) => ({
        '@type': 'BlogPosting',
        '@id': `${SITE}/blog/${p.slug}#article`,
        headline: p.title,
        description: p.excerpt,
        url: `${SITE}/blog/${p.slug}`,
        datePublished: p.datePublished,
        dateModified: p.dateModified ?? p.datePublished,
        image: p.image ? `${SITE}${p.image}` : `${SITE}/images/og-home.jpg`,
        author: {
          '@type': 'Person',
          name: 'Bernadette Tobin',
          url: `${SITE}/about/qualifications`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Visage Aesthetics',
          logo: { '@type': 'ImageObject', url: `${SITE}/icon.png` },
        },
        articleSection: p.category,
        inLanguage: 'en-GB',
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${p.slug}` },
      })),
    },
    {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: blogPostsByDate.length,
      itemListElement: blogPostsByDate.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  ],
}

const FORMAT_DATE = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default function BlogPage() {
  const [featured, ...rest] = blogPostsByDate

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />

      {/* HERO */}
      <section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-5">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Blog</li>
            </ol>
          </nav>
          <div className="max-w-3xl">
            <span className="hairline hairline-left mb-8 bg-gold" />
            <div className="text-eyebrow text-gold mb-5">Insights &amp; advice</div>
            <h1 className="font-display italic text-hero text-charcoal">
              Aesthetics, in plain English.
            </h1>
            <p className="mt-7 text-body-lg text-ink-soft max-w-2xl leading-relaxed">
              Honest, evidence-based aesthetic-treatment guidance from <Link href="/about/qualifications" className="underline decoration-gold/40 hover:decoration-gold-deep text-charcoal">Bernadette Tobin RGN, MSc</Link>
              {' '}- a registered nurse with twenty years of clinical experience and an MSc in Advanced Practice (Level 7).
              No marketing spin, no scare tactics, no hidden agenda. Just clear answers to the questions people actually
              ask in the consultation room.
            </p>
            <p className="mt-5 text-body text-stone max-w-2xl leading-relaxed">
              Visage Aesthetics was named <strong className="text-charcoal font-medium">Best Non-Surgical Aesthetics Clinic 2026, Essex</strong>{' '}
              by the Health, Beauty &amp; Wellness Awards. I am also a 2026 nominee for Educator of the Year.
              {' '}<Link href="/awards" className="underline decoration-gold/40 hover:decoration-gold-deep">More on awards →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED POST */}
      {featured && (
        <section className="py-6 md:py-9 bg-cream">
          <div className="max-w-[1280px] mx-auto px-5 md:px-8">
            <Link
              href={`/blog/${featured.slug}`}
              className="block group border border-line/30 rounded-md p-7 md:p-10 bg-cream-soft hover:border-gold/60 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-center">
                <div className="md:col-span-8">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-eyebrow text-gold">{featured.category}</span>
                    <span aria-hidden className="text-stone/40">·</span>
                    <span className="text-eyebrow text-stone">Latest</span>
                    <span aria-hidden className="text-stone/40">·</span>
                    <time dateTime={featured.datePublished} className="text-stone text-[12px] tracking-[0.06em]">
                      {FORMAT_DATE(featured.datePublished)}
                    </time>
                  </div>
                  <h2 className="font-display italic text-charcoal" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.1, fontWeight: 500 }}>
                    {featured.title}
                  </h2>
                  <p className="mt-5 text-body-lg text-ink-soft max-w-2xl leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <div className="mt-7 flex items-center gap-3 text-charcoal text-sm font-medium">
                    <span>Read article</span>
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
                <div className="md:col-span-4 md:text-right">
                  <div className="text-eyebrow text-stone mb-2">Author</div>
                  <div className="font-display italic text-charcoal" style={{ fontSize: 22, fontWeight: 500 }}>Bernadette Tobin</div>
                  <div className="text-stone text-[12px] tracking-[0.06em] mt-1">RGN · MSc Advanced Practice</div>
                  <div className="text-stone text-[11px] tracking-[0.18em] uppercase mt-3">NMC PIN 05G1755E</div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ARCHIVE GRID */}
      {rest.length > 0 && (
        <section className="py-6 md:py-9 bg-cream">
          <div className="max-w-[1280px] mx-auto px-5 md:px-8">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <div className="text-eyebrow text-gold mb-3">All articles</div>
                <h2 className="font-display text-h2 text-charcoal">More from the clinic.</h2>
              </div>
              <span className="text-stone text-[12px] tracking-[0.18em] uppercase hidden md:inline-block">
                {blogPostsByDate.length} articles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {rest.map((post) => (
                <article key={post.slug} className="border border-line/30 rounded-md p-6 md:p-7 bg-cream-soft flex flex-col">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-eyebrow text-gold">{post.category}</span>
                    <span aria-hidden className="text-stone/40">·</span>
                    <time dateTime={post.datePublished} className="text-stone text-[11px] tracking-[0.06em]">
                      {FORMAT_DATE(post.datePublished)}
                    </time>
                  </div>
                  <h3 className="font-display italic text-charcoal mb-3" style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 500 }}>
                    {post.title}
                  </h3>
                  <p className="text-body text-ink-soft leading-relaxed mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-5 border-t border-line/30 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12px] text-stone">
                      <Clock size={12} strokeWidth={1.5} /> {post.readTime}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-gold text-[12px] font-medium hover:gap-2 transition-all"
                    >
                      Read <ArrowUpRight size={13} strokeWidth={1.75} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INTERNAL LINK BLOCK, feeds the funnel + crawl depth */}
      <section className="py-6 md:py-9 bg-cream-soft">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">From the writer</div>
            <h2 className="font-display text-h2 text-charcoal mb-5">Why I write this blog.</h2>
            <p className="text-body-lg text-ink-soft leading-relaxed">
              Most aesthetic-treatment information online is written by marketing teams, not practitioners.
              I write these articles myself, in the same voice you would hear if you came in for a consultation,
              calm, conservative, clinical. The aim is to help you make a properly-informed decision before any
              syringe is opened.
            </p>
            <p className="mt-4 text-body-lg text-ink-soft leading-relaxed">
              New articles publish every two days. If there is a question you would like covered, the
              {' '}<Link href="/contact" className="underline decoration-gold/40 hover:decoration-gold-deep text-charcoal">contact page</Link>{' '}
              is always open.
            </p>
          </div>
          <div>
            <div className="text-eyebrow text-gold mb-3">Quick links</div>
            <h3 className="font-display italic text-charcoal mb-5" style={{ fontSize: 22, fontWeight: 500 }}>Reader favourites.</h3>
            <ul className="space-y-3">
              {[
                { href: '/treatments', label: 'All treatments' },
                { href: '/pricing', label: 'Transparent pricing' },
                { href: '/about/qualifications', label: 'Bernadette’s qualifications' },
                { href: '/awards', label: 'Awards & recognition' },
                { href: '/faq', label: 'Frequently asked questions' },
                { href: '/contact', label: 'Book a free consultation' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex items-center gap-2 text-charcoal hover:text-gold transition-colors group">
                    <span className="border-b border-line/40 group-hover:border-gold transition-colors">{l.label}</span>
                    <ArrowUpRight size={14} className="text-stone group-hover:text-gold-deep transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
