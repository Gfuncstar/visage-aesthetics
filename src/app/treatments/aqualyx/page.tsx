import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/aqualyx' },
  title: 'AQUALYX Fat Dissolving | Award-Winning Clinic, Braintree',
  description:
    'AQUALYX injectable fat-dissolving treatment for double chin, jowls, flanks and stubborn pockets. Visage Aesthetics, Braintree, awarded Best Non-Surgical Aesthetics Clinic 2026, Essex.',
}

export default function Page() {
  const treatment = getTreatment('aqualyx')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="A non-surgical injectable that gradually dissolves stubborn pockets of localised fat."
      overview="AQUALYX is a clinically formulated injectable that breaks down the wall of fat cells in a targeted area, allowing the body to clear them naturally over the following weeks. It is designed for stubborn, localised fat that does not shift with diet or exercise: a small double chin, jowl pocket, flanks, bra fat, inner thighs or knees. It is not a weight-loss treatment, and it is not a shortcut to a smaller dress size. For the right candidate at a stable weight, however, it can refine an area that has resisted everything else, with no surgery, no general anaesthetic and no real downtime beyond a few days of swelling."
      benefits={[
        'Targets stubborn pockets of fat that do not shift with diet.',
        'Treats double chin, jowls, flanks, bra fat, thighs and knees.',
        'No surgery, no general anaesthetic and no recovery week.',
        'Results are gradual and natural, not sudden.',
        'Once cells are cleared, they do not return in the same area.',
        'Subtle contour change that suits clients at a stable weight.',
      ]}
      suitableFor={[
        'Adults at a stable, healthy weight with localised fat pockets.',
        'Clients who maintain a balanced diet and regular activity.',
        'Anyone wanting non-surgical refinement of jaw, chin or flanks.',
        'Realistic expectations of subtle, gradual contour change.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'BMI over 30 or anyone seeking weight loss.',
        'Liver, kidney or pancreatic disease.',
        'Lipodystrophy, autoimmune conditions or active skin infection at the site.',
      ]}
      expect={{
        before:
          'A consultation to confirm you are a suitable candidate and to map the area. Avoid blood thinners and alcohol for 24 hours to limit bruising and swelling.',
        during:
          'Local anaesthetic is mixed in to keep the session comfortable. A series of small injections is placed across the area over around 30 minutes.',
        after:
          'Significant swelling, tenderness and bruising for three to seven days is normal and expected. Compression and gentle activity help the area settle.',
      }}
      pricingNote="From \u00a3250 per area per session, with most clients needing two to four sessions spaced six to eight weeks apart. Pricing for multiple areas in the same appointment is agreed at consultation."
      faqs={[
        {
          question: 'How many sessions will I need?',
          answer:
            'Most areas need two to four sessions spaced six to eight weeks apart. The first session usually produces the most visible change because there is more fat to break down, with later sessions refining the result. I will not push you towards more sessions than the area genuinely needs. After your second session we will review honestly and decide together whether further treatment will add real value or whether you have reached the natural endpoint for that area.',
        },
        {
          question: 'How painful is the treatment?',
          answer:
            'AQUALYX is more uncomfortable than most injectable treatments, and I will not pretend otherwise. The product can sting as it goes in, and the area often feels hot and tender during and just after. Local anaesthetic is mixed into the formula to take the edge off, and most clients tolerate it well once they know what to expect. The discomfort settles within an hour. The few days of swelling and tenderness afterwards tend to feel more significant than the appointment itself.',
        },
        {
          question: 'When will I see results?',
          answer:
            'Initial swelling can mask any change for the first one to two weeks. From around week three you will start to see a smoother, more refined contour, with the full result of each session visible at six to eight weeks. That is why sessions are spaced a month and a half apart. Photos taken before each session are essential because change is gradual and the area can look the same in the mirror even when the photographs clearly show progress.',
        },
        {
          question: 'Are the results permanent?',
          answer:
            'The fat cells that are dissolved are gone for good and are not replaced by your body. So in that sense, yes, the result is permanent. However, the remaining fat cells in the area can still grow if your weight increases, which means staying within a stable weight range is important to keep the result. Think of AQUALYX as resculpting a stubborn area, not as a free pass on lifestyle. Most clients see this as a sensible trade.',
        },
        {
          question: 'How is it different from liposuction?',
          answer:
            'Liposuction is a surgical procedure performed under anaesthetic that removes a much larger volume of fat in one session, with several weeks of recovery. AQUALYX is a series of in-clinic injections with no anaesthetic, no incisions and no time off work. The trade-off is that it is suited only to small, localised pockets and the result builds gradually over months. For a small double chin or refined jawline AQUALYX is often the better option. For larger volume removal, surgery is still the right tool.',
        },
      ]}
      practitionerNote="AQUALYX works wonderfully for the right client and disappoints when it is asked to do something it cannot. I will always be honest at consultation about whether your concern is suited to it. Stable weight, localised pocket, realistic expectation: that is the recipe for a result you will be pleased with."
    />
  )
}
