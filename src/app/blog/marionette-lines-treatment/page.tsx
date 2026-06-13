import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'marionette-lines-treatment',
  title: "Marionette lines: what helps and what doesn't",
  description: "Marionette lines: what helps and what doesn't, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Essex.",
  datePublished: '2026-06-13',
  dateModified: '2026-06-13',
  image: '/images/og-home.jpg',
  wordCount: 1613,
}

const FAQS = [
  {
    "q": "What causes marionette lines?",
    "a": "Marionette lines form due to three factors: increased activity of the depressor anguli oris muscle that pulls the mouth corners downward, volume loss in the lower face and chin causing skin to sag, and declining skin elasticity with age. Together, these create the characteristic downturned creases from the mouth corners to the jawline."
  },
  {
    "q": "Why doesn't filler directly into marionette lines work?",
    "a": "Injecting filler only into the line itself creates a ridge effect, where the skin on either side casts a shadow and makes the line appear deeper rather than softer. The solution is to restore volume in the deeper layers below the marionette line using strategic placement, which naturally softens the line as a consequence."
  },
  {
    "q": "How does DAO Botox treat marionette lines?",
    "a": "DAO Botox targets the depressor anguli oris muscle at the mouth corner, weakening it so the natural upward-pulling muscles can take over. This creates a subtle lift at the mouth corners and reduces the downturned appearance. Results appear within 3-5 days, with the full effect after two weeks."
  },
  {
    "q": "What is the best treatment approach for marionette lines?",
    "a": "The most effective approach combines small doses of Botox into the depressor anguli oris muscle, strategic filler placement in the lower face and chin to restore volume and support, and sometimes biostimulators to improve skin quality. This layered approach addresses the underlying anatomical causes rather than just treating the visible line."
  },
  {
    "q": "How quickly will I see results from marionette line treatment?",
    "a": "Botox results are visible within 3-5 days, with full effects after about two weeks. Filler results are visible immediately, though the full effect takes a few weeks. The lift from Botox lasts between 3 and 6 months, depending on how quickly you metabolise the product."
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
    <Link href="/blog" className="text-sm font-semibold text-gold hover:text-gold-dark transition-colors mb-8 inline-block">
      Back to all articles
    </Link>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-xs font-semibold uppercase tracking-wider text-gold mb-4">Injectables</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Marionette lines: what helps and what doesn't</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-0">
      Marionette lines are those downturned creases from the mouth corners to the jawline that deepen over time. Many people assume direct filler into the line is the answer, but it rarely is. A combined approach using Botox, strategic filler placement, and sometimes biostimulators gives real results.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6">
    
    <div className="bg-white border border-gold rounded p-6 my-8">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Short version</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
        Marionette lines are caused by a combination of downward muscle pull, volume loss, and skin descent. Botox alone won't fully address them. Filler directly into the line often creates shadowing rather than softness. The best approach combines small doses of Botox into the depressor anguli oris muscle (to lift the mouth corners), strategic filler in the lower face and chin to restore volume and support, and sometimes biostimulators to improve skin quality. Results are visible quickly with Botox (3-5 days) and immediately with filler, though the full effect takes a few weeks.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What are marionette lines, and why do they form?</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Marionette lines are the vertical creases that run downward from the corners of your mouth towards the chin and jawline. They're named after puppet mouths, which is fairly accurate: they give the impression of a downturned or sad expression, even when you're smiling or at rest.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      They form because of three overlapping factors. First, the depressor anguli oris muscle, which pulls the mouth corners downward, becomes more active or dominant over time. Second, volume loss in the lower face and chin causes the skin to sag, which deepens any existing fold. Third, skin elasticity declines with age, so the tissues don't rebound the way they did in your twenties. The result is a crease that looks permanent even when you try to lift it with a smile.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why direct filler into the line often makes things worse</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Many people assume the answer is to inject filler directly into the marionette line itself, the same way you might plump a lip. This is where the first mistake happens. When you fill only the line without addressing the surrounding volume loss, you create a ridge effect. The skin on either side of that line casts a shadow, making the line appear deeper and more pronounced rather than softer.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Think of it like highlighting a wrinkle with a shadow: if you only fill the bottom of a fold, the edges stand out more. The solution is to work in layers and address the deeper structures first. In my clinic, we focus on restoring volume in the supramuscular and submuscular layers, particularly in the prejowl sulcus and chin projection area. This lifts the skin naturally and softens the line as a consequence, rather than drawing attention to it.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Using a cannula for deeper placement allows precise distribution of filler where it actually addresses the anatomical problem: volume loss below the marionette line, not the line itself.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">DAO Botox: lifting the mouth corners</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The depressor anguli oris (DAO) is the small muscle at the corner of the mouth that pulls it downward. When injected with Botox, this muscle is temporarily weakened, which allows the natural upward-pulling muscles of the mouth to take over. The result is a subtle lift at the mouth corners and a reduction in the downturned appearance.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The dose is small: typically 2-4 units per side of the mouth. This is one of those treatments where less is always better. Too much Botox in the DAO can create an odd, overly-wide grin or an asymmetrical appearance. The goal is a gentle lift that looks like you've had a good night's sleep, not a surgical surprise.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      You'll see results within 3-5 days, though the full effect takes about two weeks. The lift lasts between 3 and 6 months, depending on how quickly you metabolise the product. DAO Botox is most effective when marionette lines are primarily driven by dynamic muscle pull rather than deep volume loss, though in reality, most people benefit from combining it with filler for the best outcome.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Strategic filler placement: volume, support, and lift</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Dermal fillers work for marionette lines by restoring the lost volume that allows gravity and muscle pull to deepen the fold in the first place. The key is placement: we're not filling the line, we're supporting it by lifting the tissues around it.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The best results come from a technique that addresses three areas: the chin projection, the prejowl sulcus (the shadow between the chin and jawline), and the lower cheek just above the marionette line itself. By restoring volume in these zones, the skin naturally sits higher and the marionette line softens as a side effect. It's a much more natural-looking result than trying to fill the line directly.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Hyaluronic acid fillers are the standard choice. Results are visible immediately and typically last between 6 and 18 months. Because hyaluronic acid fillers are reversible with an enzyme called hyaluronidase, there's a safety margin: if the result isn't right, we can adjust it.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Biostimulators: skin quality and longer-term improvement</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      For some clients, particularly those with more significant skin laxity or loss of elasticity, adding a biostimulator like <Link href="/treatments/harmonyca">HarmonyCa</Link> or Sculptra can make a real difference. These products work differently from traditional fillers: instead of adding immediate volume, they stimulate your own collagen production over weeks and months.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The advantage is that you're improving the quality and thickness of the skin itself, not just filling a space. This is particularly useful in the lower face where skin tends to become crepey and thin. Results build gradually and last considerably longer than hyaluronic acid.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The combined approach: why it works</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Marionette lines are a multifactorial problem, which means they benefit from a multimodal treatment. Botox alone won't lift the corner of your mouth if there's significant volume loss. Filler alone won't address the dynamic downward pull of the DAO muscle. Combining the two gives you both lift and support.
    </p>

    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· DAO Botox addresses the dynamic component: the muscle that pulls the mouth down.</li>
      <li>· Strategic filler addresses the static component: the volume loss and skin descent that deepen the line.</li>
      <li>· Together, they soften the line, lift the mouth corner, and restore the definition of the jawline.</li>
      <li>· Biostimulators can be added if skin quality is poor, for a longer-lasting and more fundamental improvement.</li>
    </ul>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In my clinic, we usually start with Botox and filler in the same appointment. This allows time for the Botox to take effect (which it does gradually over two weeks) while the filler provides immediate support. By the time the Botox is at full strength, the combined result is a naturally lifted, softened lower face.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Botox and dermal fillers are prescription-only medicines in the UK and must be administered by a trained, qualified practitioner. Marionette line treatment requires a thorough understanding of lower facial anatomy, particularly the position of the DAO muscle and the blood supply to the lower face. Injecting in the wrong plane or with too much product can cause asymmetry, nerve compression, or vascular complications.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If you're considering treatment, book a consultation with a practitioner who has relevant training and experience, and who will talk you through the risks and realistic outcomes before you commit. A good consultation should take at least 30 minutes.
    </p>

    <div className="bg-white border border-gold rounded p-6 my-8">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Ready to discuss your marionette lines?</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
        Book a free consultation at Visage Aesthetics. I'll assess your lower face, explain what's contributing to your marionette lines, and recommend a realistic treatment plan that's right for you.
      </p>
      <Link href="/contact" className="inline-block px-6 py-3 bg-gold text-charcoal font-semibold rounded hover:bg-gold-dark transition-colors">
        Book your consultation
      </Link>
    </div>

    <div className="grid md:grid-cols-2 gap-6 mt-12">
      <div className="bg-white border border-gold rounded p-6">
        <h3 className="font-display italic text-h3 text-charcoal mb-3">Dermal filler</h3>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
          Strategic filler placement is the foundation of treating marionette lines. Learn how we use volume restoration to support and lift the lower face.
        </p>
        <Link href="/treatments/dermal-filler" className="text-gold font-semibold hover:text-gold-dark transition-colors">
          Read more about dermal filler
        </Link>
      </div>
      <div className="bg-white border border-gold rounded p-6">
        <h3 className="font-display italic text-h3 text-charcoal mb-3">Anti-wrinkle injections</h3>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
          DAO Botox lifts the mouth corners by relaxing the muscle that pulls them downward. Find out how it works and what to expect.
        </p>
        <Link href="/treatments/anti-wrinkle-injections" className="text-gold font-semibold hover:text-gold-dark transition-colors">
          Read more about anti-wrinkle injections
        </Link>
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
