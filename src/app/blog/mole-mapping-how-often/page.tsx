import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'mole-mapping-how-often',
  title: "Mole mapping: who needs it, how often, and what the appointment involves",
  description: "Mole mapping: who needs it, how often, and what the appointment involves, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic",
  datePublished: '2026-06-03',
  dateModified: '2026-06-03',
  image: '/images/og-home.jpg',
  wordCount: 1657,
}

const FAQS = [
  {
    "q": "Who actually needs mole mapping?",
    "a": "Mole mapping is most useful for people with around 50 or more moles, atypical or irregular moles, a personal or family history of melanoma, fair sun-damaged skin, or a suppressed immune system. For those outside these groups, a regular self-check using the ABCDE method is usually sufficient."
  },
  {
    "q": "How often should mole mapping be done?",
    "a": "For people in the higher-risk groups, annual review is a sensible baseline. Some risk profiles may be reviewed more often, depending on individual factors discussed at the appointment."
  },
  {
    "q": "What happens during a mole mapping appointment?",
    "a": "A photo documentation system records whole-body images that map the position of every lesion, and close-up dermoscopic images are taken of any mole of concern. The images are stored so they can be compared with new photographs at your next visit to detect any change."
  },
  {
    "q": "Is mole mapping available on the NHS?",
    "a": "The NHS does not offer routine mole mapping to the general public. Dermatology surveillance is usually reserved for patients with a history of dysplastic naevus syndrome or previous melanoma."
  },
  {
    "q": "Does mole mapping use AI to detect skin cancer?",
    "a": "Many modern systems use AI to assist with comparing images over time. However, the clinical decision remains with the practitioner rather than the software."
  },
  {
    "q": "Why is change over time more important than a single mole image?",
    "a": "A single photograph today is not very informative on its own. Compared against the same view six or twelve months later, mapping can reveal subtle evolution in size, shape or colour, as well as new lesions in adults, which is one of the more meaningful warning signs."
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
<section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
  <div className="max-w-3xl mx-auto px-6">
    <Link href="/blog" className="text-sm text-ink-soft hover:text-charcoal">← Back to all articles</Link>
    <span className="hairline hairline-left mb-8 bg-gold block mt-6" />
    <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-4">Skin health</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Mole mapping: who needs it, how often, and what the appointment involves</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Mole mapping is one of those services people either dismiss as overkill or chase too aggressively. The honest answer sits in between. It is a photographic baseline of your skin, compared at follow-up, and it earns its keep in specific risk profiles rather than for the general population. Here is who actually benefits, how often it is sensible, and what happens in the appointment itself.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6">

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The short version</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Mole mapping is a non-invasive way of detecting change in pigmented lesions over time. A specialist system photographs the whole skin surface, captures close-up dermoscopic images of lesions of concern, and stores them so they can be compared at the next visit. It is most useful for people with a lot of moles, atypical moles, a personal or family history of melanoma, fair sun-damaged skin, or a suppressed immune system. For those groups, annual review is a sensible baseline, with some profiles reviewed more often. For everyone else, a good skin self-check and a sensible relationship with the sun will usually do more.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Melanoma cases in the UK are now at a record high. Cancer Research UK reports more than 20,000 melanoma diagnoses in 2022, projected to reach 26,500 a year by 2040, with nearly nine in ten cases linked to UV exposure from the sun and sunbeds. That is the backdrop to any conversation about screening, and it is the reason we offer mapping at the clinic for the people most likely to benefit from it.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What mole mapping actually is</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Digital mole mapping uses a photo documentation system to record the moles on your body. Whole-body images map the position of every lesion. Close-up dermoscopic images can be taken of any mole of concern, capturing structure, pigment network and borders at a level the naked eye cannot see. At your next appointment, the new images are compared with the originals, and any change in size, shape, colour or new lesion appearance can be flagged. Many modern systems use AI to assist that comparison, but the clinical decision still sits with the practitioner.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The point of mapping is not to diagnose a single mole in isolation. The point is change over time. A still photograph today is not very interesting on its own. A still photograph today, set against the same view six or twelve months from now, can reveal subtle evolution that would otherwise be missed, including the appearance of new lesions in adults, which is one of the more meaningful warning signs.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Who genuinely benefits</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The NHS does not offer routine mole mapping to the general public. Dermatology surveillance is typically reserved for patients with a history of dysplastic naevus syndrome or previous melanoma, and primary care is asked to manage stable, benign-looking moles without imaging. That is not because mapping is useless, but because the evidence for benefit concentrates in higher-risk groups. A 2025 evaluation in the British Journal of Dermatology described referral criteria along the lines of three of: a history of melanoma, around 100 or more common moles, at least five atypical moles, or at least two larger acquired moles greater than 8mm.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Research published through PubMed Central found that screening and digital mole mapping showed no significant benefit in low-risk patients, but in high-risk patients tumour thickness at diagnosis decreased. Thinner tumours at diagnosis mean better outcomes. That study supports a risk-adapted approach, with intensified, digitally supported follow-up for those most likely to develop a melanoma.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In practical terms, the people I would actively recommend consider mapping are:
    </p>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Anyone with a large number of moles overall, particularly around 50 or more.</li>
      <li>· Anyone with atypical or irregular moles, especially those larger than 5mm with uneven colour or borders.</li>
      <li>· A personal history of melanoma or non-melanoma skin cancer.</li>
      <li>· A first-degree family history of melanoma.</li>
      <li>· Fair skin, freckling or red hair (skin types I and II) combined with significant lifetime sun exposure or sunbed use.</li>
      <li>· Immunosuppression, including transplant recipients and those living with HIV.</li>
    </ul>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If none of those apply to you, mapping is not wrong, but a careful monthly self-check using the ABCDE method will usually serve you well. If you have not come across it, <Link href="/blog/abcde-mole-check-guide">our guide on when to worry about a mole</Link> walks through what to look for at home.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How often you should be mapped</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      For most higher-risk adults, annual mapping is the sensible baseline. NHS dermatology leaflets describe a range of three months to yearly depending on individual risk, with the frequency decided clinically. If a particular mole is being watched closely, a short-interval review at three to six months can be useful, after which the cadence can stretch back out if everything is stable. If nothing of concern is found and the risk profile is low, repeat imaging may not be needed at all.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In my clinic, six-monthly review tends to be reserved for patients with a personal history of melanoma, atypical mole syndrome, or active immunosuppression. Annual review is the standard for everyone else who meets the high-risk criteria. The honest answer at the end of your first appointment will depend on what we find, not on a pre-decided schedule.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What the appointment looks like</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      NHS patient leaflets put a typical mole mapping appointment at around 30 to 40 minutes, and that is broadly what to expect with us. The visit has three parts: preparation, photography and dermoscopic review.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Preparation is simple but matters. The skin needs to be uncovered so that as many moles as possible can be captured. Please come with no make-up, no fake tan, and ideally no jewellery. Long hair will be tied back. You will be asked to undress to your underwear and to wear similar underwear to any future appointments so that the same areas of skin can be compared like-for-like. Before any images are taken, a consent form is signed for taking and storing medical images.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The photography itself is a sequence of standardised poses, capturing the whole skin surface in defined views. Close-up dermoscopic images are then taken of any moles that look worth a second look, or that you have specifically asked about. Nothing is cut, injected or removed. There is no downtime. You can dress and leave straight after.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The report that follows is the clinical product of the visit. It will describe what was seen, flag anything that needs a closer look, and recommend when, if at all, to return. If something genuinely concerning is found, the next step is referral for assessment and, where indicated, excision and histology. Mapping is a screening and surveillance tool. It is not a substitute for biopsy when a lesion warrants one.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short honesty note on private skin screening</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Private mole checks in Essex and elsewhere vary widely in quality. Some are a five-minute eyeball under a hand lens. Some are a full photographic baseline with structured dermoscopy. Both can be advertised as a "mole check" and that is unhelpful for the public. When you book, ask what is included, who is reviewing the images, what their training is, and what happens if something is found. Our clinical standards and registration details are on our <Link href="/about/qualifications">qualifications page</Link> if you want to read them before you book.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The wider context is also worth mentioning. The UK aesthetics sector remains largely unregulated at the practitioner level, the proposed licensing scheme for England is not yet in force, and a further consultation is expected before legislation. Skin screening sits on the medical side of what we do, and we run it to medical standards regardless of where licensing eventually lands. If you want the broader picture, <Link href="/blog/uk-aesthetics-regulation-2026">our overview of what is changing in 2026</Link> covers it.
    </p>

    <div className="my-12 p-8 bg-cream border border-gold/30 rounded-sm">
      <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-3">Free consultation</p>
      <h3 className="font-display italic text-h3 text-charcoal mb-3">Not sure if mapping is right for you?</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
        A short consultation is the easiest way to find out. We will look at your skin type, mole count, family history and sun exposure, and tell you honestly whether mapping is worth it or whether a sensible self-check is enough. No pressure, no hard sell.
      </p>
      <Link href="/contact" className="inline-block px-6 py-3 bg-charcoal text-cream text-sm uppercase tracking-widest hover:bg-charcoal/90">Book a consultation</Link>
    </div>

    <div className="grid md:grid-cols-2 gap-6 mt-12">
      <Link href="/treatments/map-my-mole" className="block p-6 border border-charcoal/10 hover:border-gold transition">
        <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-2">Treatment</p>
        <h3 className="font-display italic text-h3 text-charcoal mb-2">Map My Mole</h3>
        <p className="text-body text-ink-soft">Photographic baseline and dermoscopic review for higher-risk skin profiles.</p>
      </Link>
      <Link href="/treatments/cryopen" className="block p-6 border border-charcoal/10 hover:border-gold transition">
        <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-2">Treatment</p>
        <h3 className="font-display italic text-h3 text-charcoal mb-2">CryoPen</h3>
        <p className="text-body text-ink-soft">Precise removal of benign skin lesions, skin tags and seborrhoeic keratoses.</p>
      </Link>
    </div>

  </div>
</section>
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
