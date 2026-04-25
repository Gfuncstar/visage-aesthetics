'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check } from 'lucide-react'
import { treatments } from '@/lib/treatments'

type FormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  treatment: string
  contactMethod: 'phone' | 'whatsapp' | 'email'
  message: string
  hearAbout: string
  consent: boolean
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>()

  const onSubmit = async (_data: FormValues) => {
    await new Promise((r) => setTimeout(r, 600))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex w-12 h-12 rounded-full bg-gold text-charcoal items-center justify-center mb-5">
          <Check size={20} strokeWidth={1.75} />
        </div>
        <h3 className="font-display text-2xl text-charcoal">Thank you for reaching out.</h3>
        <p className="text-ink-soft mt-3 max-w-md mx-auto leading-relaxed">
          I&apos;ve received your enquiry and will be in touch personally within 24 hours. Looking forward to meeting you.
        </p>
        <p className="text-eyebrow text-gold mt-6">Bernadette</p>
      </div>
    )
  }

  const inputClass = 'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="text-eyebrow text-ink-soft mb-2 block">First name</label>
          <input id="firstName" autoComplete="given-name" className={inputClass} {...register('firstName', { required: 'Required' })} />
          {errors.firstName && <p className="text-xs text-gold mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="text-eyebrow text-ink-soft mb-2 block">Last name</label>
          <input id="lastName" autoComplete="family-name" className={inputClass} {...register('lastName', { required: 'Required' })} />
          {errors.lastName && <p className="text-xs text-gold mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="text-eyebrow text-ink-soft mb-2 block">Email</label>
          <input id="email" type="email" autoComplete="email" inputMode="email" className={inputClass} {...register('email', { required: 'Required', pattern: { value: /[^\s@]+@[^\s@]+\.[^\s@]+/, message: 'Invalid email' } })} />
          {errors.email && <p className="text-xs text-gold mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="text-eyebrow text-ink-soft mb-2 block">Phone</label>
          <input id="phone" type="tel" autoComplete="tel" inputMode="tel" className={inputClass} {...register('phone', { required: 'Required' })} />
          {errors.phone && <p className="text-xs text-gold mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="treatment" className="text-eyebrow text-ink-soft mb-2 block">Interested in</label>
        <select id="treatment" className={inputClass} {...register('treatment')}>
          <option value="not-sure">Not sure yet, happy to discuss</option>
          {treatments.map((t) => (
            <option key={t.slug} value={t.slug}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <span className="text-eyebrow text-ink-soft mb-3 block">Preferred contact method</span>
        <div className="grid grid-cols-3 gap-2">
          {(['phone', 'whatsapp', 'email'] as const).map((m) => (
            <label key={m} className="flex items-center justify-center gap-2 border border-line/40 rounded-sm py-3 cursor-pointer has-[:checked]:bg-gold has-[:checked]:text-charcoal has-[:checked]:border-gold transition-colors">
              <input type="radio" value={m} className="sr-only" {...register('contactMethod', { required: true })} />
              <span className="text-sm capitalize">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-eyebrow text-ink-soft mb-2 block">Message</label>
        <textarea id="message" rows={4} className={inputClass} placeholder="A few words about what you'd like to address." {...register('message')} />
      </div>

      <div>
        <label htmlFor="hearAbout" className="text-eyebrow text-ink-soft mb-2 block">How did you hear about us?</label>
        <select id="hearAbout" className={inputClass} {...register('hearAbout')}>
          <option value="">Please select</option>
          <option value="google">Google</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="word-of-mouth">Word of mouth</option>
          <option value="other">Other</option>
        </select>
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-soft leading-relaxed pt-2">
        <input type="checkbox" className="mt-1 accent-bronze" {...register('consent', { required: true })} />
        <span>
          I consent to my details being used to process this enquiry, in line with the privacy policy.
        </span>
      </label>
      {errors.consent && <p className="text-xs text-gold">Please tick to consent.</p>}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
        {isSubmitting ? 'Sending…' : 'Send enquiry'}
      </button>
      <p className="text-xs text-ink-soft text-center">
        Your details are never shared. We will only ever contact you about your enquiry.
      </p>
    </form>
  )
}
