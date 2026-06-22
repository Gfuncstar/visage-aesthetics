import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'harmonyca-jawline-restoration',
  title: "HarmonyCa for jawline restoration: hybrid filler with collagen build",
  description: "HarmonyCa for jawline restoration: hybrid filler with collagen build, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in ",
  datePublished: '2026-06-22',
  dateModified: '2026-06-22',
  image: '/images/og-home.jpg',
  wordCount: 1554,
}

const FAQS = [
  {
    "q": "What is HarmonyCa filler made of?",
    "a": "HarmonyCa is a hybrid filler containing 44.5% cross-linked hyaluronic acid and 55.5% calcium hydroxyapatite microspheres. The hyaluronic acid provides immediate volume and lift, whilst the calcium hydroxyapatite stimulates your own collagen production over time."
  },
  {
    "q": "How long do HarmonyCa results last?",
    "a": "Results last between 12 to 18 months. Many patients see immediate improvement from the hyaluronic acid component, with noticeable improvements in skin firmness and quality developing over 3 to 6 months as collagen is stimulated."
  },
  {
    "q": "How many treatments of HarmonyCa do I need?",
    "a": "Most patients need a single treatment session for jawline restoration. However, a second touch-up at 6 months can extend the results if desired."
  },
  {
    "q": "Why is HarmonyCa better than regular filler for the jawline?",
    "a": "Standard hyaluronic acid fillers add volume temporarily but don't address loss of skin firmness or elasticity. HarmonyCa stimulates your fibroblasts to produce new collagen, so you gain not just volume but improved skin quality and elasticity that extends beyond simple volume replacement."
  },
  {
    "q": "When will I see results from HarmonyCa?",
    "a": "You'll see immediate results within hours to days from the hyaluronic acid component. The collagen-stimulation phase becomes clinically noticeable between 3 to 6 months, when the jawline appears not just fuller but also firmer and more elastic."
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
    <a href="/blog" className="text-sm font-medium text-gold hover:text-gold-dark mb-8 inline-block">
      Back to all articles
    </a>
    <span className="hairline hairline-left mb-8 bg-gold block w-1" />
    <p className="text-sm uppercase tracking-wide text-gold mb-3">Jawline Restoration</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">HarmonyCa for jawline restoration: hybrid filler with collagen build</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Most people over 40 notice their jawline soften first. That gradual loss of definition comes from two things: volume loss and skin laxity. Traditional hyaluronic acid fillers add volume, but they don't address the underlying loss of collagen and elasticity. HarmonyCa does both. In this post, I'll explain how this hybrid filler works, why it suits mid-life jawline restoration better than HA alone, and what you can realistically expect from one or two treatments.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6 md:px-8">
    
    <div className="bg-gold-pale border-l-4 border-gold px-6 py-5 mb-10 rounded-sm">
      <p className="font-semibold text-charcoal mb-3">Short version</p>
      <ul className="space-y-2 text-body-lg text-charcoal">
        <li>· HarmonyCa is a hybrid filler: 44.5% cross-linked hyaluronic acid (immediate lift) and 55.5% calcium hydroxyapatite microspheres (collagen stimulation).</li>
        <li>· Results appear in two phases: immediate volume from the HA component, then noticeable firmness and improvement in skin quality over 3 to 6 months as the calcium hydroxyapatite stimulates new collagen.</li>
        <li>· Total longevity is 12 to 18 months, making it ideal for jawline definition, pre-jowl sulcus reduction, and overall facial structure restoration.</li>
        <li>· Most patients need a single treatment session, though a second touch-up at 6 months can extend results.</li>
        <li>· The collagen-stimulation phase gives a skin-quality benefit (improved elasticity and firmness) that extends beyond simple volume replacement.</li>
      </ul>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why the jawline matters</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The jawline is one of the first structures to show age. Bone resorption, loss of subcutaneous fat, and decline in collagen and elastin all combine to blur the angle between the chin and neck. What used to be a clean line softens into a gradual curve. For many people, this change feels more noticeable than fine lines, because it alters the entire shape of the face.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This is where standard hyaluronic acid fillers often fall short. They add volume, which can help temporarily, but they don't address the loss of skin firmness or the underlying structural change. A 0.5ml syringe of HA might plump the pre-jowl sulcus for a few months, but it won't improve the quality or elasticity of the skin itself. And when it absorbs (typically within 6 to 12 months), you're back where you started.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What makes HarmonyCa different</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HarmonyCa is the first hybrid filler to combine two active ingredients in a single product. It contains 44.5% cross-linked hyaluronic acid and 55.5% calcium hydroxyapatite (CaHa) microspheres. That split is deliberate: the HA gives you immediate results, while the CaHa works over time.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The hyaluronic acid component works exactly as you'd expect. It hydrates tissue, adds volume, and lifts the skin within hours to days. This is why many patients see a visible improvement to jawline definition after their first appointment. The HA sits in the dermis and provides structural support, filling the pre-jowl sulcus and creating a more defined angle between the chin and jaw.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      But the real innovation is what happens after that initial lift. The calcium hydroxyapatite microspheres don't dissolve like HA. Instead, they form a scaffold. Over the following weeks and months, they stimulate your fibroblasts (the cells responsible for collagen production) to lay down new collagen. This process begins within 1 to 2 weeks and becomes clinically noticeable over 3 to 6 months. You're not just filling a void; you're triggering your skin's own repair and regeneration.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The two-phase results timeline</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Understanding the timeline helps set realistic expectations. Most patients experience results in two distinct phases.
    </p>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Week 0 to 2: Immediate volumisation from the HA component. Swelling settles by day 7 to 10. The jawline looks sharper and more defined.</li>
      <li>· Week 2 to 6: CaHa microspheres begin stimulating collagen production. The skin gradually becomes firmer and smoother. This effect is subtle at first.</li>
      <li>· Month 3 to 6: Noticeable improvement in skin quality. The jawline is not just fuller but also more elastic and tighter. Fine lines soften. The overall appearance is more youthful and structured.</li>
      <li>· Month 6 to 18: Results plateau and gradually diminish as the HA is absorbed and the collagen-stimulation phase completes. Many patients choose a touch-up at the 6-month mark to maintain the benefit.</li>
    </ul>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Clinical evidence for jawline restoration</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HarmonyCa has CE marking and is approved for use across Europe. Clinical data show specific benefits for the jawline area. In treatment studies, HarmonyCa administration improved the sharpness of the jawline and the infracommissural area (the space below the chin) with reduction in the pre-jowl sulcus. The calcium hydroxyapatite component is also ideal for jawline augmentation because of its rheologic properties (the way it flows and sets); it achieves defined contours and angles rather than soft, rounded results.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Patient satisfaction data from clinical trials was high: 91.6% of patients reported improvement in treated areas, and 86% showed clinically significant improvement. A 4.1 out of 5 satisfaction score reflects genuine patient confidence in the treatment.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Single treatment or two</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Most people achieve excellent results with a single treatment session. I assess the degree of jawline laxity, volume loss, and skin quality at the consultation and recommend a volume range (typically 1ml to 1.5ml per side). A single session delivers immediate results and allows the collagen-stimulation phase to unfold over the following months.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Some patients prefer a staged approach: a conservative first treatment (0.5ml to 1ml per side) followed by a review at 2 to 3 weeks, with a second session if they want additional definition. This is equally valid, especially if you're new to filler and want to see how your skin responds.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      With a follow-up touch-up session at 6 months, you can extend the overall benefit to 12 to 24 months, depending on how quickly your body metabolises the product. Most of my patients choose to top up around the 12-month mark to maintain definition, rather than waiting until results have completely faded.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When HarmonyCa is the right choice</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HarmonyCa suits several profiles better than traditional HA fillers alone. If you have early to moderate jawline laxity, noticeable pre-jowl sulcus deepening, or visible loss of skin elasticity in the lower face, this hybrid approach addresses the root problem rather than masking it. If you've had HA fillers before but found they didn't improve skin quality or lasted shorter than you'd hoped, the collagen-stimulation phase of HarmonyCa often delivers better longevity and a more natural-looking result.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      It's also worth considering if you're concerned about the trend towards over-treatment. Because HarmonyCa works by stimulating your own collagen, you're less likely to need large volumes to see results. A conservative approach often achieves subtle, structured definition rather than the overfilled look that becomes obvious within weeks.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HarmonyCa is a prescribed medical device that should only be administered by a trained, regulated healthcare practitioner. In the UK, this means a doctor, nurse, or dentist with documented competency in facial anatomy and injectable technique. The regulatory landscape has tightened significantly in 2026; practitioners administering injectables now require mandatory competency checks, written consent documentation, and continuing professional development. When you book a consultation, ask to see your practitioner's qualifications and their training credentials for HarmonyCa specifically. You can also verify registration with the <a href="https://www.nmc.org.uk/" className="text-gold hover:text-gold-dark underline">NMC (Nursing and Midwifery Council)</a> or the <a href="https://www.gmc-uk.org/" className="text-gold hover:text-gold-dark underline">GMC (General Medical Council)</a>.
    </p>

    <div className="bg-cream border border-gold-pale rounded-lg p-6 md:p-8 my-10">
      <p className="font-semibold text-charcoal mb-3">Book a free consultation</p>
      <p className="text-body-lg text-ink-soft mb-6">
        If you're considering jawline restoration with HarmonyCa, a face-to-face consultation allows us to assess your anatomy, discuss your goals, and explain realistic timelines and costs. There's no obligation, and we'll give you honest advice about whether this treatment suits you.
      </p>
      <a href="/contact" className="inline-block bg-gold text-charcoal font-semibold px-6 py-3 rounded-sm hover:bg-gold-dark transition-colors">
        Request a consultation
      </a>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
      <a href="/treatments/harmonyca" className="block bg-cream border border-gold-pale rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 className="font-display italic text-h3 text-charcoal mb-3">HarmonyCa treatment</h3>
        <p className="text-body-lg text-ink-soft mb-4">
          Full details on how HarmonyCa works, what to expect during and after treatment, and pricing.
        </p>
        <span className="text-gold font-semibold">Learn more</span>
      </a>
      <a href="/treatments/dermal-filler" className="block bg-cream border border-gold-pale rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 className="font-display italic text-h3 text-charcoal mb-3">Dermal filler</h3>
        <p className="text-body-lg text-ink-soft mb-4">
          Explore the full range of filler treatments available at Visage, including HA, hybrid, and biostimulator options.
        </p>
        <span className="text-gold font-semibold">Learn more</span>
      </a>
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
