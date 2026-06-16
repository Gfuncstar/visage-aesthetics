import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'polynucleotides-vs-profhilo',
  title: "Polynucleotides vs Profhilo: two skin boosters, different jobs",
  description: "Polynucleotides vs Profhilo: two skin boosters, different jobs, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braint",
  datePublished: '2026-06-16',
  dateModified: '2026-06-16',
  image: '/images/og-home.jpg',
  wordCount: 1674,
}

const FAQS = [
  {
    "q": "What is the difference between polynucleotides and Profhilo?",
    "a": "Profhilo is pure hyaluronic acid that hydrates skin and stimulates collagen, delivering visible results within 1-2 weeks and lasting about 6 months. Polynucleotides are salmon DNA fragments that repair and regenerate tissue at a cellular level, with gradual results unfolding over 2-3 months and lasting around 12 months."
  },
  {
    "q": "How long do results last with polynucleotides vs Profhilo?",
    "a": "Profhilo results typically last about 6 months before the body metabolises the hyaluronic acid naturally. Polynucleotides tend to last around 12 months, making them more durable in terms of treatment interval."
  },
  {
    "q": "Which skin booster is better for acne scars?",
    "a": "Polynucleotides are better for acne scarring, as they work at the cellular repair level to regenerate damaged tissue. Profhilo is primarily designed for hydration and skin laxity rather than repairing scarring."
  },
  {
    "q": "How quickly will I see results from Profhilo?",
    "a": "Most clients see visible skin plumping and radiance within 1-2 weeks of Profhilo treatment. Results continue to develop and typically peak at around the 6-month mark before gradually fading."
  },
  {
    "q": "Is Profhilo reversible?",
    "a": "Yes, Profhilo is reversible because it is made of hyaluronic acid, which can be dissolved with hyaluronidase if a client is unhappy with the result."
  },
  {
    "q": "Which treatment is better for under the eyes?",
    "a": "Polynucleotides excel in delicate areas like under the eyes, where they can repair thin, damaged skin without the immediate volume effect of Profhilo. This makes them particularly suitable for sensitive eye area treatment."
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
  <div className="max-w-3xl mx-auto px-6 md:px-8">
    <a href="/blog" className="inline-block text-body-sm text-ink-soft hover:text-charcoal mb-8 transition">
      Back to all articles
    </a>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-overline uppercase tracking-wide text-ink-soft mb-4">Skin boosters explained</p>
    <h1 className="font-display text-h1 text-charcoal mb-8">Polynucleotides vs Profhilo: two skin boosters, different jobs</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Both polynucleotides and Profhilo sit under the umbrella of "skin boosters", but they work in fundamentally different ways. One hydrates and tightens; the other repairs tissue from within. Understanding which does what, and which is right for your skin, matters far more than chasing the trend.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6 md:px-8">
    
    <div className="bg-gold bg-opacity-15 border-l-4 border-gold p-6 mb-10 rounded">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Short version</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-3">
        Profhilo is a pure hyaluronic acid injectable (high and low molecular weight) that hydrates skin and stimulates collagen production. It delivers fast, visible results in 1-2 weeks and lasts about 6 months. It works best for skin laxity and creating luminosity.
      </p>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-3">
        Polynucleotides are purified salmon DNA fragments that stimulate cellular repair and regeneration. Results are gradual, unfolding over 2-3 months, and last around 12 months. They excel at repairing thin skin, acne scarring, and sun damage, especially in delicate areas like under the eyes.
      </p>
      <p className="text-body-lg text-ink-soft leading-relaxed">
        Neither is universally better. The right choice depends on your skin concern, timeline expectations, and what outcome matters most to you.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What Profhilo actually is</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Profhilo has been on the market since 2015. It is 100 per cent hyaluronic acid (HA), not chemically cross-linked like traditional dermal fillers. Instead, it uses a process called NAHYCO Hybrid Technology, which uses heat to bind together high molecular weight HA (1100-1400 KDa) and low molecular weight HA (80-100 KDa) into stable complexes without chemical reagents.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Because it is not cross-linked, Profhilo is very low viscosity. This means it spreads and integrates quickly through the skin layers, rather than sitting as a discrete depot like a filler. The high molecular weight component provides hydration and volume; the low molecular weight component penetrates deeper and stimulates fibroblasts to produce collagen and elastin.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In practice, clients see visible skin plumping and radiance within 1-2 weeks. The effect peaks and typically lasts about 6 months before the body metabolises the HA naturally. Because HA is reversible with hyaluronidase, if a client is unhappy with the result, it can be dissolved.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What polynucleotides actually are</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Polynucleotides are highly purified chains of DNA fragments extracted from salmon sperm. Salmon DNA is used because it shares significant compatibility with human DNA, making it well-tolerated by the immune system. The extraction process carefully removes proteins that could trigger an immune response, leaving only the biologically active nucleic acid strands in a sterile injectable solution.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      These DNA fragments work by activating adenosine A2A receptors in skin cells. This activation triggers a cascade of cellular events: reduced inflammation, increased fibroblast proliferation, enhanced vascular growth factor production, and direct stimulation of collagen synthesis. Unlike Profhilo, which works primarily through hydration and growth factor release, polynucleotides are working at the cellular repair level.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Because the effect is driven by cell regeneration rather than volume addition, results are gradual. Most clients notice progressive improvement in skin texture, firmness, and quality over 2-3 months. The regenerative effects tend to last around 12 months, making polynucleotides more durable than Profhilo in terms of treatment interval.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Which does what: a clear comparison</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The core distinction is this: Profhilo hydrates and biostimulates broadly across the face. Polynucleotides repair and regenerate specific tissue damage.
    </p>
    
    <ul className="space-y-3 mb-6 text-body-lg text-ink-soft">
      <li>· Profhilo produces immediate results (1-2 weeks) and lasts 6 months. Polynucleotides produce gradual results (2-3 months) and last 12 months.</li>
      <li>· Profhilo is best for skin laxity, loss of radiance, and a general "lifting" effect. Polynucleotides are best for acne scarring, sun damage, and thin, crepey skin.</li>
      <li>· Profhilo works well across the whole face and décolletage. Polynucleotides excel in delicate areas: under the eyes, neck, and around the mouth where skin is thin and prone to damage.</li>
      <li>· Profhilo is entirely reversible with hyaluronidase. Polynucleotides cannot be reversed, though the effect does naturally diminish over time.</li>
      <li>· Profhilo produces visible plumping and skin tightening. Polynucleotides produce more subtle, progressive improvement in skin quality and resilience.</li>
    </ul>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In my clinic, the most successful approach is often both. A client might have Profhilo for overall hydration and biostimulation, then add polynucleotides specifically under the eyes or to scarred areas where cellular repair is the priority. They address complementary goals.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When to choose Profhilo</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Choose Profhilo if your main concern is skin laxity, loss of radiance, or the early signs of volume loss. It is ideal if you want visible results quickly, or if you are planning an event in the next 2-3 weeks. It works well for clients who are not yet at the point of needing filler but want active skin rejuvenation. It is also a good first step for younger clients (late twenties and early thirties) who want to invest in skin quality before deeper lines form.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Because Profhilo is entirely hyaluronic acid, it carries no foreign DNA and poses no theoretical risk related to genetic material. For clients concerned about the origin of polynucleotides or preferring a more conventional ingredient, Profhilo is a safer psychological choice, even if the clinical risk of polynucleotides is low.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When to choose polynucleotides</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Choose polynucleotides if you have acne scarring, sun damage, or thin, fragile skin that needs genuine cellular repair. They are the clear choice for the under-eye area, where skin is thinnest and most prone to crepiness and fine lines. Clients concerned with skin resilience and wanting to improve the underlying quality of their skin (rather than just add volume) tend to see the most satisfaction.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Polynucleotides are also appropriate if you prefer longer intervals between treatments and are willing to wait for gradual results. Because the effect lasts 12 months, you commit to fewer injections per year than with Profhilo.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Clients with thin skin around the neck and decolletage often benefit most from polynucleotides, as this is an area where dermal repair and collagen stimulation make a visible difference that hydration alone may not achieve.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A note on regulation and honesty</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      As of 2026, the UK aesthetic medicine industry remains largely unregulated. Proposed legislation coming in July 2026 will require all practitioners performing cosmetic injectables to be registered, accredited, and fully compliant. New guidance classifies "skin booster-type injections" as medium-risk procedures, bringing them under stricter oversight.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Profhilo is an established product with a long safety track record and clear regulatory history. Polynucleotides, while used safely in aesthetic practice across Europe for some years, occupy a more ambiguous regulatory space in the UK. No specific MHRA statement directly addresses polynucleotides' classification. If you choose polynucleotides, ensure your practitioner is medically trained, insured, and transparent about the product's origin and purity.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I mention this not to discourage polynucleotide use, but to ensure you are informed. Any aesthetics treatment carries risk if delivered by an undertrained practitioner in an unclean environment. Choose a practitioner with a nursing or medical background, not just a short weekend course.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A practical word on expectations</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Neither skin booster is a substitute for good skincare or professional-grade treatments like <a href="/blog/micro-needling-results-timeline" className="text-charcoal underline hover:text-ink-soft transition">micro-needling</a>. Both work best as part of a broader routine: diligent sun protection, retinoids, vitamin C, and a good cleanser.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If you have untreated acne, severe sun damage, or significant scarring, your practitioner may recommend starting with micro-needling or other collagen-induction therapies before adding polynucleotides. If your main concern is mild volume loss, a strategic course of <a href="/treatments/profhilo" className="text-charcoal underline hover:text-ink-soft transition">Profhilo</a> might be enough without needing filler.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Be sceptical of any clinic promising dramatic results after one treatment, or of practitioners who push you towards both treatments immediately. In my experience, the most satisfied clients are those who start with one treatment, review the result at 2-3 weeks, and then decide if a second treatment or a complementary option makes sense.
    </p>

    <div className="bg-charcoal text-cream rounded p-8 my-10">
      <h3 className="font-display italic text-h3 mb-4">Book a free consultation</h3>
      <p className="text-body-lg leading-relaxed mb-6">
        Not sure which is right for your skin. Book a free 20-minute consultation at Visage Aesthetics. We will assess your skin, discuss your goals, and recommend the treatment (or combination) most likely to deliver the result you want.
      </p>
      <a href="/contact" className="inline-block bg-gold text-charcoal font-semibold px-6 py-3 rounded hover:bg-opacity-90 transition">
        Book your consultation
      </a>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
      <div className="border border-gold rounded p-6">
        <h4 className="font-display italic text-h3 text-charcoal mb-3">Profhilo</h4>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
          Fast-acting hyaluronic acid booster for hydration and biostimulation. Ideal for skin laxity and radiance.
        </p>
        <a href="/treatments/profhilo" className="text-charcoal font-semibold hover:underline transition">
          Learn more
        </a>
      </div>
      <div className="border border-gold rounded p-6">
        <h4 className="font-display italic text-h3 text-charcoal mb-3">Dermal filler</h4>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
          If you are considering volume restoration alongside skin quality improvements, dermal filler complements both boosters.
        </p>
        <a href="/treatments/dermal-filler" className="text-charcoal font-semibold hover:underline transition">
          Learn more
        </a>
      </div>
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
