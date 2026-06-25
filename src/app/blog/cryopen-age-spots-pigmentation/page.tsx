import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'cryopen-age-spots-pigmentation',
  title: "Removing age spots and pigmentation with CryoPen",
  description: "Removing age spots and pigmentation with CryoPen, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Essex.",
  datePublished: '2026-06-25',
  dateModified: '2026-06-25',
  image: '/images/og-home.jpg',
  wordCount: 1719,
}

const FAQS = [
  {
    "q": "How long does it take for age spots to disappear after CryoPen treatment?",
    "a": "The crust typically sheds naturally over 1-3 weeks, with the spot gradually fading as the new skin blends with surrounding tissue. Most lesions respond within one or two treatment sessions."
  },
  {
    "q": "What happens to your skin immediately after CryoPen treatment?",
    "a": "You will experience a sting, redness and possible swelling in the first 24 hours. A blister or crust then forms and darkens over days 2-4 before gradually loosening and lifting away naturally."
  },
  {
    "q": "Can CryoPen treat all types of pigmentation marks?",
    "a": "CryoPen is effective for solar lentigines (age spots), but it is not effective for melasma or post-inflammatory hyperpigmentation, which require different treatment approaches. A proper consultation determines suitability for your specific condition."
  },
  {
    "q": "How should you protect your skin after CryoPen treatment?",
    "a": "Sun protection is essential for 4-6 weeks after treatment to prevent new pigmentation and allow even blending of the treated area with surrounding skin."
  },
  {
    "q": "Why do age spots appear on hands and face?",
    "a": "Solar lentigines develop when melanocytes become overactive in localised clusters, usually in response to cumulative UV exposure over decades. They typically emerge on sun-exposed areas like the hands, décolletage, face and forearms."
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
    <Link href="/blog" className="inline-block text-body-sm text-ink-soft hover:text-charcoal mb-8 transition-colors">
      Back to all articles
    </Link>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-label text-ink-soft mb-4 font-medium">Age spot removal</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-8">Removing age spots and pigmentation with CryoPen</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Solar lentigines on your hands, décolletage and face respond predictably to CryoPen treatment. If you understand what the healing timeline looks like, how to protect treated skin afterwards, and which pigmentation conditions CryoPen cannot address, you'll go into the appointment with realistic expectations and the knowledge to care for your skin properly.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6 md:px-8">
    <div className="bg-white border-l-4 border-gold p-6 md:p-8 mb-10 rounded">
      <h2 className="font-display text-h3 text-charcoal mb-4">Short version</h2>
      <ul className="space-y-2 text-body-lg text-ink-soft">
        <li>· CryoPen works by freezing excess melanin in solar lentigines, which then flake away naturally over 1-3 weeks.</li>
        <li>· Expect redness and swelling for the first few days, followed by a crust that gradually sheds.</li>
        <li>· Sun protection for the subsequent 4-6 weeks is essential to prevent new pigmentation and allow even blending.</li>
        <li>· CryoPen is not effective for melasma or post-inflammatory hyperpigmentation, which require different treatment approaches.</li>
        <li>· Not all practitioners properly assess which lesions are candidates; a proper consultation determines suitability.</li>
      </ul>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What are solar lentigines and why do they appear?</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Solar lentigines, commonly called age spots or sun spots, are flat patches of increased pigmentation that develop on sun-exposed skin over time. They form when melanocytes (the cells that produce skin pigment) become overactive in localised clusters, usually in response to cumulative UV exposure. Unlike freckles, which are often hereditary and appear in childhood, solar lentigines typically emerge after decades of sun exposure and concentrate on the hands, décolletage, face and forearms.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The spots are benign but can look uneven or aged, which is why many patients seek treatment for cosmetic reasons. In my clinic, I see them most commonly in patients over 50, though earlier onset is increasingly common in people who spent significant time outdoors or in sunny climates when younger.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How CryoPen works on age spots</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      CryoPen is a handheld device that delivers a controlled, precise jet of extremely cold gas to the surface of the skin. The cold induces rapid freezing of excess melanin in the lesion without damaging the surrounding healthy tissue. The mechanism is selective: the concentrated cold ablates the melanocytes responsible for the pigmentation while leaving the dermis and deeper structures largely intact.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The device uses difluoroethane, which is gentler than traditional liquid nitrogen and allows for shorter, more controlled bursts. In clinical studies of cryotherapy for solar lentigines, efficacy ranges from 37% to 71%, depending on lesion depth, skin type and the number of treatment cycles. Most lesions respond within one or two sessions.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      What I appreciate about CryoPen is the precision. I can target an individual spot without affecting the surrounding skin, which is crucial for delicate areas like the décolletage or thin skin on the hands.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The healing timeline: what to expect week by week</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Understanding the healing process helps you avoid anxiety and poor aftercare decisions. Here is what typically unfolds after treatment:
    </p>
    <ul className="space-y-3 mb-6 text-body-lg text-ink-soft">
      <li>· <strong>Immediately after:</strong> You will feel a sting and see redness. The treated spot may look slightly darker or raised. This is normal.</li>
      <li>· <strong>First 24 hours:</strong> Swelling develops, often mild. The area remains red and may feel tender. A small blister or crust may begin to form.</li>
      <li>· <strong>Days 2-4:</strong> The crust or blister thickens and darkens. The skin around it may remain pink. Do not pick, scratch or deliberately remove the crust.</li>
      <li>· <strong>Days 5-10:</strong> The crust gradually loosens and lifts away naturally. Underneath, you will see new, often noticeably pink or lighter skin. This is fresh epidermis.</li>
      <li>· <strong>Week 2 onwards:</strong> The pink colour gradually fades as blood flow normalises and the new skin blends with surrounding tissue. Full settlement typically takes 1-3 weeks, though blending can continue subtly beyond that.</li>
    </ul>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The treated spot will likely appear darker in the first few days before it flakes away. This is the body's natural response and not a sign that treatment has failed.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Sun protection: non-negotiable for 4-6 weeks</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This is where many patients stumble. The new skin revealed after the crust sheds is highly photosensitive. Without rigorous sun protection, two things happen: the treated area can develop new pigmentation, undoing the treatment, or it heals unevenly, with patches darker or lighter than surrounding skin.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      For 4-6 weeks post-treatment, you must use broad-spectrum sunscreen SPF 30 or higher, reapply every 2 hours if outdoors, and consider physical sun avoidance where practical. On the hands and décolletage, where CryoPen is often used, this means wearing gloves or long sleeves during peak sun hours, or simply staying in the shade. I recommend my patients treat this period as seriously as they would after a chemical peel.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If you are unable to commit to sun protection, postpone treatment until a season when you can. Picking at the crust or rubbing the area also delays healing and increases the risk of uneven pigmentation. Let the crust fall off on its own.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What CryoPen cannot treat: melasma and post-inflammatory hyperpigmentation</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Not all pigmentation is the same, and CryoPen has clear limits. The most important contraindication is melasma, a condition characterised by symmetric patches of hyperpigmentation, often on the cheeks, forehead and upper lip. Melasma is triggered by hormonal changes, genetic predisposition and sun exposure. Cryotherapy is neither safe nor effective for melasma and can worsen it. Melasma requires entirely different approaches, such as tranexamic acid injections or topical depigmenting agents.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Post-inflammatory hyperpigmentation (PIH) is another scenario where CryoPen is inappropriate. This is pigmentation that develops after an injury, inflammation or previous aesthetic treatment. In patients with darker skin types especially, cryotherapy carries a significant risk of inducing or worsening PIH, creating a situation where the treatment causes more pigmentation than it resolves. In such cases, tranexamic acid or other systemic approaches are safer.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This is why a proper consultation matters. During assessment, I distinguish between solar lentigines (discrete, well-demarcated spots from sun damage) and other pigmentation disorders. If a patient comes in with melasma or a history of PIH, I will not recommend CryoPen and will instead discuss more suitable options.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note on practitioner selection</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      CryoPen is widely available, but the quality of assessment and aftercare varies enormously. Some practitioners will treat any spot presented to them without properly evaluating whether it is a suitable lesion. Others will not give clear aftercare guidance, leaving patients surprised by redness or confused about sun protection.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Ensure your practitioner takes time to examine the lesion, confirms it is a solar lentigo (and not melasma or PIH), discusses realistic expectations including the healing timeline, and provides written aftercare instructions. <Link href="/contact" className="underline hover:no-underline text-charcoal">A good consultation should answer your questions and feel unhurried.</Link>
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Realistic expectations and follow-up</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      CryoPen is effective, but not universally. Some lesions respond completely in one session. Others require a second treatment 4-6 weeks later. Very deep or stubborn spots may not resolve entirely but will typically lighten significantly. Age spots on the hands and décolletage, where skin texture is often varied, may leave faint marks even after successful treatment.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      After treatment, it is normal for the skin to look slightly different in the short term. The new skin may be paler initially, then gradually blend. If uneven healing occurs despite good sun protection, a second session or topical treatments can refine the result.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I recommend a two-week follow-up review to assess healing and plan any further treatment. <Link href="/treatments/cryopen" className="underline hover:no-underline text-charcoal">At Visage Aesthetics, this review is included as part of the CryoPen treatment package.</Link>
    </p>

    <div className="bg-cream border border-gold rounded p-6 md:p-8 my-10">
      <h3 className="font-display text-h3 text-charcoal mb-4">Book a consultation</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-6">
        If you have age spots on your hands, face or décolletage and want to explore whether CryoPen is right for you, book a free consultation. I will assess your lesions, discuss your skin type and healing capacity, and explain what to expect before and after treatment.
      </p>
      <Link href="/contact" className="inline-block px-8 py-3 bg-charcoal text-cream font-medium rounded hover:bg-gold hover:text-charcoal transition-colors">
        Book your consultation
      </Link>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Key takeaways</h2>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Solar lentigines respond well to CryoPen because the cold selectively freezes excess melanin.</li>
      <li>· Healing takes 1-3 weeks, with the crust shedding naturally to reveal fresh skin beneath.</li>
      <li>· Sun protection SPF 30+ for 4-6 weeks post-treatment is essential and non-negotiable.</li>
      <li>· CryoPen is not suitable for melasma or post-inflammatory hyperpigmentation; these require different approaches.</li>
      <li>· Choose a practitioner who takes time to assess lesion suitability and provides clear aftercare guidance.</li>
    </ul>

  </div>
</section>

<section className="bg-white py-12 md:py-16">
  <div className="max-w-3xl mx-auto px-6 md:px-8">
    <h2 className="font-display italic text-h2 text-charcoal mb-8">Related treatments</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href="/treatments/cryopen" className="block p-6 border border-gold rounded hover:bg-cream transition-colors group">
        <h3 className="font-display text-h3 text-charcoal group-hover:text-gold transition-colors mb-3">CryoPen</h3>
        <p className="text-body-lg text-ink-soft mb-4">Precision cryotherapy for age spots, solar lentigines and other benign skin lesions.</p>
        <span className="text-charcoal font-medium text-body-sm">Learn more</span>
      </Link>
      <Link href="/treatments/micro-needling" className="block p-6 border border-gold rounded hover:bg-cream transition-colors group">
        <h3 className="font-display text-h3 text-charcoal group-hover:text-gold transition-colors mb-3">Micro-needling</h3>
        <p className="text-body-lg text-ink-soft mb-4">Collagen induction therapy to improve skin texture, scars and overall skin quality.</p>
        <span className="text-charcoal font-medium text-body-sm">Learn more</span>
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
