import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'profhilo-treatment-guide',
  title: "Profhilo: a no-nonsense treatment guide",
  description: "Profhilo: a no-nonsense treatment guide, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Essex.",
  datePublished: '2026-05-17',
  dateModified: '2026-05-17',
  image: '/images/og-home.jpg',
  wordCount: 1925,
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
  <div className="mx-auto max-w-3xl px-4">
    <a href="/blog" className="text-sm text-gold hover:underline mb-6 inline-block">← Back to all articles</a>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-sm uppercase tracking-widest text-gold mb-3">Treatment Guide</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Profhilo: A No-Nonsense Treatment Guide</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Profhilo has become one of the most requested treatments in my clinic over the past few years, yet I still find myself correcting the same misunderstandings week after week. This guide sets out what Profhilo actually is, what it cannot do, who benefits most from it, and why the treatment comes as a course of two sessions rather than a single appointment.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="mx-auto max-w-3xl px-4">

    <div className="bg-white border border-gold/20 rounded-lg p-6 mb-10">
      <p className="text-sm uppercase tracking-widest text-gold mb-3">The Short Version</p>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
        Profhilo is a hyaluronic acid-based injectable that improves skin quality through deep hydration and by stimulating your own collagen and elastin production. It is not a filler: it will not add volume to your cheeks or lips. The standard protocol requires two sessions spaced four weeks apart, with results typically lasting six to nine months. It works well on skin that has lost tone and hydration, particularly in the face, neck, and hands. It is not a replacement for filler, and it will not address significant volume loss or deep static lines.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What Profhilo Actually Is</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Profhilo is an injectable treatment containing one of the highest concentrations of hyaluronic acid available on the market: 64mg per 2ml syringe. That figure comes from a combination of 32mg of high-molecular-weight hyaluronic acid (1100-1400 kDa) and 32mg of low-molecular-weight hyaluronic acid (80-100 kDa). The two are stabilised together through a patented thermal process called NAHYCO Hybrid Technology, which creates what the manufacturer describes as stable, hybrid, and cooperative complexes (HyCoCos).
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The important distinction here is the absence of chemical cross-linking agents. Traditional dermal fillers use a substance called BDDE to cross-link hyaluronic acid molecules, which creates a gel firm enough to add structural volume. Profhilo contains no BDDE. Without that cross-linking, the product behaves differently: it spreads through the tissue rather than staying put, and it acts as a biostimulator rather than a volumiser.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The dual molecular weight composition serves two purposes. The high-molecular-weight component provides immediate hydration to the skin. The low-molecular-weight component stimulates fibroblasts (the cells responsible for producing structural proteins) to generate new collagen and elastin. Research indicates that Profhilo stimulates production of collagen types I, III, IV, and VII, along with elastin. This is why you will sometimes hear the treatment described as a "bio-remodeller" rather than a filler.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What Profhilo Is Not</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I spend a fair amount of consultation time managing expectations around what <a href="/treatments/profhilo" className="text-gold hover:underline">Profhilo</a> will not do. The treatment occupies an interesting position: it sits somewhere between skinboosters and fillers, but it is neither.
    </p>

    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· <strong>It is not a volumising filler.</strong> If you have lost volume in your cheeks, temples, or lips, Profhilo will not replace that volume. You need a <a href="/treatments/dermal-filler" className="text-gold hover:underline">dermal filler</a> for structural work.</li>
      <li>· <strong>It is not mesotherapy.</strong> Mesotherapy involves multiple superficial injections of vitamins, minerals, or dilute hyaluronic acid. Profhilo uses a different injection technique (five points per side of the face, known as the BAP technique) and a different product formulation.</li>
      <li>· <strong>It will not address deep static lines.</strong> If you have established lines at rest (nasolabial folds, marionette lines, forehead creases that do not disappear when you relax), Profhilo alone will not smooth these. It improves skin quality around them, but it does not fill them.</li>
      <li>· <strong>It is not a substitute for good skincare or sun protection.</strong> I say this about every treatment, but it bears repeating.</li>
    </ul>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The treatment works holistically to improve skin texture, hydration, and firmness across the treated region. If you come to me expecting the structural change you would see from cheek filler or the line-softening effect of <a href="/treatments/anti-wrinkle-injections" className="text-gold hover:underline">anti-wrinkle injections</a>, you will be disappointed. If you come wanting your skin to look healthier, more hydrated, and slightly firmer, that is realistic.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Who Benefits Most from Profhilo</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In my clinic, the clients who see the most noticeable results from Profhilo tend to share certain characteristics. They typically have skin that has started to lose its bounce and hydration but has not progressed to significant sagging or volume loss. The skin looks a bit tired, a bit crepey, perhaps slightly dull. When I pinch the skin on their cheek or jawline, it does not spring back the way it once did.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This often, though not always, correlates with age. Clients in their late thirties through to their fifties tend to be in the sweet spot, but I have treated younger clients with prematurely dehydrated skin and older clients who simply want to maintain what they have. Skin type matters too: thinner, drier skin often responds more visibly than thicker, oilier skin, though both can benefit.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The treatment works well on the lower face and jawline, the neck, the décolletage, and the backs of the hands. The neck in particular is an area where Profhilo has become almost a standard recommendation in my practice, because it is notoriously difficult to treat with filler and responds poorly to many energy-based devices.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Who Should Look Elsewhere</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Profhilo is not the right choice for everyone, and part of my role is to steer clients toward treatments that will actually address their concerns.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If your primary concern is significant volume loss (hollow temples, flat cheeks, thinning lips), you need dermal filler. If your concern is dynamic lines (crow's feet when you smile, forehead lines when you raise your eyebrows, frown lines when you concentrate), you need anti-wrinkle treatment. If your concern is advanced skin laxity with visible jowling and banding in the neck, you may be looking at surgical options, or at least a more intensive treatment plan combining multiple modalities. <a href="/treatments/harmonyca" className="text-gold hover:underline">HarmonyCa</a>, for instance, combines hyaluronic acid with calcium hydroxylapatite for both immediate lift and longer-term collagen stimulation, and may be more appropriate for moderate laxity.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I also advise caution in clients with active inflammatory skin conditions, those who are pregnant or breastfeeding, and those with a history of severe allergic reactions to hyaluronic acid products. These are standard contraindications, and any reputable practitioner will screen for them.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why a Course of Two Treatments</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The question I hear most often is: "Why do I need two sessions? Can I just do one and see if I like it?"
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The recommended protocol for Profhilo is two treatments spaced four weeks apart. This is not a commercial decision; it reflects how the product works. The first treatment begins the process of intense hydration and initiates the biostimulatory cascade. But a single treatment will not provide the maximum benefit. The second treatment, performed four weeks later, amplifies and consolidates those effects by further stimulating collagen and elastin production.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The four-week gap matters. It gives the hyaluronic acid gel time to integrate into your tissue and allows your fibroblasts to begin responding. Shortening the interval does not improve results and may increase the risk of lumps or uneven distribution. Full effects typically become visible four to six weeks after the second treatment, which means you are looking at roughly ten to twelve weeks from your first appointment to optimal results.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Some practitioners recommend a third treatment for skin that is more damaged or mature. I assess this on a case-by-case basis. For most clients, two sessions are sufficient for the initial course, with maintenance sessions every four to six months thereafter to sustain results.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How Long Results Last</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Based on clinical evidence and my own observations, Profhilo results typically last six to nine months following the initial two-treatment protocol. This varies depending on individual factors: your age, skin quality, metabolism, lifestyle, and how well you look after your skin between treatments.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      To maintain optimal results, I generally recommend top-up sessions every four to six months. Some clients stretch this to twice a year; others prefer to come in quarterly. There is no single correct answer, and I work with each client to find a maintenance schedule that fits their goals and budget.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A Note on Safety and Standards</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Profhilo is a prescription medicine in the UK, which means it must legally be prescribed following a face-to-face consultation. From June 2025, the Nursing and Midwifery Council made this face-to-face requirement explicit for nurse prescribers in the non-surgical cosmetic field. I have always worked this way, because it is the only responsible approach.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The aesthetics industry in the UK remains largely unregulated, and I am honest about that with every client. The proposed licensing scheme for England is still being developed; a further public consultation is expected before primary legislation and regulations are finalised. In the meantime, your protection as a patient comes from choosing practitioners who hold themselves to high standards voluntarily: proper qualifications, appropriate insurance, genuine clinical oversight. My <a href="/about/qualifications" className="text-gold hover:underline">credentials and NMC registration</a> are publicly verifiable.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      As with any injectable treatment, Profhilo carries risks: bruising, swelling, tenderness at the injection sites, and in rare cases, lumps that typically resolve within a few weeks. Serious complications are uncommon when the treatment is performed correctly with genuine product. I always advise clients to ask where their product is sourced and to walk away from any practitioner who cannot answer that question clearly.
    </p>

    <div className="bg-white border border-gold/20 rounded-lg p-8 my-12 text-center">
      <p className="font-display italic text-h3 text-charcoal mb-3">Book a Consultation</p>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-6">
        If you are considering Profhilo and want to discuss whether it is the right treatment for your skin, I offer consultations at my clinic in Essex. We will go through your concerns, examine your skin, and build a realistic plan.
      </p>
      <a href="/contact" className="inline-block bg-gold text-white px-6 py-3 rounded hover:bg-gold/90 transition">
        Request a Consultation
      </a>
    </div>

    <p className="text-sm text-ink-soft mb-8">
      Bernadette Tobin RGN, MSc<br />
      Founder, Visage Aesthetics<br />
      <a href="/awards" className="text-gold hover:underline">Best Non-Surgical Aesthetics Clinic 2026, Essex</a>
    </p>

    <div className="grid md:grid-cols-2 gap-6 mt-12">
      <a href="/treatments/profhilo" className="block bg-white border border-gold/20 rounded-lg p-6 hover:shadow-md transition">
        <p className="text-sm uppercase tracking-widest text-gold mb-2">Related Treatment</p>
        <p className="font-display italic text-h4 text-charcoal">Profhilo</p>
        <p className="text-body text-ink-soft mt-2">Full treatment details and pricing for Profhilo at Visage Aesthetics.</p>
      </a>
      <a href="/treatments/harmonyca" className="block bg-white border border-gold/20 rounded-lg p-6 hover:shadow-md transition">
        <p className="text-sm uppercase tracking-widest text-gold mb-2">Related Treatment</p>
        <p className="font-display italic text-h4 text-charcoal">HarmonyCa</p>
        <p className="text-body text-ink-soft mt-2">A hybrid filler combining hyaluronic acid with calcium hydroxylapatite for lift and collagen stimulation.</p>
      </a>
    </div>

  </div>
</section>
      <BookingCTA />
    </article>
  )
}
