import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'Profhilo vs Dermal Filler: Which Do You Actually Need? | Visage Aesthetics',
  description: 'Both are injectable. Both contain hyaluronic acid. They do completely different jobs. Bernadette Tobin, RN MSc, explains the real difference and how to choose.',
}

export default function ProfhiloVsFillerPost() {
  return (
    <article className="bg-cream">
      {/* HERO BAND */}
      <section className="relative bg-cream text-charcoal overflow-hidden pt-32 md:pt-40 pb-20 md:pb-24">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-3xl mx-auto px-5 md:px-8 relative">
          <Link href="/blog" className="text-stone text-sm hover:opacity-70 transition-opacity mb-8 inline-block">
            &larr; Back to all articles
          </Link>
          <span className="hairline hairline-left mb-8 bg-gold" />
          <div className="text-eyebrow text-stone mb-5 md:mb-7">
            Skin quality
          </div>
          <h1 className="font-display italic text-hero text-charcoal">
            Profhilo vs dermal filler: which one do you actually need?
          </h1>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone">
            <span>Bernadette Tobin &middot; RN, MSc &middot; Updated April 2026</span>
            <span className="hidden sm:inline text-charcoal/30">/</span>
            <span>8 min read</span>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <p className="text-body-lg text-charcoal leading-relaxed mb-5">
          One of the most common questions I get asked at consultations is which of these two treatments is right. The confusion is completely understandable. Both are injectable, both use hyaluronic acid, and the marketing for both can sound very similar. In practice they do entirely different jobs, and choosing well makes a meaningful difference to your result.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          I am Bernadette, a registered nurse with an MSc in Advanced Practice. I have been treating clients with both of these products for years at the Visage clinic in Braintree. This is the explanation I find most useful in the consultation room.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">What each one does</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Profhilo is a skin remodelling treatment. The hyaluronic acid is a very pure, ultra-pure form that is delivered just under the skin in small precise points. From there it spreads, hydrates, and stimulates your own collagen and elastin to rebuild over the following weeks. The result is firmer, plumper, glowier skin, but the underlying shape of your face does not change.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Dermal filler is a structural treatment. The hyaluronic acid is cross-linked into a gel of varying firmness, designed to hold its shape once placed. It is used to add volume back where the face has deflated, to support and contour the cheek, jaw or chin, or to refine and shape the lip. Filler changes structure. Profhilo does not.
        </p>

        <blockquote className="font-display italic text-h2 text-charcoal my-10 border-l-2 border-gold pl-6">
          &ldquo;Profhilo treats skin quality. Filler treats facial volume and shape. They answer two completely different questions.&rdquo;
        </blockquote>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">Who Profhilo is for</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Profhilo is the right answer when the issue is the quality of the skin itself rather than the shape underneath. Skin that is starting to look a little dehydrated, crepey or dull. A jawline that is losing definition because the skin is sagging slightly rather than because the bone has changed. The early lined look on the neck. A general loss of bounce.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          It tends to suit people in their mid-thirties and beyond, although there is no fixed age. The standard course is two sessions four weeks apart, with results building gradually and lasting around six to nine months. Many of my clients run two courses a year as a maintenance plan, which is a very gentle, sustainable way to keep skin looking healthy.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">Who filler is for</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Filler is the right answer when there is a structural change you want to address. Cheeks that have flattened or descended. A chin that has always been slightly recessive. Lips that have thinned with age, or have always been smaller than you would like. A tear trough hollow that has appeared as the face has matured.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Done conservatively and in the right hands, filler can be one of the most rewarding treatments in aesthetics. It rebuilds support that has been lost and the result, oddly, is that the whole face looks softer and fresher even though only one or two areas have actually been treated. Results last anywhere from nine to eighteen months depending on the product and the area.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">Can they be combined?</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Yes, and they often are. The two treatments do not compete, they complement each other. Filler restores the architecture, Profhilo improves the canvas that sits over the top. A face that has had a small amount of well-placed filler and a course of Profhilo will almost always look better than one that has had either treatment alone.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          When I plan a combined approach I usually space the treatments out so we can see what each one is doing. I also keep the volumes very modest. The goal is never to add as much as possible, it is to add the smallest amount that achieves the result.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">Which comes first?</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          As a general rule, if there is a clear structural concern I will address that with filler first. Once the face has its proper support back, we can layer Profhilo over the top to improve skin quality. If the structure looks fundamentally fine and the issue is purely the quality of the skin, we go straight to Profhilo and skip filler entirely.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          What I will never do is sell you both treatments simply because both are available. If your concern can be met with one of them, that is what I will recommend. Doing less is almost always the right call.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">A simple decision guide</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          If you are still not sure which way to lean before your consultation, this short checklist usually helps clients narrow it down:
        </p>

        <div className="my-10 border border-line/30 rounded-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-taupe-dark/30">
            <div className="p-6 md:p-8 bg-cream-soft">
              <div className="text-eyebrow text-gold mb-3">Lean Profhilo</div>
              <ol className="space-y-3 text-ink-soft text-body leading-relaxed list-decimal list-inside">
                <li>Your concern is dullness, dryness or crepey-looking skin.</li>
                <li>You want a healthier glow rather than a change in shape.</li>
                <li>The structure of your face still feels like yours.</li>
                <li>You want a low-key, low-commitment maintenance treatment.</li>
              </ol>
            </div>
            <div className="p-6 md:p-8 bg-cream">
              <div className="text-eyebrow text-gold mb-3">Lean filler</div>
              <ol className="space-y-3 text-ink-soft text-body leading-relaxed list-decimal list-inside">
                <li>Your concern is loss of volume in cheeks, lips or chin.</li>
                <li>You feel you look flatter or more tired than you used to.</li>
                <li>You want subtle structural support, not just better skin.</li>
                <li>You are happy to have a longer-lasting result and review yearly.</li>
              </ol>
            </div>
          </div>
        </div>

        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          And if you genuinely cannot tell which side you fall on, that is what the free consultation is for. I will look at your face, listen to what you actually want, and tell you honestly which treatment, if any, will give you the result you have come in for.
        </p>

        <blockquote className="font-display italic text-h2 text-charcoal my-10 border-l-2 border-gold pl-6">
          &ldquo;The best treatment is always the smallest one that solves the problem. Sometimes that is Profhilo, sometimes it is filler, and sometimes it is neither.&rdquo;
        </blockquote>
      </div>

      <BookingCTA />
    </article>
  )
}
