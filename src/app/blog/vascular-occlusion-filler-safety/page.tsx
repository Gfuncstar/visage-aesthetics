import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'vascular-occlusion-filler-safety',
  title: "Vascular occlusion: the rare but serious filler complication",
  description: "Vascular occlusion: the rare but serious filler complication, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintre",
  datePublished: '2026-06-04',
  dateModified: '2026-06-04',
  image: '/images/og-home.jpg',
  wordCount: 1792,
}

const FAQS = [
  {
    "q": "What is vascular occlusion from dermal filler?",
    "a": "Vascular occlusion is when filler blocks a blood vessel, either by being injected directly into an artery or by compressing one from outside. This cuts off blood supply to the tissue downstream, which can begin to die if flow is not restored."
  },
  {
    "q": "How common is vascular occlusion with filler?",
    "a": "The estimated incidence is roughly 1 in 100,000 treatments, so it is rare. However, when it does happen the window to act is short, which is why preparation matters more than the odds."
  },
  {
    "q": "Which areas of the face carry the highest risk?",
    "a": "The glabella between the brows and the nose are the classic high-risk zones because they have limited collateral blood flow. The tear trough, nasolabial fold and temples also carry meaningful risk."
  },
  {
    "q": "What is hyaluronidase and why must a clinic have it?",
    "a": "Hyaluronidase is a prescription-only enzyme that dissolves hyaluronic acid filler, and it is the rescue treatment for an occlusion. It must be on the premises before any HA filler is injected, with a prescriber on site or immediately reachable, so that flow can be restored quickly."
  },
  {
    "q": "What should I ask a clinic before booking filler?",
    "a": "Ask whether hyaluronidase is stocked on site, whether there is a written protocol for managing vascular complications, and whether the clinician is trained to use both. If the clinic cannot show you the protocol when you ask, that is your answer."
  },
  {
    "q": "Can vascular occlusion cause blindness or a stroke?",
    "a": "In rare cases filler can travel through the vascular tree to the retinal artery, causing sudden vision loss, or to branches supplying the brain, causing stroke-like events. Cutaneous skin ischaemia is far more common and, treated early, usually resolves, whereas ocular and neurological events more often leave permanent damage."
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
    <p className="eyebrow text-sm uppercase tracking-widest text-ink-soft mb-4">Filler safety</p>
    <h1 className="font-display italic text-h1 text-charcoal mb-6">Vascular occlusion: the rare but serious filler complication</h1>
    <p className="text-body-lg text-ink-soft leading-relaxed">
      Vascular occlusion is the complication every filler client should know exists, and every injector should be ready for. It is rare, but it is the reason hyaluronidase must be on the premises before a single drop of filler goes into your face. Here is what it is, how it presents, and the one question that should decide where you book.
    </p>
  </div>
</section>

<section className="pb-6 md:pb-10">
  <div className="max-w-3xl mx-auto px-6">

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The short version</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Vascular occlusion happens when filler either enters a blood vessel or compresses one from outside, cutting off blood supply to the tissue downstream. Estimated incidence is roughly 1 in 100,000 treatments. It is uncommon, but when it does happen the window to act is short. The treatment is hyaluronidase, a prescription-only enzyme that dissolves hyaluronic acid filler. If the clinic you are sitting in does not have hyaluronidase, a written protocol, and a clinician who knows how to use both, you should not be having filler there. That is the headline.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      I am writing this not to scare anyone away from filler. I inject it most days. I am writing it because the most important conversation about safety happens before the needle is ever uncapped, and most clients never know to have it.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What vascular occlusion actually is</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In plain language, vascular occlusion (sometimes shortened to VO) is filler blocking a blood vessel. It happens in one of two ways. Either the needle or cannula enters an artery and filler is deposited directly inside the vessel, or filler placed alongside a vessel exerts enough external pressure to compress it. Either way, blood stops reaching the tissue that vessel was feeding. Without blood, that tissue starts to die.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The face is a difficult map. Arteries do not sit in tidy, predictable places, and they branch and anastomose in ways that vary from person to person. Some areas are higher risk than others because they have limited collateral blood flow, meaning if the main supply is blocked there is no easy back-up route. The glabella (between the brows) and the nose are the classic high-risk zones. The tear trough, nasolabial fold and temples also carry meaningful risk.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      In the worst cases, filler can travel through the vascular tree and reach the retinal artery, causing sudden vision loss, or branches supplying the brain, causing stroke-like events. A UK consensus guideline on filler-induced vision loss was published in <em>Eye</em> in April 2026, which tells you this is not a theoretical worry the field has stopped thinking about. Cutaneous (skin) ischaemia is by far the most common pattern and, treated early and properly, usually resolves. Ocular and neurological events are rarer but far more often leave permanent damage.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">Why hyaluronidase has to be on the premises</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Hyaluronidase is an enzyme that breaks down hyaluronic acid. Almost every modern dermal filler used for lips, cheeks, chin, jaw, tear trough and nose is hyaluronic acid based, which means it is, in principle, reversible. Hyaluronidase is the reversal. In an occlusion, it is also the rescue: high-dose, pulsed infiltration of hyaluronidase across the ischaemic area can dissolve the obstruction and restore flow before the tissue is lost.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Two things follow from that. The first is that hyaluronidase is a prescription-only medicine in the UK. It cannot be bought casually. It has to be prescribed by an appropriate clinician, and since the Nursing and Midwifery Council brought in its face-to-face prescribing rule on 1 June 2025, nurse and midwife prescribers must see patients in person before prescribing aesthetic medicines, including emergency kit items. That has changed how clinics stock and supply it.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The second is that hyaluronidase has to be already in the building, with the prescriber on site or immediately reachable, before any HA filler is injected. Posting it overnight from somewhere else is not a plan. Sending the patient to A&amp;E with no enzyme on board is not a plan. The published consensus is unambiguous: a clear written protocol for managing vascular complications must be in place before treatment begins, whether the injector is medical or non-medical. If your injector cannot show you that protocol when you ask, that is your answer.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The early signs, in the order they tend to appear</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Most occlusions declare themselves on the treatment couch or within the first hour. The pattern is reasonably consistent, and any injector should know it by heart.
    </p>
    <ul className="space-y-2 mb-6 text-body-lg text-ink-soft">
      <li>· <strong>Immediate blanching.</strong> The skin over the affected area turns white as blood is pushed out and not replaced. This can be subtle and is easier to see against natural skin tone than against fresh erythema from the needle.</li>
      <li>· <strong>Pain that does not fit the procedure.</strong> Filler should not really hurt once the local has settled. Disproportionate, persistent or worsening pain after injection is a red flag and not something to push through.</li>
      <li>· <strong>Slow capillary refill.</strong> Press the skin, lift off, and watch how quickly the colour returns. Healthy skin refills in about a second. Ischaemic skin refills slowly or sluggishly.</li>
      <li>· <strong>Mottled, dusky or livedo-pattern skin.</strong> A net-like purplish discolouration (livedo reticularis) appearing across the territory of an artery is classic. So is a grey-blue or dusky colour replacing the initial blanch.</li>
      <li>· <strong>Progressive worsening rather than settling.</strong> Normal post-injection redness fades. Ischaemia does not. If it is getting worse hour by hour, treat it as an occlusion until proven otherwise.</li>
    </ul>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Vision changes, severe headache, drooping of the face or weakness on one side are the symptoms that take this from a clinic problem to an emergency department problem, immediately.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">What a clinician should do in the first 60 minutes</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Speed matters more than perfection. The current ACE Group and CMAC guidance is built around high-dose pulsed hyaluronidase: infiltrate generously across the entire ischaemic field, not just at the original injection site, and repeat hourly until reperfusion is achieved. That means warm pink skin, brisk capillary refill, and relief of pain. In a single episode the total dose can run into hundreds, sometimes more than a thousand, units. This is not the time for cautious dosing.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Alongside the enzyme, a competent clinician will stop the procedure, apply warm compresses to encourage vasodilation, massage the area to break up the bolus, and consider aspirin to reduce platelet aggregation if there is no contraindication. They will photograph the area, document times and doses, and arrange close follow-up over the next 24 to 72 hours. If there is any suggestion of visual disturbance, transfer to ophthalmology is immediate; the retinal ischaemia window is very short.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      None of this can happen if the kit, the drug and the trained hands are not all in the same room. That is the whole argument.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">The one question to ask at any filler consultation</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      If you take nothing else from this piece, take this. At your consultation, before you discuss volume or product or price, ask:
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      <em>"Do you have hyaluronidase on the premises today, who prescribed it, and can I see your vascular occlusion protocol?"</em>
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      A safe clinic will answer all three parts without flinching. A competent injector will be pleased you asked. If the answer is vague, defensive, or some version of "we don't usually need it", you have learned everything you came to learn. Walk out. The aesthetics industry in the UK is still only partly regulated. Scotland passed legislation in April 2026 to bring higher-risk non-surgical procedures into a registered, healthcare-led setting, with businesses given until at least September 2027 to comply. England is consulting on licensing. Until that catches up, the burden of due diligence sits with the client.
    </p>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      The same logic applies to other questions worth asking, which I have written about in <Link href="/blog/consultation-questions-to-ask" className="underline">ten questions to ask at any aesthetics consultation</Link>. And if you are weighing up where to have filler in the first place, <Link href="/blog/natural-looking-aesthetics-essex" className="underline">how to find a natural-looking aesthetics clinic in Essex</Link> covers the wider checklist.
    </p>

    <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short safety note</h2>
    <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
      Filler is a medical procedure. Hyaluronic acid filler is reversible with hyaluronidase, which is one of the genuinely reassuring features of the category, but reversibility only matters if the reversal agent is to hand. At Visage Aesthetics, hyaluronidase is stocked and prescribed in line with current NMC and JCCP guidance, every filler treatment has a documented complications protocol, and I do not inject any HA product I am not equipped to dissolve. My NMC registration and clinical credentials are on the <Link href="/about/qualifications" className="underline">qualifications page</Link> if you would like to read them before you book.
    </p>

    <div className="my-10 p-8 bg-cream border border-gold/30 rounded-sm">
      <h3 className="font-display italic text-h3 text-charcoal mb-4">Book a free consultation</h3>
      <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
        If you are considering filler, or you have had filler elsewhere and want a second opinion, come in for a consultation. There is no charge and no pressure to book treatment on the day. We will talk through what you are hoping to change, what is sensible, and what the safety protocol around it looks like.
      </p>
      <Link href="/contact" className="inline-block px-6 py-3 bg-charcoal text-cream hover:bg-gold transition-colors">Arrange a consultation</Link>
    </div>

    <div className="grid md:grid-cols-2 gap-6 mt-12">
      <Link href="/about/qualifications" className="block p-6 border border-charcoal/15 hover:border-gold transition-colors">
        <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-2">About</p>
        <h3 className="font-display italic text-h3 text-charcoal mb-2">Bernadette's qualifications</h3>
        <p className="text-body text-ink-soft">NMC registration, MSc Advanced Practice, prescribing rights and clinical experience.</p>
      </Link>
      <Link href="/treatments/dermal-filler" className="block p-6 border border-charcoal/15 hover:border-gold transition-colors">
        <p className="eyebrow text-xs uppercase tracking-widest text-ink-soft mb-2">Treatment</p>
        <h3 className="font-display italic text-h3 text-charcoal mb-2">Dermal filler at Visage</h3>
        <p className="text-body text-ink-soft">How we plan, place and review HA filler, with full reversibility built into the protocol.</p>
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
