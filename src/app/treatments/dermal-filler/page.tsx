import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  title: 'Dermal Filler | Visage Aesthetics Braintree',
  description:
    'Hyaluronic acid dermal filler for lips, cheeks, jawline and non-surgical nose reshaping. Subtle, considered results in Braintree, Essex.',
}

export default function Page() {
  const treatment = getTreatment('dermal-filler')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Restore lost volume, refine contour and gently enhance lips with hyaluronic acid filler."
      overview="Dermal filler is a smooth gel made from hyaluronic acid, a sugar your skin already produces. Placed carefully under the skin, it replaces volume that has been lost with age, defines areas that have softened over time and gives lips a natural-looking lift without changing their shape. It is immediate, reversible and tailored to your face rather than a trend. I use a range of products with different consistencies because lips, cheeks, chin, jawline and nose all need a different feel. Most clients enjoy results for nine to eighteen months depending on the area and the product chosen."
      benefits={[
        'Replaces lost volume in cheeks, temples and chin.',
        'Defines the jawline and refines facial contour.',
        'Gently enhances lip shape, hydration and definition.',
        'Reshapes the nose without surgery for the right candidate.',
        'Results visible immediately, with full settle by two weeks.',
        'Fully reversible if you ever change your mind.',
      ]}
      suitableFor={[
        'Adults wanting to restore age-related volume loss.',
        'Anyone seeking subtle lip enhancement or hydration.',
        'Clients looking for sharper cheek, chin or jaw definition.',
        'Suitable candidates for non-surgical rhinoplasty after assessment.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Known allergy to hyaluronic acid or lidocaine.',
        'Active cold sore, acne or skin infection in the treatment area.',
        'Recent dental work, fillers or facial surgery in the past two weeks.',
      ]}
      expect={{
        before:
          'A free consultation to map your face, agree the goal and choose the right product. Avoid alcohol, fish oil and ibuprofen for 24 hours to limit bruising.',
        during:
          'Numbing cream is applied, then filler is placed using a fine needle or cannula. Most appointments take 30 to 45 minutes and feel very tolerable.',
        after:
          'Some swelling and small bruising is normal for a few days, particularly with lips. Results settle by two weeks and a review is included.',
      }}
      pricingNote="From \u00a3200 per ml, with most areas needing one to two ml. Pricing is agreed in writing at consultation, including the product brand, the volume planned and any review appointment."
      faqs={[
        {
          question: 'Does dermal filler dissolve naturally?',
          answer:
            'Yes. Modern hyaluronic acid fillers gradually break down as your body metabolises them, which is one of the reasons I prefer them. Depending on the product and the area, they last roughly nine to eighteen months. Lips tend to move through filler faster because they are constantly active, while deeper areas like cheeks and chin last longer. If you ever want to reverse a result more quickly, an enzyme called hyaluronidase can be injected to dissolve the filler safely, usually within a day or two.',
        },
        {
          question: 'How long do the results last?',
          answer:
            'It varies by product and placement, but a sensible expectation is six to nine months for lips, twelve months for jawline and chin, and up to eighteen months for cheek and temple work. Lifestyle plays a part too: a faster metabolism, a lot of cardio and high stress all shorten the result. Rather than topping up too often, I usually advise small refresh appointments before the previous treatment fully fades, which keeps the look consistent and uses less product over time.',
        },
        {
          question: 'How painful is it?',
          answer:
            'Most clients are surprised at how comfortable the appointment is. The fillers I use contain a built-in local anaesthetic, and I apply numbing cream first for sensitive areas like lips. You will feel a small pinch when the needle goes in and a firm pressure as the product is placed, but it is rarely described as painful. Lip work is the most sensitive zone, so I work in slow stages and check in with you throughout. Most people leave saying it was easier than they expected.',
        },
        {
          question: 'Will my lips look swollen straight away?',
          answer:
            'Some swelling is normal and expected, particularly in the first 24 to 48 hours. Lips can look notably bigger immediately after, then gradually settle to their true shape over one to two weeks. Light bruising is also possible. Plan around this if you have a wedding, photo shoot or important event, ideally giving yourself two weeks before the date. I will warn you of anything that looks unusual at your review and we can adjust if needed.',
        },
        {
          question: 'What is the difference between filler and Botox?',
          answer:
            'They solve completely different problems. Anti-wrinkle injections, often called Botox, relax muscles to soften wrinkles caused by movement, like frown lines and crow\u2019s feet. Dermal filler is a gel that physically replaces lost volume or adds structure where the face has changed shape. Many clients use both as part of a longer plan, with anti-wrinkle injections every few months and filler refreshed only every year or two. In your consultation I will explain which one suits the concern you came in with.',
        },
      ]}
      practitionerNote="My rule with lips and cheeks is always start subtle and build slowly. You can add a little more in six weeks, but you cannot un-see a face that has had too much in one go. I would rather you came back for a small refresh than ever feel overdone."
    />
  )
}
