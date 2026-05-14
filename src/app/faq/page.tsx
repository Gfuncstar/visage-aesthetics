import type { Metadata } from 'next'
import Accordion, { type AccordionItem } from '@/components/ui/Accordion'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'FAQ | Awarded Best Clinic Essex 2026',
  description: 'Common questions about aesthetic treatments at Visage Aesthetics, Braintree, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Safety, qualifications, cost, what to expect before and after.',
}

const safety: AccordionItem[] = [
  {
    question: 'Is it safe to have aesthetic treatments?',
    answer: "When carried out by a qualified medical professional with regulated products, yes. Every treatment at Visage is performed by a registered nurse with an MSc in Advanced Practice and 20+ years of clinical experience. We take a full medical history, assess your suitability honestly, and only proceed when it is in your best interest. If a treatment is not right for you, I will say so.",
  },
  {
    question: 'What are my qualifications?',
    answer: 'Registered Nurse (NMC), MSc Advanced Practice, accredited aesthetic practitioner with continuous professional development across all treatments offered. Full evidence of qualifications and indemnity insurance is available on request and at consultation.',
  },
  {
    question: 'What happens if something goes wrong?',
    answer: 'We talk through possible side effects fully at consultation, before consent is signed. Most are mild and short-lived (a small bruise, a little swelling). For anything more involved, you have direct access to me by phone, and I have all the protocols and reversal products on hand. You are never left wondering what to do.',
  },
  {
    question: 'Are you accredited?',
    answer: 'Yes. Visage Aesthetics holds practitioner-level accreditation through industry-recognised bodies, in addition to NMC nurse registration and full medical indemnity. Accreditation requires evidence of training, ongoing CPD and adherence to the Joint Council for Cosmetic Practitioners standards.',
  },
]

const treatmentsFaq: AccordionItem[] = [
  {
    question: 'What is the difference between Botox and dermal filler?',
    answer: "They do completely different jobs. Anti-wrinkle injections (often called Botox) relax the muscles that cause expression lines like forehead lines, frown lines and crow's feet. Dermal filler is a hyaluronic acid gel that adds volume or definition: lips, cheeks, jawline, tear troughs. Many clients have both, planned together.",
  },
  {
    question: 'Does it hurt?',
    answer: 'Most treatments are surprisingly comfortable. Anti-wrinkle uses very fine needles and feels like a small pinch. Filler products contain a built-in local anaesthetic and we numb the area first when needed. Profhilo and micro-needling can feel a little more, but never something most people would call painful. We always go at your pace.',
  },
  {
    question: 'How long do results last?',
    answer: 'Anti-wrinkle injections typically 3 to 4 months. Dermal filler 9 to 18 months depending on the product and area. Profhilo around 6 to 9 months from a course of two. Micro-needling builds gradually, with collagen continuing to develop for 3 to 6 months after a course. We talk through realistic timelines at consultation.',
  },
  {
    question: 'Will I look natural?',
    answer: "Always. The whole philosophy at Visage is that you should look like a refreshed version of yourself. Never altered. We start conservatively, build gradually, and would always rather under-treat than over-treat. If anyone asks whether you've had something done, I haven't done my job properly.",
  },
  {
    question: 'Can I have multiple treatments at once?',
    answer: 'Often, yes. Anti-wrinkle and filler can usually be carried out in the same appointment. Profhilo is normally booked as its own session because of the technique. We plan a sensible sequence at consultation so each treatment has the chance to settle and work as intended.',
  },
  {
    question: 'What is Profhilo and how is it different from filler?',
    answer: "Profhilo is a high-concentration hyaluronic acid that bio-remodels the skin. It does not add volume or contour like filler does. Instead it spreads under the skin and stimulates the body's own collagen and elastin production, improving hydration, texture and laxity. It's brilliant for skin that looks tired or dehydrated.",
  },
]

const booking: AccordionItem[] = [
  {
    question: 'How much do treatments cost?',
    answer: 'Pricing varies by treatment. As a guide: anti-wrinkle from £120, dermal filler from £110 per ml, Profhilo from £180 per session, AQUALYX from £250 per area, micro-needling from £80, CryoPen from £80. Full pricing is discussed openly at consultation, in line with what is right for you.',
  },
  {
    question: 'What happens at a free consultation?',
    answer: "We sit down properly. I take a full medical history, ask about what you'd like to address, examine the area, and we discuss what is realistic. If a treatment isn't right for you, I'll tell you. If it is, we plan it together with no pressure to book on the day.",
  },
  {
    question: 'Do I have to book after my consultation?',
    answer: 'No. Consultations are genuinely no-obligation. Many clients take a few days to think it through, ask family or weigh up cost. I would much rather you come back when you are ready than make a decision in the moment.',
  },
  {
    question: 'How far in advance should I book?',
    answer: "For first-time clients I usually suggest booking the consultation 2 to 3 weeks ahead. Treatment slots typically have 1 to 2 weeks' availability. For events (a wedding, a milestone birthday), I recommend planning at least 4 weeks before so any swelling settles fully.",
  },
  {
    question: 'Do you offer payment plans?',
    answer: 'Most treatments are paid in full at the appointment. For longer treatment courses (Profhilo, AQUALYX, micro-needling) we can split payment across the sessions. We do not offer financing or buy-now-pay-later schemes, by choice.',
  },
]

const aftercare: AccordionItem[] = [
  {
    question: 'What should I do before my appointment?',
    answer: 'Avoid alcohol for 24 hours, ibuprofen and aspirin for 48 hours where medically possible, and arrive with a clean face. Eat normally beforehand. If you have a holiday or event in the next 2 weeks, mention it: timing matters.',
  },
  {
    question: 'When will I see results?',
    answer: 'Filler is largely visible immediately. Anti-wrinkle takes 3 to 5 days to start working, with full effect at 14 days. Profhilo results build over 4 to 6 weeks. Micro-needling shows initial radiance within a week and continues to improve for months.',
  },
  {
    question: 'How long is recovery time?',
    answer: 'For most injectables, none. You can return to normal activity straight away. Bruising or small swelling is possible and usually settles in a few days. Micro-needling causes a little redness for 24 to 48 hours.',
  },
  {
    question: 'What should I avoid after treatment?',
    answer: 'No exercise, alcohol, hot showers, saunas or facial treatments for 24 hours after injectables. No make-up for 12 hours. Sleep on your back where possible for the first night. I send full written aftercare via email after every appointment.',
  },
]

export default function FAQPage() {
  const allFaqs = [...safety, ...treatmentsFaq, ...booking, ...aftercare]
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-8 md:pb-12 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-5">Frequently asked</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Everything you might wonder, answered.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            If you can&apos;t find what you&apos;re looking for, send a message. I read every enquiry and reply personally.
          </p>
        </div>
      </section>

      {[
        { title: 'Safety and qualifications', items: safety },
        { title: 'The treatments', items: treatmentsFaq },
        { title: 'Booking and cost', items: booking },
        { title: 'Before and after', items: aftercare },
      ].map((cat) => (
        <section key={cat.title} className="py-7 md:py-10 border-b border-line/20 last:border-b-0">
          <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-4">
              <span className="hairline hairline-left mb-6" />
              <div className="text-eyebrow text-gold mb-3">Section</div>
              <h2 className="font-display text-h1 text-charcoal">{cat.title}.</h2>
            </div>
            <div className="md:col-span-8">
              <Accordion items={cat.items} />
            </div>
          </div>
        </section>
      ))}

      <BookingCTA />
    </>
  )
}
