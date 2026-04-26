import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/harmonyca' },
  title: 'HarmonyCa | Visage Aesthetics Braintree',
  description:
    'HarmonyCa hybrid injectable for instant lift and long-term collagen stimulation. Natural lower-face contouring in Braintree, Essex.',
}

export default function Page() {
  const treatment = getTreatment('harmonyca')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="A hybrid injectable that lifts immediately and rebuilds collagen quietly over the months that follow."
      overview="HarmonyCa is a clever hybrid injectable that combines hyaluronic acid for immediate lift with calcium hydroxyapatite microspheres that stimulate your own collagen over time. It is most often used along the jawline, cheeks and lower face to restore definition where bone and soft tissue have shifted with age. The lift is visible from day one, then the collagen response continues for around nine to twelve months, so the result actually improves rather than fades. It is one of the few injectables I recommend for clients in their late thirties and beyond who want a longer-lasting, more structural result without surgery."
      benefits={[
        'Immediate lifting and contouring along the jaw and cheeks.',
        'Stimulates your own collagen for months after the appointment.',
        'Result improves over time rather than simply fading.',
        'Lasts longer than standard hyaluronic acid filler.',
        'Restores definition lost from natural ageing and bone change.',
        'A natural look that suits clients who avoid heavy filler.',
      ]}
      suitableFor={[
        'Adults aged 35 and over with mild to moderate skin laxity.',
        'Clients wanting a longer-lasting alternative to traditional filler.',
        'Anyone seeking subtle lower-face contouring or jaw definition.',
        'Clients in good general health with realistic expectations.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Active autoimmune conditions or current immunosuppressant treatment.',
        'History of severe allergies or hypersensitivity to product ingredients.',
        'Active skin infection or unhealed wound in the planned treatment area.',
      ]}
      expect={{
        before:
          'A detailed consultation to map facial anatomy and confirm HarmonyCa is the right product for your goals. Avoid blood thinners, alcohol and ibuprofen for 24 hours.',
        during:
          'The treatment is delivered with a fine cannula or needle over 30 to 45 minutes. Numbing cream is used and the product itself contains anaesthetic.',
        after:
          'Mild swelling and tenderness for two to three days is normal. Avoid heat and exercise for 48 hours. Massage as instructed for the first week.',
      }}
      pricingNote="From \u00a3450 per session, with most clients needing one to two sessions to reach their goal. The fee includes the product, the appointment and a follow-up review at four weeks."
      faqs={[
        {
          question: 'How is HarmonyCa different from regular dermal filler?',
          answer:
            'Standard hyaluronic acid filler simply replaces volume and gradually dissolves over six to eighteen months. HarmonyCa is a hybrid: the hyaluronic acid gives an immediate lift, but the calcium hydroxyapatite microspheres also stimulate your own collagen production for months afterwards. So instead of just filling a hollow, you actually rebuild some of the structural support that has been lost. The result tends to look more natural and last considerably longer, which is why I reach for it for jaw and cheek work in clients over thirty-five.',
        },
        {
          question: 'How long does it last?',
          answer:
            'Most clients see results lasting twelve to eighteen months, with some still happy at the two-year mark. The hyaluronic acid component dissolves over the first nine months or so, but the new collagen your body has produced in response to the calcium microspheres carries the result on. A small top-up at the twelve-month review is often enough to keep things looking the same rather than starting from scratch, which makes it a sensible long-term investment.',
        },
        {
          question: 'Which areas can be treated?',
          answer:
            'HarmonyCa is licensed for the lower face, so I use it most often for jawline definition, cheek lift, marionette lines and the area in front of the ears where the face naturally drops with age. It is not appropriate for lips, tear troughs or the very upper face, where softer fillers and Profhilo are better choices. In your consultation I will map exactly where the product needs to go and where it absolutely should not, which is just as important.',
        },
        {
          question: 'Is there any downtime?',
          answer:
            'Plan for two to three days of mild swelling and possible bruising, plus some tenderness when you press on the treated area. Most clients feel completely normal by day four and are fine to be photographed by the end of the first week. You will be given a short massage protocol to follow for seven days to help the product settle smoothly. Avoid the gym, saunas and facials for at least 48 hours, and dental work for two weeks where possible.',
        },
        {
          question: 'Will I look overdone?',
          answer:
            'Not in my chair. HarmonyCa works best when used conservatively to support facial structure rather than to dramatically reshape it. I prefer to place a sensible amount, see you again at four weeks and add more only if needed. The point of this product is that the collagen response builds the result for you over time, so there is no need to overload the face on day one. Friends should think you look well, not different.',
        },
      ]}
      practitionerNote="HarmonyCa is one of the most exciting injectables I have added to the clinic in years. The instant lift is lovely, but it is the collagen response over the following months that really wins clients over. Subtle, structural and properly long lasting."
    />
  )
}
