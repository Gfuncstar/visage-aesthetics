import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'botox-vs-filler',
  title: 'Botox vs filler: what is the actual difference?',
  description: 'Both are injectable. They do completely different jobs. Bernadette Tobin RGN, MSc explains the real difference, when each is right, and how to avoid the over-treatment trap.',
  datePublished: '2026-04-20',
  dateModified: '2026-04-26',
  image: '/images/og-home.jpg',
  wordCount: 1620,
}

export const metadata: Metadata = {
  title: 'Botox vs Filler: The Real Difference | Visage Aesthetics',
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

export default function BotoxVsFillerPost() {
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
          <h1 className="font-display italic text-hero text-charcoal">Botox vs filler: what&apos;s the actual difference?</h1>
          <p className="mt-6 text-body-lg text-ink-soft">
            They are both injectable. They both come out of a syringe. They are both administered by an
            aesthetic practitioner with a needle. And that is roughly where the similarity ends. They do
            completely different jobs, and getting them mixed up is one of the most common reasons people
            end up with results they did not want.
          </p>
        </div>
      </section>

      <section className="pb-6 md:pb-10">
        <div className="max-w-3xl mx-auto px-5 md:px-8 prose-styles">
          <div className="text-stone text-[12px] tracking-[0.18em] uppercase mb-8">8 min read &middot; By Bernadette Tobin RGN, MSc</div>

          <h2 className="font-display italic text-h2 text-charcoal mt-2 mb-5">The short version</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-6">
            Anti-wrinkle injections (commonly called Botox) <em>relax muscles</em>. Dermal filler <em>adds volume</em>.
            That is the entire core distinction. If a line appears when you make an expression, it is usually
            anti-wrinkle territory. If you have lost volume, flatter cheeks, thinner lips, a hollow under the
            eye, it is filler territory. Many clients in their forties have both, planned together, in
            small amounts.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What anti-wrinkle injections actually do</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Anti-wrinkle injections use small, precise doses of botulinum toxin, a purified protein produced
            by the bacterium <em>Clostridium botulinum</em>. The brand names you will hear are <strong>Botox</strong>,
            <strong> Bocouture</strong>, <strong>Azzalure</strong> and <strong>Dysport</strong>. They all do the same thing,
            slightly differently dosed.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Once injected into a specific muscle, the toxin temporarily blocks the signal from the nerve
            ending to the muscle fibre. The muscle relaxes. The lines that muscle was creating soften.
            Critically: the muscle is still there. It still has tone. You can still smile, frown and lift
            your brows, just less aggressively. Treated well, you still look like yourself, just a bit
            smoother and a bit less tired.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Where it works:
          </p>
          <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
            <li>· Forehead lines (the horizontal lines you see when you raise your eyebrows)</li>
            <li>· Frown lines (the vertical &ldquo;11s&rdquo; between the eyebrows)</li>
            <li>· Crow&apos;s feet (the fan of lines around the outer eye)</li>
            <li>· Bunny lines (fine lines on the bridge of the nose)</li>
            <li>· Masseter relaxation (jaw slimming, teeth-grinding relief)</li>
            <li>· Hyperhidrosis (excessive sweating, particularly underarms)</li>
            <li>· Migraine prevention (a recognised medical indication)</li>
          </ul>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            What it will not do: it cannot replace lost volume. It cannot reshape your face. It cannot
            fill in static lines that are present even when your face is at rest, those are usually
            the territory of skin treatments like Profhilo, micro-needling, or in some cases very
            fine filler.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Results show within 7-14 days, last 3-4 months, and are completely reversible by waiting
            for the effect to wear off. There is no &ldquo;eraser&rdquo;, but the toxin is metabolised
            naturally and the muscle returns to baseline.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What dermal filler actually does</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Dermal filler is, in almost every reputable UK clinic in 2026, <strong>hyaluronic acid (HA)</strong>,
            a sugar molecule that occurs naturally in your skin, joints and connective tissue. Brand names
            include <em>Juvederm, Restylane, Teosyal, Belotero</em>. They differ in viscosity, longevity and
            licensed indication, but the active ingredient is the same.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            HA filler is injected into a specific layer of tissue, usually the dermis, sometimes deeper
            for structural work, where it physically takes up space. That is it. It does not stimulate
            the body to do anything. It just sits there, holding up the surrounding tissue, until the body
            slowly metabolises it.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Where it works:
          </p>
          <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
            <li>· Lip volume and definition (most popular use)</li>
            <li>· Cheek augmentation and contour</li>
            <li>· Tear trough (the hollow under the eye, the most technically demanding area)</li>
            <li>· Jawline definition and chin projection</li>
            <li>· Non-surgical rhinoplasty (subtle bridge or tip adjustment)</li>
            <li>· Nasolabial folds (the lines from nose to mouth corner)</li>
            <li>· Marionette lines (from mouth corner downward)</li>
          </ul>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            What it will not do: it cannot soften lines caused by muscle movement (that is anti-wrinkle).
            It cannot improve skin quality, hydration or texture (that is Profhilo, micro-needling or topical
            skincare). And, this is the one most clients are surprised by, it does not stimulate your
            face to grow more of anything. When the filler is gone, your face returns to where it was.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Results are visible immediately, settle over 2 weeks, and last 6-18 months depending on
            product and area (lips dissolve faster than cheeks). Critically: HA filler can be dissolved
            on demand using an enzyme called <strong>hyaluronidase</strong>. If you do not like the result,
            or if a complication occurs, the filler can be removed within 24-48 hours. This reversibility is
            one of the safest features of HA, and a major reason we do not work with permanent or
            semi-permanent fillers at Visage.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When you might be told you need filler, and you do not</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            This is the hardest part of an honest aesthetics consultation. Filler is more expensive than
            anti-wrinkle, lasts longer, and is more visible to the practitioner during placement. Some
            clinics, and this is a known problem in the wider industry, recommend filler when
            another treatment would actually serve the client better. A few examples:
          </p>
          <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
            <li>· Tired-looking eyes are <em>often</em> better treated with anti-wrinkle to the crow&apos;s feet plus a tiny dose to the frown line, not filler to the tear trough.</li>
            <li>· Dull, lined skin around the lower face is usually a job for Profhilo (deep skin hydration) and micro-needling (collagen stimulation), not filler.</li>
            <li>· Forehead lines that are present even at rest sometimes need 4-6 months of relaxation with anti-wrinkle to settle, not filler to plump them out.</li>
            <li>· Down-turned mouth corners often respond better to a tiny anti-wrinkle dose to the depressor anguli oris muscle than they do to filler.</li>
          </ul>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            The honest version of consultation is asking <em>what is causing the appearance</em>, not
            <em>what shall we inject</em>. Movement causes some lines. Volume loss causes others.
            Skin quality contributes to a third group. Each has a different treatment. A good
            practitioner will tell you when none of the above is the right answer this year.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When you might genuinely benefit from both</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Many clients in their late thirties through fifties get the best result from a combination,
            small amounts of each, planned together. A typical example: 1ml of filler split between cheeks
            and tear troughs to address volume loss, plus anti-wrinkle to the forehead, glabella (frown
            lines) and crow&apos;s feet. The filler restores the structure, the anti-wrinkle softens the
            movement lines on top of it. Each treatment supports the other.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Done well, the combined effect is a face that looks rested rather than altered.
            Done poorly, you get the &ldquo;done&rdquo; look, flat, frozen, doughy. The difference is
            almost entirely in the dosing and placement. There is no aesthetic ingredient that is
            inherently bad; there is only a long history of overuse.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Both treatments are very safe in qualified hands. Both have known complications,
            bruising, swelling, asymmetry, rare vascular events with filler. Both should only be
            performed by a registered medical professional with an indemnity insurer, a documented
            consent process, and reversal/protocol products on site. Aesthetics is largely
            unregulated in the UK in 2026; the protection is in choosing your practitioner, not
            the product.
          </p>

          <div className="mt-12 p-7 md:p-8 border border-line/30 rounded-md bg-cream-soft">
            <div className="text-eyebrow text-gold mb-3">Free consultation</div>
            <p className="font-display italic text-charcoal mb-4" style={{ fontSize: 24, lineHeight: 1.3, fontWeight: 500 }}>
              Not sure what you need? That is what consultations are for.
            </p>
            <p className="text-body text-ink-soft mb-5">
              Bring photos of your face you like and ones you do not. We will look together,
              talk through what is causing what, and plan something that genuinely suits you.
              No pressure to book treatment, no upselling.
            </p>
            <Link href="/contact" className="btn btn-primary">
              <span>Book consultation</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/treatments/anti-wrinkle-injections" className="block border border-line/30 rounded-md p-5 hover:border-gold/60 transition-colors">
              <div className="text-eyebrow text-gold mb-2">Read more</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 20 }}>Anti-wrinkle injections →</div>
            </Link>
            <Link href="/treatments/dermal-filler" className="block border border-line/30 rounded-md p-5 hover:border-gold/60 transition-colors">
              <div className="text-eyebrow text-gold mb-2">Read more</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 20 }}>Dermal filler →</div>
            </Link>
          </div>
        </div>
      </section>

      <BookingCTA />
    </article>
  )
}
