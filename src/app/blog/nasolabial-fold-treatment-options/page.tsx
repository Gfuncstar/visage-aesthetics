import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'nasolabial-fold-treatment-options',
  title: "Nasolabial folds: filler is rarely the right first step",
  description: "Nasolabial folds: filler is rarely the right first step, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Es",
  datePublished: '2026-06-05',
  dateModified: '2026-06-05',
  image: '/images/og-home.jpg',
  wordCount: 1847,
}

const FAQS = [
  {
    "q": "What causes nasolabial folds to deepen with age?",
    "a": "Nasolabial folds deepen mainly because of mid-face volume loss rather than a problem with the line itself. Facial fat begins to atrophy from around the age of 30, the deep cheek fat pads thin, ligaments loosen and the cheek tissue slides forward and down, which makes the fold below appear more pronounced."
  },
  {
    "q": "Is filler the best treatment for nasolabial folds?",
    "a": "In most cases, no. Injecting filler directly into the fold often makes the face look puffier rather than younger, because it adds volume to the lower edge of a problem caused by sagging from above. The first conversation in clinic is usually about supporting the cheek, improving skin quality, or doing nothing at all."
  },
  {
    "q": "Is filler in the nasolabial fold dangerous?",
    "a": "The medial part of the face, which includes the nasolabial area, has a denser and more variable arterial supply than the lateral cheek. Peer-reviewed analysis confirms a higher risk of tissue necrosis in this region, and vision loss, while rare, has been reported."
  },
  {
    "q": "How does cheek filler improve smile lines without injecting the fold?",
    "a": "When the cheek is restored to where it used to sit, the fold lifts with it. Studies on mid-face hyaluronic acid placement and thread lifting show measurable improvement in nasolabial fold severity without anything being injected into the fold itself."
  },
  {
    "q": "Is hyaluronic acid filler reversible if I do not like the result?",
    "a": "Yes, HA filler can be dissolved with hyaluronidase if anything looks off, which is part of why it is used for mid-face support. Hybrid products such as HarmonyCa contain a collagen-stimulating component and are not reversible in the same way, so patient selection matters."
  },
  {
    "q": "Why might my face look heavier after nasolabial filler?",
    "a": "Filling the crease adds volume to the lower edge of a fold that is being caused by sagging tissue above. The line may look softer briefly, but the face often reads as fuller in the wrong place, and the mouth can start to look heavy."
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
<div className="max-w-3xl mx-auto px-4">
<a href="/blog" className="text-sm text-ink-soft hover:text-charcoal">← Back to all articles</a>
<span className="hairline hairline-left mb-8 bg-gold mt-6 block" />
<p className="eyebrow text-gold uppercase tracking-widest text-sm mb-4">Face anatomy, honestly</p>
<h1 className="font-display italic text-h1 text-charcoal mb-6">Nasolabial folds: filler is rarely the right first step</h1>
<p className="text-body-lg text-ink-soft leading-relaxed">Almost every week, someone sits in my consultation room, points at the line running from the side of their nose to the corner of their mouth, and asks me to fill it. In most cases, my answer is no. Not because filler is wrong as a category, but because the fold itself is rarely the thing causing the fold.</p>
</div>
</section>

<section className="pb-6 md:pb-10">
<div className="max-w-3xl mx-auto px-4">

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The short version</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">Nasolabial folds, the lines that some people call smile lines, are usually a symptom of mid-face volume loss, not a problem with the line itself. The cheek descends a little each year, the soft tissue above the fold gets heavier, and a crease forms where the lighter upper lip meets the heavier cheek. Injecting filler straight into that crease often makes the face look puffier, not younger, and carries one of the higher vascular risk profiles on the face. In my clinic, the first conversation is almost always about supporting the cheek, improving skin quality, or doing nothing at all.</p>

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why the fold forms in the first place</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">The nasolabial fold is an anatomical feature, not a wrinkle. Even babies have a faint version of it. What changes with age is the contrast between the cheek above and the upper lip below. Facial fat begins to atrophy from around the age of 30, at roughly one per cent per year, and the deep fat pads of the mid-face are some of the first to thin. Bone resorbs slowly underneath them, ligaments loosen, and the cheek tissue slides forward and down. The fold deepens because something above it has shifted, not because the fold itself has grown.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">Once you understand this, the standard "let's plump the line" approach starts to look very strange. You are adding volume to the lower edge of a problem that is being caused by sagging from the upper edge. The line might look softer for a few weeks, but the face often reads as fuller in the wrong place, and the mouth can start to look heavy or simian. Clients sometimes tell me they look less like themselves after this kind of treatment, and they are usually right.</p>

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What actually helps: supporting the cheek</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">The clinical evidence on this is reasonably consistent. Studies comparing cheek-lifting techniques, whether with hyaluronic acid placed in the mid-face or with thread lifting, show measurable improvement in nasolabial fold severity without anything being injected into the fold itself. In other words, when you put the cheek back where it used to sit, the fold lifts with it.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">In practice, this means a careful assessment of where the cheek has lost projection, often quite high up near the cheekbone, and small, restrained placements of filler to restore structural support. This is HA filler, so it is reversible with hyaluronidase if anything looks off. The aim is not to "fill" the face. The aim is to put back the support that has thinned, so the lower face stops being dragged down. Done well, you should not be able to see where I have worked. Friends might say you look rested.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">For some clients, particularly those who also have early laxity along the jawline, a hybrid product like HarmonyCa, which combines HA with a collagen-stimulating component, can be appropriate. I have written more on that in <a href="/blog/harmonyca-vs-traditional-filler" className="underline">HarmonyCa vs traditional dermal filler</a>. It is not a first choice for everyone, and it is not reversible in the same way pure HA is, so it needs careful patient selection.</p>

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why I am cautious about filler directly into the fold</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">There are two reasons I avoid filling the nasolabial fold directly in most cases. One is aesthetic. The other is safety.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">The aesthetic reason is the one I have already covered: it tends to look heavier rather than younger, and it does not address the cause. The safety reason is more serious. The medial part of the face, which includes the nasolabial fold area, has a denser and more variable arterial supply than the lateral cheek. Peer-reviewed analysis of vascular events confirms that the medial facial region carries a higher risk of tissue necrosis than the lateral region. Vision loss, while rare, has been reported. This is why I have written separately on <a href="/blog/vascular-occlusion-filler-safety" className="underline">vascular occlusion as a filler complication</a>: it is the conversation every injector should be having with every client, and most are not.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">If filler in the fold is going to happen, it should be done by someone who understands the local anatomy, uses a cannula where appropriate, aspirates, and has hyaluronidase on the premises with a clear emergency protocol. In a properly run clinic, this is the bare minimum. In an unregulated industry, it often is not.</p>

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What about Botox for nasolabial folds?</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">This is a question I get often. The honest answer is that Botox is not injected into the nasolabial fold itself. Anyone who tells you otherwise has misunderstood the anatomy.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">What can be done is a small dose of botulinum toxin into the levator labii superioris alaeque nasi, a muscle that lifts the upper lip and contributes to the upper part of the fold during animation. In carefully chosen patients with a dynamic component to their fold, this can soften the upper third of the line slightly. But the trade-off is real: weakening this muscle changes how the smile looks. Some clients find their smile feels less sincere, or their upper lip lifts asymmetrically. For most people, I do not recommend it. The risk to the character of the smile is, in my view, too high for too modest a benefit.</p>

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When a skin booster like Profhilo is the right answer</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">Profhilo sits in a different category from filler. It is a stabilised hyaluronic acid bio-remodeller, made without the chemical cross-linking used in dermal filler, and it works by spreading through the tissue and stimulating fibroblast activity, encouraging the skin to make more of its own collagen and elastin. It is not a volumiser. It cannot rebuild a cheek that has descended, and it cannot lift a fold caused by structural loss.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">What it can do, in the right person, is improve the quality and elasticity of the skin around the mid and lower face, so the fold reads as softer and the skin looks healthier overall. It is most useful when:</p>

<ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
<li>· The fold is mild and the main issue is crepiness or dullness in the surrounding skin.</li>
<li>· A client has had good structural work in the past and now wants to maintain skin quality.</li>
<li>· A client is in their late twenties or early thirties and wants a sensible, preventative-feeling option rather than filler.</li>
<li>· There are medical reasons to avoid more invasive treatment.</li>
</ul>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">The standard protocol is two sessions, four weeks apart, using a fixed set of injection points on each side of the face. There is more detail in <a href="/blog/profhilo-treatment-guide" className="underline">my no-nonsense Profhilo guide</a>, including who it does not suit. Profhilo is not a substitute for cheek support when cheek support is what the face needs. I have seen people spend several rounds on bio-remodellers hoping a structural problem will resolve, and it does not.</p>

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">When the right answer is nothing</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">There is a version of this conversation I have several times a month. Someone in their early thirties, with healthy skin and a perfectly normal anatomical fold, has been looking at themselves on a front-facing phone camera and decided the line needs treating. It does not. A mild nasolabial fold is part of a face that has expressed emotion. Removing it entirely makes people look strangely flat, and the treatment cycle becomes self-perpetuating.</p>

<p className="text-body-lg text-ink-soft leading-relaxed mb-5">My advice in those consultations is usually a good skincare routine, sun protection, and a six or twelve month review if they would still like one. No treatment. No deposit taken. This is the part of the job I take most seriously, and it is also the part that the wider industry tends to skip, because nothing was sold. With Scotland having passed legislation on higher-risk non-surgical procedures and an English consultation on the highest-risk tier due in early 2026, I would expect this kind of restraint to become more, not less, of an expectation. There is more on the regulatory picture in <a href="/blog/uk-aesthetics-regulation-2026" className="underline">my piece on what is actually changing in 2026</a>.</p>

<h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">Every injectable treatment on the face carries some risk. HA fillers are reversible with hyaluronidase, which is one of the reasons I prefer them over permanent or semi-permanent products in this area. Botulinum toxin metabolises naturally over a few months. The mid-face is a vascular region, and the nasolabial area in particular has anatomical variation that demands a careful, slow technique. If you are considering any of this, ask your practitioner about their training, their complication protocol, and what is in the room if something goes wrong. <a href="/blog/consultation-questions-to-ask" className="underline">My list of ten questions to ask at any consultation</a> is a reasonable starting point.</p>

<div className="bg-white border border-gold/30 rounded-lg p-8 my-12">
<h3 className="font-display italic text-h3 text-charcoal mb-3">A free, no-pressure consultation</h3>
<p className="text-body-lg text-ink-soft leading-relaxed mb-5">If you are unsure whether your nasolabial folds need treatment at all, that is exactly the kind of question I am happy to answer in person. Consultations at Visage Aesthetics are complimentary, unhurried, and you will not be sold anything you do not need. You can <a href="/contact" className="underline">book a consultation here</a>, or read more about <a href="/about/qualifications" className="underline">my clinical background and NMC registration</a> first.</p>
</div>

<div className="grid md:grid-cols-2 gap-6 mt-10">
<a href="/treatments/dermal-filler" className="block border border-gold/30 rounded-lg p-6 hover:bg-white transition">
<p className="eyebrow text-gold uppercase tracking-widest text-xs mb-2">Treatment</p>
<h3 className="font-display italic text-h3 text-charcoal mb-2">Dermal filler</h3>
<p className="text-ink-soft">Structural support for the mid-face, used conservatively and only where it is genuinely indicated.</p>
</a>
<a href="/treatments/profhilo" className="block border border-gold/30 rounded-lg p-6 hover:bg-white transition">
<p className="eyebrow text-gold uppercase tracking-widest text-xs mb-2">Treatment</p>
<h3 className="font-display italic text-h3 text-charcoal mb-2">Profhilo</h3>
<p className="text-ink-soft">A bio-remodeller for skin quality, used where the issue is texture and elasticity rather than volume.</p>
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
