// Consent / intake forms — the clinic's own back-end copy of the forms that
// currently live in Ovatu. These are reproduced VERBATIM from the live Ovatu
// forms so the wording, fields, options and declarations match exactly what
// clients sign today. Do not paraphrase, reword or "improve" anything here:
// these are medical/legal documents and must mirror the source.
//
// Source: extracted from Visage Aesthetics – Ovatu Manager (14 forms total).
// Captured and encoded below (exact):
//    1. Botox Consent Form
//    2. Dermal Filler Consent Form
//    3. Skin Booster Consent Form
//    4. Polynucleotide Consent Form
//    5. B12 Consent Form                 (declaration was TRUNCATED in Ovatu; completed here, push back to Ovatu)
//    6. NAD Consent Form                 (declaration was TRUNCATED, same as B12; completed here, push back to Ovatu)
//    7. CryoPen Consent Form             (its own form — NOT the Dermal Filler one)
//    8. Micro-Needling Consent
//    9. Haytox Consent Form              (Botox for hay fever / rhinitis)
//   10. Hyalase Consent Form             (hyaluronidase / filler dissolving)
//   11. Profhilo Structura Consent Form  (its own form — NOT the Skin Booster one)
//   12. HarmonyCa                        (its own form — NOT the Dermal Filler one)
//   13. HIFU Mini
//   14. Aqualyx Consent Form           (ADAPTED — see note on that form: the
//       Ovatu source had no Personal Details and no tick-to-agree declaration,
//       so the standard block + declaration were added to fit our model)
// All 14 Ovatu forms are now captured and encoded.
//
// Signature model: every Ovatu form uses a single tick-to-agree checkbox next
// to the declaration. There is no drawn signature, typed-name or date field in
// the source, so we capture name + date automatically and a single agreement
// tick, to match.

export type ConsentFieldType =
  | 'heading'
  | 'info'
  | 'short-text'
  | 'long-text'
  | 'number'
  | 'date'
  | 'email'
  | 'phone'
  | 'yes-no'
  | 'single-choice'
  | 'multi-choice'

export type ConsentField = {
  type: ConsentFieldType
  label: string
  options?: string[]
  required?: boolean
  helper?: string
}

export type ConsentForm = {
  id: string
  /** Exact title as shown in Ovatu. */
  name: string
  /** Verbatim preamble shown before the questions. */
  intro: string
  fields: ConsentField[]
  /** The tick-to-agree declaration, verbatim. */
  declaration: string
  /**
   * Set when the declaration text is known to be incomplete/truncated in the
   * SOURCE (Ovatu). Reproduced as-is for fidelity; flagged for correction.
   */
  declarationTruncated?: boolean
}

// Shared personal-details block (was identical across every captured Ovatu
// form). Two clinic tightening changes have been made here and MUST be pushed
// back to the live Ovatu forms so what clients sign matches:
//   1. Date of Birth is now a real date field (was free text).
//   2. A required "I am 18 or over" attestation is captured in writing, to
//      meet the policy condition that aesthetic injectables and prescribing are
//      for over-18s only. This records the attestation; staff should still
//      verify age at the appointment for any treatment that needs it.
const PERSONAL_DETAILS: ConsentField[] = [
  { type: 'heading', label: 'Personal Details' },
  { type: 'short-text', label: 'First Name', required: true },
  { type: 'short-text', label: 'Last Name', required: true },
  { type: 'date', label: 'Date of Birth', required: true },
  { type: 'short-text', label: 'Address', required: true },
  { type: 'short-text', label: 'E-mail', required: true },
  { type: 'short-text', label: 'Contact Number', required: true },
  { type: 'short-text', label: 'Doctor Surgery', required: true },
  {
    type: 'yes-no',
    label: 'I confirm I am 18 years of age or over',
    options: ['Yes', 'No'],
    required: true,
    helper: 'Aesthetic treatments are for clients aged 18 and over only.',
  },
]

const STANDARD_DECLARATION =
  'I accept and understand the information provided to me both verbally and within this form. All information I am consenting is correct'

// The B12 and NAD declarations were TRUNCATED in Ovatu itself (ended mid-word
// at "...treatment deta"). The original full text is not recoverable from the
// source, so a complete informed-consent declaration has been authored here to
// close the gap. This MUST be pushed back to the live Ovatu B12 and NAD forms
// so the document clients actually sign carries the full declaration.
const COMPLETE_INJECTABLE_DECLARATION =
  'I accept and understand the information provided to me both verbally and within this form. I confirm that my treating practitioner has: provided me with sufficient information about the treatment, its details, benefits, risks, possible side effects and alternatives; answered my questions to my satisfaction; and explained that no specific result can be guaranteed. I confirm that the medical history and personal information I have given is accurate and complete to the best of my knowledge, and I understand that withholding information may affect my safety. I consent to the treatment described above.'

const INJECTABLE_PRE_POST = `Pre-Treatment Instructions: • {TREATMENT} must not be administered if you have had any vaccines, immunizations, procedures, illnesses, or dental work in the past two weeks and for an additional two weeks after this procedure. • Do not {USE} if you are pregnant or breastfeeding, are allergic to any of the ingredients, suffer from any neurological or autoimmune disorders, are experiencing any cold or flu-like symptoms, or have any active inflammatory processes (cysts, pimples, rashes, hives). • For optimal results, and to minimize the chance of bleeding or bruising at the injection site, please avoid all blood-thinning medications (unless prescribed) and supplements for one week prior to your appointment. This includes over-the-counter medication such as aspirin and ibuprofen. If you are taking prescribed blood thinning medication, please consult with your named clinician before stopping these. Also avoid herbal supplements such as garlic, vitamin E, ginko biloba, St. John's Wort and omega-3 capsules. If you have a cardiovascular history, please check with your doctor prior to stopping use of aspirin. Do not drink alcoholic beverages 24 hours before or after your treatment to avoid extra bruising. • Inform your provider if you have a history of Perioral Herpes to receive advice on antiviral therapy prior to treatment. • Avoid topical products such as Tretinoin (Retin-A) retinols, retinoids, glycolic acid, alpha hydroxy acid, or any "anti-aging" products for two days before and after treatment. Post-Treatment Instructions: • Avoid significant movement or massage of the treated area unless instructed by provider. • Avoid strenuous exercise or anything that increases your heart rate for 24 hours. • Avoid extensive sun or heat for 72 hours (no sauna, hot tub). • Avoid consuming excess amounts of alcohol or salts to avoid excessive swelling. • You may apply a cool compress or ice pack for 15 minutes each hour while awake to reduce swelling. • Use paracetamol for discomfort. No NSAIDs (ibuprofen, aspirin) for 24 hours as they can increase bleeding. • Try to sleep face up and slightly elevated if you experience swelling. • You may want to consider taking Arnica (found in health food stores) to help with the bruising and swelling. • Avoid wearing makeup the day of procedure ( 12 hours post procedure). • Sanitize your phone before putting it to your face and try to talk on speaker phone as much as you can day of. • Wait a minimum of two weeks before dental work, immunizations, or laser treatments.`

export const CONSENT_FORMS: ConsentForm[] = [
  {
    id: 'botox',
    name: 'Botox Consent Form',
    intro: `Consent and consultation form for patients treated with BOTOX® (Botulinum Toxin Type A) BOTOX® is indicated for the temporary improvement in the appearance of moderate to severe vertical lines between the eyebrows seen at maximum frown (glabellar lines); moderate to severe lateral canthal lines (crow's feet lines) seen at maximum smile; moderate to severe crow's feet lines seen at maximum smile and glabellar lines seen at maximum frown when treated simultaneously in adults, when the severity of these lines has an important psychological impact for the patient. Like all medicines, BOTOX® can have side effects, although not everybody gets them. In general, side effects occur within the first few days following injection. They usually last only for a short time, but they may last for several months and in rare cases, longer. These adverse reactions may be related to treatment, injection technique or both. Diffusion of botulinum toxin into nearby muscles is possible when high doses are injected, particularly in the neck area. As expected for any injection procedure, pain/burning/stinging, swelling and/or bruising may be associated with the injection. Speak to your doctor if you are worried about this. Adverse reactions possibly related to the spread of toxin distant from the site of administration have been reported very rarely with botulinum toxin (e.g. muscle weakness, constipation, difficulty in swallowing, food or liquid accidentally going into the lungs which in some cases may lead to pneumonia). Injection of BOTOX® is not recommended in patients with a history of dysphagia (difficulty to swallow) and impaired swallowing. The chance of having a side effect is described by the following categories: Common - More than 1 out of 100 persons and less than 1 out of 10 persons. Uncommon - More than 1 out of 1,000 persons and less than 1 out of 100 persons. Injections in the forehead for vertical lines Common side effects are: Headaches, drooping eye lid, skin redness, localised muscle weakness, face pain. Uncommon side effects are: Infection, anxiety, numbness, dizziness, inflammation of the eyelid, eye pain, visual disturbance, nausea (feeling sick), dry mouth, skin tightness, swelling (face, eyelid, around the eyes), sensitivity to light, itching, dry skin, muscle twitching, flu syndrome, lack of strength, fever. Injections in the fan-shaped lines from the corner of the eyes Common side effects are: Swelling of the eyelid, injection site bleeding and/or bruising. Uncommon side effects are: Injection site pain and/or tingling or numbness. Injections in the fan-shaped lines from the corner of the eyes, when treated at the same time as injections in the forehead for vertical lines Common side effects are: Injection site bruising. Uncommon side effects are: Injection site bleeding and/or pain. The following additional side effects have been reported for BOTOX® since it has been marketed: allergic reactions, which can be serious (swelling of the face and airways, difficulty in breathing), loss of nerve supply to/shrinkage of injected muscle, respiratory depression and/or respiratory failure, aspiration pneumonia (lung inflammation caused by accidentally breathing in food, drink, saliva or vomit), chronic disease affecting the muscles (myasthenia gravis), blurred vision, difficulties in seeing clearly, slurred speech, strabismus (squint), numbness, tingling and pain in hands and feet, fainting, pain/numbness/ or weakness starting from the spine, drooping of the muscles on one side of the face, weakness of the face muscles, difficulty moving the arm and shoulder, decreased skin sensation, muscle pain, abdominal pain, diarrhoea, vomiting, loss of appetite, dry mouth, feeling sick, fever, different types of red blotchy skin rashes, feeling generally unwell, speech problems, itching, excessive sweating, hair loss, loss of eyebrows, decreased hearing, noises in the ear, feeling of dizziness or "spinning" (vertigo). Allergic reactions, difficulties to swallow, speak or breathe, have been reported rarely when botulinum toxin type A has been used for other uses. Visit your doctor immediately if such signs develop after BOTOX® treatment. If any of the side effects get serious, or if you notice any side effects not listed in this leaflet, please tell your doctor or pharmacist. BOTOX® should only be administered by medically qualified physicians with appropriate qualifications and expertise in this treatment and having the required equipment. Too frequent or excessive dosing of BOTOX® may increase the risk of antibodies in the blood which may lead to failure of treatment with botulinum toxin when used for this and other conditions. The aesthetic effects of BOTOX® last for an average of 3-4 months but will vary depending on the condition of the skin, area treated, amount of product injected, injection technique and lifestyle factors such as sun exposure and smoking. 2 Weeks Before Botox Make sure you schedule your Botox appointment at least 2 weeks prior to any special occasions such as a vacation or a wedding. Results from Botox injections and dermal fillers take around 4-7 days to appear. You should also avoid blood thinning medications and anti-inflammatory medicines for the 2 weeks leading up to your treatment. Also avoid aspirin, vitamin E, ginkgo biloba, ginseng, St. John's Wort, Omega 3/Fish Oil supplements, and NSAIDs such as Ibuprofen and Advil. All of these can thin your blood which increases the likelihood of you experiencing swelling or bruising after botox injections. Discuss with your doctor any concerns you may have. It may not be prudent for you to stop taking certain prescription medication. 48 Hours Before Botox 2 days before your Botox procedure you should stop taking Retin-A. Also, do not take it for the 2 days following your botox injections. If you have a cold sore or an acne breakout on the target botox area, reschedule your appointment. If you are prone to cold sores, let your botox clinic know. You may be given anti-viral medication during your visit. 24 Hours Before Botox Alcohol has a blood thinning side effect. Do not drink any alcohol for at least 24 hours before your treatment. On the morning of your procedure, ensure you eat a healthy, nourishing breakfast. If your appointment is later in the day, make sure you eat close to your appointment. This will prevent you from becoming faint or lightheaded during your treatment. After treatment, please avoid extreme facial expressions, alcohol consumption and applying make up for 12 hours. Please avoid extreme sun exposure, UV light, extreme temperatures, saunas and Jacuzzi's for 2 weeks after treatment. Please avoid exercise for 24 hours`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Thyroid Disease', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure'],
        required: true,
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Do you have any allergies?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you take any medications (prescribed or over the counter)', options: ['Yes', 'No'], required: true, helper: 'If yes, please inform your practitioner' },
      { type: 'single-choice', label: 'How frequently do you feel dissatisfied with your appearance?', options: ['Rarely', 'A few days a month', 'At least once a week', 'Every day', 'Never'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'dermal-filler',
    name: 'Dermal Filler Consent Form',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT Treatment with dermal fillers (such as Juvederm, and others) can smooth out facial folds and wrinkles, add volume to the lips, and contour facial features that have lost their volume and fullness due to ageing, sun exposure, illness, etc. The dermal fillers are injected under the skin with a very fine needle. This produces natural appearing volume under wrinkles and folds which are lifted up and smoothed out. The results can often be seen immediately. RISKS AND COMPLICATIONS Before undergoing this procedure, understanding the risks are essential. No procedure is completely risk-free. The following risks may occur, but there may be unforeseen risks and risks that are not included on this list. Some of these risks, if they occur, may necessitate hospitalisation, and/or extended outpatient therapy to permit adequate treatment. It has been explained to me that the risks include but are not limited to: 1) Post treatment discomfort and pain, swelling, redness, bruising, and discolouration of skin; 2) Post treatment infection; 3) Allergic reactions; 4)Reactivation of herpes (cold sores); 5) Lumpiness, visible yellow or white patches; 6) Granuloma (delayed reaction and lump) formation; 7) Localised skin or tissue loss and necrosis due to blockage of a blood vessel by injected product, and/or sloughing, with scab and/or without scab; 8) asymmetry 9) visual problems and blindness Pre-Treatment Instructions: • Dermal fillers must not be administered if you have had any vaccines, immunizations, procedures, illnesses, or dental work in the past two weeks and for an additional two weeks after fillers. • Do not use dermal fillers if you are pregnant or breastfeeding, are allergic to any of the ingredients, suffer from any neurological or autoimmune disorders, are experiencing any cold or flu-like symptoms, or have any active inflammatory processes (cysts, pimples, rashes, hives). • For optimal results, and to minimize the chance of bleeding or bruising at the injection site, please avoid all blood-thinning medications and supplements for one week prior to your appointment. This includes over-the-counter medication such as aspirin and ibuprofen. If you are taking prescribed blood thinning medication, please consult with your named clinician before stopping these. Also avoid herbal supplements such as garlic, vitamin E, ginko biloba, St. John's Wort and omega-3 capsules. If you have a cardiovascular history, please check with your doctor prior to stopping use of aspirin. Do not drink alcoholic beverages 24 hours before or after your treatment to avoid extra bruising. • Inform your provider if you have a history of Perioral Herpes to receive advice on antiviral therapy prior to treatment. • Avoid topical products such as Tretinoin (Retin-A) retinols, retinoids, glycolic acid, alpha hydroxy acid, or any "anti-aging" products for two days before and after treatment. Post-Treatment Instructions: • Avoid significant movement or massage of the treated area unless instructed by provider. • Avoid strenuous exercise or anything that increases your heart rate for 24 hours. • Avoid extensive sun or heat for 72 hours (no sauna, hot tub). • Avoid consuming excess amounts of alcohol or salts to avoid excessive swelling. • You may apply a cool compress or ice pack for 15 minutes each hour while awake to reduce swelling. • Use paracetamol for discomfort. No NSAIDs (ibuprofen, aspirin) for 24 hours as they can increase bleeding. • Try to sleep face up and slightly elevated if you experience swelling. • You may want to consider taking Arnica (found in health food stores) to help with the bruising and swelling. • Avoid wearing makeup the day of procedure ( 12 hours post procedure). • Sanitize your phone before putting it to your face and try to talk on speaker phone as much as you can day of. • Wait a minimum of two weeks before dental work, immunizations, or laser treatments.`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'short-text', label: 'If yes, please state name and dosage of medication below', required: true },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions'],
        required: true,
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you allergic to bee-stings?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you had any dental work within the last 2 weeks?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any antibiotics?', options: ['Yes', 'No'], required: true },
      { type: 'multi-choice', label: 'How often are you dissatisfied with your appearance?', options: ['Never', 'Rarely', '1-2 days per month', 'Every week', 'Every day/ Most days'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'skin-booster',
    name: 'Skin Booster Consent Form',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT They are made up of a high percentage of hyaluronic acid (HA) which is a substance that our bodies naturally produce that helps to maintain moisture levels within our skin. As we age we lose roughly 1% of our HA stores each year after the age of 30, this can result in the formation of fine lines and volume loss. By injecting HA into the skin, in the form of skin boosters, we deliver high levels of hydration which can help improve skin tone, texture, firmness and even reduce fine lines and wrinkles. ${INJECTABLE_PRE_POST.replace('{TREATMENT}', 'Skin Boosters').replace('{USE}', 'use Skin Boosters')}`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'short-text', label: 'If yes, please state name and dosage of medication below', required: true },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions'],
        required: true,
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you allergic to bee stings?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you had any dental work within the last 2 weeks?', options: ['Yes', 'No'], required: true },
      { type: 'multi-choice', label: 'How often are you dissatisfied with your appearance?', options: ['Never', 'Rarely', 'Monthly', 'Weekly', 'Most Days/Every Day'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'polynucleotide',
    name: 'Polynucleotide Consent Form',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT Polynucleotide treatments use a solution derived from salmon or trout DNA to stimulate collagen and elastin production, which helps rejuvenate and regenerate the skin. The treatment is effective for improving skin texture, reducing fine lines, and restoring a youthful appearance, making it ideal for individuals looking for a refreshed look without invasive procedures. ${INJECTABLE_PRE_POST.replace('{TREATMENT}', 'Polynucleotides').replace('{USE}', 'have a Polynucleotide treatment')}`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'short-text', label: 'If yes, please state name and dosage of medication below', required: true },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions'],
        required: true,
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you allergic to fish?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you had any dental work within the last 2 weeks?', options: ['Yes', 'No'], required: true },
      // NOTE: "apperaance" is the exact spelling stored in Ovatu. Reproduced verbatim.
      { type: 'multi-choice', label: 'How often are you dissatisfied with your apperaance?', options: ['Never', 'Rarely', 'Weekly', 'Monthly', 'Most Days/Every Day'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'b12',
    name: 'B12 Consent Form',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your practitioner. B12 injections are typically used as a treatment for a certain type of anemia (pernicious anemia). In this type of anemia, people lack intrinsic factor in the stomach which is necessary for the absorption of the vitamin. Vegetarians (especially vegans) are also given shots of B12 since their diet is low in animal products, the primary source of B12. People with chronic fatigue or anemia require weekly to monthly injections of vitamin B12 usually because the oral form is not dependable. Vitamin B12 shots are most effective when taken at regular intervals (usually weekly or monthly). A regular schedule to receive the injections can be customized to each individual. The body's ability to absorb vitamin B12 is reduced with increasing age. Older people are often detected to have a more potent vitamin B12 deficiency, even in cases where they do not suffer from pernicious anemia. Methylcobalamin (Methyl B12} is a unique form of vitamin B12, which is more readily converted into the coenzyme forms than conventional cyanocobalamin. Mehtylcobalamin also readily binds body stores of cyanide. Deficiency of vitamin B12 can lead to abnormal neurological and psychiatric symptoms including ataxia (shaky movements and unsteady gait), muscle weakness, spasticity, incontinence, hypotension, vision problems, dementia, psychoses, and mood disturbances. Benefits of B12 More Energy, Mental Alertness and Stamina for everyday tasks Healthier Immune Systems Improves Sleep Increases Metabolism, thereby aiding in Weight Loss Reduces Allergies, Stress and Depression Improves Mood Stabilization Lessens Frequency and Severity of Migraines and Headaches Helps lower Homocysteine Levels in the blood, thereby reducing the probability of Heart Diseases and Strokes. Side effects B12 injections are typically very well tolerated and very safe. However, some people may experience some pain, swelling or redness at the injection site. If any of these symptoms occur or you are concerned about other symptoms, please contact your health care provider.`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'short-text', label: 'If yes, please state name and dosage of medication below', required: true },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Autoimmune Conditions', 'Epilepsy/Convulsions', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Porphyria', 'Bleeding Conditions', "Memory Loss/ Alzheimer's", 'Immunosupression', 'Numbness/Tingling of the body', 'Prenicious Anemia', 'IBD', 'MS', 'An active Infection', 'Intolerance/Allergy to Cobalt'],
        required: true,
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
    ],
    // Was TRUNCATED in Ovatu; completed here. Push the full text back to Ovatu.
    declaration: COMPLETE_INJECTABLE_DECLARATION,
  },
  {
    id: 'nad',
    name: 'NAD Consent Form',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your practitioner. About NAD+ NAD (Nicotinamide Adenine Dinucleotide) is essential for our cellular health. It is a coenzyme found in all cells of the body. It is revered for its anti-ageing properties and plays a key role in prolonging lifespan. These powerful molecules have the potential to slow down age-related changes occurring in the skin, brain, and all vital organs and tissues. Therapeutic NAD Injections can help combat several undesirable side-effects of ageing, as well as chronic conditions affecting the skin and health. Benefits of NAD Injections Promotes normal circadian rhythm for sleep Improves mental clarity, alertness, concentration, and memory Energy Metabolism: NAD is essential for converting food into energy. It powers metabolic processes by transferring electrons in the mitochondria, our cells powerhouse Cellular repair: NAD supports DNA repair, protecting cells from damage caused by aging, toxins or environmental stressors What are Contraindications & Considerations to getting NAD? History of Cancer or significant family history of Cancer, genetic predisposition as determined by Medical Director in consult Cardiovascular disease-History of severe heart failure, multiple medicated hypertension, and arrhythmogenic issues-as determined by Medical Director in consult Pregnancy (there is no safety data for use of NAD in pregnant clients); client must attest they are not pregnant to receive NAD infusion(intravenous "IV")/intramuscular injection ("IM"); if client is not absolutely positive she is not pregnant, then postponement and a client's self-administered pregnancy test is recommended prior to beginning any course of NAD IV/IM Breastfeeding (there is no safety data for use of NAD in clients who are regularly engaged in breastfeeding a child); client must attest they are not breastfeeding to receive NAD IM injections. Severe chronic illnesses like kidney or liver disease as this may affect how the body processes NAD. Metabolic Disorders. Clients with conditions like gout or hyperuricaemia may experience worsening symptoms as NAD may influence uric acid levels.`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'long-text', label: 'If yes, please state name and dosage of medication below' },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        // "Immunosupression" (one 's') and "Prenicious Anemia" (should be "Pernicious") are verbatim Ovatu typos.
        options: ['Allergies', 'Autoimmune Conditions', 'Epilepsy/Convulsions', 'Diabetes', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Bleeding Conditions', 'Immunosupression', 'Numbness/Tingling of the body', 'Prenicious Anemia', 'MS', 'An active Infection', 'Fatigue'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
    ],
    // Was TRUNCATED in Ovatu, identically to B12; completed here. Push to Ovatu.
    declaration: COMPLETE_INJECTABLE_DECLARATION,
  },
  {
    id: 'cryopen',
    name: 'CryoPen Consent Form',
    intro: `Cryosurgery is minimally invasive treatment of controlled destruction of unwanted tissue by the application of extreme cold. Cryosurgery is used to treat different types of lesions on the skin such as skin tags, warts and many more. Rapid freezing to -27°C and more will produce cryonecrosis in all benign human tissues. Although necrosis takes place at -27°C we have to take into consideration the body temperature, so the treatment needs to be done at least -64°C Difference between liquid nitrogen and nitrous oxide Nitrous oxide rapidly freezes and destroys targeted cells but it's not so cold as to cause unwanted damage to the surrounding healthy tissue. Nitrous oxide works at -89°C as cold as you can go without causing tissue damage. Liquid nitrogen is -196°C and provides a much higher the risk of damage. The CryoPen applicator is designed for precision and allows a focused gas flow that targets only the lesion and provides pinpoint accuracy during the treatment. Cryosurgery using liquid nitrogen involves the use of a cryoprobe or a cotton-tipped applicator that could be less precise than the CryoPen. This is why nitrous oxide is now favoured over liquid nitrogen Risks and Side Effects CryoPen Therapy is a relatively low risk-risk treatment and side effects and complications are usually minimal. Some side effects may occurs a result of the treatment. These include: Pigment changes: Both hypo-pigmentation (lightening of the skin) and hyper-pigmentation (darkening of the skin). Both can last a few months but can be longer lasting. Shards of frozen humidity: The innovation of the CryoPen is the direct application of nitrous oxide under pressure (55 bar). The high pressure jet may cause minor shards of frozen humidity in the air blown away in a circle of approx 30cm, They will thaw the moment they would eventually touch healthy skin. Lesions on sites with coarse thermal hair: Hair follicles are easily damaged by cryosurgery and permanent alopecia is not uncommon. Nerve Damage: Though rare, damage to nerves are possible, particularly in areas where they are closer to the surface such as fingers, wrists and the area behind the ear. Reports suggest thar this may disappear after several months. Blisters: Patients may experience blistering for a period of 7-14 days post treatment and potentially up to 2-4 weeks depending on the area treated. Lesions on the body generally have a longer healing period compared to those that those on the face. Considerations Pregnancy or Breastfeeding: It is advised to abstain from treatment due to unknown side effects Antihistamine: Treatment with CryoPen cannot be performed if you are taking Anti-histamines. Please avoid taking them for 2-3 days prior to your treatment unless medically prescribed. *Please ensure that you have sought medical advice and have confirmed that the lesion is benign`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Have you previously had Cryotherapy treatment?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Thyroid Disease', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', "Raynaud's Disease", 'Multiple Myeloma', 'Skin Cancer', 'Adverse reaction to cold temperatures'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you planning to go abroad or use sunbeds in the next 3 weeks?', options: ['Yes', 'No'], required: true },
      // "rarely" (lower-case) and "Most Days/Every days" are verbatim Ovatu inconsistencies.
      { type: 'single-choice', label: 'How often are you dissatisfied with your appearance?', options: ['Never', 'rarely', 'Monthly', 'Weekly', 'Most Days/Every days'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'micro-needling',
    name: 'Micro-Needling Consent',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT To the patient: Being fully informed about your condition and treatment will help you make the decision whether or not to have a microneedling treatment. This disclosure is not to alarm you but to better inform you so that you may withhold your consent for this treatment. Description of the Procedure Microneedling treatment allows for controlled induction of the skin's self-repair mechanism by creating micro-"injuries" in the skin, which triggers new collagen synthesis, yet does not pose the risk of permanent scarring. The result is smoother, firmer and younger-looking skin. Microneedling procedures are performed in a safe and precise manner with the use of the sterile needle head. The procedure is normally completed within 30-60 minutes, depending on the required treatment and anatomical site. Side Effects After the procedure, the skin will be red and flushed in appearance in a similar way to moderate sunburn. You may also experience skin tightness and mild sensitivity to touch on the area being treated. This will diminish greatly after a few hours following treatments and within the next 24 hours the skin will be completely healed. After three days there is barely any evidence that the procedure has taken place. Contraindications Microneedling treatment is contraindicated for patients with: keloid scars, scleroderma, collagen vascular diseases or cardiac abnormalities, a hemorrhagic disorder or haemostatic dysfunction, active bacterial or fungal infection.`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'long-text', label: 'If yes, please state name and dosage of medication below' },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions', 'Active Infection'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'haytox',
    name: 'Haytox Consent Form',
    intro: `BOTOX® should only be administered by medically qualified physicians with appropriate qualifications and expertise in this treatment and having the required equipment. Too frequent or excessive dosing of BOTOX® may increase the risk of antibodies in the blood which may lead to failure of treatment with botulinum toxin when used for this and other conditions. The aesthetic effects of BOTOX® last for an average of 3-4 months Botox for the treatment of hay fever and Rhinitis is used ''Off label''. Off label use means that the medicine has a license for treating some conditions (e.g muscle spasticity, cosmetic use) but the manufacturer has not applied for a license for it to be used for hay fever or rhinitis. Like all medicines, BOTOX® can have side effects, although not everybody gets them. In general, side effects occur within the first few days following treatment. They usually last only for a short time, but they may last for several months and in rare cases, longer. These adverse reactions may be related to treatment, technique or both. Possible side effects with using Botox for the treatment of hay fever/rhinitis are extremely rare. However, the following may occur: Atomiser site discomfort Bleeding from the nostrils Redness, itching or irritation Headache Under eye puffiness Flu-like symptoms Anxiety symptoms Lack of effect If you experience any of these, please inform your practitioner. You cannot have this treatment if you have any of the following: An allergy to Botox or materials used in the treatment You currently have infected rhinitis You are pregnant or breastfeeding If you have a bleeding disorder that is poorly controlled on anti-coagulant therapy You must tell us if you suffer from the following: Severe anxiety If you have a deviated septum or problems with inhalation Pre-Care: It is advisable to perform a saline nasal spray 30-60 minutes prior to the appointment. This will wash away existing pollen particles and prepare the nasal passage to have better contact with the toxin Aftercare You must not use a nasal spray for 24 hours following your procedure You may use all your other hay fever/rhinitis medication as normal Results take 1-2 weeks to take effect Your practitioner may review you at a 2 week period and may suggest a dose adjustment`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Thyroid Disease', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you taking any prescribed or over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'long-text', label: 'If yes, please state name and dose below' },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'hyalase',
    name: 'Hyalase Consent Form',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT Uses of Hyalase (Hyaluronidase) 1. Aesthetic Medicine – It is commonly used to dissolve dermal fillers (like hyaluronic acid fillers) in case of overcorrection, lumps, migration, or complications. 2. Ophthalmology – Used in eye surgeries to enhance the spread of local anesthesia. 3. Dermatology & Medicine – Helps improve the absorption of subcutaneous injections (e.g., local anesthetics, fluids). 4. Emergency Treatment – Used to manage vascular occlusions caused by filler injections, which can lead to skin necrosis if untreated. Treatment & Administration - Injection: Hyalase is injected directly into the area requiring treatment. - Dosage: Depends on the purpose (e.g., dissolving fillers vs. improving drug absorption). - Effect Time: Works within 24–48 hours for filler dissolving, but minor results can be seen sooner. - Repeat Treatments: Sometimes required for full effect. Side Effects & Risks - Swelling & Redness: Common but temporary. - Bruising: May occur at the injection site. - Allergic Reactions: Rare but possible—skin testing may be recommended. Allergic reaction including anaphylactic shock are possible, they occur at a rate of between 1/2000 and 1/100 depending on the data source. Anaphylactic shock has a mortality rate 0.3 to 5% depending on the study. An allergy test can often identify this risk prior to full exposure. Local reactions include oedema, erythema, pain and itching, urticaria and angioedema. - Over dissolving: If too much is used, it may break down the body's natural hyaluronic acid.`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'long-text', label: 'If yes, please state name and dosage of medication below' },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you allergic to bee-stings?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you had any dental work within the last 2 weeks?', options: ['Yes', 'No'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'profhilo-structura',
    name: 'Profhilo Structura Consent Form',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT About Profhilo Structura From the scientists behind the sought-after Profhilo skin treatment, Profhilo Structura is a truly ground-breaking injectable treatment that targets and regenerates your natural facial fat pads. The results are a more lifted, naturally contoured and rejuvenated facial profile without looking artificially enhanced. Profhilo Structura should not be mistaken for a dermal filler, skin booster, nor the original Profhilo treatment. It is a unique category of advanced treatment. Unlike skin boosters or the original Profhilo skin treatment, Profhilo Structura specifically targets the mid-face superficial fat and triggers regeneration; this is important because the ageing process shrinks and drops these fat pads, leading to facial hollowness, sagging skin, jowl formation, lack of facial definition, and more. Profhilo Structura differs to dermal fillers as dermal fillers physically replace lost fat with a synthetic hyaluronic acid-based gel. Structura stimulates the restoration of your fat pats, not replication of them. Possible Side-Effects Some individuals may have an allergic reaction to the components of Profhilo Structura, such as hyaluronic acid. Symptoms of an allergic reaction may include itching, swelling, or rash. It's a rare adverse reaction and can be prevented by a thorough discussion of the health condition during consultation with the doctor. If you suspect an allergic reaction seek medical attention promptly. There is a risk of infection at the injection sites, particularly if proper hygiene protocols are not followed during the procedure. Signs of infection may include increased redness, warmth, pain, or discharge from the treated area. Granulomas, which are small, firm bumps under the skin, may develop at the injection sites. They are a rare complication of Profhilo injections. These require further medical intervention to address. Nerve damage may occur as a result of injectable treatment. Symptoms may include numbness, tingling, or loss of sensation in the fixed area. Are There Contraindications for Injectable Treatments Like Profhilo Structura? Injection treatments are not performed on individuals under 18, pregnant, or breastfeeding. Contraindications include active herpes, inflammation or active skin disease in the treatment area, excessive scarring, porphyria, skin damage or open wounds in the treatment area, active skin cancer, warts, bacterial or fungal infections, frostbite or sunburned skin. If you have any questions or concerns, please raise these with your practitioner before your treatment.`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'long-text', label: 'If yes, please state name and dosage of medication below' },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you allergic to bee stings?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you had any dental work within the last 2 weeks?', options: ['Yes', 'No'], required: true },
      { type: 'single-choice', label: 'How often are you dissatisfied with your appearance?', options: ['Never', 'Rarely', 'Monthly', 'Weekly', 'Every day/Most days'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'harmonyca',
    name: 'HarmonyCa',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT The HArmonyCa treatment is a dual-effect hybrid injectable that combines Calcium Hydroxyapatite (CaHA) with Hyaluronic Acid (HA). HArmonyCa provides an immediate lift from the Hyaluronic Acid, a natural substance found within us which causes us to look plump and youthful when we are young. It also provides a sustained lifting effect from new collagen production associated with Calcium Hydroxyapatite. As we age, your body starts producing less collagen which reduces the volume behind our skin. Re-introducing the Hyaluronic Acid and Calcium Hydroxyapatite using the hybrid injectable HArmonyCa treatment can help you boost and support the bodies collagen production whilst improving your skin architecture, enhancing and sculpting the face. Risks/Side Effects This injectable has received CE-mark approval, allowing wide use in Europe. Despite undergoing rigorous clinical trials and tests, aesthetic providers should discuss that common Harmonyca side effects may still occur after treatments. These typically last for a few days, subside independently, and may range from mild to moderate. Temporary Redness and Swelling: After the injection, patients may notice redness and swelling at the treatment site. This is a normal reaction as the skin adjusts to the filler. The symptoms generally resolve within a few days and can be managed by applying a cold compress. Mild Discomfort or Tenderness: Some patients may feel mild discomfort or tenderness at the injection site, which is the body's natural response to the needle and the filler formulation. This tenderness usually fades within a few days and can be alleviated with over-the-counter pain relievers if necessary. Itching or Bruising: Itching or minor bruising may also occur, particularly in sensitive areas. These symptoms are usually mild and resolve on their own within a week. Avoiding alcohol and certain medications before treatment can help minimize bruising. Allergic Reactions: Treated individuals with hypersensitivity to Harmonyca components may experience allergic reactions. Symptoms may include itching, hives, rash, difficulty breathing, or more severe reactions. Infection at the Injection Site: Although rare, infections may still occur. Improper administration, sterilization, or Harmonyca aftercare may cause this severe side effect. Nodule Formation or Lumps under the Skin: This rare side effect may be caused by uneven distribution during injection sessions and may require medical intervention. Aftercare Please avoid Strenious activity , exposure to sunlight and tanning lamps/beds or extreme weather conditions foro 24 hours after treatment. Applying an ice pack/cold compress to the treated area for 24 hours after treatment may help reduce redness, swelling and irritation. If nodules or small lumps appear, gently massage the area. If you have any concerns- please contact your practitioner/GP`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'long-text', label: 'If yes, please state name and dosage of medication below' },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        options: ['Allergies', 'Angina/heart related conditions', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Kidney/liver failure', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Are you allergic to bee-stings?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you had any dental work within the last 2 weeks?', options: ['Yes', 'No'], required: true },
      { type: 'single-choice', label: 'How often are you dissatisfied with your appearance?', options: ['Never', 'Rarely', '1-2 a month', 'Weekly', 'Every day/Most days'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    id: 'hifu',
    name: 'HIFU Mini',
    intro: `The purpose of this informed consent form is to provide written information regarding the risks, benefits and alternatives of the procedure named above. This material serves as a supplement to the discussion you have with your doctor/healthcare provider. It is important that you fully understand this information, so please read this document thoroughly. If you have any questions regarding the procedure, ask your doctor/healthcare professional prior to signing the consent form. THE TREATMENT HIFU, or High-Intensity Focused Ultrasound, offers a revolutionary approach to facial rejuvenation without surgery. This non-invasive procedure uses ultrasound energy to penetrate deep into the skin's layers, stimulating collagen production and tightening tissues. Unlike traditional facelifts or other invasive cosmetic procedures, HIFU doesn't require any incisions, injections, or damage to the skin's surface. The non-invasive nature of HIFU brings several benefits. Patients experience minimal discomfort during the treatment, with most describing it as a warm, tingling sensation. There's no need for anesthesia, and the risk of complications is significantly lower compared to surgical alternatives. The ultrasound energy used in HIFU is precisely focused on specific tissue depths below the skin's surface. This creates thermal coagulation points, which trigger the body's natural healing response. This response includes the production of new collagen and elastin, leading to gradual skin tightening and lifting effects. The precision of HIFU allows practitioners to target the foundational layers of the skin typically addressed in cosmetic surgery, but without cutting or disrupting the surface of the skin. HIFU Facial Treatment Procedure To prepare for your HIFU facial treatment, it's important to clean and clear your skin. This procedure utilizes targeted ultrasound waves that aim to tighten and lift your facial structure. Post-treatment, adhering to proper care guidelines is crucial to enhance the effects and ensure a smooth recovery. Here are the steps you should follow: Pre-Treatment Preparation Cleanse your skin to remove any makeup, oils, or dirt. Avoid using any harsh skincare products that might irritate your skin a few days prior. During the Procedure The clinician will apply a gel to your face; this acts as a conductor for the ultrasound waves. You may feel slight discomfort or warmth as the ultrasound energy penetrates the skin layers. Post-Treatment Care Keep your skin hydrated by drinking plenty of water and using a gentle moisturizer. Avoid direct sunlight and wear sunscreen to protect your skin. Don't use high-heat treatments like saunas or steam rooms for at least 48 hours. Following these steps will help you achieve the best possible results from your HIFU treatment.`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'yes-no', label: 'Do you smoke?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you drink alcohol?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you use sun beds?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Are you currently taking any prescribed medications or any over the counter medications?', options: ['Yes', 'No'], required: true },
      { type: 'long-text', label: 'If yes, please state name and dosage of medication below' },
      {
        type: 'multi-choice',
        label: 'Do you suffer from any of the following conditions?',
        // "Sclerroderma" (double-r) is a verbatim Ovatu typo.
        options: ['Allergies', 'Autoimmune Conditions', 'Arthritis', 'Epilepsy/Convulsions', 'Myasthenia Gravis', 'Gillian Barre Syndrome', "Bell's Palsy/Nerve Problems", 'Diabetes', 'Facial cold sores/acne', 'Active Cancer', 'HIV/Hepatitis', 'Hypertrophic scarring/Keloid', 'Porphyria', 'Bleeding Conditions', 'Pacemaker', 'Lupus', 'Sclerroderma', 'Metal Implants', 'Active Infections'],
      },
      { type: 'long-text', label: 'If you have any of the above conditions or are currently receiving any medical treatment, please provide details below', required: true },
      { type: 'yes-no', label: 'Are you Pregnant or Breast-feeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you ever had severe allergic or an anaphylactic reaction?', options: ['Yes', 'No'], required: true, helper: 'If YES, please inform your practitioner' },
      { type: 'yes-no', label: 'Have you had any dental work, fillers or threads within the last 4 weeks?', options: ['Yes', 'No'], required: true },
      { type: 'single-choice', label: 'How often are you dissatisfied with your appearance?', options: ['Never', 'Rarely', '1-2 a month', 'Weekly', 'Every day/most days'], required: true },
    ],
    declaration: STANDARD_DECLARATION,
  },
  {
    // ADAPTED to our model (Giles' decision). The Ovatu source for Aqualyx is
    // structurally unlike the others: it had NO Personal Details section, NO
    // tick-to-agree declaration (Data Consent toggle off), two fields both
    // labelled "Aqualyx & Lidocaine", and the consent statements embedded as the
    // pre-filled default text of a long-text box. To make it usable and
    // consistent here we: add the standard Personal Details block, show the
    // verbatim treatment overview + "I understand / I agree" statements as the
    // read-only intro, and add the standard tick-to-agree declaration.
    id: 'aqualyx',
    name: 'Aqualyx Consent Form',
    intro: `Aqualyx & Lidocaine Consent Form. This needs to be completed prior to the treatment commencing. Treatment Overview Aqualyx is an injectable fat-dissolving treatment used to reduce small, localised areas of stubborn fat. The active ingredient is deoxycholic acid, which works by breaking down fat cell membranes so the body can naturally eliminate the released fat over time. It is intended for body contouring and is not a weight-loss treatment. Common treatment areas include the chin, abdomen, thighs, upper arms, flanks, knees, and back rolls. I understand that common side effects may include: Swelling Bruising Redness Tenderness Itching Temporary numbness Firmness or nodules under the skin Mild discomfort or burning sensation I understand that rare but more serious complications may include: Infection Allergic reaction Skin irregularities Hyperpigmentation Persistent lumps or nodules Nerve irritation Tissue damage or skin necrosis Scarring I understand that no guarantee has been made regarding the outcome of treatment. I agree to follow all aftercare instructions provided, including: Avoiding strenuous exercise for 48 hours Avoiding excessive heat, saunas, and sunbeds Maintaining adequate hydration Avoiding alcohol for 24 hours where advised Contacting the practitioner immediately if I experience unusual pain, excessive swelling, or signs of infection`,
    fields: [
      ...PERSONAL_DETAILS,
      { type: 'heading', label: 'Medical History' },
      { type: 'info', label: 'Please state if you are/have any of the following;' },
      { type: 'yes-no', label: 'Pregnant or breastfeeding?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Liver Disease?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Diabetes', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Kidney Disease?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Autoimmune', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Taking anti-coagulants/blood thinners?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Previous fat dissolving treatments?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Blood clotting disorder?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Allergies to deoxycholate?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Have you any allergies?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Heart Condition?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'To your knowledge have you any allergies to Lidocaine or any local anaesthetic?', options: ['Yes', 'No'], required: true },
      { type: 'yes-no', label: 'Do you take prescribed or OTC medication?', options: ['Yes', 'No'], required: true },
      { type: 'short-text', label: 'If so please put below' },
    ],
    declaration: STANDARD_DECLARATION,
  },
]

export function getConsentForm(id: string): ConsentForm | undefined {
  return CONSENT_FORMS.find((f) => f.id === id)
}

/** True when a submitted value counts as a real answer for the given field. */
export function isAnswered(field: ConsentField, value: unknown): boolean {
  if (field.type === 'multi-choice') return Array.isArray(value) && value.length > 0
  return typeof value === 'string' ? value.trim().length > 0 : value != null && value !== ''
}

/**
 * Keep only answers that correspond to real input fields, coerced to a safe
 * shape, and report any required fields left blank. Shared by both submit
 * paths (per-booking and standalone) so validation stays identical.
 */
export function sanitiseAnswers(
  form: ConsentForm,
  raw: unknown,
): { answers: Record<string, string | string[]>; missing: string[] } {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const answers: Record<string, string | string[]> = {}
  const missing: string[] = []
  for (const field of form.fields) {
    if (field.type === 'heading' || field.type === 'info') continue
    const v = input[field.label]
    if (field.type === 'multi-choice') {
      const arr = Array.isArray(v) ? v.map((x) => String(x).slice(0, 300)).filter(Boolean) : []
      const allowed = field.options ?? []
      answers[field.label] = arr.filter((x) => allowed.includes(x))
    } else {
      answers[field.label] = typeof v === 'string' ? v.slice(0, 4000) : ''
    }
    if (field.required && !isAnswered(field, answers[field.label])) missing.push(field.label)
  }
  return { answers, missing }
}

/**
 * Resolve the consent form a booking needs, from its service slug and/or name.
 * Mirrors how Ovatu attaches forms to services today. Order matters: the more
 * specific treatments (Haytox, HarmonyCa, CryoPen, Hyalase, Profhilo Structura)
 * are checked BEFORE the broader Botox / filler / skin-booster buckets, because
 * their names would otherwise be swept up by those. Returns null when no form is
 * mapped — e.g. Aqualyx, which is not yet encoded.
 */
export function consentFormForService(slug: string | null | undefined, name: string | null | undefined): ConsentForm | null {
  const s = `${slug ?? ''} ${name ?? ''}`.toLowerCase()
  if (!s.trim()) return null
  // Haytox — Botox for hay fever / rhinitis (its own form; check before Botox).
  if (/haytox|hay.?fever|rhinitis/.test(s)) return getConsentForm('haytox') ?? null
  // Botox / botulinum toxin (incl. hyperhidrosis & migraine use).
  if (/botox|anti.?wrinkle|toxin|wrinkle|hyperhidrosis|sweat|migraine|masseter|jaw slim/.test(s)) return getConsentForm('botox') ?? null
  // HarmonyCa — CaHA + HA hybrid (its own form; check before filler).
  if (/harmonyca/.test(s)) return getConsentForm('harmonyca') ?? null
  // CryoPen cryotherapy (its own form; check before filler).
  if (/cryopen|cryo/.test(s)) return getConsentForm('cryopen') ?? null
  // Hyalase / hyaluronidase — filler dissolving (its own form; check before filler).
  if (/hyalase|hyaluronidase/.test(s)) return getConsentForm('hyalase') ?? null
  // Profhilo Structura — fat-pad regeneration (distinct from skin boosters).
  if (/structura/.test(s)) return getConsentForm('profhilo-structura') ?? null
  // Skin booster / Profhilo (bio-remodelling).
  if (/profhilo|skin.?booster|booster|bio.?remodel/.test(s)) return getConsentForm('skin-booster') ?? null
  // Polynucleotides.
  if (/polynucleotide|plinest|nucleofill|\bpn\b/.test(s)) return getConsentForm('polynucleotide') ?? null
  // NAD+.
  if (/\bnad\b/.test(s)) return getConsentForm('nad') ?? null
  // B12.
  if (/\bb12\b|b-12|vitamin.?b/.test(s)) return getConsentForm('b12') ?? null
  // Micro-needling / skin needling.
  if (/micro.?needl|microneedl|skin.?needl|derma.?pen|dermaroll/.test(s)) return getConsentForm('micro-needling') ?? null
  // HIFU (high-intensity focused ultrasound).
  if (/\bhifu\b|focused.?ultrasound/.test(s)) return getConsentForm('hifu') ?? null
  // Aqualyx — fat dissolving (deoxycholic acid).
  if (/aqualyx|deoxychol|fat.?dissolv/.test(s)) return getConsentForm('aqualyx') ?? null
  // Dermal filler — general HA filler.
  if (/filler|lip|cheek|tear.?trough|jawline|chin|nasolabial|juvederm|restylane/.test(s)) return getConsentForm('dermal-filler') ?? null
  return null
}
