import type { Metadata } from 'next'
import GiftPurchase from './GiftPurchase'

export const metadata: Metadata = {
  title: 'Gift voucher | Visage Aesthetics',
  description: 'Treat someone to a Visage Aesthetics gift voucher — for any treatment at our nurse-led clinic in Braintree, Essex. Sent straight to their inbox.',
  alternates: { canonical: 'https://www.vaclinic.co.uk/gift' },
}

export default function GiftPage() {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-24">
        <div className="eyebrow text-gold mb-2">Gift voucher</div>
        <h1 className="font-display italic text-charcoal text-4xl md:text-6xl leading-tight">
          Give the gift of Visage.
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
          A voucher towards any treatment at our nurse-led clinic — chosen amount, sent straight to
          their inbox with your message. Valid for 12 months and usable over more than one visit.
        </p>
        <div className="mt-10">
          <GiftPurchase />
        </div>
      </div>
    </section>
  )
}
