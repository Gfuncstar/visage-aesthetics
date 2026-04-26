import type { Metadata } from 'next'
import Image from 'next/image'
import { Award, Stethoscope, ShieldCheck, GraduationCap, BookOpen, Heart } from 'lucide-react'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'About Bernadette Tobin | Nurse-Led Aesthetics, Braintree Essex',
  description: 'Bernadette Tobin: registered nurse, MSc Advanced Practice, founder of Visage Aesthetics in Braintree, Essex. 20+ years clinical experience and a passion for natural results.',
}

const credentials = [
  { Icon: GraduationCap, title: 'MSc Advanced Practice', desc: 'Level 7 postgraduate qualification in advanced clinical practice — the highest academic level a nurse can hold.' },
  { Icon: Stethoscope, title: 'NMC Registered Nurse', desc: 'NMC PIN 05G1755E. 20+ years clinical experience, fully regulated by the Nursing and Midwifery Council.' },
  { Icon: ShieldCheck, title: 'Royal College of Nursing', desc: 'Member of the RCN — the largest nursing union and professional body in the United Kingdom.' },
  { Icon: Award, title: 'CPD Certified', desc: 'Ongoing continuing professional development across all treatments offered.' },
  { Icon: BookOpen, title: 'Aesthetics Training', desc: 'Advanced injectable techniques across leading regulated product ranges (Allergan, Galderma, IBSA).' },
  { Icon: Heart, title: 'Safeguarding Trained', desc: 'Patient welfare and informed consent at the centre of every consultation.' },
]

const values = [
  { title: 'Safety above all', body: "Every treatment decision goes through a clinical lens. If something is not in your best interest, I will say so. I never compromise on safety to make a sale." },
  { title: 'Natural results only', body: "My goal is for you to look like you, just refreshed. Not altered, not frozen, not done. The whole point is that nobody can quite tell what has changed." },
  { title: 'Your pace, your call', body: "There is never any pressure. I will explain everything, answer every question, and you will leave the consultation feeling informed, not sold to." },
]

export default function AboutPage() {
  return (
    <>
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-8 md:pb-12 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="text-eyebrow text-stone mb-5">About Visage Aesthetics</div>
            <h1 className="font-display italic text-hero text-charcoal">
              A practitioner who genuinely cares.
            </h1>
            <p className="mt-6 text-body-lg text-ink-soft max-w-xl">
              Twenty years of nursing. A Master&apos;s degree. Three children. And a quietly held belief that the best aesthetic work is the kind that no one notices.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-md overflow-hidden">
              <Image src="/images/bernadette-portrait.jpg" alt="Bernadette Tobin" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-9">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <div>
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">My story</div>
            <h2 className="font-display text-h1 text-charcoal">Why I do this work.</h2>
            <div className="mt-6 space-y-5 text-body-lg text-ink-soft leading-relaxed">
              <p>I qualified as a registered nurse over twenty years ago. My career has taken me through acute medical wards, community nursing, and advanced clinical practice, where I went on to complete an MSc.</p>
              <p>I came into aesthetics later, and deliberately. I had spent enough time in clinical settings to know that this is, fundamentally, a medical field. It deserves the same rigour, the same consent process, the same clinical care.</p>
              <p>I&apos;m also a mother of three, and I understand how much confidence sits behind even a small treatment decision. My job is not to talk you into anything. My job is to listen carefully, plan something that genuinely suits you, and carry it out beautifully.</p>
              <p>The clinic in Braintree is calm, private, and unhurried. I see one client at a time. You will not feel rushed. You will not feel sold to. And you will leave looking exactly like yourself.</p>
            </div>
            <blockquote className="mt-10 border-l-2 border-gold pl-6 font-display italic text-2xl md:text-3xl text-charcoal leading-snug">
              &ldquo;The best aesthetic work is the kind no one notices. People should just think you look well.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      <section className="bg-cream-soft py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-12">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">Qualifications</div>
            <h2 className="font-display text-h1 text-charcoal">Credentials and training.</h2>
            <p className="mt-5 text-body-lg text-ink-soft">A non-exhaustive summary. Full evidence available on request.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {credentials.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-cream border border-line/25 rounded-md p-6">
                <Icon size={22} strokeWidth={1.5} className="text-gold mb-4" />
                <h3 className="font-display text-xl text-charcoal">{title}</h3>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 md:py-9">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-12">
            <span className="hairline hairline-left mb-6" />
            <div className="text-eyebrow text-gold mb-3">My philosophy</div>
            <h2 className="font-display text-h1 text-charcoal">How I work.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {values.map((v) => (
              <div key={v.title} className="border border-line/25 rounded-md p-7">
                <div className="text-eyebrow text-gold mb-3">01</div>
                <h3 className="font-display text-2xl text-charcoal mb-3">{v.title}</h3>
                <p className="text-body text-ink-soft leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
