'use client'
import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EDE8F2 0%, #F0EBF7 50%, #EDE8F2 100%)' }}>
      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4" style={{ background: 'rgba(176,155,191,0.2)', color: '#8B6FA0' }}>Newsletter</span>
        <h3 className="font-display text-h3 text-[#1C1C1A] mb-2">Stay in the know</h3>
        <p className="text-[#6B6660] text-sm mb-6">
          Exclusive offers, skincare advice and clinic news, straight to your inbox.
        </p>
        {submitted ? (
          <p className="text-[#8B6FA0] font-semibold">Thank you! We&apos;ll be in touch soon.</p>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-full border-2 bg-white text-[#1C1C1A] placeholder:text-[#6B6660]/60 text-sm focus:outline-none transition-colors"
              style={{ borderColor: 'rgba(176,155,191,0.35)' }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full text-white text-sm font-semibold whitespace-nowrap btn-primary"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
