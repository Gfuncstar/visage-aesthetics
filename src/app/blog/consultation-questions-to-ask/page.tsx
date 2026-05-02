import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: 'consultation-questions-to-ask',
  title: 'Ten questions to ask at any aesthetics consultation.',
  description: 'A practical checklist before you let anyone put a needle in your face. Bernadette Tobin RGN, MSc lists the ten questions every aesthetics consultation should answer, and the red flags if they don\'t.',
  datePublished: '2026-04-26',
  dateModified: '2026-04-26',
  image: '/images/og-home.jpg',
  wordCount: 1620,
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

export default function ConsultationQuestionsPost() {
  return (
    <article className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(POST)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(POST.slug, POST.title)) }} />

      <section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-3xl mx-auto px-5 md:px-8 relative">
          <Link href="/blog" className="text-stone text-sm hover:opacity-70 transition-opacity mb-8 inline-block">
            &larr; Back to all articles
          </Link>
          <span className="hairline hairline-left mb-8 bg-gold" />
          <div className="text-eyebrow text-gold mb-3">Choosing a clinic</div>
          <h1 className="font-display italic text-hero text-charcoal">Ten questions to ask at any aesthetics consultation.</h1>
          <p className="mt-6 text-body-lg text-ink-soft">
            Aesthetics in the UK is largely unregulated. Anyone can legally inject. The protection you have, as a
            client, is in the questions you ask before you commit. These are the ten I would ask if I were sitting on
            the other side of the desk, and the red flags if a clinic struggles to answer them.
          </p>
        </div>
      </section>

      <section className="pb-6 md:pb-10">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="text-stone text-[12px] tracking-[0.18em] uppercase mb-8">8 min read &middot; By Bernadette Tobin RGN, MSc</div>

          <h2 className="font-display italic text-h2 text-charcoal mt-2 mb-5">1. What is your NMC PIN, GMC number or GDC number?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            A registered nurse will have an NMC PIN. A doctor will have a GMC number. A dentist will have a GDC number.
            All three are public, verifiable, and genuine professionals will give them freely. If a practitioner says
            &ldquo;I don&apos;t need to give you that&rdquo; or hesitates noticeably, walk away. There is no innocent
            reason for a regulated clinician to be cagey about their registration.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            For context: Bernadette&apos;s NMC PIN is <strong>05G1755E</strong>, verifiable on the public NMC register.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">2. Who actually does the treatments here?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Some clinics market themselves as &ldquo;nurse-led&rdquo; or &ldquo;doctor-led&rdquo; while the actual
            treatments are performed by less-qualified injectors. Ask directly: who will be putting the needle in my
            face today, and what is their qualification? If the answer is anything other than the registered
            professional whose name is above the door, you are not in a nurse-led or doctor-led clinic in the way that
            phrase implies.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">3. What level of qualification do you hold for aesthetic injectables?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Most UK aesthetic injectors hold a Level 4 or Level 5 qualification. Level 7 (MSc) is the highest. A short
            weekend course is not a meaningful qualification. The honest answer here will tell you a lot, and a
            practitioner with deeper training will be open about it because it is a competitive advantage.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">4. Who is your medical indemnity insurer?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Every legitimate practitioner has indemnity insurance, and they should be able to name their insurer
            without thinking. The insurer matters because some providers do not cover certain procedures, and policy
            limits vary widely. If a practitioner cannot answer this clearly, they may be uninsured, which is a
            significant red flag both for safety and for what happens if something goes wrong.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">5. Do you keep hyaluronidase on site?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            If you are having hyaluronic acid filler, the practitioner must have <strong>hyaluronidase</strong> in the
            building, ready to use, in case of complication. Hyaluronidase dissolves HA filler in an emergency
            (vascular occlusion) and electively (you change your mind, or had bad work elsewhere). A clinic without it
            on site cannot manage the most serious filler complication safely. This is non-negotiable.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">6. What would you do if you hit a vessel?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Vascular occlusion, accidentally injecting filler into an artery, is rare but serious. A practitioner
            should be able to walk you through their protocol clearly: stop, recognise the signs, hyaluronidase
            flooded into the area, hot compress, aspirin, follow-up. Fluency here tells you they have trained for it
            and thought about it. Vagueness tells you they haven&apos;t.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">7. What is the brand of product you are using, and can I see the box?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            The major UK-licensed brands for botulinum toxin are Botox (Allergan), Bocouture (Merz) and Azzalure
            (Galderma). For HA filler: Juvederm, Restylane, Teosyal, Belotero. For Profhilo: only IBSA. A
            practitioner should show you the box, the syringe with batch number, and let you photograph it if you
            want to. Some less reputable clinics use products from grey-market sources or substitute cheaper
            alternatives. If the practitioner is reluctant to show you what they are about to inject, do not let them.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">8. How will you document my consent and my medical history?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Proper consultation includes a written medical history and a documented, signed consent form before any
            product is opened. A clinic that says &ldquo;just sign here&rdquo; without going through the form, or
            doesn&apos;t document at all, is operating below clinical standard. The consent form is not just legal
            protection for them, it is your record of the conversation, including discussed risks and agreed
            outcomes.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">9. What is your follow-up like if I have a concern?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            How do you contact the practitioner if something feels wrong at 11pm three days after treatment? &ldquo;Email
            us&rdquo; is not a good answer for a clinical concern. Direct phone access to the practitioner who treated
            you, ideally with a published number, is the standard you should expect. You should also be told what
            symptoms warrant a phone call versus what is normal recovery, and offered a complimentary review at two
            weeks.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">10. Is there a treatment you would not do today?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            This is the question that separates clinical practitioners from sales operations. A good answer is
            specific: &ldquo;You came in asking for tear-trough filler, but I can see your concern is more about skin
            quality than volume, I would suggest Profhilo first.&rdquo; Or: &ldquo;You wanted 2ml in lips today, but
            we should start at 0.5ml and review.&rdquo; Or simply: &ldquo;I don&apos;t think you need treatment yet.&rdquo;
            A practitioner who tells you what they would <em>not</em> do is a practitioner thinking clinically. A
            practitioner who agrees to whatever you ask for is a practitioner thinking commercially.
          </p>

          <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">A short note on what consultation should feel like</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            A good consultation feels like a clinical conversation: unhurried, candid, two-way. The practitioner asks
            about your goals, your medical history, your previous treatments. They examine your face at rest and in
            expression. They explain what is causing the concern you are raising, what would address it, and what
            wouldn&apos;t. They give you space to think. They don&apos;t push you to book today, accept a deposit
            before you have decided, or imply that the offered price is time-limited.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            If you leave the consultation feeling pressured, sold to, or like you didn&apos;t fully understand what
            was being recommended, that is the answer to whether you should book. Trust that feeling.
          </p>

          <div className="mt-12 p-7 md:p-8 border border-line/30 rounded-md bg-cream-soft">
            <div className="text-eyebrow text-gold mb-3">Free consultation</div>
            <p className="font-display italic text-charcoal mb-4" style={{ fontSize: 24, lineHeight: 1.3, fontWeight: 500 }}>
              We will happily answer all ten of these.
            </p>
            <p className="text-body text-ink-soft mb-5">
              Free consultation, no commitment. NMC PIN 05G1755E. Best Non-Surgical Aesthetics Clinic 2026, Essex.
              Bring this list with you and read it out, we&apos;ll be glad you did.
            </p>
            <Link href="/contact" className="btn btn-primary">
              <span>Book consultation</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/about/qualifications" className="block border border-line/30 rounded-md p-5 hover:border-gold/60 transition-colors">
              <div className="text-eyebrow text-gold mb-2">Read more</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 20 }}>Our qualifications →</div>
            </Link>
            <Link href="/blog/what-is-a-nurse-led-clinic" className="block border border-line/30 rounded-md p-5 hover:border-gold/60 transition-colors">
              <div className="text-eyebrow text-gold mb-2">Related article</div>
              <div className="font-display italic text-charcoal" style={{ fontSize: 20 }}>What &ldquo;nurse-led&rdquo; really means →</div>
            </Link>
          </div>
        </div>
      </section>

      <BookingCTA />
    </article>
  )
}
