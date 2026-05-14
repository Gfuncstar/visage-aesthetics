import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'aqualyx-fat-dissolving-explained',
  title: "AQUALYX fat dissolving: what to expect",
  description: "AQUALYX fat dissolving: what to expect, written by Bernadette Tobin RGN, MSc Advanced Practice. Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Nurse-led clinic in Braintree, Essex.",
  datePublished: '2026-05-13',
  dateModified: '2026-05-13',
  image: '/images/og-home.jpg',
  wordCount: 1995,
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
    <a href="/blog" className="inline-flex items-center text-body text-ink-soft hover:text-charcoal transition-colors mb-6">
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to all articles
    </a>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-body uppercase tracking-wider text-ink-soft mb-4">Fat Dissolving Treatments</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">AQUALYX Fat Dissolving: What to Expect</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed max-w-2xl">
      Fat dissolving injections have become one of the most requested body-contouring treatments in recent years, particularly for addressing a double chin. AQUALYX is the product I use in clinic, and in this post I want to explain exactly how it works, who it suits, what the treatment course looks like, and what results you can realistically expect. If you are considering this treatment, my aim is to give you the clinical detail you need to make an informed decision.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="container mx-auto px-4 max-w-3xl">
    
    <div className="bg-white border border-gold/20 rounded-lg p-6 mb-10">
      <h2 className="font-display italic text-h3 text-charcoal mb-4">The short version</h2>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-0">
        AQUALYX is a fat dissolving injection containing deoxycholic acid, a substance that destroys fat cell membranes. It works best on small, stubborn fat pockets (particularly under the chin) in people with good skin elasticity. Most clients need two to eight sessions spaced four weeks apart. Swelling is expected and can last several days; final results appear over two to three months. The fat cells destroyed do not return, but weight gain can create new fat deposits. This is not a weight-loss treatment and is not suitable for everyone.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How AQUALYX works: the mechanism</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The active ingredient in AQUALYX is a derivatised form of deoxycholic acid. Deoxycholic acid is a secondary bile acid that occurs naturally in the human body, where its job is to emulsify dietary fat in the intestine. When injected directly into subcutaneous fat, it acts as a detergent on the membranes of fat cells (adipocytes), causing those membranes to rupture. This process is called cell lysis, and it releases the stored triglycerides from inside the cell.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Once the fat cells have been destroyed, the body sends macrophages (a type of immune cell) to the area to clear the cellular debris and the released lipids. These lipids are then processed through normal metabolic pathways and eventually excreted. The formulation also includes a slow-release galactose-based polymer system and buffering agents, which help control the rate of action and improve tolerability.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This mechanism means AQUALYX deliberately causes a controlled inflammatory response. That inflammation is not a complication; it is the treatment working. Understanding this helps explain why swelling after treatment is both expected and necessary.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Regulatory status in the UK</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      AQUALYX holds a European CE Mark, which was approved in December 2012. It is classified as a medical device. The CE registration specifically covers use of the solution in a two-step treatment protocol alongside an external ultrasound device, though in practice many UK practitioners use it without ultrasound depending on the treatment area and their training.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      It is worth being clear that AQUALYX is not FDA-approved in the United States. The only fat dissolving injectable with FDA approval is Kybella (also deoxycholic acid), which is licensed specifically for submental fat (the area under the chin). In the UK, AQUALYX is only licensed for use by physicians and nurses trained in the intralipotherapy technique. As a registered nurse with advanced training in this area, I am qualified to administer this treatment, but I would encourage anyone considering fat dissolving injections to verify their practitioner's credentials before booking. You can read more about my qualifications on the <a href="/about/qualifications" className="text-gold hover:text-gold/80 underline">qualifications page</a>.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Who is a good candidate for AQUALYX?</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      AQUALYX is designed to target stubborn localised fat pockets that have not responded to diet and exercise. The most common treatment area is submental fat (the double chin), but it can also be used on other small fat deposits. The key word here is "localised". This is a body-contouring treatment, not a weight-loss solution. If you are significantly overweight, AQUALYX is not the right approach.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Good skin elasticity is essential. When the fat volume reduces, the overlying skin needs to contract and tighten naturally. If there is significant skin laxity, the treatment could leave the skin looking loose or saggy. Generally, this means AQUALYX works best for people between 18 and 60 years old, though age alone is not the deciding factor. I assess skin quality during the consultation and will be honest if I think your skin will not respond well.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      There are specific contraindications that rule out treatment entirely:
    </p>
    
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Known allergy or hypersensitivity to deoxycholic acid or any component of the formulation</li>
      <li>· Active infection or skin disease at or near the proposed injection site</li>
      <li>· Significant liver disease</li>
      <li>· Significant kidney disease</li>
      <li>· Autoimmune diseases affecting connective tissue or fat metabolism</li>
      <li>· Pregnancy or breastfeeding</li>
    </ul>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I also do not treat anyone under 18, and I will not proceed if I feel a client has unrealistic expectations about what the treatment can achieve. During your consultation, I will take a full medical history and assess both the fat deposit and the overlying skin before recommending whether AQUALYX is appropriate for you.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What does the treatment course look like?</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      AQUALYX is not a single-session treatment. Most people require between two and eight sessions to achieve their desired result, with sessions spaced four weeks apart. The number of sessions depends on the size and location of the fat deposit. For a double chin, most clients need one to three treatments. Larger areas such as the hips or thighs may require up to eight sessions.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Each treatment session takes between 30 and 60 minutes, depending on the area being treated. The injections themselves are relatively quick; the time includes preparation, marking, and post-treatment checks. I use a fine needle and inject the solution directly into the fat layer using a specific technique. For submental treatment, this typically involves two to three injection points per session.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I assess progress at each appointment before deciding whether further treatment is needed. Some clients achieve their goals in fewer sessions than expected; others need the full course. I never promise a specific number of sessions at the outset because every client's anatomy and response is different.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Downtime and side effects</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Because AQUALYX works by triggering an inflammatory response, side effects are part of the expected process. Everyone will experience some degree of redness, swelling, and tenderness in the treated area. Some people also develop bruising. These effects are typically much less severe than those associated with surgical alternatives like liposuction, but they are not trivial.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Swelling is the most noticeable effect, particularly when treating under the chin. It is normal for the skin to remain swollen for three to five days after the injection. Some clients find the area feels tender for a few weeks. The swelling can be quite pronounced in the first 48 hours, so if you have an important event or need to be on camera, plan accordingly. Most clients find they can return to work the next day, but you will not look your best immediately after treatment.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      More serious complications are rare but possible. These include infection, nerve damage, allergic reactions, and uneven results. This is why practitioner selection matters. In my clinic, I take a conservative approach: I would rather under-treat and review than over-treat and create problems. If you have any concerns after your treatment, I encourage you to contact me directly.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Realistic results and timeline</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Visible results from AQUALYX typically begin to appear about three to four weeks after treatment. However, the full effects often take two to three months to become fully apparent. This delay is because the body needs time to clear the destroyed fat cells and for the inflammatory response to settle.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      When results do appear, they are considered permanent in the sense that the destroyed fat cells do not regenerate. Once those cells are gone, they are gone. However, the remaining fat cells in the area can still expand if you gain weight. If you put on significant weight after treatment, the fat will reappear. AQUALYX is not a substitute for maintaining a stable, healthy weight through diet and exercise.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I am always honest with clients about what this treatment can and cannot do. If you have a modest fat pocket under your chin and good skin elasticity, AQUALYX can make a meaningful difference to your profile. If you are expecting dramatic change from a single session, or hoping to avoid addressing your overall weight, you will be disappointed. I would rather turn away a client than set them up for an outcome that will not satisfy them.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A note on safety and standards</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The UK aesthetics industry remains largely unregulated. While Scotland has recently passed legislation requiring certain higher-risk procedures to be performed by or alongside healthcare professionals, these requirements will not be enforceable until at least September 2027. In England, the government has confirmed a risk-tiered approach is coming, but the full licensing scheme is still in development with further consultation expected in 2026.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      What this means in practice is that anyone can currently offer fat dissolving injections in England, regardless of their training or background. This is why I always recommend checking that your practitioner is a registered healthcare professional with specific training in the treatment you are considering. You can verify my NMC registration and read about my training on the <a href="/about/qualifications" className="text-gold hover:text-gold/80 underline">qualifications page</a>.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If you would like to discuss whether <a href="/treatments/aqualyx" className="text-gold hover:text-gold/80 underline">AQUALYX</a> is right for you, I offer consultations where we can assess your concerns, examine the area, and talk through realistic expectations. There is no obligation to proceed, and I will give you my honest opinion even if that opinion is that treatment is not appropriate.
    </p>

    <div className="bg-cream border border-gold/30 rounded-lg p-8 my-12 text-center">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Book a consultation</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-6">
        If you are considering fat dissolving treatment and would like to discuss your options, I offer consultations at my clinic in Essex. We will assess your concerns, review your medical history, and I will give you an honest recommendation.
      </p>
      <a href="/contact" className="inline-block bg-gold text-white px-8 py-3 rounded hover:bg-gold/90 transition-colors text-body font-medium">
        Request a consultation
      </a>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Related treatments</h2>
    
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <a href="/treatments/aqualyx" className="block bg-white border border-gold/20 rounded-lg p-6 hover:border-gold/40 transition-colors">
        <h3 className="font-display italic text-h4 text-charcoal mb-2">AQUALYX</h3>
        <p className="text-body text-ink-soft">
          Learn more about fat dissolving injections, including pricing and what to expect during your appointment.
        </p>
      </a>
      <a href="/treatments/profhilo" className="block bg-white border border-gold/20 rounded-lg p-6 hover:border-gold/40 transition-colors">
        <h3 className="font-display italic text-h4 text-charcoal mb-2">Profhilo</h3>
        <p className="text-body text-ink-soft">
          If skin laxity is a concern, Profhilo offers deep hydration and bio-remodelling to improve skin quality and firmness.
        </p>
      </a>
    </div>

  </div>
</section>
      <BookingCTA />
    </article>
  )
}
