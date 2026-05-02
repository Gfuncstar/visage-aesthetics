import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'how-long-does-profhilo-last',
  title: 'How long does Profhilo actually last?',
  description: 'Profhilo lasts 6 to 9 months from a course of two, but the picture is more nuanced than that. Bernadette Tobin RGN, MSc explains the timeline, the variables, and what to expect long-term.',
  datePublished: '2026-04-26',
  dateModified: '2026-04-26',
  image: '/images/og-home.jpg',
  wordCount: 1580,
}

export const metadata: Metadata = {
  title: `${POST.title} | Visage Aesthetics`,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
  openGraph: {
    type: 'article',
    title: POST.title,
    description: POST.description,
    url: `https://www.vaclinic.co.uk/blog/${POST.slug}`,
    publishedTime: POST.datePublished,
    modifiedTime: POST.dateModified,
    authors: ['Bernadette Tobin'],
  },
}

export default function ProfhiloDurationPost() {
  return (
    <article className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(POST)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(POST.slug, POST.title)) }} />

      <section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-3xl mx-auto px-5 md:px-8 relative">
          <Link href="/blog" className="text-stone text-sm hover:opacity-70 transition-opacity mb-8 inline-block">
            &larr; Back to all articles
          </Link>
          <span className="hairline hairline-left mb-8 bg-gold" />
          <div className="text-eyebrow text-gold mb-3">Treatment guide</div>
          <h1 className="font-display italic text-hero text-charcoal">How long does Profhilo actually last?</h1>
          <p className="mt-6 text-body-lg text-ink-soft">
            The short answer most clinics give is &ldquo;6 to 9 months&rdquo;. The honest answer is more layered than that.
            Profhilo is not filler, so it does not have a clean &ldquo;dissolves on day X&rdquo; profile. The product itself
            metabolises within weeks, but the changes it triggers in your skin can keep developing, and the visible benefit can
            outlast the product itself by months.
          </p>
        </div>
      </section>

      <section className="pb-6 md:pb-10">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="text-stone text-[12px] tracking-[0.18em] uppercase mb-8">7 min read &middot; By Bernadette Tobin RGN, MSc</div>

          <h2 className="font-display italic text-h2 text-charcoal mt-2 mb-5">The short version</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-6">
            A standard course of two Profhilo sessions four weeks apart typically produces visible benefit for <strong>6 to 9 months</strong>. The hyaluronic acid itself fully metabolises within weeks, but the collagen and elastin you have stimulated continue to develop. Many clients see the result hold for longer than the product strictly &ldquo;lasts&rdquo;. From around month 6, the visible glow begins to soften, and most clients book a single maintenance session at that point.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What actually happens after the injections</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Profhilo is a high-concentration ultra-stabilised hyaluronic acid (HA), placed at five anatomical points on each side of the face using the BAP injection technique. The HA itself is not designed to sit in place forever, within around 28 days, it has fully metabolised. So if &ldquo;lasting&rdquo; meant &ldquo;the gel is still there&rdquo;, the answer would be &ldquo;a month&rdquo;, which is misleading.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            What actually keeps Profhilo working is what it triggers while it is in your skin. The HA spreads through the dermis, attracts water, and signals fibroblast cells (your collagen-and-elastin makers) to start producing again. By the time the product is gone, you have new collagen and elastin scaffolding that did not exist before, and that is what creates the visible glow, bounce and improved texture for months afterwards.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A realistic timeline</h2>
          <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
            <li>· <strong>Week 0:</strong> First session. Small bumps at injection points settle within 12-24 hours.</li>
            <li>· <strong>Week 2-3:</strong> First visible softening, clients describe it as a glow rather than a change.</li>
            <li>· <strong>Week 4:</strong> Second session. Bumps again, settle in 24 hours.</li>
            <li>· <strong>Week 6-8:</strong> Peak visible result. Skin looks smoother, more bounce, often described as &ldquo;rested&rdquo; by people who don&apos;t know you&apos;ve had treatment.</li>
            <li>· <strong>Month 4-5:</strong> Result is still clearly there but starting to soften gradually.</li>
            <li>· <strong>Month 6-7:</strong> Most clients begin to notice the glow returning to baseline, and book a maintenance session.</li>
            <li>· <strong>Month 9-12:</strong> Without maintenance, most clients are back to where they started, though the underlying collagen stimulation does not fully reverse, so each course can build on the last.</li>
          </ul>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What makes it last longer (or shorter)</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            The 6-to-9 month range is wide because individual responses vary considerably. Variables that lengthen the result:
          </p>
          <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
            <li>· Consistent daily SPF50, sun damage breaks down collagen faster than anything else.</li>
            <li>· Good sleep, hydration and a sensible skincare routine.</li>
            <li>· Not smoking, smokers metabolise hyaluronic acid faster and produce less collagen.</li>
            <li>· Lower stress and lower cortisol levels.</li>
            <li>· Regular maintenance sessions every 6 months, each course builds on the last.</li>
          </ul>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Variables that shorten the result:
          </p>
          <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
            <li>· Heavy sun exposure without protection.</li>
            <li>· Smoking and high alcohol intake.</li>
            <li>· High-intensity training every day (athletes metabolise HA notably faster).</li>
            <li>· Significant weight loss or fluctuation during the treatment window.</li>
            <li>· Ageing , younger clients tend to respond more strongly than older clients, simply because there is more functional collagen to wake up.</li>
          </ul>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Does it last longer the second time?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            For most clients, yes. The collagen and elastin stimulated by your first course does not fully disappear when the visible glow softens. So when you repeat the course six months later, you are building on a stronger foundation than you started with. Many clients tell me their second course holds visibly for longer, closer to 9 months than 6, and the results compound over multiple cycles.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            This is one of the reasons I recommend Profhilo as a long-term skin maintenance strategy rather than a one-off treatment. The first course is the foundation. Subsequent courses are upkeep, and they get more economical with time.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why &ldquo;authentic Profhilo&rdquo; matters for longevity</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Profhilo is made by IBSA, an Italian pharmaceutical company. It is sold in distinctive single-use syringes with traceable batch numbers. Some clinics, particularly in less regulated parts of the industry, substitute cheaper hyaluronic acid skin boosters and call them &ldquo;Profhilo&rdquo;. These can produce some result, but the longevity is rarely what the genuine product delivers. If a clinic offering &ldquo;Profhilo&rdquo; cannot show you the box and the syringe, you may not be getting Profhilo.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            At Visage we use authentic IBSA Profhilo, sourced direct from the manufacturer, in the original syringe, with batch traceability. Never relabelled, never substituted. The clinical evidence I have based my advice on this whole article comes from studies of the genuine product, substitutes do not have the same data behind them.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When Profhilo does not last well</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Occasionally a client comes back at 8 weeks disappointed that the result has not been as visible or as long as expected. There are usually one of three explanations:
          </p>
          <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
            <li>· <strong>Wrong treatment for the goal.</strong> If you wanted volume change (cheeks, lips, jawline), Profhilo was never going to deliver that, it does not add volume. <Link href="/treatments/dermal-filler" className="underline decoration-gold/40 hover:decoration-gold-deep text-charcoal">Filler</Link> would have been the right answer.</li>
            <li>· <strong>Skin needed more than two sessions.</strong> A small subset of clients with significantly compromised skin (heavy sun damage, smoker history) need three sessions rather than two for a strong first response.</li>
            <li>· <strong>Expectations were unrealistic.</strong> Profhilo is gentle. The result is &ldquo;your skin on a really good day, sustained&rdquo;, not a dramatic change. If you wanted dramatic, we should have spotted that at consultation and suggested a different plan.</li>
          </ul>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            This is exactly why the consultation matters. I would rather tell you Profhilo isn&apos;t the right treatment for what you want than take your money and have you disappointed at 8 weeks.
          </p>

          <div className="mt-12 p-7 md:p-8 border border-line/30 rounded-md bg-cream-soft">
            <div className="text-eyebrow text-gold mb-3">Free consultation</div>
            <p className="font-display italic text-charcoal mb-4" style={{ fontSize: 24, lineHeight: 1.3, fontWeight: 500 }}>
              Not sure if Profhilo is right for you?
            </p>
            <p className="text-body text-ink-soft mb-5">
              Bring photos of your face you like and ones you don&apos;t. We will look together and plan
              something that genuinely suits you, Profhilo, filler, micro-needling, or none of the above.
              No upselling, no pressure.
            </p>
            <Link href="/contact" className="btn btn-primary">
              <span>Book consultation</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/treatments/profhilo" className="block border border-line/30 rounded-md p-5 hover:border-gold/60 transition-colors">
              <div className="text-eyebrow text-gold mb-2">Read more</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 20 }}>Profhilo treatment page →</div>
            </Link>
            <Link href="/blog/profhilo-vs-dermal-filler" className="block border border-line/30 rounded-md p-5 hover:border-gold/60 transition-colors">
              <div className="text-eyebrow text-gold mb-2">Related article</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 20 }}>Profhilo vs dermal filler →</div>
            </Link>
          </div>
        </div>
      </section>

      <BookingCTA />
    </article>
  )
}
