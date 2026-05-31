import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'abcde-mole-check-guide',
  title: "When to worry about a mole: the ABCDE check",
  description: "When to worry about a mole: the ABCDE check, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Essex.",
  datePublished: '2026-05-31',
  dateModified: '2026-05-31',
  image: '/images/og-home.jpg',
  wordCount: 2181,
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
  <div className="max-w-3xl mx-auto px-4">
    <a href="/blog" className="inline-flex items-center text-sm text-ink-soft hover:text-charcoal transition-colors mb-6">
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to all articles
    </a>
    <span className="hairline hairline-left mb-8 bg-gold" />
    <p className="text-sm uppercase tracking-wider text-ink-soft mb-3">Skin Health</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">When to worry about a mole: the ABCDE check</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Most moles are completely harmless and will remain so for life. But melanoma, the most serious form of skin cancer, often begins in or near an existing mole. Knowing what to look for means you can catch changes early, when treatment is simplest and outcomes are best. The ABCDE criteria give you a structured way to assess any mole that concerns you, and this guide explains each element in the kind of practical detail that actually helps.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-4">

    <div className="bg-white border border-gold/20 rounded-lg p-6 my-8">
      <h2 className="font-display italic text-xl text-charcoal mb-3">The short version</h2>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
        ABCDE stands for Asymmetry, Border, Colour, Diameter, and Evolution. These five features help distinguish a potentially problematic mole from a normal one. No single feature confirms melanoma, but any one of them warrants a professional opinion. Check your own skin once a month, in good light, and consider annual mole mapping for a documented baseline. If something changes or looks different from your other moles, see your GP or a skin specialist promptly. Early detection makes an enormous difference: almost everyone diagnosed with stage 1 melanoma survives five years or more.
      </p>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What a normal mole looks like</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Before you can spot something abnormal, it helps to know what normal looks like. Most people have somewhere between 10 and 40 moles on their body, and the vast majority of these are entirely benign. A typical harmless mole is round or oval, with a smooth, well-defined edge. The colour is usually even, often a single shade of brown, though some normal moles contain more than one shade. They can be flat against the skin or slightly raised, and they may feel smooth or have a slightly rough texture.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Normal moles do change over time, and this is an important point that often causes unnecessary anxiety. A mole that starts flat in your twenties may gradually become raised over the following decades. This slow, predictable evolution is not a warning sign. What concerns clinicians is rapid change, asymmetric change, or a mole that behaves differently from the others on your body.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The ABCDE criteria explained</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The ABCDE framework was developed to give both clinicians and patients a memorable system for evaluating pigmented lesions. It is not a diagnostic tool in itself, but a screening prompt. If a mole scores positively on any of these criteria, it deserves professional assessment.
    </p>

    <h3 className="font-display text-xl text-charcoal mt-8 mb-4">A: Asymmetry</h3>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Imagine drawing a line through the centre of the mole. In a normal mole, the two halves would roughly mirror each other. Asymmetry means one half looks noticeably different from the other, whether in shape, colour, or texture. This does not mean every mole must be perfectly circular. Many benign moles are slightly oval. But if one side appears to be growing differently or has a distinctly different character, that is worth noting.
    </p>

    <h3 className="font-display text-xl text-charcoal mt-8 mb-4">B: Border</h3>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      A normal mole typically has a clear, smooth edge where the pigmented area meets the surrounding skin. Irregular borders, where the edges are blurred, notched, scalloped, or poorly defined, can indicate abnormal cell growth. Some describe this as looking like the mole is "spreading" into the skin around it. If you cannot easily trace where the mole ends and normal skin begins, this is a border irregularity.
    </p>

    <h3 className="font-display text-xl text-charcoal mt-8 mb-4">C: Colour</h3>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      While some normal moles contain more than one shade of brown, concerning colour patterns involve multiple distinctly different colours within the same lesion. This might include various browns, black, red, white, or blue-grey areas. A mole that was previously one colour and develops new shades, or one that looks like a patchwork of different pigments, warrants assessment. Particularly concerning is any area within the mole that has lost pigment entirely, appearing white or skin-coloured.
    </p>

    <h3 className="font-display text-xl text-charcoal mt-8 mb-4">D: Diameter</h3>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The traditional guidance suggests paying attention to moles larger than 6mm across, roughly the size of a pencil eraser. However, this criterion has important limitations. Melanomas can certainly be smaller than 6mm, especially when caught early, which is precisely when we want to catch them. Equally, many people have large moles that are completely harmless. Think of diameter as a prompt to look more carefully rather than a definitive threshold. A large mole with no other concerning features may be perfectly fine. A small mole that is changing rapidly deserves attention regardless of its size.
    </p>

    <h3 className="font-display text-xl text-charcoal mt-8 mb-4">E: Evolution</h3>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This is arguably the most important criterion. A mole that is changing, whether in size, shape, colour, elevation, or any other feature, needs assessment. This includes new symptoms: itching, bleeding, crusting, or a different sensation in or around the mole. As I mentioned earlier, normal moles do evolve very slowly over years. What concerns us is change that happens over weeks or months, or change that you can actually perceive happening in real time.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The ugly duckling sign</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Beyond the formal ABCDE criteria, clinicians often use what is called the "ugly duckling" sign. Most people's moles follow a pattern. They tend to be similar to each other in terms of size, colour, and general appearance. A mole that clearly stands out from this personal pattern, the one that looks nothing like your others, deserves closer scrutiny even if it does not meet all the ABCDE criteria.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      This is why knowing your own skin matters. When you are familiar with your baseline, an outlier becomes obvious. Someone else looking at the same mole in isolation might not recognise it as unusual.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How to do a monthly self-check</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      UK cancer organisations recommend checking your skin once a month. This does not need to be time-consuming, but it should be done systematically and in good light. Natural daylight is ideal. You will need a full-length mirror and a hand mirror to see your back, or a willing partner to help.
    </p>

    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Start with your face, including your ears, and work down methodically.</li>
      <li>· Check your scalp by parting your hair in sections. A hairdryer on a cool setting can help move hair aside.</li>
      <li>· Examine your hands thoroughly, including between fingers and under nails.</li>
      <li>· Use mirrors to check your back, buttocks, and the backs of your legs.</li>
      <li>· Do not forget the soles of your feet and the spaces between your toes.</li>
      <li>· Check areas that rarely see sun as well as exposed skin. Melanoma can occur anywhere.</li>
    </ul>

    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Taking photographs of moles you want to monitor is a practical approach. Use consistent lighting and include something for scale, like a ruler or coin. This gives you an objective record to compare against, which is more reliable than memory.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The role of professional mole mapping</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      There is currently no national screening programme for melanoma in the UK. Research has not shown that population-wide screening clearly outweighs potential harms, so the emphasis remains on individual skin awareness and prompt assessment when changes are noticed. However, for those who want a documented baseline or have multiple moles to track, professional <a href="/treatments/map-my-mole" className="text-charcoal underline hover:text-gold transition-colors">mole mapping</a> offers a structured approach.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      During a mole mapping appointment, high-resolution photographs are taken of your entire skin surface. Individual moles of interest are examined more closely, often using a dermatoscope. This handheld device allows clinicians to see structures beneath the skin surface that are not visible to the naked eye, and research confirms that dermoscopy significantly improves diagnostic accuracy compared with visual examination alone. These images become your baseline, making future changes objectively measurable rather than relying on recollection.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When to seek a professional opinion</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The NHS advises seeing your GP if you develop a new mole or notice a change in an existing mole. This includes moles in less obvious locations: on the soles of your feet, under your nails, or on your scalp. You do not need to wait until a mole ticks every ABCDE box. Any single concerning feature is reason enough for assessment.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In the UK, GPs use a weighted 7-point checklist to decide whether to refer patients urgently. Major features (change in size, irregular shape or border, irregular colour) carry more weight than minor features (diameter of 7mm or more, inflammation, oozing or crusting, change in sensation including itch). A score of 3 or more triggers an urgent referral for assessment within two weeks.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      You do not need to know this checklist in detail. The point is simply that the system is designed to assess suspicious lesions quickly. Do not delay seeing someone because you are unsure whether your concern is "serious enough." Early assessment is exactly what the pathway is designed for.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why early detection matters so much</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The statistics here are genuinely encouraging when melanoma is caught early. Almost everyone diagnosed with stage 1 melanoma, where the cancer is confined to the outer layers of skin, survives five years or more. At stage 2, five-year survival remains around 85%. When melanoma reaches the lymph nodes, this drops considerably. Early detection is not just marginally better; it fundamentally changes outcomes.
    </p>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Recent data from Cancer Research UK shows melanoma cases have reached record levels, with over 20,000 diagnoses in 2022 and projections suggesting this could rise substantially over the coming years. Nearly 9 out of 10 cases are caused by UV radiation from sun exposure and sunbeds, making this largely preventable. But when prevention has not worked, early detection becomes everything.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A note on who books mole checks</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Data from specialist clinics shows a significant gender gap in mole check appointments, with women accounting for roughly two-thirds of bookings and men only one-third. This is concerning given that melanoma outcomes are generally worse in men, partly because of later presentation. If you are a man reading this, or if there is a man in your life who dismisses health concerns, this is worth a direct conversation. The monthly self-check takes minutes. A professional assessment takes less than an hour. Neither is onerous, and both could matter enormously.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
    
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Nothing in this article constitutes a diagnosis or replaces professional medical assessment. The ABCDE criteria are a screening tool, not a definitive test. Plenty of entirely benign moles will have one or more of these features, and occasionally a melanoma will not obviously display any of them. The purpose of knowing these criteria is not to diagnose yourself but to know when to seek expert evaluation. When in doubt, get it checked. The downside of an unnecessary appointment is trivial compared with the downside of a missed diagnosis.
    </p>

    <div className="bg-white border border-gold/20 rounded-lg p-8 my-12 text-center">
      <h3 className="font-display italic text-2xl text-charcoal mb-3">Book a consultation</h3>
      <p className="text-body-lg text-ink-soft mb-6 max-w-xl mx-auto">
        If you have a mole that concerns you, or if you would like to establish a documented baseline through mole mapping, I offer unhurried consultations where we can assess your skin properly and discuss what, if anything, needs to happen next.
      </p>
      <a href="/contact" className="inline-block bg-charcoal text-cream px-8 py-3 rounded hover:bg-gold transition-colors text-sm uppercase tracking-wider">
        Request a consultation
      </a>
    </div>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Related treatments</h2>
    
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <a href="/treatments/map-my-mole" className="block bg-white border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
        <h3 className="font-display italic text-xl text-charcoal mb-2">Map My Mole</h3>
        <p className="text-ink-soft">Full-body mole mapping with dermoscopy and documented photography for ongoing comparison.</p>
      </a>
      <a href="/treatments/cryopen" className="block bg-white border border-gold/20 rounded-lg p-6 hover:border-gold transition-colors">
        <h3 className="font-display italic text-xl text-charcoal mb-2">CryoPen</h3>
        <p className="text-ink-soft">Precise removal of benign skin lesions including skin tags, warts, and age spots using controlled freezing.</p>
      </a>
    </div>

  </div>
</section>
      <BookingCTA />
    </article>
  )
}
