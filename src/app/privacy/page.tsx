import BookingCTA from '@/components/sections/BookingCTA'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'Privacy Policy, Visage Aesthetics',
  description: 'How Visage Aesthetics collects, stores and protects your personal data, in line with UK GDPR.',
  path: '/privacy',
  ogTitle: 'Privacy Policy',
})

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-5">Legal</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Privacy policy.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            How we collect, use and protect your personal information.
          </p>
        </div>
      </section>

      <section className="py-5 md:py-8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 prose prose-lg">
          <p className="text-eyebrow text-ink-soft">Last updated: April 2026</p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Who we are</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Visage Aesthetics is a clinic operated by Bernadette Tobin (RN, MSc), 17A Friars Lane, Braintree, Essex CM7 9BL. For privacy-related questions, contact info@vaclinic.co.uk.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">What we collect</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            When you make an enquiry: your name, contact details and the treatment you&apos;re interested in. When you become a client: your medical history, consent forms, photographs and treatment notes (held securely as part of your clinical record).
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">How we use it</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Enquiry data is used to respond to you and arrange a consultation. Clinical records are kept to deliver safe care, in line with NMC and clinical record-keeping standards. We never sell or share your data with third parties for marketing.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">How long we keep it</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Enquiry data is held for up to 12 months. Clinical records are held for the period required by professional regulation, currently a minimum of 8 years from your last appointment.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Your rights</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Under UK GDPR you have the right to access, correct, delete or restrict use of your personal data. To exercise any of these rights, email info@vaclinic.co.uk and we will respond within 30 days.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Cookies</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            This site uses essential cookies only, no advertising trackers. Anonymous analytics may be used to understand how the site is performing.
          </p>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
