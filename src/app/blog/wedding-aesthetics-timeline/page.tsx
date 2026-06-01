import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'wedding-aesthetics-timeline',
  title: "Aesthetics before your wedding: a sensible 12-month timeline",
  description: "Aesthetics before your wedding: a sensible 12-month timeline, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintre",
  datePublished: '2026-06-01',
  dateModified: '2026-06-01',
  image: '/images/og-home.jpg',
  wordCount: 1663,
}

const FAQS = [
  {
    "q": "When should I start aesthetic treatments before my wedding?",
    "a": "Ideally around twelve months before the day, when skin quality work can be done properly. Starting early allows treatments like micro-needling or Profhilo to build results gradually, rather than rushing close to the wedding."
  },
  {
    "q": "How long before a wedding should I stop having Botox?",
    "a": "The final anti-wrinkle top-up should be around four weeks before the wedding, and then nothing further. The key rule is no firsts close to the day, so any new treatment should be avoided in the fortnight beforehand."
  },
  {
    "q": "When should I have Profhilo before my wedding?",
    "a": "The standard protocol is two sessions four weeks apart, with full effects visible 4 to 6 weeks after the second session and results lasting roughly 4 to 6 months. The timing should be calculated so it is at its peak on the wedding day, not still developing or already fading."
  },
  {
    "q": "Can I have a facial or peel in the week before my wedding?",
    "a": "No. In the two weeks before the day, no facials, peels, new products or new treatments should be introduced. The risk of unexpected reactions or irritation is not worth taking so close to the wedding."
  },
  {
    "q": "When should filler be finalised before the wedding?",
    "a": "Hyaluronic acid filler should be finalised around three months before the wedding. This allows time for any final tweaks and for the result to settle properly well in advance of the day."
  },
  {
    "q": "Are biostimulator treatments suitable for brides?",
    "a": "Biostimulators sit around the six-month mark if they have been recommended, but they are not for everyone and are not reversible in the way hyaluronic acid fillers are. A careful assessment matters more than the product, and they should not be suggested without a proper discussion of alternatives."
  }
]


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

export default function Post() {
  return (
    <article className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(POST)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(POST.slug, POST.title)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }} />
<section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
  <div className="max-w-3xl mx-auto px-6">
    <a href="/blog" className="text-sm text-ink-soft hover:text-charcoal transition-colors">← Back to all articles</a>
    <span className="hairline hairline-left mb-8 bg-gold mt-6 block" />
    <p className="eyebrow text-sm uppercase tracking-widest text-gold mb-4">Bridal preparation</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Aesthetics before your wedding: a sensible 12-month timeline</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Brides ask me the same question almost every week: when should I start, and when should I stop? The honest answer is that the work that matters most happens early, not late. This is the timeline I give clients in my clinic, working backwards from the day itself, with the rule that nothing new goes in close to the wedding.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6">

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The short version</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If you give yourself a year, you have time to do skin quality work properly, decide whether you actually want injectables, and stop in good time before the day. If you give yourself a month, you should be doing almost nothing. The single most important rule of pre-wedding aesthetics is this: no firsts close to the day. No first Botox, no first filler, no first peel, no first laser, no first product trial in the fortnight before you walk down the aisle.
    </p>

    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· 12 months out: start skin quality work (micro-needling, Profhilo if suitable).</li>
      <li>· 6 months out: any biostimulator treatments, if recommended.</li>
      <li>· 3 months out: confirm filler placement and any final tweaks.</li>
      <li>· 4 weeks out: final anti-wrinkle top-up, then stop.</li>
      <li>· 2 weeks out: no facials, no peels, no new products, no new anything.</li>
    </ul>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Twelve months out: skin quality first</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      A year before the wedding is when I want to see brides for the first proper consultation. Not because the work takes a year (it usually doesn't), but because skin quality work is cumulative, and rushing it is what produces the wrong kind of bridal photographs.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      At this stage I'm looking at the basics. How is the skin behaving? Is there active acne, post-inflammatory pigmentation, sun damage, dehydration, fine textural lines? Is the homecare regime actually doing anything, or is it a drawer of half-used serums? Most of the visible glow people associate with weddings comes from skin that has been treated kindly and consistently for months, not from a heroic facial the week before.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If micro-needling is appropriate, this is the window for a course. Results build gradually as collagen remodels, so we have time for several sessions spaced sensibly apart and the final session well clear of the wedding date. <a href="/blog/micro-needling-results-timeline" className="text-gold underline">Micro-needling has its own timeline</a>, and starting late is the most common mistake I see.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Profhilo also belongs in this early window for the right candidate. The standard protocol is two sessions four weeks apart, with full effects becoming visible 4 to 6 weeks after the second session, and results lasting roughly 4 to 6 months. So if you want Profhilo to be working at its peak on the day itself, the maths matters. Starting too late means paying for a treatment that hasn't fully expressed itself yet; starting too early means it's already fading. For a more detailed look at how it actually works, this <a href="/blog/profhilo-treatment-guide" className="text-gold underline">no-nonsense Profhilo guide</a> covers the mechanism.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Six months out: biostimulators, if any</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Around the six-month mark is where biostimulator treatments sit, if they have been recommended at all. These are products that work by encouraging the skin's own collagen response over weeks and months, rather than by adding immediate volume. The result is slow, structural, and not something you want to be assessing two weeks before the wedding.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I am deliberately cautious about biostimulators on brides. They are not for everyone, they are not reversible in the way hyaluronic acid fillers are, and the assessment matters more than the product. If a practitioner is suggesting one on a first consultation without a proper discussion of alternatives, that is a flag, not a recommendation.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Six months also gives time for any course of treatment started earlier to be reviewed honestly. Has the skin actually improved? Are we on the right track? This is where I have the "do we need to do anything else at all" conversation, and quite often the answer is no.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Three months out: confirm filler placement</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If hyaluronic acid filler is part of the plan, three months out is when I want it finalised. That means any structural placement (cheeks, chin, jawline) has settled, any swelling has fully resolved, and we can see what the face actually looks like rather than what it looks like with a few millilitres of post-treatment oedema.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HA fillers are reversible with hyaluronidase, which is one of the reasons I prefer them in the bridal context. If something isn't sitting quite right at the three-month mark, there is still time to dissolve and reset before the day. There is no equivalent rescue option for biostimulators or thread-based work, which is why those belong earlier in the timeline.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Lip filler deserves its own note. Brides often want fuller lips for photographs, and I understand the impulse, but lips are the area where over-treatment shows most cruelly. If you've never had lip filler, your wedding is not the time to try it for the first time. If you have, a conservative top-up at three months, followed by nothing, is the right approach. The <a href="/blog/lip-filler-aftercare-guide" className="text-gold underline">aftercare guide</a> covers what to expect in the days afterwards.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Four weeks out: the final anti-wrinkle window</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Botulinum toxin (anti-wrinkle injection) typically begins to show effect within 24 to 72 hours and peaks at around two weeks. It metabolises naturally over the months that follow. For a wedding, I want the final treatment to be roughly four weeks before the day. That gives the result time to settle into its full, even expression, with any minor asymmetries identified and addressed at a two-week review.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Four weeks is also late enough that the effect will still be present on the day, and early enough that there is no panic if a top-up is needed. After this point, I will not treat a bride with anti-wrinkle injections for the first time. The risk of an unexpected response, a mild brow heaviness, an asymmetry that needs balancing, is small but real, and the wedding is not the place to discover it. If you've never had it, please don't start it in the final month. There is more on this in my piece on <a href="/blog/first-time-botox-mistakes" className="text-gold underline">first-time Botox mistakes</a>.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Two weeks out: stop. Genuinely, stop.</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The fortnight before the wedding is for sleep, water, and the skincare you already know your skin tolerates. It is not for facials, peels, new acids, new exfoliants, a sudden retinol experiment, a "bridal glow" treatment your friend mentioned, or anything you have not used before. Almost every red, blotchy, panicked bride I've ever seen in clinic got there by trying something new in the final two weeks.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      That includes treatments being marketed online with confident promises. The MHRA has been clear that exosome injections cannot legally be administered for aesthetic purposes in the UK, and the regulatory landscape around non-surgical cosmetic procedures is changing, with a Government consultation on the highest-risk procedures planned for spring 2026 and a licensing scheme on the way. If a practitioner is offering you something that sounds new and exciting just before your wedding, that is exactly the wrong context to be a first user.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      None of the above is a prescription. Every face is different, every skin is different, and a good consultation will sometimes conclude that the best pre-wedding plan is to do less than you thought. I would rather a bride leave my clinic with a homecare routine and no injectables booked than be talked into a treatment that doesn't suit her. If you are considering pre-wedding work, look at the practitioner's clinical registration, ask how long they've been treating, and ask what they would say no to. The answer to that last question tells you a lot.
    </p>

    <div className="bg-white border border-gold/30 rounded-lg p-8 my-12">
      <p className="eyebrow text-sm uppercase tracking-widest text-gold mb-3">Free consultation</p>
      <h3 className="font-display italic text-2xl text-charcoal mb-4">Planning your wedding skin?</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
        If your wedding is on the horizon and you'd like a sensible, conservative plan rather than a sales pitch, book a consultation. We'll work backwards from your date and tell you honestly what is worth doing, what isn't, and what you can safely skip.
      </p>
      <a href="/contact" className="inline-block bg-charcoal text-cream px-6 py-3 rounded hover:bg-gold transition-colors">Book a consultation</a>
    </div>

    <div className="grid md:grid-cols-2 gap-6 mt-12">
      <a href="/about" className="block bg-white border border-charcoal/10 rounded-lg p-6 hover:border-gold transition-colors">
        <p className="eyebrow text-xs uppercase tracking-widest text-gold mb-2">About the clinic</p>
        <h4 className="font-display italic text-xl text-charcoal mb-2">Who we are and how we work</h4>
        <p className="text-ink-soft">A nurse-led clinic with two decades of clinical practice behind every consultation.</p>
      </a>
      <a href="/treatments/profhilo" className="block bg-white border border-charcoal/10 rounded-lg p-6 hover:border-gold transition-colors">
        <p className="eyebrow text-xs uppercase tracking-widest text-gold mb-2">Treatment</p>
        <h4 className="font-display italic text-xl text-charcoal mb-2">Profhilo</h4>
        <p className="text-ink-soft">Bio-remodelling for skin quality, hydration and the kind of glow that photographs well.</p>
      </a>
    </div>

  </div>
</section>
      <section className="pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto px-5 md:px-0">
          <h2 className="font-display italic text-h2 text-charcoal mt-4 mb-6">Common questions</h2>
          <div className="divide-y divide-line border-t border-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="text-charcoal font-medium mb-2">{f.q}</h3>
                <p className="text-body-lg text-ink-soft leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <BookingCTA />
    </article>
  )
}
