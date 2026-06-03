// Consent / intake forms — the clinic's own back-end copy of the forms that
// currently live in Ovatu. These are reproduced VERBATIM from the live Ovatu
// forms so the wording, fields, options and declarations match exactly what
// clients sign today. Do not paraphrase, reword or "improve" anything here:
// these are medical/legal documents and must mirror the source.
//
// Source: extracted from Visage Aesthetics – Ovatu Manager (14 forms total).
// Captured so far and encoded below (exact):
//   1. Botox Consent Form
//   2. Dermal Filler Consent Form        (Ovatu attaches this to: Filler, CryoPen)
//   3. Skin Booster Consent Form
//   4. Polynucleotide Consent Form
//   5. B12 Consent Form                  (declaration is TRUNCATED in Ovatu itself)
// Still to capture from Ovatu (do not invent): NAD, and forms 7–14.
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

// Shared personal-details block (identical across every captured Ovatu form).
const PERSONAL_DETAILS: ConsentField[] = [
  { type: 'heading', label: 'Personal Details' },
  { type: 'short-text', label: 'First Name', required: true },
  { type: 'short-text', label: 'Last Name', required: true },
  { type: 'short-text', label: 'Date of Birth', required: true },
  { type: 'short-text', label: 'Address', required: true },
  { type: 'short-text', label: 'E-mail', required: true },
  { type: 'short-text', label: 'Contact Number', required: true },
  { type: 'short-text', label: 'Doctor Surgery', required: true },
]

const STANDARD_DECLARATION =
  'I accept and understand the information provided to me both verbally and within this form. All information I am consenting is correct'

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
    // The declaration is TRUNCATED in Ovatu itself (ends mid-word at "...treatment deta").
    // Reproduced exactly as stored; flagged for correction at source.
    declaration:
      'I accept and understand the information provided to me both verbally and within this form. I confirm that my treating practitioner has: Provided me with sufficient information about the treatment deta',
    declarationTruncated: true,
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
 * Mirrors how Ovatu attaches forms to services today (e.g. CryoPen uses the
 * Dermal Filler form). Returns null when no form is mapped yet — the remaining
 * Ovatu forms (NAD, etc.) are not encoded, so those services map to nothing
 * until they are captured.
 */
export function consentFormForService(slug: string | null | undefined, name: string | null | undefined): ConsentForm | null {
  const s = `${slug ?? ''} ${name ?? ''}`.toLowerCase()
  if (!s.trim()) return null
  // Botox / botulinum toxin (incl. hyperhidrosis & migraine use).
  if (/botox|anti.?wrinkle|toxin|wrinkle|hyperhidrosis|sweat|migraine|masseter|jaw slim/.test(s)) return getConsentForm('botox') ?? null
  // Skin booster / Profhilo (bio-remodelling).
  if (/profhilo|skin.?booster|booster|bio.?remodel/.test(s)) return getConsentForm('skin-booster') ?? null
  // Polynucleotides.
  if (/polynucleotide|plinest|nucleofill|\bpn\b/.test(s)) return getConsentForm('polynucleotide') ?? null
  // B12.
  if (/\bb12\b|b-12|vitamin.?b/.test(s)) return getConsentForm('b12') ?? null
  // Dermal filler — Ovatu also attaches this form to CryoPen.
  if (/filler|lip|cheek|tear.?trough|jawline|chin|nasolabial|harmonyca|juvederm|restylane|cryopen|cryo/.test(s)) return getConsentForm('dermal-filler') ?? null
  return null
}
