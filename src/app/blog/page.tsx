import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'Insights & Advice | Visage Aesthetics',
  description: 'Plain-English notes on aesthetic treatments from Bernadette Tobin, registered nurse. Honest, evidence-based guidance from the Visage Aesthetics clinic in Braintree.',
}

const posts = [
  {
    slug: 'first-botox-appointment',
    category: 'Anti-wrinkle',
    title: 'What to expect from your first Botox appointment.',
    excerpt: 'Nervous about your first anti-wrinkle treatment? A calm, honest walk-through of the consultation, the injections themselves, the first two weeks and the results you should expect.',
    readTime: '7 min read',
  },
  {
    slug: 'natural-looking-filler',
    category: 'Dermal filler',
    title: 'How to get natural-looking dermal filler results.',
    excerpt: 'Why does some filler look obvious and other filler look like nothing at all? It comes down to the practitioner, the anatomy and a willingness to do less. Here is what actually matters.',
    readTime: '7 min read',
  },
  {
    slug: 'profhilo-vs-dermal-filler',
    category: 'Skin quality',
    title: 'Profhilo vs dermal filler: which one do you actually need?',
    excerpt: 'Both are injectable. Both contain hyaluronic acid. They do completely different jobs. A clear, jargon-free guide to choosing the right treatment for your skin and your goals.',
    readTime: '8 min read',
  },
]

export default function BlogPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="max-w-3xl">
            <span className="hairline hairline-left mb-8 bg-gold" />
            <div className="text-eyebrow text-stone mb-5 md:mb-7">
              Insights &amp; advice
            </div>
            <h1 className="font-display italic text-hero text-charcoal">
              Honest, expert guidance.
            </h1>
            <p className="mt-7 md:mt-9 text-body-lg text-ink-soft max-w-xl leading-relaxed">
              Plain-English notes on aesthetic treatments from a registered nurse.
            </p>
          </div>
        </div>
      </section>

      {/* POSTS GRID */}
      <section className="py-6 md:py-9 bg-cream">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="card flex flex-col"
              >
                <div className="text-eyebrow text-gold mb-4">{post.category}</div>
                <h2 className="font-display text-2xl text-charcoal leading-snug mb-4">
                  {post.title}
                </h2>
                <p className="text-ink-soft text-body leading-relaxed mb-6">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-5 border-t border-line/25 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-ink-soft">
                    <Clock size={13} strokeWidth={1.5} /> {post.readTime}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-gold text-sm font-medium hover:gap-2 transition-all"
                  >
                    Read article <ArrowUpRight size={15} strokeWidth={1.75} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
