import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/anti-wrinkle-injections' },
  title: 'Anti-Wrinkle Injections (Botox) Braintree | Visage Aesthetics',
  description:
    'Officially awarded nurse-led anti-wrinkle injections in Braintree, Essex. Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Naturally subtle results, full expression preserved. From £120.',
}

export default function Page() {
  const treatment = getTreatment('anti-wrinkle-injections')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Soften lines around the forehead, brow and eyes, without losing your expression. Performed by a registered nurse with twenty years' clinical experience."
      overview="Anti-wrinkle injections, commonly called Botox, use small, precise doses of botulinum toxin to relax the muscles that create dynamic lines on the forehead, between the brows, and around the eyes. The treatment doesn't fill, plump or change your face. It quietly relaxes the muscles that have been pulling at your skin every time you frown, squint or raise your brows. Treated well, you still look like yourself, just smoother and a little less tired. Treated badly, overdosed, placed too widely, performed by someone treating every face the same way, you get the frozen look that gives the whole field a bad reputation. The difference is entirely in the practitioner's hands. The appointment itself takes 10 to 15 minutes, uses very fine needles, and most clients describe it as a brief pinch rather than pain. There are no needles to fear, no downtime to plan around, and you can drive yourself home afterwards. Results begin to appear from day three and settle by day fourteen, that's when we book you in for a complimentary review to fine-tune anything that has come up uneven. Most clients return every three to four months to maintain results, and many start in their late twenties or early thirties as a preventative measure rather than waiting for deep static lines to set in. I have performed anti-wrinkle injections at Visage Aesthetics for years, and the clinic was named Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards) for exactly this kind of conservative, medically-led work. The approach is the same regardless of who walks in: less is more, you should still look like you, and the muscles still need to do their job."
      benefits={[
        'Softens forehead lines, frown lines (the "11s") and crow’s feet.',
        'Subtle, natural results with full expression preserved, no frozen look.',
        'No downtime, return to work, drive home, carry on with your day.',
        'Quick 10 to 15 minute appointment, fine needles, surprisingly comfortable.',
        'Results visible from day 3, fully settled by day 14, last 3 to 4 months.',
        'Suitable as a preventative treatment from your late twenties or early thirties.',
        'Also licensed for hyperhidrosis (excessive sweating), bruxism (jaw clenching) and chronic migraine prevention.',
        'Complimentary two-week review included to fine-tune any unevenness.',
        'Performed by an NMC-registered nurse with MSc Advanced Practice (Level 7).',
      ]}
      suitableFor={[
        'Adults aged 25 and over with moderate to severe dynamic wrinkles.',
        'Anyone wanting a preventative approach to early lines.',
        'Clients who have tried skincare and want a small, considered clinical step further.',
        'Men and women looking for natural, refreshed results rather than a frozen look.',
        'People with strong frown lines that make them look tired or cross even when relaxed.',
        'Clients with crow’s feet that have started becoming visible at rest.',
        'Anyone seeking an honest second opinion after over-treatment elsewhere.',
        'People wanting to address jaw clenching, teeth grinding (bruxism) or excessive sweating.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Anyone with certain neuromuscular conditions such as myasthenia gravis or Lambert-Eaton syndrome.',
        'Active skin infection, rash, eczema flare or cold sore in the treatment area.',
        'Allergy to botulinum toxin or any of its ingredients.',
        'Recent (within 2 weeks) cosmetic surgery or significant dental work to the face.',
        'Currently taking certain antibiotics (aminoglycosides), we discuss your medication at consultation.',
        'Unrealistic expectations about what the treatment can achieve, we will say so honestly.',
      ]}
      expect={{
        before:
          'A free 20-30 minute consultation to assess your facial movement at rest and in expression, take a full medical history, and agree the treatment plan. We avoid alcohol and blood-thinning supplements for 24 hours before and after to reduce bruising risk. Photos are taken with consent for before/after comparison at your two-week review.',
        during:
          'A series of 5-15 tiny injections into specific muscles, each muscle treated individually, dosed to its strength rather than a one-size-fits-all approach. Most clients describe a brief pinch rather than pain. The whole appointment is finished in 10 to 15 minutes; you can drive yourself home immediately.',
        after:
          'Stay upright for four hours and avoid the gym, sauna, hot yoga and lying flat. Avoid massaging or rubbing the treated area for 24 hours. Results begin to appear from day three, peak around day seven, and settle by day fourteen, at which point your complimentary review takes place to fine-tune anything that has come up uneven.',
      }}
      pricingNote="From £120 for a single area, £170 for two, and £220 for three areas at the same appointment. The fee covers your treatment, all product, and a complimentary two-week review. There is no consultation fee. Pricing is transparent across the site, see the /pricing page for the full table including filler and Profhilo."
      faqs={[
        {
          question: 'What is the difference between anti-wrinkle injections and dermal filler?',
          answer:
            'Anti-wrinkle injections relax the muscles that create movement lines, so they smooth wrinkles caused by expression such as frowning or squinting. Dermal filler is a hyaluronic acid gel that adds volume and structure to areas where you have lost fullness, cheeks, lips, tear troughs, jawline. They do completely different jobs and are often used together. Many clients in their forties have small amounts of both, planned together. In a consultation I will explain which one, or which combination, suits the concern you have raised, rather than recommending the same thing for everyone. If neither is the right answer this year, I will say so.',
        },
        {
          question: 'How long does it last?',
          answer:
            'Most clients see results lasting three to four months, with the muscles gradually returning to their normal movement after that. The first time you have treatment it sometimes wears off a little sooner, then settles into a longer pattern with regular top-ups. Heavy exercise, fast metabolism and stress can shorten the result, so the timing is slightly different for everyone. I usually suggest rebooking before you fully drop back to baseline so the muscles stay relaxed and lines stay softer, but there is no obligation to book on a fixed schedule. Stop entirely whenever you like and your face simply returns to where it was.',
        },
        {
          question: 'Will it freeze my face or look obvious?',
          answer:
            'Not when it is done well. The frozen look comes from too much product, placed in the wrong spots, often by someone treating every face the same way. I dose conservatively at first and review you at two weeks, so we can add a small amount if needed rather than overshoot. The aim is for friends and family to say you look well rested, not that you look different. If you want a stronger result we can build to it gradually over a couple of cycles, the worst thing is to chase a heavy result on day one and end up living with it for three months.',
        },
        {
          question: 'Can men have anti-wrinkle injections?',
          answer:
            'Yes, and an increasing number of men do. The technique is slightly different because male muscles are usually stronger and the brow shape needs to stay flatter rather than arched. Dosing is typically higher than for women, but the goal is the same: a softer, less tired look without anyone being able to point to what has changed. Many of my male clients come in before a big presentation, a wedding or simply because they are tired of the frown line that makes them look cross. There is a dedicated /treatments/mens-aesthetics page that goes into more detail.',
        },
        {
          question: 'How often will I need top-ups?',
          answer:
            'A typical pattern is every three to four months for the first year, then some clients can stretch to four or five months as the muscles adapt and stay quieter for longer. I will not push you to come back sooner than you need to. At your review I will assess the result honestly and only recommend a repeat when there is a clear benefit. If you decide to stop entirely, your face will simply return to how it was, no withdrawal effect, no penalty, no muscle deterioration.',
        },
        {
          question: 'What brand of botulinum toxin do you use?',
          answer:
            'I use the major regulated UK brands, Botox (Allergan), Bocouture (Merz) and Azzalure (Galderma), depending on the area being treated and your individual response. They all do the same thing, slightly differently dosed and slightly differently formulated. We discuss the choice at consultation; some clients respond better to one brand than another, and we keep that information in your record so future treatments are tailored to what worked.',
        },
        {
          question: 'Is it safe?',
          answer:
            'When carried out by a qualified medical professional with regulated products, yes, anti-wrinkle injections are one of the most studied and safe injectable treatments available. The active ingredient is approved by the MHRA, has decades of clinical use behind it, and at the doses used in aesthetics is extremely well tolerated. The risk is almost entirely in the practitioner, not the product. I am an NMC-registered nurse (PIN 05G1755E) with full medical indemnity insurance, an MSc in Advanced Practice (Level 7), and twenty years of clinical experience. The aesthetic industry in the UK is largely unregulated, make sure whoever treats you can show the same.',
        },
        {
          question: 'Can I see before-and-after photos?',
          answer:
            'Yes. Examples are available at consultation with the consent of the clients pictured, we do not publish identifiable client photos online without explicit, written, ongoing consent because anti-wrinkle treatment is private. Bring photos of yourself you like and ones you do not, and we will look together at what is causing the difference and what is realistically achievable.',
        },
        {
          question: 'Do you treat clients from outside Braintree?',
          answer:
            'Yes, clients travel to Friars Lane from Chelmsford, Colchester, Halstead, Witham, Maldon, Sudbury, Great Dunmow and across Essex. Each town has its own page below with travel times, surrounding-area lists and local FAQs. Free on-site parking and a discreet entrance.',
        },
      ]}
      practitionerNote="My approach to anti-wrinkle injections is simple: less is more, and you should still look like you. I would rather under-treat first and add a touch at your two-week review than risk a heavy result. I dose to the muscle, not to the area. I tell clients honestly when I think they do not need treatment yet, or when something else, Profhilo, micro-needling, even just a different skincare routine, would serve them better. Subtle, natural and yours. That's the entire job."
    />
  )
}
