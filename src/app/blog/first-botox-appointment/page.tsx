import type { Metadata } from 'next'
import Link from 'next/link'
import Accordion from '@/components/ui/Accordion'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'first-botox-appointment',
  title: 'What to expect from your first Botox appointment.',
  description: 'A calm, honest guide to your first anti-wrinkle injection appointment from Bernadette Tobin, registered nurse. Consultation, treatment, recovery and results explained.',
  datePublished: '2025-09-12',
  dateModified: '2026-04-01',
  image: '/images/og-home.jpg',
  wordCount: 1450,
}

export const metadata: Metadata = {
  title: 'What to Expect from Your First Botox Appointment | Visage Aesthetics',
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

const faqs = [
  {
    question: 'Can I wear make-up to my appointment?',
    answer: 'You can, but it is easier if you arrive with clean skin. If you do come in with make-up, I will gently remove it from the treatment area before we begin so the skin is properly clean.',
  },
  {
    question: 'What if I do not like the result?',
    answer: 'Anti-wrinkle injections naturally wear off over three to four months, so nothing is permanent. If at your two-week review you feel anything is uneven or too strong, we talk it through honestly. Results that feel too relaxed at first usually soften within a couple of weeks as the muscles begin to work around the product.',
  },
  {
    question: 'Can I exercise on the day of treatment?',
    answer: 'Please avoid vigorous exercise, hot yoga and saunas for 24 hours after treatment. A gentle walk is fine. We want to give the product time to settle exactly where I have placed it.',
  },
  {
    question: 'When should I rebook?',
    answer: 'Most people come back every three to four months once they find a rhythm that suits them. At your review I will give you a personal recommendation based on how your muscles responded. There is no pressure to book on a fixed schedule.',
  },
]

export default function FirstBotoxPost() {
  return (
    <article className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(POST)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(POST.slug, POST.title)) }} />
      {/* HERO BAND */}
      <section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-3xl mx-auto px-5 md:px-8 relative">
          <Link href="/blog" className="text-stone text-sm hover:opacity-70 transition-opacity mb-8 inline-block">
            &larr; Back to all articles
          </Link>
          <span className="hairline hairline-left mb-8 bg-gold" />
          <div className="text-eyebrow text-stone mb-5 md:mb-7">
            Anti-wrinkle
          </div>
          <h1 className="font-display italic text-hero text-charcoal">
            What to expect from your first Botox appointment.
          </h1>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone">
            <span>Bernadette Tobin &middot; RN, MSc &middot; Updated April 2026</span>
            <span className="hidden sm:inline text-charcoal/30">/</span>
            <span>7 min read</span>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-5 md:py-8">
        <p className="text-body-lg text-charcoal leading-relaxed mb-5">
          Being nervous before your first anti-wrinkle appointment is completely normal. I have seen it hundreds of times in the clinic, and almost every first-timer tells me afterwards that they wish they had done it sooner. The fear is nearly always bigger than the experience itself.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          I am Bernadette, a registered nurse with over twenty years of clinical experience and an MSc in Advanced Practice. I run the Visage Aesthetics clinic on Friars Lane in Braintree. This is the guide I wish more first-timers had read before they walked through anyone&apos;s door.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">Before you book</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Do your research properly, and by that I mean please look beyond Instagram. Before-and-after photos are easy to filter and easy to fake. What you actually want to know is who the person holding the needle is. Are they a nurse, doctor or dentist? What is their training? How long have they been doing this? Do they have proper aesthetic insurance?
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Anti-wrinkle injections are a prescription-only medicine. They should be administered by a medical professional who can take a full history, recognise contraindications and manage anything unexpected. If a clinic feels more like a beauty counter than a medical setting, that is information worth paying attention to.
        </p>

        <blockquote className="font-display italic text-h2 text-charcoal my-10 border-l-2 border-gold pl-6">
          &ldquo;The right practitioner will be perfectly happy for you to walk out of the consultation without booking. That is exactly how it should feel.&rdquo;
        </blockquote>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">The consultation</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Every first appointment with me starts with a proper conversation. We sit down, I ask about your medical history, the medications you take, any previous treatments and, importantly, what you are actually hoping to achieve. I want to hear it in your own words, not from a photograph of someone else.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          I then assess your face. I look at how your muscles move, where your lines fall when you are at rest and where they appear when you frown or raise your brows. Every face is different, which is why no two of my treatment plans look the same. If I think anti-wrinkle injections are not the right answer for what you have come in for, I will tell you, and I will tell you what I would suggest instead.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">The treatment itself</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          The actual injections take ten to fifteen minutes. I use very fine needles and work calmly and precisely. Most clients describe the sensation as a small, sharp pinch that is over within a second. There is no need for numbing cream and most people are genuinely surprised by how comfortable it is.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Depending on the areas we have agreed in your plan, I will place a series of small doses into the muscles of the forehead, the frown area between your brows, or around the outer corners of the eyes. The pattern is based entirely on your anatomy and the result you have asked for, not a one-size template.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          You may see tiny raised bumps at each injection site immediately after. These settle within twenty to thirty minutes. A small bruise is possible but not the norm.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">Immediately after</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          You can walk straight back out into your day. There is no obvious sign that anything has been done. I ask that you stay upright for four hours, avoid lying flat or face down, skip exercise and saunas for the rest of the day, and resist the urge to rub or massage the treated area. You will leave with a written aftercare sheet so you do not have to remember it all.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          A word of reassurance: do not expect to see anything change in the mirror that evening. The product needs time to find the nerve endings and start its work.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">The first two weeks</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Most people start to notice subtle changes between days three and five. The muscles soften gradually rather than all at once, which is part of why a well-done result looks so natural. By day seven you should see meaningful improvement in the targeted lines, and by day fourteen the result has fully settled.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          That two-week mark is when I bring you back for a complimentary review. We look at the result together honestly. If a small area has metabolised the product faster, or one side has responded more than the other, I top it up at no extra cost. This review is built into the price of every first treatment.
        </p>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-4">Results</h2>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          A good first result should leave you looking refreshed and rested, not altered. Friends might ask if you have been on holiday or had more sleep than usual. Nobody should be able to point at your forehead and say what you have had done. That is genuinely the goal every single time.
        </p>
        <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
          Results typically last three to four months. As the product wears off the muscle returns to full movement gradually, and your lines come back as they were. There is no rebound effect and no need to keep going forever. You can stop at any point with no ill effect.
        </p>

        <blockquote className="font-display italic text-h2 text-charcoal my-10 border-l-2 border-gold pl-6">
          &ldquo;Your first appointment should feel like a calm clinical conversation, not a hard sell. If you leave feeling informed and unhurried, you have found the right person.&rdquo;
        </blockquote>

        {/* FAQ ACCORDION */}
        <div className="mt-16 md:mt-20">
          <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-6">Common first-timer questions</h2>
          <Accordion items={faqs} />
        </div>
      </div>

      <BookingCTA />
    </article>
  )
}
