import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'platysmal-bands-neck-botox',
  title: "Neck bands and Botox: what works on the platysma",
  description: "Neck bands and Botox: what works on the platysma, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Essex.",
  datePublished: '2026-06-10',
  dateModified: '2026-06-10',
  image: '/images/og-home.jpg',
  wordCount: 1784,
}

const FAQS = [
  {
    "q": "Does Botox work on neck bands?",
    "a": "Yes. Botox is FDA-approved for moderate to severe platysmal bands (vertical neck cords) and works by relaxing the overactive platysma muscle. Clinical trials showed 62-65% of patients reported satisfaction with their results within two weeks."
  },
  {
    "q": "How long do Botox results last on the neck?",
    "a": "Results typically last 3 to 4 months. They begin to appear within 3 to 7 days and peak around two weeks, after which the muscle gradually regains function and the bands reappear."
  },
  {
    "q": "Can Botox treat horizontal neck lines?",
    "a": "Botox is not effective for horizontal neck lines, which are caused by sun damage, repetitive folding, and loss of skin elasticity. These lines respond better to skin boosters like Profhilo or microneedling instead."
  },
  {
    "q": "Will Botox tighten loose neck skin?",
    "a": "No. Botox relaxes muscle but does not tighten skin. If you have significant skin laxity or excess fat, you will need additional or alternative treatments alongside Botox."
  },
  {
    "q": "What is the best treatment for neck cords?",
    "a": "Vertical neck cords (platysmal bands) respond well to Botox alone. For best results when horizontal lines or loose skin are also present, a combination approach using Botox for bands, skin boosters for texture, or radiofrequency microneedling for laxity usually works better."
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
```jsx
<section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
  <div className="max-w-3xl mx-auto px-6">
    <Link href="/blog" className="inline-flex items-center text-body-sm text-ink-soft hover:text-charcoal mb-8 transition-colors">
      <span className="mr-2">←</span> Back to all articles
    </Link>
    <span className="hairline hairline-left mb-8 bg-gold block w-1 h-12" />
    <p className="text-label uppercase tracking-wide text-ink-soft mb-3">Neck treatments</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Neck bands and Botox: what works on the platysma</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed max-w-2xl">
      Vertical neck cords (platysmal bands) are one of the few areas where Botox delivers reliable, visible results. But horizontal lines, loose skin, and stubborn fat tell a different story. Here's what actually works, and when to look beyond anti-wrinkle injections.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6">
    
    <div className="bg-charcoal-light text-charcoal p-6 md:p-8 rounded-sm mb-10 mt-10">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Short version</h3>
      <ul className="space-y-2 text-body-lg text-ink-soft">
        <li>· Platysmal bands (vertical neck cords) respond well to small doses of Botox, with clinical trials showing 62-65% patient satisfaction.</li>
        <li>· Horizontal neck lines are more difficult to treat with Botox alone and often improve with skin boosters like Profhilo or microneedling instead.</li>
        <li>· Significant skin laxity or excess fat requires additional or alternative treatments; Botox does not tighten loose skin.</li>
        <li>· Combination approaches (Botox for bands, skin boosters for texture, or radiofrequency microneedling for laxity) usually deliver the best aesthetic outcome.</li>
      </ul>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What are platysmal bands, and why do they appear?</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The platysma is a broad, thin muscle that runs vertically down the front of your neck from the jawline to the collarbone. When this muscle becomes overactive or loses tone over time, it creates vertical cords or bands that are visible when you tense your neck or look down. These bands are particularly noticeable in people with naturally strong platysma muscles or those who spend hours looking at screens.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Unlike horizontal neck lines (which are caused by sun damage, repetitive folding, and loss of skin elasticity), platysmal bands are a muscular issue. That distinction is crucial, because it means anti-wrinkle injections can work where other treatments might fall short.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How Botox treats vertical neck bands</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Botox works on platysmal bands by relaxing the overactive platysma muscle. The neurotoxin binds at motor nerve terminals and blocks acetylcholine release, preventing the muscle from contracting as strongly. Over a week or two, the bands soften and become less prominent. This is one of the few areas where Botox addresses the root cause of the problem, rather than just masking a symptom.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The FDA approved Botox specifically for moderate to severe platysmal bands in 2024, based on two clinical trials (M21-309 and M21-310). In both studies, significantly more patients treated with anti-wrinkle injections met the primary endpoint of minimal to mild band appearance with at least 2-grade improvement compared with placebo (32% vs 2%, and 31% vs 0% respectively). Within two weeks, 62-65% of treated patients reported being very satisfied or satisfied with their neck and jawline definition, compared to 12% on placebo.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Approved doses range from 26 to 36 units, depending on severity. In my clinic, I concentrate injections in the upper half of the platysma muscle where motor control is densest. This approach minimises the number of injection points, reduces discomfort, and lowers the risk of unwanted effects like neck weakness.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Timeline and realistic expectations</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Results begin to appear within 3 to 7 days, peak around the two-week mark, and typically last 3 to 4 months. This is consistent with Botox metabolism elsewhere on the face. After that, the muscle gradually regains function and the bands reappear. Many clients choose to retreat every 3 to 4 months to maintain softening.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I always book a two-week review after neck Botox. This gives us time to see the full effect, confirm the result is what you wanted, and adjust the dose or placement if needed at no charge. It's a simple precaution that prevents disappointment.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When Botox alone is not enough</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Platysmal bands respond reliably to Botox. Horizontal neck lines do not. These shallow creases run side to side across the neck and are caused by sun damage, repetitive folding from posture, and loss of skin elasticity. Botox has no mechanism to address skin laxity. It relaxes muscle, it does not tighten skin.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If your neck concern is primarily horizontal lines or loose, crepe-like skin, I would not recommend anti-wrinkle injections as a first step. Instead, I would consider skin boosters like <Link href="/treatments/profhilo">Profhilo</Link>, which uses high-concentration stabilised hyaluronic acid to hydrate and gently remodel aging tissue beneath the surface. Profhilo delivers rapid hydration and a subtle tightening effect over 6 months, improving skin quality and mild laxity without repositioning deeper tissues.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      <Link href="/treatments/micro-needling">Microneedling</Link> combined with radiofrequency is another strong option for horizontal lines, wrinkles, and moderate skin laxity. Radiofrequency microneedling (sometimes called Agnes RF) offers a dual approach: the needles create controlled injury to stimulate collagen, whilst the radiofrequency energy tightens deeper tissue. This can be particularly effective for the neck where skin is thin and laxity is visible.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Significant skin laxity and excess fat</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If your neck has marked skin excess, fullness from submental fat, or a "turkey neck" appearance, Botox will not address these concerns. Anti-wrinkle injections relax muscle; they do not remove fat or tighten stretched skin to any meaningful degree.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In these cases, I refer clients to a surgeon for a neck lift or, if they wish to avoid surgery, I discuss radiofrequency microneedling as a non-surgical option. Some clients benefit from a combination: Botox for any platysmal bands present, plus radiofrequency microneedling for skin tightening and laxity, plus targeted fat reduction if appropriate. But I'm always honest: if there is significant laxity, non-surgical treatments have limits. Surgery remains the gold standard for dramatic improvement.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A practical combination approach</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In my clinic, the best results for a tired, ageing neck often come from combining treatments. For example:
    </p>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Botox for visible vertical bands (26-36 units, concentrated in the upper platysma).</li>
      <li>· Profhilo or another skin booster for hydration, radiance, and mild laxity correction.</li>
      <li>· Radiofrequency microneedling every 4-6 weeks for progressive collagen remodelling and firming.</li>
    </ul>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This multi-modal approach addresses muscle, skin quality, and laxity in a single plan. It requires more thought and a longer review timeline (usually 8-12 weeks before final assessment), but the outcome is far more natural and longer lasting than any single treatment alone.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Safety and honest reflection</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Neck Botox is a relatively safe procedure in trained hands. The main risk is over-treatment leading to difficulty swallowing or neck weakness if injections are placed too deeply or in the wrong location. This is why precise anatomy and conservative dosing matter. I place injections in the upper half of the platysma, where motor innervation is densest, to minimise drift into the deeper neck structures.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I also want to acknowledge that the aesthetics industry sometimes over-treats necks. I see clients who have had dozens of units of Botox placed throughout the entire neck and lower face, leaving them with a stiff, unnatural appearance. The neck is not the face. It moves differently, has different anatomy, and deserves a more restrained approach. When you walk into any aesthetics clinic for neck concerns, ask your practitioner about their specific experience with <Link href="/treatments/anti-wrinkle-injections">anti-wrinkle injections</Link> for the platysma, and ask to see examples of their work.
    </p>

    <div className="bg-charcoal-light text-charcoal p-6 md:p-8 rounded-sm my-10">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">A note on UK regulation</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
        From July 2026, new UK legislation will require all practitioners performing cosmetic injectables (including Botox) to be registered, accredited, and compliant with new professional standards. From 2025, all prescribing of prescription-only medicines like botulinum toxin must be preceded by a mandatory face-to-face consultation with a qualified clinician. This is a positive shift towards safer, more professional practice. When you book neck Botox, ask your clinic about their qualifications, insurance, and whether they offer a proper consultation before treatment.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What to expect at consultation</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      A good consultation for neck concerns should include:
    </p>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· A clear assessment of whether your concern is muscular (bands), skin quality (lines and texture), or structural (laxity and fat).</li>
      <li>· Honest advice on whether Botox alone will address your concern, or whether combination treatment would be better.</li>
      <li>· A realistic timeline for results and maintenance.</li>
      <li>· A discussion of alternatives if Botox is not the right fit.</li>
      <li>· Clear pricing and a two-week review built into the plan.</li>
    </ul>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If a clinic promises dramatic results from Botox alone, or if they push you toward treatment without discussing alternatives, that's a red flag. The neck is complex. The best aesthetic outcome requires thought, humility, and sometimes a combination of approaches.
    </p>

    <div className="bg-charcoal-light text-charcoal p-6 md:p-8 rounded-sm my-10">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Book a free consultation</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
        If you're considering neck treatment and want to discuss whether Botox, skin boosters, microneedling, or a combination approach is right for you, I'd be happy to see you for a free consultation. No pressure, no sales pitch. Just an honest conversation about your neck and the options available.
      </p>
      <Link href="/contact" className="inline-flex items-center px-6 py-3 bg-charcoal text-cream rounded-sm font-sans font-medium hover:bg-charcoal/90 transition-colors">
        Request a free consultation
      </Link>
    </div>

    <hr className="my-10 border-charcoal-light" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href="/treatments/anti-wrinkle-injections" className="block p-6 border border-charcoal-light rounded-sm hover:border-charcoal transition-colors group">
        <p className="text-label uppercase tracking-wide text-ink-soft mb-2 group-hover:text-charcoal transition-colors">Treatment</p>
        <h3 className="font-display italic text-h3 text-charcoal">Anti-wrinkle injections</h3>
        <p className="text-body-sm text-ink-soft mt-3">Learn more about how Botox works and what to expect from your first appointment.</p>
      </Link>

      <Link href="/treatments/profhilo" className="block p-6 border border-charcoal-light rounded-sm hover:border-charcoal transition-colors group">
        <p className="text-label uppercase tracking-wide text-ink-soft mb-2 group-hover:text-charcoal transition-colors">Treatment</p>
        <h3 className="font-display italic text-h3 text-charcoal">Profhilo</h3>
        <p className="text-body-sm text-ink-soft mt-3">A deeper dive into skin boosters and how they improve skin laxity and radiance on the neck.</p>
      </Link>
    </div>

  </div>
</section>
```
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
