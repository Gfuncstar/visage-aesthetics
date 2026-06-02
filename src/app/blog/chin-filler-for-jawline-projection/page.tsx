import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'chin-filler-for-jawline-projection',
  title: "Chin filler for jawline projection: a small change with big effect",
  description: "Chin filler for jawline projection: a small change with big effect, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Br",
  datePublished: '2026-06-02',
  dateModified: '2026-06-02',
  image: '/images/og-home.jpg',
  wordCount: 1775,
}

const FAQS = [
  {
    "q": "What is chin filler and how does it work?",
    "a": "Chin filler, also called non-surgical chin augmentation, uses hyaluronic acid to improve the projection, shape and side-profile balance of the lower third of the face. In suitable candidates, 1 to 2ml is often enough to redefine the jawline and rebalance the profile."
  },
  {
    "q": "How long does chin filler last?",
    "a": "Results from licensed HA fillers placed in the chin typically last in the region of 12 months. The product is also reversible with hyaluronidase if needed."
  },
  {
    "q": "Can chin filler make my nose look smaller?",
    "a": "Yes, improving chin projection can make the nose look smaller without touching it, because the chin sits at the end of the profile chain alongside the forehead, nose and lips. Bringing the chin forward a few millimetres softens the eyebrow-to-nose-to-chin angle so the nose no longer leads the profile."
  },
  {
    "q": "Is chin filler better than jawline filler for a more defined lower face?",
    "a": "In many cases, treating the chin alone achieves most of what people are looking for when they ask for jawline filler. Improving chin projection lengthens the apparent jawline, sharpens the angle where the jaw meets the neck, and tends to age more gracefully than running filler along the entire mandible."
  },
  {
    "q": "Who is a good candidate for chin filler?",
    "a": "Common reasons to consider chin filler include microgenia, mild retrognathia, a chin that disappears behind the lower lip on profile, a deepening prejowl sulcus, mentalis dimpling, or a blunt lower face after weight loss. A consultation is needed to decide which chin landmarks to address and in what proportion."
  },
  {
    "q": "Does chin filler help with chin dimpling or 'orange peel' texture?",
    "a": "Mentalis dimpling, sometimes described as an orange peel texture when pursing the lips, is often better treated with a few units of anti-wrinkle injection into the mentalis muscle rather than filler. Choosing the right treatment for the specific concern is a key part of the assessment."
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
  <div className="max-w-3xl mx-auto px-5">
    <a href="/blog" className="text-sm text-ink-soft hover:text-charcoal">← Back to all articles</a>
    <span className="hairline hairline-left mb-8 bg-gold block mt-6" />
    <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-4">Dermal filler</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Chin filler for jawline projection: a small change with big effect</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      A well-placed millilitre or two in the chin can quietly rebalance a face in a way that no amount of lip or cheek filler ever will. It is one of the most underused treatments in UK aesthetics, and one of the most misunderstood. In this piece I want to explain why I reach for chin filler so often, who it suits, and where the trend for a "snatched" jawline goes wrong.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-5">

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The short version</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Chin filler, sometimes called non-surgical chin augmentation, uses hyaluronic acid (HA) to improve the projection, shape and side-profile balance of the lower third of the face. In the right candidate, 1 to 2ml is often enough to make the jawline look more defined, the neck look longer, and (surprisingly to most people) the nose look smaller, without anyone touching the nose. Results from licensed HA fillers in the chin typically last in the region of 12 months, and the product is reversible with hyaluronidase if needed.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why the chin matters more than people think</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      When I assess a face for the first time, I spend almost as much time looking at the side profile as I do the front. The chin sits at the end of a chain: forehead, nose, lips, chin. If one link is short or set back, every other feature looks larger by comparison. The classic example is a person who has always disliked their nose. They look in the mirror straight on and see "a big nose". They turn to the side and the nose still looks big, but very often what is actually out of balance is the chin sitting behind the lower lip.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      There is a measurable relationship behind this. Practitioners often assess profile using the line from eyebrow to nose tip to chin, which ideally falls somewhere around 165 to 175 degrees. Bring the chin forward a few millimetres and that angle softens. The nose has not changed at all, but it no longer leads the profile. It is one of the most satisfying results I do, and patients often come back two weeks later saying friends have asked if they have lost weight, had their hair done, or had something done to their nose. Almost never do they guess it was the chin.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What we are actually correcting</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Chin filler is not a one-size treatment. The chin has three landmarks that matter: the pogonion (the most forward point), the menton (the lowest point, which sets vertical height), and the paragonion on either side (which sets width). A good consultation starts with deciding which of these need addressing, and in what proportion.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Common reasons clients come to me for chin work include:
    </p>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· Microgenia, where the chin is genuinely under-developed and looks small from every angle</li>
      <li>· Mild retrognathia, where the chin sits behind the cheeks on profile</li>
      <li>· A chin that disappears behind the lower lip when viewed from the side</li>
      <li>· A deepening prejowl sulcus, the small dip between the chin and the start of the jowl</li>
      <li>· Mentalis dimpling, the "orange peel" texture some people get when they purse their lips</li>
      <li>· A blunt or shortening lower face after weight loss</li>
    </ul>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Each of those needs a different plan. A retruded chin usually wants a small, firm bolus placed deep on the bone at the pogonion to push the soft tissue forward. A prejowl sulcus is better treated with a softer product, often laid down with a cannula, to smooth the transition into the jawline. Mentalis dimpling is sometimes better treated with a few units of anti-wrinkle injection into the mentalis muscle rather than filler at all. Knowing which tool to pick up is most of the job.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How chin filler changes the jawline without filling the jawline</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      A lot of people walk in asking for "jawline filler" because they have seen it on social media. What they usually mean is they want a more defined lower face. In many cases, you can achieve most of that effect by treating the chin alone. Improving chin projection lengthens the apparent jawline, sharpens the angle where the jaw meets the neck on the side view, and reduces the look of a soft submental area. It is a much smaller intervention than running filler along the entire mandible, and it tends to age more gracefully.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      For clients whose concern is actually a heavy or square lower face from clenching, the better answer is often masseter anti-wrinkle injections rather than more filler. I have written about that separately in <Link href="/blog/masseter-botox-jawline-slimming">masseter Botox for jawline slimming, bruxism and TMJ relief</Link>, and it is worth reading if you are not sure which camp you fall into. Adding volume to a face that is already wide is the most common mistake I see corrected in my dissolving appointments.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Candidate selection: who this suits, and who it does not</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Chin filler suits people whose chin is the limiting feature of their profile. That is genuinely most adults if you look closely enough, but only some of them will benefit enough to make treatment worthwhile. In my clinic the best results tend to come from clients in their late twenties to early fifties with reasonable skin quality, no significant jowling, and a chin that is short either forward or vertically.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      It suits men and women differently. A female chin generally looks balanced when its width is roughly the same as the distance between the inner corners of the eyes, with a soft taper. A male chin can carry more width and a squarer outline. This is why I am cautious when a female client brings in a reference photo of a very square, "snatched" jawline. Over-filling the paragonion can masculinise a face and, with repeated treatment, can actually reverse the natural triangle of youth, making the lower face heavier than the upper. That is a hard pattern to reverse without dissolving and starting again.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Chin filler is not suitable for under-18s in England under any circumstances for cosmetic purposes. It is also not the right starting point for someone with significant skeletal retrognathia, where an orthodontic or maxillofacial opinion is more appropriate than filler. Part of an honest consultation is being willing to say so.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">How long it lasts, and what to expect</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      HA fillers used for chin augmentation are designed to be firm enough to project tissue but soft enough to feel natural. Clinical studies of HA chin augmentation report most of the improvement is retained at six months, with partial improvement still present at twelve months in the majority of patients. Manufacturer data for products specifically indicated for chin projection supports results lasting up to around a year with optimal treatment. In practice I tell clients to expect a top-up somewhere between twelve and eighteen months, depending on their metabolism, how much movement is in the area, and how much product was used initially.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      On the day, expect a small amount of swelling and occasional bruising at the injection points. The chin tolerates treatment well because the bone is close to the surface and the technique is relatively quick. I review every chin filler client at two weeks before deciding whether anything else is needed. If you want a sense of what good aftercare looks like across filler treatments more broadly, the principles in <Link href="/blog/lip-filler-aftercare-guide">our lip filler aftercare guide</Link> apply here too.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Dermal fillers in the UK are not currently prescription-only medicines, which means the legal bar to inject them is far lower than it should be. This is changing: a licensing scheme is being developed, and the Department of Health has confirmed a further public consultation on the highest-risk procedures. In the meantime, the responsibility falls on you to choose carefully. Ask who is injecting, what their clinical registration is, what product is being used, and what their plan is if something goes wrong. I have written more about this in <Link href="/blog/uk-aesthetics-regulation-2026">UK aesthetics regulation in 2026</Link>, and the <Link href="/blog/consultation-questions-to-ask">ten questions to ask at any aesthetics consultation</Link> is a useful checklist to take with you.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      One genuine advantage of HA filler over a chin implant is that it is reversible. If you do not like the result, or if a complication occurs, hyaluronidase can dissolve it. A chin implant cannot be undone without surgery. That reversibility is also why I prefer to under-treat at the first appointment and add at review, rather than the other way round.
    </p>

    <div className="my-10 p-6 md:p-8 bg-cream border border-gold/30 rounded">
      <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-3">Not sure if your chin is the issue</p>
      <h3 className="font-display italic text-h3 text-charcoal mb-3">Book a free, no-pressure consultation</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
        I will assess your profile properly in lateral view, talk through whether chin filler is genuinely the right answer, and tell you honestly if it is not. There is no obligation to book treatment on the day.
      </p>
      <a href="/contact" className="inline-block px-6 py-3 bg-charcoal text-cream text-sm tracking-wide uppercase">Request a consultation</a>
    </div>

    <div className="grid md:grid-cols-2 gap-6 mt-10">
      <a href="/treatments/dermal-filler" className="block p-6 border border-charcoal/15 hover:border-gold transition">
        <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-2">Treatment</p>
        <h3 className="font-display italic text-h3 text-charcoal mb-2">Dermal filler</h3>
        <p className="text-body text-ink-soft">Chin, cheeks, lips and jawline contouring with reversible hyaluronic acid.</p>
      </a>
      <a href="/treatments/mens-aesthetics" className="block p-6 border border-charcoal/15 hover:border-gold transition">
        <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-2">Treatment</p>
        <h3 className="font-display italic text-h3 text-charcoal mb-2">Men's aesthetics</h3>
        <p className="text-body text-ink-soft">Jaw, chin and profile work tailored to a stronger, more masculine lower third.</p>
      </a>
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
