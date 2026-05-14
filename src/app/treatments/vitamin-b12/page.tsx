import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/vitamin-b12' },
  title: 'Vitamin B12 Injections | Awarded Best Clinic Essex 2026',
  description:
    'Vitamin B12 injections for energy, focus, mood and deficiency support. Visage Aesthetics, Braintree, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex.',
}

export default function Page() {
  const treatment = getTreatment('vitamin-b12')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="A direct intramuscular B12 injection for clients who feel flat, foggy or mildly deficient."
      overview="Vitamin B12 is essential for energy production, nervous system function, red blood cell formation and mental clarity. Many people have lower-than-ideal levels without realising, particularly vegans, vegetarians, women on the pill, anyone over fifty and those with absorption issues such as coeliac or pernicious anaemia. Oral supplements work for some, but they rely on a healthy gut to absorb properly. An intramuscular injection bypasses the gut entirely and delivers the full dose directly into the bloodstream within hours. Most clients notice better energy, sharper focus and improved mood within a few days, with monthly maintenance appointments keeping levels topped up."
      benefits={[
        'Bypasses gut absorption issues for full uptake.',
        'Supports energy, focus and mood within days.',
        'Useful for vegans, vegetarians and those over fifty.',
        'Helps with low-level fatigue and brain fog.',
        'Supports red blood cell production and nervous system health.',
        'Quick five-minute appointment with no downtime.',
      ]}
      suitableFor={[
        'Vegans and vegetarians with limited dietary B12.',
        'Adults over fifty, where natural absorption declines.',
        'Anyone with persistent fatigue, brain fog or low mood.',
        'Clients with diagnosed B12 deficiency or absorption issues.',
      ]}
      notSuitableFor={[
        'Known allergy to cobalt or cobalamin.',
        'Pregnancy or breastfeeding without GP approval.',
        'Certain rare blood disorders such as Leber\u2019s disease.',
        'Anyone already receiving prescribed B12 from their GP without coordination.',
      ]}
      expect={{
        before:
          'A short consultation to confirm the injection is appropriate. If you suspect significant deficiency I will suggest a blood test through your GP first.',
        during:
          'A quick intramuscular injection into the upper arm using a fine needle. The whole appointment, including chat and aftercare, takes around five minutes.',
        after:
          'No restrictions. Most clients return to normal life immediately and notice improvement within three to seven days as the B12 reaches every system.',
      }}
      pricingNote="From \u00a335 per injection, with discounted bundles for monthly maintenance. The fee includes the consultation, the product and any aftercare advice you need."
      faqs={[
        {
          question: 'How often should I have a B12 injection?',
          answer:
            'For general energy and wellbeing support, monthly is the most common pattern. For diagnosed deficiency or pernicious anaemia, a more intensive loading course followed by injections every two to three months may be appropriate, ideally coordinated with your GP. I will not push you towards more injections than you genuinely need. After your first appointment we will agree a sensible schedule based on how you respond, your diet, lifestyle and any blood test results you have available.',
        },
        {
          question: 'What are the symptoms of B12 deficiency?',
          answer:
            'Persistent tiredness even after a good night\u2019s sleep, brain fog, poor concentration, low mood, breathlessness on mild exertion, tingling in the fingers or toes, mouth ulcers and pale or yellowish skin can all point to low B12. These symptoms overlap with many other conditions, so a blood test is the only reliable way to confirm. If your symptoms are significant I will recommend you ask your GP for a serum B12 and active B12 test before starting, so we have a baseline to work from.',
        },
        {
          question: 'Is it better than oral supplements?',
          answer:
            'For most people with normal absorption, a high-quality oral supplement at the right dose is enough. The injection is more useful when absorption is the problem, which includes anyone with coeliac, Crohn\u2019s, pernicious anaemia, after stomach surgery, on long-term acid blockers, or simply over fifty when stomach acid naturally declines. Injections deliver the full dose direct to the bloodstream within hours, where oral B12 may be absorbing only a fraction of what is swallowed. We can talk through which suits you.',
        },
        {
          question: 'Can it replace a prescription from my GP?',
          answer:
            'No. If you have been diagnosed with pernicious anaemia or another condition that requires lifelong prescribed B12 (usually hydroxocobalamin), please continue with your GP-led treatment as the priority. The injections offered here are intended to support general wellbeing and lifestyle-related insufficiency, not to replace a clinical regimen. If you are unsure where you sit, bring your most recent blood results to your consultation and we will work out the safest plan together, in coordination with your GP if needed.',
        },
        {
          question: 'When will I feel a difference?',
          answer:
            'Most clients notice an uplift in energy and a clearer head within three to seven days of the first injection, sometimes sooner if they were genuinely depleted. Mood and motivation often follow over the second week. If your symptoms are caused by something other than B12, an injection alone will not fix them, which is why a sensible diagnostic conversation matters. If you have had no benefit at all by the four-week mark, we should talk about whether B12 is actually the right answer for you.',
        },
      ]}
      practitionerNote="I see B12 as one part of a wider wellbeing picture, not a magic fix. For the right client it is genuinely transformative, but I will always encourage you to look at sleep, diet and stress alongside it. The injection works best when the rest of your foundations are honest."
    />
  )
}
