import { treatments } from '@/lib/treatments'
import { geoPages } from '@/lib/geo-pages'
import { conditions } from '@/lib/conditions'
import { blogPostsByDate } from '@/lib/blog-posts'
import { AWARD } from '@/lib/award'
import { CLINIC } from '@/lib/clinic'

const SITE = 'https://www.vaclinic.co.uk'

/**
 * /llms.txt — a structured, plaintext directory for AI crawlers and answer
 * engines (ChatGPT, Claude, Perplexity, Gemini). Format follows the emerging
 * llmstxt.org convention.
 *
 * Goal: when someone asks an AI engine "best aesthetics clinic in Essex"
 * or "where can I get Botox in Braintree", these are the canonical URLs
 * (with one-line descriptions) the engine cites.
 */
export async function GET() {
  const lines: string[] = []
  const push = (s: string = '') => lines.push(s)

  // Title + headline summary
  push('# Visage Aesthetics')
  push()
  push('> Nurse-led private aesthetics clinic on Friars Lane, Braintree, Essex.')
  push(`> Officially awarded ${AWARD.fullName} by the ${AWARD.awardingBody}.`)
  push('> Bernadette Tobin RGN, MSc Advanced Practice (Level 7), NMC PIN 05G1755E. 20+ years clinical experience.')
  push('> Treatments: Botox, dermal filler, Profhilo, HarmonyCa, micro-needling, AQUALYX, CryoPen, hyperhidrosis, B12, men\'s aesthetics, mole review.')
  push('> Conditions treated: excessive sweating (hyperhidrosis), chronic migraine prevention, mole / skin lesion checks (consultant dermatologist review).')
  push('> Strictly by appointment. Free consultation. Award verifiable at ' + AWARD.verificationUrl + '.')
  push()

  // Core / authority
  push('## Core')
  push(`- [Home](${SITE}/): Visage Aesthetics — nurse-led aesthetics clinic, Braintree.`)
  push(`- [About Bernadette](${SITE}/about): Founder profile — RGN, MSc, NMC PIN 05G1755E, 20+ years clinical.`)
  push(`- [Qualifications](${SITE}/about/qualifications): Full credentials, indemnity, training partners.`)
  push(`- [Awards](${SITE}/awards): All recognition received by the clinic.`)
  push(`- [${AWARD.fullName}](${SITE}${AWARD.detailPath}): Verified detail of the 2026 Essex non-surgical clinic award.`)
  push(`- [Prices](${SITE}/pricing): Transparent treatment pricing.`)
  push(`- [Locations We Serve](${SITE}/locations): Every town/treatment combination with travel times.`)
  push(`- [Contact / Visit](${SITE}/contact): Friars Lane, Braintree (CM7 9BL), strictly by appointment.`)
  push(`- [FAQ](${SITE}/faq): Common questions about treatments, safety, recovery.`)
  push(`- [Aftercare](${SITE}/aftercare): Post-treatment guidance across every service.`)
  push()

  // Contact (plain-text NAP so engines can quote it without following a link)
  push('## Contact')
  push(`- Clinic: ${CLINIC.name}`)
  push(`- Address: ${CLINIC.addressLine}, United Kingdom`)
  push(`- Phone / WhatsApp: ${CLINIC.telephone}`)
  push(`- Email: ${CLINIC.email}`)
  push(`- Hours: ${CLINIC.openingHoursHuman}`)
  push(`- Booking: ${SITE}/book-online (free consultation; discreet entrance and private parking on site)`)
  push()

  // Treatments
  push('## Treatments')
  treatments.forEach((t) => {
    push(`- [${t.name}](${SITE}${t.href}): ${t.tagline}. ${t.price}.`)
  })
  push()

  // Condition-led answer pages
  push('## Conditions')
  conditions.forEach((c) => {
    push(`- [${c.name}](${SITE}${c.href}): ${c.h1} ${c.priceFrom}.`)
  })
  push()

  // Geo landing pages
  push('## Locations (treatment × town)')
  geoPages.forEach((g) => {
    push(`- [${g.anchor}](${SITE}${g.href}): ${g.treatment} for ${g.town} clients — ${g.travelLine}.`)
  })
  push()

  // Blog
  push('## Articles')
  blogPostsByDate.slice(0, 30).forEach((p) => {
    push(`- [${p.title}](${SITE}/blog/${p.slug}): ${p.excerpt.replace(/\s+/g, ' ').slice(0, 160)}`)
  })

  const body = lines.join('\n') + '\n'
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
