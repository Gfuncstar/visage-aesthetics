import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'tear-trough-filler-truth',
  title: "Tear trough filler: when it works and when it really doesn't",
  description: "Tear trough filler: when it works and when it really doesn't, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintr",
  datePublished: '2026-04-29',
  dateModified: '2026-04-29',
  image: '/images/og-home.jpg',
  wordCount: 1825,
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
    <a href="/blog" className="inline-flex items-center text-sm text-ink-soft hover:text-gold transition-colors mb-6">
      ← Back to all articles
    </a>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-sm uppercase tracking-wider text-ink-soft mb-3">Dermal Filler</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Tear trough filler: when it works and when it really doesn't</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      The tear trough is widely recognised as the most challenging area to treat with hyaluronic acid filler. That is not marketing language, it is the clinical consensus. Most people who enquire about under eye filler are not suitable candidates, and I turn away more than I treat. This post explains why, what makes a good candidate, and what alternatives exist when filler is not the answer.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="mx-auto max-w-3xl px-4">

    <div className="bg-white border border-gold/20 rounded-lg p-6 my-8">
      <h2 className="font-display italic text-h3 text-charcoal mb-3">The short version</h2>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-0">
        Tear trough filler works well for a narrow group of patients: those with mild to moderate hollowing, good skin elasticity, and minimal fat pads or puffiness. If you have chronic fluid retention, prominent eye bags, very thin skin, or deep hollows, filler will likely make things worse, not better. The area has uniquely thin skin, limited lymphatic drainage, and sits close to critical blood vessels. I assess every patient against a validated scoring system and recommend treatment only when the anatomy supports a good outcome. For everyone else, I discuss alternatives including skin quality treatments, lifestyle factors, or referral to an oculoplastic surgeon.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why the tear trough is different from every other area</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The skin beneath the eye is approximately 0.5mm thick, compare that to around 2mm on the cheeks. This difference matters enormously. Place filler even slightly too superficially, and it becomes visible: you see contour irregularities, or worse, a bluish-grey discolouration called the Tyndall effect, where the filler shows through the skin.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The under-eye area also has limited lymphatic drainage compared to other facial regions. When filler disrupts the normal drainage pathways, even slightly, the result is persistent puffiness that can last for months. I have seen patients arrive at clinic having had tear trough filler elsewhere, convinced they now have worse eye bags than before. In most cases, they are correct. The filler has created or worsened oedema.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Then there is the vascular anatomy. The infraorbital vessels run close to the treatment plane. Vascular occlusion, where filler enters or compresses a blood vessel, is rare, but the consequences are severe: tissue necrosis and, in documented cases, blindness. This is not theoretical. It has happened. It is why I only treat this area with a cannula, take my time, and work with reversible hyaluronic acid products exclusively.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Who is actually a good candidate</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The ideal candidate has a specific presentation: mild to moderate hollowing creating a visible shadow, good skin tone with minimal laxity, and, critically, no significant fat pads or pseudo-bulging beneath the eye. Published clinical guidance states that patients with values below 2 on a validated tear trough scoring system are ideal for hyaluronic acid treatment, while those scoring above 8 should be assessed for surgery instead.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In practical terms, I am looking for someone whose dark circles are caused by a groove, a genuine volume deficit, rather than by pigmentation, thin skin showing underlying muscle, or bags pushing forward. Volume loss responds to volume replacement. The other causes do not.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      When I examine a patient, I assess skin elasticity by gently pinching the lower eyelid skin. If it snaps back quickly, we have good elasticity. If it stays tented or moves sluggishly, the skin is unlikely to adapt well to filler, and we will see irregularities.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Who should not have tear trough filler</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This is the longer list. I do not recommend <a href="/treatments/dermal-filler" className="text-gold hover:underline">under eye filler</a> for patients with:
    </p>

    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Chronic puffiness or fluid retention around the eyes, particularly if worse in the morning</li>
      <li>· Prominent fat pads or bulging, the classic "eye bags" that cast their own shadow</li>
      <li>· Very thin, crepey skin where filler will show through regardless of depth</li>
      <li>· Deep hollowing extending across multiple anatomical zones, which requires more volume than the area can safely accommodate</li>
      <li>· Significant skin laxity or excess lower eyelid skin</li>
      <li>· A history of significant oedema or poor lymphatic drainage</li>
    </ul>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Research confirms this conservative approach. Patients with large fat pads or pseudo-bulging pads see minimal improvement from filler, with some actually complaining of increased puffiness after treatment. Those with more pronounced deformities, severe orbital fat bulging, and excess lower eyelid skin are better served by surgery.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I understand this is disappointing to hear. Many patients arrive having researched tear trough filler online, seen beautiful before-and-after photographs, and already decided this is what they want. Part of my role is to explain, kindly but clearly, when the treatment will not deliver what they are hoping for.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What happens when tear trough filler goes wrong</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      A systematic review of tear trough filler complications found that swelling was the most common delayed issue, occurring in over 40 percent of reported complications, followed by lumps and nodules in around a quarter of cases. The Tyndall effect, that telltale blue-grey tint, and contour irregularities are also frequently reported.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Many of these complications can be addressed. Massage helps with some lumps. Hyaluronidase, an enzyme that dissolves hyaluronic acid, can reverse filler that has been placed incorrectly or has migrated. This is one reason I only use HA-based products in the tear trough: they are reversible. If something goes wrong, we have an exit strategy.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      But prevention is better than correction. Careful patient selection eliminates most problems before they start. In my clinic, I would rather decline a treatment than manage a complication.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How I approach tear trough treatment</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      When a patient is suitable, I use conservative volumes. Research supports using a maximum of 1ml across both eyes in a single sitting, and in practice I typically use less, published studies report an average of around 0.45ml per side. I use a cannula rather than a needle for this area. While research shows no statistically significant difference in aesthetic outcomes between the two techniques, the cannula reduces the risk of vascular injury, and that matters more to me than marginal efficiency gains.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Product selection matters too. I choose soft, pliable hyaluronic acid fillers designed for superficial placement. These integrate more naturally with the tissue and are less likely to create visible lumps.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Results from tear trough filler typically last between one and two years, though a recent retrospective study of over 150 patients showed sustained improvement persisting up to 18 months. I review patients at two weeks to assess the result and address any concerns before they become problems.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What to do instead if you are not a candidate</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If I advise against tear trough filler, it does not mean nothing can be done. It means filler is not the right tool. Alternatives depend on the underlying cause of your dark circles:
    </p>

    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· <strong>For skin quality concerns:</strong> <a href="/treatments/profhilo" className="text-gold hover:underline">Profhilo</a> or medical-grade skincare can improve skin texture, hydration, and fine crepiness without adding volume to an area that cannot accommodate it.</li>
      <li>· <strong>For pigmentation:</strong> Targeted skincare ingredients and sun protection address discolouration that filler cannot touch.</li>
      <li>· <strong>For prominent fat pads or true eye bags:</strong> Lower blepharoplasty, surgical removal or repositioning of fat, is the appropriate treatment. I refer to trusted oculoplastic surgeons when this is the case.</li>
      <li>· <strong>For fluid retention:</strong> Addressing sleep, salt intake, allergies, and alcohol consumption often makes a visible difference. These are not glamorous interventions, but they work.</li>
    </ul>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Sometimes the answer is simply accepting that the under-eye area changes with age, and that a slight hollow is normal, healthy, and does not require correction. Not every concern needs a treatment.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A note on safety and regulation</h2>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The tear trough is not an area for casual treatment. England is currently preparing a licensing framework for non-surgical cosmetic procedures, and Scotland has already passed legislation requiring higher-risk procedures to be performed by or alongside healthcare professionals in registered settings. These changes reflect what should already be standard practice: complex treatments performed by qualified practitioners in appropriate clinical environments.
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I am a registered nurse with the NMC, hold an MSc in Advanced Practice, and have treated this area for many years. You can verify my <a href="/about/qualifications" className="text-gold hover:underline">qualifications and registration</a> directly. If you are considering tear trough treatment elsewhere, I would encourage you to ask the same questions: What are their qualifications? What scoring system do they use for candidacy? What is their complication rate? What products do they use, and why?
    </p>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The practitioners who welcome these questions are usually the ones worth trusting.
    </p>

    <div className="bg-white border border-gold/20 rounded-lg p-8 my-10 text-center">
      <h3 className="font-display italic text-h3 text-charcoal mb-3">Not sure if you are a candidate?</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
        I offer consultations specifically to assess suitability for tear trough treatment. There is no obligation to proceed, and if filler is not right for you, I will explain why and discuss what might help instead.
      </p>
      <a href="/contact" className="inline-block bg-gold text-white px-6 py-3 rounded hover:bg-gold/90 transition-colors">
        Book a consultation
      </a>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Related treatments</h2>

    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <a href="/treatments/dermal-filler" className="block bg-white border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
        <h3 className="font-display italic text-h4 text-charcoal mb-2">Dermal filler</h3>
        <p className="text-body text-ink-soft">
          Hyaluronic acid filler for lips, cheeks, jawline, and other areas where volume restoration or enhancement is appropriate.
        </p>
      </a>
      <a href="/treatments/profhilo" className="block bg-white border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
        <h3 className="font-display italic text-h4 text-charcoal mb-2">Profhilo</h3>
        <p className="text-body text-ink-soft">
          Skin quality treatment using injectable hyaluronic acid to hydrate and improve laxity, an alternative when filler volume is not the answer.
        </p>
      </a>
    </div>

  </div>
</section>
      <BookingCTA />
    </article>
  )
}
