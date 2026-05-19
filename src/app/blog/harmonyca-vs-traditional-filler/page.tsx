import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'harmonyca-vs-traditional-filler',
  title: "HarmonyCa vs traditional dermal filler: when to choose which",
  description: "HarmonyCa vs traditional dermal filler: when to choose which, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintre",
  datePublished: '2026-05-19',
  dateModified: '2026-05-19',
  image: '/images/og-home.jpg',
  wordCount: 1917,
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

export default function Post() {
  return (
    <article className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(POST)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(POST.slug, POST.title)) }} />
<section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
  <div className="container mx-auto px-4">
    <a href="/blog" className="inline-flex items-center text-sm text-ink-soft hover:text-gold transition-colors mb-6">
      ← Back to all articles
    </a>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-sm uppercase tracking-widest text-gold mb-4">Treatments</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">HarmonyCa vs Traditional Dermal Filler: When to Choose Which</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed max-w-2xl">
      Patients often ask whether they need a traditional hyaluronic acid filler or something that works differently. The honest answer depends on what you are trying to achieve: immediate volume, longer-term skin quality, or both. HarmonyCa sits in a distinct category because it does two things at once, which makes it useful for some concerns and unnecessary for others.
    </p>
    <p className="text-sm text-ink-soft mt-6">
      By Bernadette Tobin RGN, MSc · May 2026
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="container mx-auto px-4 max-w-3xl">

    <div className="bg-white border border-charcoal/10 rounded-lg p-6 mb-10">
      <h2 className="font-display italic text-h3 text-charcoal mb-4">The short version</h2>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
        Traditional HA fillers add volume and hydration where you place them. HarmonyCa, a hybrid of hyaluronic acid and calcium hydroxylapatite, adds volume immediately and then stimulates your own collagen over the following months. Choose a classic HA filler when you want targeted, reversible correction in a specific area (lips, tear troughs, a single fold). Choose HarmonyCa when you want broader mid-to-lower face lifting combined with gradual improvement in skin firmness. Neither is universally better; they solve different problems.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What HarmonyCa actually is</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HarmonyCa is manufactured by Allergan Aesthetics (the same company behind the Juvéderm range) and carries CE-mark approval. It is a hybrid injectable that combines hyaluronic acid with calcium hydroxylapatite microspheres in a single syringe. The product also contains lidocaine, which makes the injection process more comfortable.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The hyaluronic acid component works the way any HA filler does: it integrates with tissue and provides immediate volumisation. The calcium hydroxylapatite microspheres do something additional. They create a scaffold within the deep dermis that supports fibroblast activity and triggers the production of new collagen, a process called biostimulation or neocollagenesis. Histological studies have shown increases of up to 160% in types I and III collagen following CaHA treatment.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Calcium hydroxylapatite is naturally found in human bone, which makes it highly biocompatible. It is also biodegradable and is eventually reabsorbed by the body. One MRI-based study found no evidence of remaining CaHA at two and a half years post-treatment.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How traditional HA fillers compare</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Hyaluronic acid fillers (Juvéderm, Restylane, Teoxane, and others) remain the most common injectables used in aesthetic clinics. They work by drawing water into tissue, creating volume and hydration at the point of injection. Different viscosities allow for different applications: thinner products for fine lines and lips, thicker products for cheek augmentation or jawline definition.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The key clinical advantage of HA fillers is reversibility. If a complication arises, or if the patient simply dislikes the result, hyaluronidase can dissolve the product. This safety profile is why HA remains the default choice for areas with higher vascular risk, such as the lips and tear troughs, and for patients who are new to injectable treatments.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Traditional HA fillers focus primarily on immediate volume and hydration. While some degree of collagen stimulation occurs with any injection (the body responds to the needle trauma), this is minimal compared to the deliberate biostimulation mechanism built into HarmonyCa.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The clinical difference in practice</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      When I inject a traditional HA filler into, say, the nasolabial fold, the result is visible immediately. The fold softens because there is now material beneath it. That result will last as long as the product remains in tissue (typically several months to over a year depending on the product and the area).
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      When I inject HarmonyCa into the mid-to-lower face, there is also an immediate lift. But over the following months, something else happens. Patient satisfaction scores in published research have been shown to improve at six months compared to immediately post-treatment. This is attributed to the biostimulation effect: the new collagen that forms gradually improves skin quality beyond what the filler alone provides.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      A 2024 Italian study involving 129 patients found visible improvement in all patients after one treatment, with results lasting at least nine months. Physicians rated 61% of outcomes as "much improved." A separate study demonstrated that the CaHA-HA combination effectively volumises and lifts cheeks and jawline with benefits lasting up to one year.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HarmonyCa is injected into sub-dermal and deep dermal layers in the mid-to-lower face. This relatively superficial placement reduces the risk of vascular occlusion compared to deeper volumising fillers, which is a meaningful safety consideration.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Who is the right candidate for each</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The decision between HarmonyCa and a traditional filler is not about which product is "better." It is about matching the treatment to the concern.
    </p>

    <h3 className="font-display text-h3 text-charcoal mt-8 mb-4">Consider traditional HA filler when:</h3>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· You want targeted correction in a specific area (lips, tear troughs, a defined fold, chin projection)</li>
      <li>· You are new to injectables and want a reversible starting point</li>
      <li>· The area being treated carries higher vascular risk and reversibility is important</li>
      <li>· You want a shorter-commitment result to "try" a look before committing</li>
      <li>· Your skin quality is reasonably good and you primarily need volume, not firmness</li>
    </ul>

    <h3 className="font-display text-h3 text-charcoal mt-8 mb-4">Consider HarmonyCa when:</h3>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· You have volume loss combined with skin laxity or sagging in the mid-to-lower face</li>
      <li>· You want both an immediate lift and gradual improvement in skin firmness</li>
      <li>· You are interested in collagen biostimulation as part of a long-term approach</li>
      <li>· You have already had traditional fillers and want to add a different mechanism</li>
      <li>· You prefer fewer treatment sessions with results that build over time</li>
    </ul>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In my clinic, I often use both in the same patient, not in the same session, but as part of a treatment plan. Someone might have <a href="/treatments/dermal-filler" className="text-gold underline hover:text-charcoal transition-colors">HA filler</a> to the lips and then <a href="/treatments/harmonyca" className="text-gold underline hover:text-charcoal transition-colors">HarmonyCa</a> to the cheeks and jawline several weeks later. These are complementary tools, not competitors.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A note on how long results last</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I need to be honest here: sources disagree on the duration of HarmonyCa results. Some clinical literature suggests around twelve months. Other sources cite longer. The variability likely reflects differences in patient age, skin quality, metabolism, and how "result" is defined (is it the filler component or the collagen stimulation that we are measuring?).
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      What I tell patients is that the immediate volumising effect will gradually soften over the course of a year or so, but the collagen that forms during that period becomes part of your own tissue. Standard treatment protocol involves two syringes initially, with a repeat session sometimes recommended at six to twelve months depending on individual response.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Traditional HA fillers have more predictable duration ranges that vary by product and placement area. This is worth discussing during consultation if predictability matters to you.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What to expect during and after treatment</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Both HarmonyCa and traditional HA fillers are office-based procedures taking thirty minutes to an hour depending on the areas treated. HarmonyCa contains lidocaine, so the injection is reasonably comfortable. I also use topical anaesthetic where appropriate.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Common side effects for HarmonyCa include redness, swelling, pain, tenderness, and itching. These typically resolve within days to two weeks. The same is true for HA fillers. Bruising is possible with any injectable, and I advise patients to avoid blood-thinning medications (where medically appropriate) before treatment.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      One practical difference: because HarmonyCa contains CaHA, it is not reversible in the same way HA is. There is no enzyme that dissolves calcium hydroxylapatite. This is rarely a clinical concern because the product is placed superficially and is highly biocompatible, but it does mean that careful patient selection and conservative dosing matter even more.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The UK aesthetics industry remains largely unregulated, though this is changing. A licensing scheme for non-surgical cosmetic procedures has been proposed, with risk-based categories and minimum training standards expected. Scotland has its own legislation targeting implementation this year. The NMC introduced guidance from June 2025 requiring face-to-face prescriber consultations for prescription-only cosmetic medicines.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I mention this because the safety of any injectable depends more on the practitioner than the product. HarmonyCa, like any filler, requires precise anatomical knowledge and proper training. Before any treatment, I recommend verifying your practitioner's <a href="/about/qualifications" className="text-gold underline hover:text-charcoal transition-colors">qualifications</a> and registration. You can check my NMC PIN (05G1755E) on the Nursing and Midwifery Council register.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Where HarmonyCa fits in a broader treatment plan</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Biostimulation is increasingly central to how I approach facial rejuvenation. Products like <a href="/treatments/profhilo" className="text-gold underline hover:text-charcoal transition-colors">Profhilo</a> work through a similar principle (improving skin quality rather than adding volume), though with a different mechanism and a different result. HarmonyCa occupies a middle ground: it provides structure and lift while also triggering collagen production.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      For patients concerned about early sagging in the lower face, HarmonyCa can delay or reduce the need for more invasive procedures. Combined with skin-quality treatments and, where appropriate, <a href="/treatments/anti-wrinkle-injections" className="text-gold underline hover:text-charcoal transition-colors">anti-wrinkle injections</a> for dynamic lines, it forms part of a conservative, maintenance-based approach that I prefer to aggressive one-off interventions.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Clinical research is ongoing. A trial investigating HarmonyCa for mid-face augmentation with a 25-month follow-up is currently listed on ClinicalTrials.gov. As more data emerges, our understanding of optimal patient selection and treatment protocols will continue to refine.
    </p>

    <div className="bg-cream border border-gold/30 rounded-lg p-8 my-12 text-center">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Book a consultation</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-6">
        If you are unsure whether HarmonyCa or a traditional filler is right for your concerns, a face-to-face consultation is the best way to find out. I will assess your anatomy, discuss your goals honestly, and recommend only what I believe will help.
      </p>
      <a href="/contact" className="inline-block bg-gold text-white px-6 py-3 rounded hover:bg-charcoal transition-colors">
        Request a consultation
      </a>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Related treatments</h2>
    <div className="grid md:grid-cols-2 gap-6">
      <a href="/treatments/harmonyca" className="block bg-white border border-charcoal/10 rounded-lg p-6 hover:border-gold transition-colors">
        <h3 className="font-display italic text-h3 text-charcoal mb-2">HarmonyCa</h3>
        <p className="text-body text-ink-soft">Hybrid filler combining immediate volume with collagen biostimulation for the mid-to-lower face.</p>
      </a>
      <a href="/treatments/dermal-filler" className="block bg-white border border-charcoal/10 rounded-lg p-6 hover:border-gold transition-colors">
        <h3 className="font-display italic text-h3 text-charcoal mb-2">Dermal Filler</h3>
        <p className="text-body text-ink-soft">Hyaluronic acid fillers for targeted volume restoration in lips, cheeks, chin, and facial folds.</p>
      </a>
    </div>

  </div>
</section>
      <BookingCTA />
    </article>
  )
}
