import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck, Scale, Syringe, Megaphone, Building2, BadgeCheck,
  Clock, Award, CheckCircle2, AlertTriangle, Camera, Stethoscope, ClipboardCheck,
  GraduationCap, Landmark,
} from 'lucide-react'
import { faqJsonLd } from '@/lib/blog-jsonld'
import { whatsappLink } from '@/lib/booking'

// ---------------------------------------------------------------------------
// Rags to Reputation — an in-depth professional-development course for UK
// aesthetics practitioners. Built and taught by Bernadette Tobin RGN, MSc
// Advanced Practice, independent nurse prescriber. £299. Regulatory content
// grounded in government and regulator sources and reviewed June 2026:
//  - DHSC consultation response on licensing non-surgical cosmetic procedures
//    in England (Aug 2025); Health and Care Act 2022 s.180.
//  - Scottish Government response + Civic Government (Scotland) Act 1982
//    (Licensing of Non-surgical Procedures) Order 2026 (in force Sept 2027).
//  - CQC scope-of-registration guidance (regulated vs non-regulated activity).
//  - NMC face-to-face prescribing requirement (from 1 June 2025); GMC 2012 ban.
//  - ASA/CAP POM advertising rules (CAP rule 12.12); MHRA enforcement.
//  - Botulinum Toxin and Cosmetic Fillers (Children) Act 2021.
// ---------------------------------------------------------------------------

const SITE = 'https://www.vaclinic.co.uk'
const PATH = '/course/rags-to-reputation'
const PRICE = '299'
const LAST_REVIEWED = 'June 2026'
const MODULE_COUNT = 12
const LESSON_COUNT = 60
const CPD_HOURS = 10

const ENROL_EMAIL =
  'mailto:info@vaclinic.co.uk' +
  '?subject=' + encodeURIComponent('Enrolment — Rags to Reputation course (£299)') +
  '&body=' + encodeURIComponent(
    "Hi Bernadette,\n\nI'd like to enrol on the Rags to Reputation course (£299). Please send me the enrolment and payment details.\n\nMy name:\nMy profession / registration (NMC, GMC, GDC, GPhC or other):\nWhere I practise:\n\nThank you."
  )

const ENROL_WHATSAPP = whatsappLink(
  "Hi Bernadette, I'd like to enrol on the Rags to Reputation course (£299). Could you send me the enrolment details?"
)

type Module = {
  num: string
  icon: typeof ShieldCheck
  title: string
  summary: string
  lessons: string[]
}

const modules: Module[] = [
  {
    num: '01',
    icon: Scale,
    title: 'The 2026 Regulatory Landscape — All Four Nations',
    summary:
      'Exactly where the law stands today across England, Scotland, Wales and Northern Ireland, what is genuinely changing, and how to read the direction of travel so nothing lands as a surprise.',
    lessons: [
      'The legal baseline right now: why no national licence is yet required in England to offer toxin or filler, and the patchwork of medicines law, medical-device law and the age law that fills the gap.',
      'Section 180 of the Health and Care Act 2022 — the enabling power behind the coming licensing scheme in England.',
      "England's proposed scheme from the DHSC consultation response of August 2025 (which drew almost 12,000 responses): the three-tier green / amber / red risk model and what sits in each tier.",
      'Where routine work lands: anti-wrinkle injections, facial dermal filler, skin boosters, PRP, HIFU, radiofrequency, cryolipolysis and medium-depth peels in the proposed amber tier — non-medics permitted only under named healthcare oversight, healthcare professionals independently.',
      'The red tier and CQC: breast, buttock and genital augmentation with filler and other highest-risk procedures restricted to regulated healthcare professionals in CQC-registered premises, with a further government consultation on these in spring 2026 and rollout expected across 2026–2027.',
      'Scotland out in front: the legislation passed by the Scottish Parliament in March 2026 and the draft Civic Government (Scotland) Act 1982 (Licensing of Non-surgical Procedures) Order 2026 — covered in detail in Module 4 — expected in force September 2027.',
      'Wales and Northern Ireland: the mandatory special-procedures licensing in Wales under the Public Health (Wales) Act 2017 (currently covering tattooing, body piercing, acupuncture and electrolysis, with a regulation-making power to add procedures), the absence of a dedicated cosmetic-procedures scheme in Northern Ireland, and why building to the highest UK standard protects you wherever you trade.',
    ],
  },
  {
    num: '02',
    icon: BadgeCheck,
    title: 'Scope of Practice, Qualifications & Registration',
    summary:
      'Who can legally do what, the qualifications that will underpin a licence, and how to make your credentials something a client can verify in thirty seconds.',
    lessons: [
      'Statutory regulation explained: the NMC, GMC, GDC and GPhC — what each registration permits, and how the public checks a PIN or registration number online.',
      'The "anyone can inject filler" gap, why it has persisted, and why the proposed amber tier closes it by tying non-medics to named healthcare oversight.',
      'The JCCP Competency Framework for Aesthetic Practice (which superseded the 2015 Health Education England standards) and what "practising at and beyond Level 4" actually means.',
      'Level 7: the Ofqual-regulated Diploma in Clinical Aesthetic Injectable Therapies (OTHM, VTCT/ITEC), why it has become the de-facto gold standard, and how it maps to the JCCP framework.',
      'The PSA-accredited voluntary registers — the JCCP register and Save Face — and why register membership is both a reputation asset and a likely licensing stepping-stone.',
      'Honest scope: knowing the precise limit of what you are trained, insured and competent to do, and building a confident referral habit.',
    ],
  },
  {
    num: '03',
    icon: Syringe,
    title: 'Medicines & Prescribing Law',
    summary:
      'Botulinum toxin is a prescription-only medicine. This module makes the medicines and prescribing rules unambiguous — including the 2025 face-to-face change that ended remote prescribing.',
    lessons: [
      'POM status: why you cannot hold, supply or administer botulinum toxin without a valid prescription, and what lawful sourcing actually looks like.',
      'The licensed UK toxin brands — Alluzience, Azzalure, Bocouture, Botox, Letybo, Nuceiva and Relfydess — and why anything outside that list is unlicensed however it is marketed.',
      'Fillers under the law: HA fillers as medical devices under MHRA oversight, and why lidocaine-containing fillers are prescription-only.',
      'The face-to-face rule: from 1 June 2025 the NMC requires an in-person consultation before prescribing non-surgical cosmetic medicines — botulinum toxin, injectable local anaesthetic, dermal fillers, hyaluronidase, tissue stimulants, lipolysis agents and vitamin injections. No telephone, video, online or third-party prescribing.',
      'The wider picture: the GMC ban on remote aesthetic prescribing since 2012, now matched by the GDC and GPhC — and what fitness-to-practise exposure looks like.',
      'Independent prescribing (the V300 route) versus leaning on a remote prescriber: building a genuine, accountable prescriber relationship and proper clinical oversight.',
      'Case study — the 2025 iatrogenic botulism outbreak: the 41 UKHSA-confirmed cases traced to an unlicensed product tested at 370 units per vial against a 200-unit label, the MHRA Criminal Enforcement Unit response, and the maximum penalty of two years and an unlimited fine.',
    ],
  },
  {
    num: '04',
    icon: Building2,
    title: 'Premises, CQC & Where You Can Legally Treat',
    summary:
      'The single most misunderstood area in the sector: precisely when the CQC applies, how the Scottish premises rules differ, what local-authority licensing demands, and the real risks of mobile and home practice.',
    lessons: [
      'The CQC line that catches people out: cosmetic toxin and filler are not regulated activities because there is no cut to the body — but the same toxin used to treat a medical condition is "treatment of disease, disorder or injury" and requires CQC registration.',
      'Worked examples that need CQC registration in England: botulinum toxin for hyperhidrosis, chronic migraine or bruxism (tooth grinding), thread lifts (temporary sutures), surgical procedures and certain diagnostic activities — registered under "treatment of disease, disorder or injury", "surgical procedures" and "diagnostic and screening procedures".',
      "Scotland's premises model in detail: Group 1 procedures (e.g. microneedling, non-ablative laser) requiring a premises licence and an individual practitioner licence from the local authority; Group 2 (injectables such as botulinum toxin and dermal filler) requiring a qualified healthcare professional and a Healthcare Improvement Scotland-regulated setting; Group 3 (e.g. breast and buttock augmentation) restricted to healthcare professionals in HIS-regulated settings.",
      'Special treatment licences and local-authority premises rules in England and Wales — how they vary by area and what to check with your council.',
      'Mobile, pop-up and home-based practice: the heightened infection-control and governance risk, and why premises standards sit at the centre of every coming licensing scheme.',
      'Future-proofing your premises now — hygiene, safety, insurance and record standards — so a licence application later is a formality rather than a scramble.',
    ],
  },
  {
    num: '05',
    icon: Scale,
    title: 'Consent, Capacity & the Under-18 Law',
    summary:
      'Treating the consultation as a clinical assessment, not a sale — and getting consent and age verification right, where the legal consequences are most serious.',
    lessons: [
      'Valid consent after Montgomery v Lanarkshire: disclosing the material risks a reasonable person in the client’s position would want to know, rather than what a clinician thinks they should hear.',
      'Capacity, voluntariness and the value of a genuine cooling-off period between consultation and treatment.',
      'The under-18 law: the Botulinum Toxin and Cosmetic Fillers (Children) Act 2021 makes it a criminal offence, carrying an unlimited fine, to administer toxin or filler for a cosmetic purpose to anyone under 18 in England — even with parental consent, and even if the young person is only visiting.',
      'Age verification in practice: the document checks that protect you, and the narrow exception where a regulated professional may treat under a doctor’s direction for a medical reason.',
      'Managing expectations and body-image red flags, including when to decline treatment and signpost instead.',
    ],
  },
  {
    num: '06',
    icon: Camera,
    title: 'Records, Clinical Photography & Data Protection',
    summary:
      'Records that protect both your client and you — and handling health data and before-and-after images lawfully under UK GDPR.',
    lessons: [
      'Contemporaneous records that stand up to scrutiny: products, doses, batch and lot numbers, expiry, anatomical sites, consent and the aftercare given.',
      'Clinical photography done properly: specific consent, secure storage, and lawful use of before-and-after images (and the advertising limits on them, picked up in Module 11).',
      'UK GDPR for clinics: health data as special category data, identifying your lawful basis and Article 9 condition, and the duty to keep it secure.',
      'Retention schedules, subject-access requests and personal-data breach reporting — what to do and by when.',
      'The cost of getting it wrong: penalties of up to £17.5m or 4% of annual turnover, and the reputational damage that outlasts any fine.',
    ],
  },
  {
    num: '07',
    icon: ShieldCheck,
    title: 'Infection Prevention, Decontamination & Waste',
    summary:
      'The unglamorous foundations that inspectors and insurers care about most — done properly and documented.',
    lessons: [
      'Standard infection-control precautions (SICPs): hand hygiene, PPE, aseptic non-touch technique, single-use policy and the correct decontamination or sterilisation of any reusable equipment.',
      'Sharps and clinical waste: puncture- and leak-proof sharps containers, and your legal status as a "producer of controlled waste" with a Duty of Care from the moment waste is created to its final disposal by a licensed carrier.',
      'Hazardous-waste consignment paperwork and choosing a compliant waste contractor.',
      'Needlestick and blood-borne-virus exposure: safe handling, the immediate response, and when an injury is reportable under RIDDOR.',
      'Building an infection-prevention policy and audit you can hand to an inspector without flinching.',
    ],
  },
  {
    num: '08',
    icon: ClipboardCheck,
    title: 'Health, Safety & Premises Standards',
    summary:
      'The wider safety system around the treatment couch — the assessments and checks a licence will expect to see in place.',
    lessons: [
      'Risk assessments and COSHH: identifying, recording and controlling the hazards in a clinic environment.',
      'First-aid provision, fire safety and the basics of premises health and safety law.',
      'Anaphylaxis readiness as a baseline standard for any injecting clinic — equipment, training and rehearsal.',
      'Business continuity, incident logging and the documentation that demonstrates you have thought it through.',
      'Cold chain and medicines storage: keeping product within its licensed conditions and recording it.',
    ],
  },
  {
    num: '09',
    icon: AlertTriangle,
    title: 'Complications: Recognition & Emergency Management',
    summary:
      'Preparing for the day it goes wrong — recognition, the emergency kit, the protocols, and the calm response that turns a complication into a managed event.',
    lessons: [
      'Recognising and managing vascular occlusion: blanching, disproportionate pain, capillary refill greater than three seconds, the threat to skin and to vision, and the ACE Group high-dose pulsed hyaluronidase protocol.',
      'Infection, nodules, biofilm and delayed-onset reactions — and when to treat, when to refer and when to escalate urgently.',
      'The emergency kit aligned to current ACE Group World guidance: adrenaline, hyaluronidase and printed algorithms (and why GTN paste is no longer recommended).',
      'The non-negotiable rule of filler practice: never inject without hyaluronidase, a prescriber and a written plan already in place.',
      'The anaphylaxis algorithm, and rehearsing it as a team so it is muscle memory rather than a panic.',
      'After the event: duty of candour, honest communication, documentation and learning.',
    ],
  },
  {
    num: '10',
    icon: Stethoscope,
    title: 'Clinical Governance, Insurance & Indemnity',
    summary:
      'The governance scaffolding that quietly underwrites a reputation — and the cover that has to be right before you ever pick up a needle.',
    lessons: [
      'Clinical governance in a small clinic: audit, significant-event analysis, reflective practice and clinical supervision, made proportionate and practical.',
      'CPD and revalidation: keeping your registration current and evidencing it.',
      'Indemnity that actually covers you: why medical malpractice cover of at least £2m — commonly £5m for toxin, filler and laser — matters, and why insurers will only cover injectables for qualified healthcare professionals.',
      'Complaints handling as a system: turning a complaint into improvement, and the records that show you did.',
      'Policies and standard operating procedures: the document set a licence assessor — or a claims handler — will expect to see.',
    ],
  },
  {
    num: '11',
    icon: Megaphone,
    title: 'Ethical Marketing & Advertising Compliance',
    summary:
      'The rules that catch out more clinics than any other — and how to market with credibility rather than hype.',
    lessons: [
      'The POM advertising ban: botulinum toxin cannot be advertised to the public (CAP rule 12.12 and the Human Medicines Regulations 2012). No brand names, no thinly veiled terms such as "tox" or "Beautox", and no #botox.',
      'Why a before-and-after of a prescription-only product — even with no words attached — is treated as an implied advertisement and a breach.',
      'Where the rules bite: paid ads, organic social posts and influencer content all count, and so do hashtags and competition prizes.',
      'What you can lawfully say: generic descriptions such as "anti-wrinkle treatment", genuinely educational content, and your verifiable qualifications.',
      'The enforcement reality: the MHRA issued dozens of enforcement notices to aesthetic businesses in 2024, and the ASA and CAP now use AI-driven monitoring to find offending posts at scale.',
      'Consumer law and honest claims: genuine before-and-after standards, testimonials and transparent pricing under CAP and CMA rules.',
    ],
  },
  {
    num: '12',
    icon: Award,
    title: 'From Rags to Reputation: Building & Future-Proofing the Practice',
    summary:
      'Pulling all eleven modules together into a system — how a respected practice is actually built from the ground up, and how to be ready before the law arrives.',
    lessons: [
      'The core thesis: how a reputation is built from nothing — not on discount toxin, flashy posts and unrealistic promises, which buy attention but erode trust, but on safety, honesty, outcomes and governance, which compound over time.',
      'Reputation systems: earning genuine reviews, building referral relationships with GPs, dentists and prescribers, and treating every complaint as data.',
      'The discipline of saying no — turning away the wrong treatment or the wrong client as a deliberate reputation strategy.',
      'A licence-readiness self-audit against the likely amber-tier standards in England and the Group requirements in Scotland, so you are ready before the law lands rather than after.',
      'Your takeaways: the compliant-clinic checklist and a 90-day action plan to close your own gaps, module by module.',
    ],
  },
]

const outcomes = [
  'Explain, in plain terms, what is and is not legally required of a UK aesthetics practitioner in 2026 — across all four nations — and what is coming.',
  'Map your own qualifications, registration and scope against the JCCP framework and the proposed licensing tiers.',
  'Stay the right side of medicines and prescribing law, including the 2025 face-to-face prescribing requirement.',
  'Decide correctly whether your activity needs CQC registration in England, an HIS-regulated setting in Scotland, a local-authority licence, or none of these.',
  'Run consent, age verification, record-keeping and data protection to a standard that protects your clients and your registration.',
  'Build infection-control, waste, health-and-safety and complications protocols that withstand inspection.',
  'Hold the right indemnity and governance, and market your practice without breaching POM advertising rules.',
  'Leave with a compliant-clinic checklist, a licence-readiness self-audit and a 90-day action plan.',
]

const stats = [
  { value: `${MODULE_COUNT}`, label: 'in-depth modules' },
  { value: `${LESSON_COUNT}+`, label: 'structured lessons' },
  { value: `~${CPD_HOURS} hrs`, label: 'recordable CPD' },
  { value: '4', label: 'UK nations covered' },
]

type Nation = { nation: string; status: string; whoWhere: string; inForce: string }
const fourNations: Nation[] = [
  {
    nation: 'England',
    status: 'No licence yet required to offer toxin or filler. Licensing scheme proposed under the Health and Care Act 2022 (s.180).',
    whoWhere: 'Proposed green / amber / red tiers. Amber (anti-wrinkle, filler, skin boosters, peels) licensed by local authorities; red (e.g. breast / buttock augmentation) restricted to healthcare professionals in CQC-registered premises.',
    inForce: 'Consultation on highest-risk procedures spring 2026; rollout 2026–2027.',
  },
  {
    nation: 'Scotland',
    status: 'Legislation passed by the Scottish Parliament (March 2026); draft Licensing of Non-surgical Procedures Order 2026.',
    whoWhere: 'Group 1 (microneedling, non-ablative laser): LA premises + practitioner licence. Group 2 (injectables): healthcare-professional-supervised, HIS-regulated setting. Group 3 (e.g. augmentation): HCP in HIS-regulated setting.',
    inForce: 'Provisions expected in force September 2027.',
  },
  {
    nation: 'Wales',
    status: 'Mandatory special-procedures licensing under the Public Health (Wales) Act 2017 — tattooing, body piercing, acupuncture and electrolysis. Cosmetic injectables are not currently within the scheme.',
    whoWhere: 'Practitioner and premises/vehicle licensing for the listed special procedures, administered by local authorities. The Act allows further procedures to be added by regulations.',
    inForce: 'In force for the listed special procedures; cosmetic injectables not currently included.',
  },
  {
    nation: 'Northern Ireland',
    status: 'No dedicated statutory cosmetic-procedures licensing scheme, and no equivalent of England’s under-18 ban. Councils have called for regulation.',
    whoWhere: 'Statutory professional registration and medicines law still apply; local regulation varies.',
    inForce: 'No scheme in force; change anticipated to follow the rest of the UK.',
  },
]

type TimelineItem = { date: string; event: string }
const timeline: TimelineItem[] = [
  { date: '2012', event: 'GMC bans remote prescribing for cosmetic procedures.' },
  { date: '1 Oct 2021', event: 'Botulinum Toxin and Cosmetic Fillers (Children) Act 2021 in force — under-18 ban in England.' },
  { date: '2022', event: 'Health and Care Act 2022, s.180 — the enabling power for an England licensing scheme.' },
  { date: 'Sept 2023', event: 'DHSC consultation on licensing non-surgical cosmetic procedures opens.' },
  { date: '1 Jun 2025', event: 'NMC face-to-face prescribing requirement takes effect — remote prescribing ends.' },
  { date: 'Summer 2025', event: 'UKHSA confirms 41 cases of iatrogenic botulism linked to an unlicensed product.' },
  { date: 'Aug 2025', event: 'DHSC publishes its consultation response — the three-tier green / amber / red model.' },
  { date: 'Oct 2025', event: 'Non-surgical cosmetic procedures Bill introduced in the Scottish Parliament.' },
  { date: 'Mar 2026', event: 'Scottish Parliament passes the legislation.' },
  { date: 'Spring 2026', event: 'England consultation on the highest-risk (red-tier) procedures.' },
  { date: '2026–2027', event: 'England licensing scheme rollout — applications and inspections begin.' },
  { date: 'Sept 2027', event: 'Scottish provisions and the licensing Order expected to come into force.' },
]

const toolkit = [
  { label: `${MODULE_COUNT} in-depth modules, ${LESSON_COUNT}+ lessons`, detail: 'Self-paced video and written lessons with worked examples and real cases throughout.' },
  { label: 'Licence-readiness self-audit', detail: 'A practical checklist mapped to the England amber-tier proposals and the Scottish Group requirements, so you can see your gaps at a glance.' },
  { label: 'Consent & records templates', detail: 'A consent framework, a records standard (products, batch numbers, doses, sites) and a clinical-photography consent note.' },
  { label: 'Complications & emergency-kit checklist', detail: 'An ACE-aligned emergency-kit list and a vascular-occlusion and anaphylaxis aide-memoire to print and display.' },
  { label: 'Compliant-marketing reference', detail: 'A plain-English do-and-don’t guide to the POM advertising rules for your social media and website.' },
  { label: '90-day action plan', detail: 'A week-by-week plan to close your compliance gaps and get the practice licence-ready.' },
]

const assessment = [
  'Short knowledge checks at the end of each module to consolidate the key legal and clinical points.',
  'A final reflective exercise applying the framework to your own practice.',
  'A certificate of completion issued on finishing the course, recordable as CPD towards your revalidation.',
  '12 months of access with free updates as the England scheme and Scottish provisions firm up.',
]

const faqs = [
  {
    q: 'Who is the Rags to Reputation course for?',
    a: 'It is written for UK aesthetics practitioners and clinic owners — nurses, doctors, dentists, pharmacists and the wider team — who want to operate to a genuinely compliant, defensible standard and build a lasting reputation. It is equally useful to anyone preparing for the licensing scheme coming to England and already legislated in Scotland.',
  },
  {
    q: 'Is this a clinical injecting qualification?',
    a: 'No, and it does not pretend to be. Rags to Reputation is a professional-development course in regulation, clinical governance, ethics and reputation. It does not teach injecting technique and does not, on its own, qualify or authorise anyone to inject. Accredited hands-on training, such as a Level 7 Diploma, and the appropriate professional registration remain essential.',
  },
  {
    q: 'How much is the course and how do I enrol?',
    a: 'The course is £299 and includes all twelve modules, the downloadable toolkit, a certificate of completion and 12 months of updates. To enrol, email info@vaclinic.co.uk or message the clinic on WhatsApp and we will send you secure payment and access details, usually the same day.',
  },
  {
    q: 'How current is the content, and is it based on real regulations?',
    a: 'Yes. The course is grounded in government and regulator sources and reviewed in June 2026 — including the DHSC consultation response of August 2025, the Scottish legislation passed in March 2026 and the draft 2026 licensing Order, CQC scope-of-registration guidance, the NMC face-to-face prescribing requirement from June 2025, the Botulinum Toxin and Cosmetic Fillers (Children) Act 2021 and current ASA/CAP advertising enforcement. Enrolment includes 12 months of updates as the position develops.',
  },
  {
    q: 'How long does it take, and is there a certificate?',
    a: `It is self-paced across ${MODULE_COUNT} modules — roughly ${CPD_HOURS} hours of structured CPD, which most practitioners complete over a few focused sessions. You receive a certificate of completion that you can record as CPD towards revalidation.`,
  },
  {
    q: 'Does it cover the whole UK?',
    a: 'Yes. It covers England, Scotland, Wales and Northern Ireland — the current law in each, the differences between the proposed England tiers and the Scottish Groups, and what to do wherever you practise.',
  },
  {
    q: 'Who teaches it?',
    a: 'Bernadette Tobin, RGN with an MSc in Advanced Practice and an independent nurse prescriber (NMC PIN 05G1755E), founder of the award-winning Visage Aesthetics in Braintree, with over twenty years in clinical practice.',
  },
]

const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Rags to Reputation',
  description:
    'An in-depth professional-development course for UK aesthetics practitioners on regulation, compliance, clinical governance, ethical marketing and building a lasting reputation. Covers all four UK nations and is grounded in government and regulator sources, reviewed June 2026.',
  url: `${SITE}${PATH}`,
  inLanguage: 'en-GB',
  provider: {
    '@type': 'Organization',
    name: 'Visage Aesthetics',
    url: `${SITE}/`,
  },
  author: {
    '@type': 'Person',
    '@id': `${SITE}/author/bernadette-tobin#person`,
    name: 'Bernadette Tobin',
    jobTitle: 'Registered Nurse, MSc Advanced Practice, Independent Nurse Prescriber',
    url: `${SITE}/author/bernadette-tobin`,
    identifier: { '@type': 'PropertyValue', propertyID: 'NMC PIN', value: '05G1755E' },
  },
  educationalLevel: 'Professional development (CPD)',
  numberOfCredits: `${CPD_HOURS} hours CPD`,
  teaches: modules.map((m) => m.title),
  offers: {
    '@type': 'Offer',
    category: 'Professional development course',
    price: PRICE,
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
    url: `${SITE}${PATH}`,
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    courseWorkload: `PT${CPD_HOURS}H`,
    description: 'Self-paced online course with downloadable toolkit, knowledge checks and a certificate of completion.',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'Rags to Reputation', item: `${SITE}${PATH}` },
  ],
}

export const metadata: Metadata = {
  title: 'Rags to Reputation — UK Aesthetics Compliance & Reputation Course | Visage Aesthetics',
  description:
    'An in-depth £299 professional-development course for UK aesthetics practitioners. 12 modules on regulation across all four nations, prescribing law, CQC, consent, complications, governance and ethical marketing. Grounded in government sources, current to June 2026, taught by Bernadette Tobin RGN, MSc.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Rags to Reputation — A Compliance & Reputation Course for UK Aesthetics Practitioners',
    description:
      'In-depth, government-grounded training on UK aesthetics regulation across all four nations, compliance, governance and ethical marketing. 12 modules. £299. Taught by an award-winning nurse prescriber.',
    url: `${SITE}${PATH}`,
    type: 'website',
  },
}

export default function RagsToReputationCourse() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      {/* Hero */}
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-10 md:pb-14 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-stone mb-6">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-charcoal/80">Rags to Reputation</li>
            </ol>
          </nav>

          <span className="hairline mb-7 bg-gold" />
          <p className="eyebrow text-gold mb-4">A course for practitioners · Self-paced online · CPD</p>
          <h1 className="font-display italic text-hero text-charcoal max-w-4xl">Rags to Reputation</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl leading-relaxed">
            The in-depth course on running a compliant, defensible, genuinely respected UK aesthetics
            practice. Regulation across all four nations, prescribing law, governance, complications and
            ethical marketing — the work that takes a practice from the ground up to a reputation that
            lasts. Grounded in government and regulator sources and current to {LAST_REVIEWED}.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-charcoal">
            <span className="font-display italic" style={{ fontSize: 40, fontWeight: 500 }}>£{PRICE}</span>
            <span className="flex items-center gap-2 text-body text-ink-soft"><Clock size={15} strokeWidth={1.6} className="text-gold" /> {MODULE_COUNT} modules · self-paced</span>
            <span className="flex items-center gap-2 text-body text-ink-soft"><Award size={15} strokeWidth={1.6} className="text-gold" /> Certificate · ~{CPD_HOURS} hrs CPD</span>
            <span className="flex items-center gap-2 text-body text-ink-soft"><BadgeCheck size={15} strokeWidth={1.6} className="text-gold" /> Taught by a nurse prescriber</span>
          </div>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <a href={ENROL_EMAIL} className="btn btn-primary btn-md:auto">
              <span>Enrol — £{PRICE}</span>
              <span className="btn-arrow">→</span>
            </a>
            <a href="#curriculum" className="btn btn-secondary btn-md:auto">
              <span>See the curriculum</span>
              <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Stat band */}
      <section className="pb-2">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line/40 border border-line/40">
            {stats.map((s) => (
              <div key={s.label} className="bg-cream p-6 text-center">
                <div className="font-display italic text-charcoal" style={{ fontSize: 34, fontWeight: 500 }}>{s.value}</div>
                <div className="text-eyebrow text-stone mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why now */}
      <section className="py-10 md:py-14">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <div className="bg-white border border-gold/20 rounded-sm p-7 md:p-8">
            <p className="text-body font-semibold text-charcoal mb-3">Why this course, and why now</p>
            <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
              For years the UK aesthetics sector has run on bravado: discount toxin, before-and-afters
              that break the advertising rules, and promises no honest practitioner could keep. That
              era is ending. England is building a licensing scheme under the Health and Care Act 2022,
              Scotland has already legislated, the NMC now requires face-to-face prescribing, and the
              MHRA and ASA are enforcing in earnest.
            </p>
            <p className="text-body-lg text-ink-soft leading-relaxed mb-0">
              The practitioners who thrive through that change will be the ones who treated compliance,
              safety and honesty as the foundation of their reputation all along. This course gives you
              that foundation, grounded in the actual government and regulator sources — and a clear plan
              to be licence-ready before the law arrives.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="pb-10 md:pb-14">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <p className="eyebrow text-gold mb-3">Who it&apos;s for</p>
          <h2 className="font-display italic text-h2 text-charcoal max-w-3xl mb-8">
            Written for the practitioner who wants to be the safest choice in the room.
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { t: 'Injecting practitioners', d: 'Nurses, doctors, dentists and pharmacists who want their compliance and governance to match their clinical skill.' },
              { t: 'Clinic owners & teams', d: 'Anyone responsible for premises, records, waste, marketing and the standards the whole team works to.' },
              { t: 'The licence-ready minded', d: 'Practitioners preparing for the England scheme and the Scottish rules, who would rather lead the change than scramble for it.' },
            ].map((c) => (
              <div key={c.t} className="border border-line/40 rounded-md p-6">
                <p className="font-display italic text-charcoal mb-2" style={{ fontSize: 22 }}>{c.t}</p>
                <p className="text-body text-ink-soft leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="pb-10 md:pb-14">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <p className="eyebrow text-gold mb-3">What you&apos;ll be able to do</p>
          <h2 className="font-display italic text-h2 text-charcoal max-w-3xl mb-8">Learning outcomes</h2>
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {outcomes.map((o) => (
              <li key={o} className="flex gap-3 text-body-lg text-ink-soft leading-relaxed">
                <CheckCircle2 size={20} strokeWidth={1.6} className="text-gold shrink-0 mt-1" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-12 md:py-16" style={{ background: '#EFE8E0' }}>
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <p className="eyebrow text-gold mb-3">The curriculum</p>
          <h2 className="font-display italic text-h2 text-charcoal max-w-3xl mb-4">Twelve modules, end to end.</h2>
          <p className="text-body-lg text-ink-soft max-w-2xl mb-10 leading-relaxed">
            Each module is built around what the law actually requires and what an inspector, an
            insurer or a regulator would expect to see. Worked examples and real cases throughout.
          </p>

          <div className="grid gap-px bg-line/40 border border-line/40">
            {modules.map((m) => {
              const Icon = m.icon
              return (
                <article key={m.num} className="bg-cream p-6 md:p-8">
                  <div className="flex items-start gap-5">
                    <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full border border-gold/40 shrink-0">
                      <Icon size={20} strokeWidth={1.5} className="text-gold-deep" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="section-num" style={{ color: 'var(--color-gold)' }}>{m.num}</span>
                        <h3 className="font-display italic text-charcoal" style={{ fontSize: 26, lineHeight: 1.15 }}>{m.title}</h3>
                      </div>
                      <p className="text-body-lg text-ink-soft leading-relaxed mb-4">{m.summary}</p>
                      <ul className="space-y-2.5">
                        {m.lessons.map((l, i) => (
                          <li key={i} className="flex gap-3 text-body text-ink-soft leading-relaxed">
                            <span aria-hidden className="text-gold mt-1.5 shrink-0" style={{ fontSize: 10 }}>●</span>
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Four nations table */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <p className="eyebrow text-gold mb-3 flex items-center gap-2"><Landmark size={14} strokeWidth={1.6} /> Four nations at a glance</p>
          <h2 className="font-display italic text-h2 text-charcoal max-w-3xl mb-4">The rules are not the same across the UK.</h2>
          <p className="text-body-lg text-ink-soft max-w-2xl mb-8 leading-relaxed">
            A quick reference you&apos;ll go far deeper on inside the course. Where you practise changes
            what you must do.
          </p>
          <div className="overflow-x-auto border border-line/40 rounded-md">
            <table className="w-full border-collapse" style={{ minWidth: 720 }}>
              <thead>
                <tr style={{ background: '#EFE8E0' }}>
                  <th className="text-left p-4 eyebrow text-charcoal/70" style={{ width: '14%' }}>Nation</th>
                  <th className="text-left p-4 eyebrow text-charcoal/70" style={{ width: '30%' }}>Current status</th>
                  <th className="text-left p-4 eyebrow text-charcoal/70" style={{ width: '38%' }}>Who can treat & where</th>
                  <th className="text-left p-4 eyebrow text-charcoal/70" style={{ width: '18%' }}>In force</th>
                </tr>
              </thead>
              <tbody>
                {fourNations.map((n, i) => (
                  <tr key={n.nation} style={{ background: i % 2 ? '#FBF8F4' : '#F5F0EC' }} className="align-top border-t border-line/40">
                    <td className="p-4 font-display italic text-charcoal" style={{ fontSize: 18 }}>{n.nation}</td>
                    <td className="p-4 text-body text-ink-soft leading-relaxed">{n.status}</td>
                    <td className="p-4 text-body text-ink-soft leading-relaxed">{n.whoWhere}</td>
                    <td className="p-4 text-body text-ink-soft leading-relaxed">{n.inForce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <p className="eyebrow text-gold mb-3">Key regulatory dates</p>
          <h2 className="font-display italic text-h2 text-charcoal mb-8">How we got here — and what&apos;s next.</h2>
          <ol className="relative border-l border-line/60 ml-2">
            {timeline.map((t) => (
              <li key={t.date} className="mb-6 ml-6">
                <span className="absolute -left-[7px] flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gold" aria-hidden />
                <div className="eyebrow text-gold-deep mb-1">{t.date}</div>
                <p className="text-body-lg text-ink-soft leading-relaxed mb-0">{t.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What's included / toolkit */}
      <section className="py-12 md:py-16" style={{ background: '#EFE8E0' }}>
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <p className="eyebrow text-gold mb-3">What&apos;s included</p>
          <h2 className="font-display italic text-h2 text-charcoal max-w-3xl mb-8">Everything you need to act on it.</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {toolkit.map((i) => (
              <div key={i.label} className="flex gap-4 bg-cream border border-line/40 rounded-md p-6">
                <CheckCircle2 size={22} strokeWidth={1.6} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-display italic text-charcoal mb-1" style={{ fontSize: 21 }}>{i.label}</p>
                  <p className="text-body text-ink-soft leading-relaxed">{i.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment & certification */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="eyebrow text-gold mb-3 flex items-center gap-2"><GraduationCap size={14} strokeWidth={1.6} /> Assessment & certification</p>
            <h2 className="font-display italic text-h2 text-charcoal mb-5">Finish it, prove it, record it.</h2>
            <p className="text-body-lg text-ink-soft leading-relaxed">
              The course is designed to leave a paper trail you can use — for your own revalidation, and
              as evidence of the standards your clinic works to when the licensing scheme arrives.
            </p>
          </div>
          <ul className="space-y-4">
            {assessment.map((a) => (
              <li key={a} className="flex gap-3 text-body-lg text-ink-soft leading-relaxed">
                <CheckCircle2 size={20} strokeWidth={1.6} className="text-gold shrink-0 mt-1" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Honesty note */}
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="mt-8 bg-white border border-gold/20 rounded-sm p-6 flex gap-4">
            <ShieldCheck size={22} strokeWidth={1.6} className="text-gold-deep shrink-0 mt-0.5" />
            <p className="text-body text-ink-soft leading-relaxed mb-0">
              <strong className="text-charcoal">An honest note on scope.</strong> Rags to Reputation is a
              professional-development course in regulation, governance, ethics and reputation. It does not
              teach injecting technique and does not, on its own, qualify or authorise anyone to inject.
              Accredited clinical training — such as a Level 7 Diploma — and the appropriate professional
              registration remain essential. We would not teach compliance and then cut a corner on it.
            </p>
          </div>
        </div>
      </section>

      {/* Value / why £299 */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <div className="border border-line/40 rounded-md p-7 md:p-9">
            <p className="eyebrow text-gold mb-3">The investment</p>
            <h2 className="font-display italic text-h3 text-charcoal mb-4">£{PRICE} — and what it protects.</h2>
            <p className="text-body-lg text-ink-soft leading-relaxed mb-4">
              A single complaint, an ASA or MHRA enforcement notice, or a licence application you are not
              ready for can cost a clinic far more than {`£${PRICE}`} — in fees, in lost trading, and in
              reputation. This course is a one-off {`£${PRICE}`} for {MODULE_COUNT} modules, the full
              downloadable toolkit, a certificate, and 12 months of updates as the law changes.
            </p>
            <p className="text-body-lg text-ink-soft leading-relaxed mb-0">
              It is the standard Bernadette holds her own award-winning clinic to, written so you can hold
              yours to the same.
            </p>
          </div>
        </div>
      </section>

      {/* Instructor */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="border border-line/40 rounded-md p-7 md:p-10 bg-cream-soft/40">
            <p className="eyebrow text-gold mb-4">Your instructor</p>
            <h2 className="font-display italic text-h3 text-charcoal mb-4">Bernadette Tobin, RGN, MSc Advanced Practice</h2>
            <p className="text-body-lg text-ink-soft leading-relaxed mb-4 max-w-3xl">
              Bernadette is a registered nurse with an MSc in Advanced Practice and an independent nurse
              prescriber (NMC PIN 05G1755E). She founded Visage Aesthetics in Braintree, named Best
              Non-Surgical Aesthetics Clinic in Essex 2026, and has spent over twenty years in clinical
              practice — long enough to watch the field grow from a niche medical specialty into a
              high-street commodity, with all the quality variation that implies.
            </p>
            <p className="text-body-lg text-ink-soft leading-relaxed mb-6 max-w-3xl">
              This course is the standard she holds her own clinic to, written for practitioners who want
              to do the same.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/about/qualifications" className="btn btn-secondary btn-md:auto">
                <span>See full qualifications</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link href="/blog/uk-aesthetics-regulation-2026" className="btn btn-secondary btn-md:auto">
                <span>Read: UK regulation in 2026</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[860px] mx-auto px-5 md:px-8">
          <p className="eyebrow text-gold mb-3">Questions</p>
          <h2 className="font-display italic text-h2 text-charcoal mb-8">Before you enrol</h2>
          <div className="divide-y divide-line/40 border-t border-line/40">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <p className="font-display italic text-charcoal mb-2" style={{ fontSize: 22, lineHeight: 1.2 }}>{f.q}</p>
                <p className="text-body-lg text-ink-soft leading-relaxed mb-0">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-stone text-[12px] tracking-[0.18em] uppercase">
            Course content reviewed {LAST_REVIEWED} · Regulation evolves — enrolment includes 12 months of updates
          </p>
        </div>
      </section>

      {/* Enrol CTA */}
      <section style={{ background: '#1F1B1A', color: '#F5F0EC', padding: 'var(--section-y) var(--pad-x)' }}>
        <div className="max-w-[820px] mx-auto">
          <div className="section-num mb-8" style={{ color: 'rgba(245, 240, 236, 0.55)' }}>
            <span className="hairline" style={{ background: 'rgba(245, 240, 236, 0.4)' }} />
            Enrol
          </div>
          <h2 className="text-h1" style={{ color: '#F5F0EC' }}>Build a reputation that lasts.</h2>
          <p className="mt-8 max-w-xl" style={{ color: 'rgba(245, 240, 236, 0.7)', fontSize: 17, lineHeight: 1.7 }}>
            Enrol on Rags to Reputation for £{PRICE}. Email or message the clinic and we&apos;ll send you
            secure payment and access details, usually the same day.
          </p>
          <div className="mt-12 flex flex-col md:flex-row gap-4">
            <a href={ENROL_EMAIL} className="btn btn-primary btn-md:auto">
              <span>Enrol by email — £{PRICE}</span>
              <span className="btn-arrow">→</span>
            </a>
            <a href={ENROL_WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-dark btn-md:auto">
              <span>Enrol on WhatsApp</span>
              <span className="btn-arrow">→</span>
            </a>
          </div>
          <p className="mt-6" style={{ color: 'rgba(245, 240, 236, 0.55)', fontSize: 13 }}>
            For practitioners and clinic teams · Self-paced · {MODULE_COUNT} modules · Certificate and recordable CPD on completion
          </p>
        </div>
      </section>
    </>
  )
}
