import type { Metadata } from 'next'
import { MapPin, Mail, Clock, MessageCircle } from 'lucide-react'
import { BOOKING_URL, BOOKING_LINK_PROPS } from '@/lib/booking'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Book a Consultation | Visage Aesthetics, Braintree Essex',
  description: 'Book a free, no-obligation aesthetic consultation at Visage Aesthetics, 17A Friars Lane, Braintree, Essex CM7 9BL.',
}

export default function ContactPage() {
  return (
    <>
      <section className="bg-cream text-charcoal">
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-6 md:pb-8">
          <div className="section-num mb-6">Book &nbsp; · &nbsp; Visit</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">A free, no-obligation conversation.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            Use the booking system below to choose a time that suits you. If you&apos;d rather speak first, the contact details on the right are always open.
          </p>
        </div>
      </section>

      <section className="pb-6 md:pb-8">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <figure className="relative bg-cream-soft border border-line/25 rounded-md overflow-hidden aspect-video">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/images/contact-poster.jpg"
              className="w-full h-full object-cover"
            >
              <source src="/video/contact.mp4" type="video/mp4" media="(min-width: 720px)" />
              <source src="/video/contact-mobile.mp4" type="video/mp4" />
            </video>
            <figcaption className="absolute top-4 left-4 px-3 py-1.5 bg-cream/90 text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal rounded-sm pointer-events-none" style={{ backdropFilter: 'blur(4px)' }}>
              ▶ &nbsp;Watch · 17A Friars Lane
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="pb-6 md:pb-10">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16" id="book">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-cream-soft border border-line/25 rounded-md overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-line/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="eyebrow text-gold">Live booking</div>
                  <div className="font-display italic text-charcoal mt-1" style={{ fontSize: 22, fontWeight: 400 }}>
                    Choose a time
                  </div>
                </div>
                <a {...BOOKING_LINK_PROPS} className="eyebrow text-stone hover:text-gold-deep transition-colors">
                  Open in new tab &nbsp;→
                </a>
              </div>
              <div className="relative" style={{ height: 'min(900px, 80vh)' }}>
                <iframe
                  title="Visage Aesthetics booking"
                  src={BOOKING_URL}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  allow="payment"
                />
              </div>
            </div>
            <p className="mt-4 text-stone text-[11px] tracking-[0.18em] uppercase">
              Powered by Ovatu &nbsp;·&nbsp;
              <a {...BOOKING_LINK_PROPS} className="underline decoration-gold/40 hover:decoration-gold-deep">
                Trouble loading? Open the full booking page
              </a>
            </p>
          </div>

          <aside className="lg:col-span-5 order-1 lg:order-2">
            <span className="hairline hairline-left mb-6 inline-block" />
            <div className="eyebrow text-gold mb-3">Visit the clinic</div>
            <h2 className="font-display text-h1 text-charcoal">Quietly tucked into the heart of Braintree.</h2>
            <ul className="mt-8 space-y-5 text-body text-charcoal">
              <li className="flex gap-4">
                <MapPin size={18} strokeWidth={1.5} className="text-gold mt-1 shrink-0" />
                <a href="https://maps.google.com/?q=CM7+9BL" target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                  17A Friars Lane<br/>Braintree, Essex CM7 9BL
                </a>
              </li>
              <li className="flex gap-4">
                <Mail size={18} strokeWidth={1.5} className="text-gold mt-1 shrink-0" />
                <a href="mailto:info@vaclinic.co.uk" className="hover:text-gold">info@vaclinic.co.uk</a>
              </li>
              <li className="flex gap-4">
                <MessageCircle size={18} strokeWidth={1.5} className="text-gold mt-1 shrink-0" />
                <a href="https://wa.me/447931395246" target="_blank" rel="noopener noreferrer" className="hover:text-gold">Chat on WhatsApp</a>
              </li>
              <li className="flex gap-4">
                <Clock size={18} strokeWidth={1.5} className="text-gold mt-1 shrink-0" />
                <span>
                  Strictly by appointment<br/>
                  Discreet entrance and private parking on site
                </span>
              </li>
            </ul>
            <div className="mt-10 aspect-video bg-cream-soft border border-line/25 rounded-md overflow-hidden">
              <iframe
                title="Visage Aesthetics on Google Maps"
                src="https://maps.google.com/maps?q=CM7+9BL&output=embed"
                width="100%"
                height="100%"
                loading="lazy"
                style={{ border: 0 }}
              />
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-cream-soft py-12 md:py-20" id="message">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="hairline hairline-left mb-6 inline-block" />
            <div className="eyebrow text-gold mb-3">Or send a private message</div>
            <h2 className="font-display italic text-h1 text-charcoal">Prefer to write first?</h2>
            <p className="mt-6 text-body-lg text-ink-soft leading-relaxed">
              If you&apos;d rather ask a question before picking a time, this is the quietest way through. I read every enquiry myself and reply personally within 24 hours.
            </p>
            <p className="mt-4 text-body text-ink-soft leading-relaxed">
              Nothing here is binding. No newsletters, no follow-up sequences, no shared lists. Just a private conversation about whether we&apos;re the right fit.
            </p>
            <p className="mt-8 text-eyebrow text-gold">Bernadette</p>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-cream border border-line/25 rounded-md p-6 md:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
