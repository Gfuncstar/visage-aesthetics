'use client'

import { useState } from 'react'
import { Check, X, RotateCcw } from 'lucide-react'

// ---------------------------------------------------------------------------
// Knowledge check for the Rags to Reputation course. Every question and its
// "correct" answer is grounded in the same government / regulator sources as
// the course itself (reviewed June 2026). The explanation names the rule so a
// learner can verify it.
// ---------------------------------------------------------------------------

type Question = {
  module: string
  q: string
  options: string[]
  correct: number
  explain: string
}

const QUESTIONS: Question[] = [
  {
    module: 'Module 3 · Prescribing law',
    q: 'From 1 June 2025, what does the NMC require before a nurse prescribes non-surgical cosmetic medicines such as botulinum toxin?',
    options: [
      'A face-to-face, in-person consultation with the patient',
      'A video consultation is sufficient',
      'A prescription can be issued on a third party’s request',
      'No consultation if the client is a returning patient',
    ],
    correct: 0,
    explain:
      'From 1 June 2025 the NMC requires an in-person consultation before prescribing non-surgical cosmetic medicines (botulinum toxin, injectable local anaesthetic, fillers, hyaluronidase, tissue stimulants, lipolysis agents and vitamin injections). Remote prescribing — telephone, video, online or third-party — is no longer permitted, aligning the NMC with the GMC’s 2012 position.',
  },
  {
    module: 'Module 3 · Medicines law',
    q: 'How many botulinum toxin products are currently licensed in the UK for aesthetic use?',
    options: ['Three', 'Seven', 'Any CE/UKCA-marked product', 'There is no limit'],
    correct: 1,
    explain:
      'Seven are licensed by the MHRA for aesthetic use: Alluzience, Azzalure, Bocouture, Botox, Letybo, Nuceiva and Relfydess. Anything outside that list is unlicensed, however it is marketed.',
  },
  {
    module: 'Module 1 · The legal framework',
    q: 'Which statute gives the government the power to introduce a licensing scheme for non-surgical cosmetic procedures in England?',
    options: [
      'The Care Standards Act 2000',
      'The Public Health (Wales) Act 2017',
      'The Health and Care Act 2022 (section 180)',
      'The Botulinum Toxin and Cosmetic Fillers (Children) Act 2021',
    ],
    correct: 2,
    explain:
      'Section 180 of the Health and Care Act 2022 is the enabling power. The power exists; as of June 2026 the scheme itself is not yet in force, with a further consultation on the highest-risk procedures expected in spring 2026 and rollout across 2026–2027.',
  },
  {
    module: 'Module 1 · England tiers',
    q: 'In England’s proposed scheme (the August 2025 consultation response), which work falls in the highest-risk “red” tier — restricted to healthcare professionals in CQC-registered premises?',
    options: [
      'Routine anti-wrinkle injections',
      'Microneedling',
      'Skin boosters',
      'Breast, buttock and genital augmentation with dermal filler',
    ],
    correct: 3,
    explain:
      'The government said it would prioritise the highest-risk procedures — augmenting the breast, buttocks and genitals with dermal fillers — restricting them to regulated healthcare professionals in CQC-registered premises. Routine anti-wrinkle, filler and skin boosters sit in the proposed amber tier, to be licensed by local authorities.',
  },
  {
    module: 'Module 4 · CQC',
    q: 'In England, when does botulinum toxin treatment become a CQC-regulated activity requiring registration?',
    options: [
      'Whenever it is injected for any reason',
      'When used to treat a medical condition such as hyperhidrosis, migraine or bruxism',
      'Only when performed in a hospital',
      'It is never a regulated activity',
    ],
    correct: 1,
    explain:
      'Purely cosmetic toxin and filler are not regulated activities, because there is no cut to the body. But the same toxin used to treat a medical condition (e.g. hyperhidrosis, chronic migraine or bruxism) is “treatment of disease, disorder or injury” and requires CQC registration — as do thread lifts and surgical procedures.',
  },
  {
    module: 'Module 4 · Scotland',
    q: 'Under Scotland’s model, injectables such as botulinum toxin and dermal filler (Group 2) must be:',
    options: [
      'Carried out by anyone holding a premises licence',
      'Banned entirely',
      'Supervised by a qualified healthcare professional in a Healthcare Improvement Scotland-regulated setting',
      'Performed only in NHS hospitals',
    ],
    correct: 2,
    explain:
      'Scotland’s three-group model places injectables in Group 2 — they must involve a qualified healthcare professional in an HIS-regulated setting. Group 1 (e.g. microneedling, non-ablative laser) needs local-authority premises and practitioner licences; Group 3 (e.g. augmentation) is restricted to healthcare professionals in HIS-regulated settings. Provisions are expected in force from September 2027.',
  },
  {
    module: 'Module 5 · Under-18 law',
    q: 'Under the Botulinum Toxin and Cosmetic Fillers (Children) Act 2021, administering toxin or filler for a cosmetic purpose to someone under 18 in England is:',
    options: [
      'Permitted with parental consent',
      'A criminal offence even with parental consent, carrying an unlimited fine',
      'Permitted if the person is 16 or 17',
      'Only an offence if harm results',
    ],
    correct: 1,
    explain:
      'Since 1 October 2021 it has been a criminal offence, carrying an unlimited fine, to administer botulinum toxin or filler for a cosmetic purpose to anyone under 18 in England — even with parental consent, and even if the young person is only visiting. A narrow exception exists where a regulated professional acts under a doctor’s direction for a medical reason.',
  },
  {
    module: 'Module 5 · Consent',
    q: 'Which legal standard governs how risks must be disclosed when taking consent?',
    options: [
      'Montgomery — the material risks a reasonable person in the patient’s position would want to know',
      'Whatever risks the clinician judges relevant',
      'No legal standard applies to cosmetic work',
      'Only risks with more than a 10% chance need disclosing',
    ],
    correct: 0,
    explain:
      'Montgomery v Lanarkshire established that consent requires disclosing the material risks a reasonable person in the patient’s position would want to know — not simply what a clinician thinks they should hear. A genuine cooling-off period supports valid consent.',
  },
  {
    module: 'Module 11 · Advertising',
    q: 'Under the CAP rules, advertising botulinum toxin (a prescription-only medicine) to the public is:',
    options: [
      'Allowed on your own organic social media',
      'Allowed as long as no price is shown',
      'Allowed for influencers only',
      'Prohibited — including brand names, #botox and before/after images of the product',
    ],
    correct: 3,
    explain:
      'Botulinum toxin is a POM and cannot be advertised to the public (CAP rule 12.12; Human Medicines Regulations 2012). This covers paid ads, organic posts and influencer content, brand names, avoidance terms like “tox”, hashtags such as #botox, and before/after images of the product (treated as an implied ad). The MHRA and ASA actively enforce this, including AI-driven monitoring.',
  },
  {
    module: 'Module 6 · Data protection',
    q: 'How is the health data a clinic holds on its clients classified under UK GDPR?',
    options: [
      'Ordinary personal data',
      'Special category data, requiring an Article 9 condition',
      'Not personal data',
      'Exempt from data-protection law',
    ],
    correct: 1,
    explain:
      'Health data is special category data under UK GDPR, requiring a lawful basis plus an Article 9 condition, secure storage and a defined retention schedule. Breaches can attract penalties of up to £17.5m or 4% of annual turnover.',
  },
  {
    module: 'Module 9 · Complications',
    q: 'After filler, you see blanching, disproportionate pain and a capillary refill time greater than three seconds. This most likely indicates:',
    options: [
      'Normal bruising',
      'Anaphylaxis',
      'Vascular occlusion — manage with the ACE Group high-dose pulsed hyaluronidase protocol',
      'Nothing of concern',
    ],
    correct: 2,
    explain:
      'These are signs of vascular occlusion, a sight- and skin-threatening emergency. ACE Group guidance is to use the high-dose pulsed hyaluronidase protocol. You should never inject filler without hyaluronidase, a prescriber and a written plan already in place.',
  },
  {
    module: 'Module 7 · Waste',
    q: 'For waste-management purposes, an aesthetics clinic is legally classed as:',
    options: [
      'A domestic-waste producer',
      'Exempt from waste rules',
      'A producer of controlled waste, with a Duty of Care through to final disposal',
      'Responsible only until the bin is full',
    ],
    correct: 2,
    explain:
      'Clinics are “producers of controlled waste” and carry a Duty of Care from the moment waste is created to its final disposal by a licensed carrier. Sharps go in puncture- and leak-proof containers, and needlestick injuries can be reportable under RIDDOR.',
  },
  {
    module: 'Module 10 · Indemnity',
    q: 'What level of medical malpractice cover is typical for toxin, filler and laser work — and who will insurers cover for injectables?',
    options: [
      'Around £10,000, available to anyone',
      'Commonly £5m (minimum £2m), with injectables covered only for qualified healthcare professionals',
      'Cover is not available in the UK',
      'It is optional and rarely held',
    ],
    correct: 1,
    explain:
      'Insurers such as Hamilton Fraser recommend a minimum of £2m, with £5m standard for toxin, filler and laser. Crucially, they will only cover injectable treatments for qualified healthcare professionals.',
  },
  {
    module: 'Module 2 · Qualifications',
    q: 'Which Ofqual-regulated qualification is widely regarded as the gold standard for injectable practice?',
    options: [
      'A one-day foundation course',
      'Level 2 Beauty Therapy',
      'The Level 7 Diploma in Clinical Aesthetic Injectable Therapies',
      'No formal qualification exists',
    ],
    correct: 2,
    explain:
      'The Level 7 Diploma in Clinical Aesthetic Injectable Therapies (offered by Ofqual-regulated awarding bodies such as OTHM and VTCT/ITEC) has become the de-facto gold standard, mapped to the JCCP Competency Framework. The JCCP also expects practitioners to be working at and beyond Level 4.',
  },
  {
    module: 'Module 3 · Case study',
    q: 'The 2025 UK outbreak of iatrogenic botulism linked to cosmetic injections was traced to:',
    options: [
      'A licensed product recall',
      'An unlicensed product tested at 370 units/vial against a 200-unit label, with 41 confirmed cases',
      'Food poisoning unrelated to injections',
      'A manufacturing fault at a licensed factory',
    ],
    correct: 1,
    explain:
      'UKHSA confirmed 41 cases of botulism (4 June–6 August 2025) linked to an unlicensed product; seized product tested at 370 units per vial against a 200-unit label. The MHRA’s Criminal Enforcement Unit responded — unlawful supply of a POM carries up to two years’ imprisonment and an unlimited fine.',
  },
]

const PASS_PCT = 80

export default function Quiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null))
  const [submitted, setSubmitted] = useState(false)

  const answeredCount = answers.filter((a) => a !== null).length
  const score = answers.reduce<number>((n, a, i) => (a === QUESTIONS[i].correct ? n + 1 : n), 0)
  const pct = Math.round((score / QUESTIONS.length) * 100)
  const passed = pct >= PASS_PCT

  const select = (qi: number, oi: number) => {
    if (submitted) return
    setAnswers((prev) => {
      const next = [...prev]
      next[qi] = oi
      return next
    })
  }

  const reset = () => {
    setAnswers(QUESTIONS.map(() => null))
    setSubmitted(false)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {submitted && (
        <div
          className="mb-10 rounded-md p-7 border"
          style={{
            background: passed ? 'rgba(94, 116, 96, 0.08)' : 'rgba(181, 131, 111, 0.08)',
            borderColor: passed ? 'rgba(94, 116, 96, 0.4)' : 'rgba(181, 131, 111, 0.4)',
          }}
        >
          <p className="eyebrow mb-2" style={{ color: passed ? '#5E7460' : '#B5836F' }}>
            {passed ? 'Pass' : 'Keep going'}
          </p>
          <p className="font-display italic text-charcoal mb-2" style={{ fontSize: 34, fontWeight: 500 }}>
            {score} / {QUESTIONS.length} &nbsp;·&nbsp; {pct}%
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-0">
            {passed
              ? 'A solid grasp of the current rules. The full course goes considerably deeper, with the templates, checklists and the licence-readiness self-audit to put it into practice.'
              : `The pass mark is ${PASS_PCT}%. Review the explanations below — this is exactly the ground the full course covers in depth, with worked examples and a licence-readiness self-audit.`}
          </p>
        </div>
      )}

      <ol className="space-y-8">
        {QUESTIONS.map((question, qi) => {
          const chosen = answers[qi]
          return (
            <li key={qi} className="bg-white border border-line/50 rounded-md p-6 md:p-7">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="eyebrow text-gold">{String(qi + 1).padStart(2, '0')}</span>
                <span className="eyebrow text-stone">{question.module}</span>
              </div>
              <p className="font-display italic text-charcoal mb-5" style={{ fontSize: 22, lineHeight: 1.25 }}>
                {question.q}
              </p>
              <div className="space-y-2.5">
                {question.options.map((opt, oi) => {
                  const isChosen = chosen === oi
                  const isCorrect = oi === question.correct
                  let border = 'rgba(217, 205, 190, 0.7)'
                  let bg = 'transparent'
                  let icon = null
                  if (!submitted && isChosen) {
                    border = '#A8895E'
                    bg = 'rgba(168, 137, 94, 0.08)'
                  }
                  if (submitted) {
                    if (isCorrect) {
                      border = '#5E7460'
                      bg = 'rgba(94, 116, 96, 0.1)'
                      icon = <Check size={17} strokeWidth={2} style={{ color: '#5E7460' }} />
                    } else if (isChosen) {
                      border = '#B5836F'
                      bg = 'rgba(181, 131, 111, 0.1)'
                      icon = <X size={17} strokeWidth={2} style={{ color: '#B5836F' }} />
                    }
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => select(qi, oi)}
                      disabled={submitted}
                      aria-pressed={isChosen}
                      className="w-full text-left flex items-center justify-between gap-3 rounded-sm transition-colors"
                      style={{
                        border: `1px solid ${border}`,
                        background: bg,
                        padding: '12px 16px',
                        cursor: submitted ? 'default' : 'pointer',
                      }}
                    >
                      <span className="text-body text-charcoal leading-snug">{opt}</span>
                      {icon}
                    </button>
                  )
                })}
              </div>
              {submitted && (
                <p className="mt-4 text-body text-ink-soft leading-relaxed border-t border-line/40 pt-4 mb-0">
                  {question.explain}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
        {!submitted ? (
          <>
            <button
              type="button"
              onClick={() => {
                setSubmitted(true)
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={answeredCount < QUESTIONS.length}
              className="btn btn-primary btn-md:auto"
              style={{ opacity: answeredCount < QUESTIONS.length ? 0.5 : 1 }}
            >
              <span>Check my answers</span>
              <span className="btn-arrow">→</span>
            </button>
            <span className="text-body text-stone">
              {answeredCount} / {QUESTIONS.length} answered
            </span>
          </>
        ) : (
          <button type="button" onClick={reset} className="btn btn-secondary btn-md:auto">
            <RotateCcw size={15} strokeWidth={1.8} />
            <span>&nbsp;Reset &amp; try again</span>
          </button>
        )}
      </div>
    </div>
  )
}
