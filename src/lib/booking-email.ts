// Transactional booking emails, rendered through the shared branded template
// (buildBroadcastHtml) so confirmations and cancellations match the clinic's
// broadcast design.

import { buildBroadcastHtml, buildBroadcastText } from './broadcast-email'
import { londonParts, dayLabel, clockLabel } from './booking-engine/time'

const SITE = 'https://www.vaclinic.co.uk'
const ADDRESS = '17A Friars Lane, Braintree, Essex CM7 9BL'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

function whenLine(startsAtIso: string): string {
  const p = londonParts(new Date(startsAtIso))
  return `${dayLabel(p.dateStr)} at ${clockLabel(p.minutes)}`
}

export function bookingConfirmationEmail(input: {
  name: string
  serviceName: string
  startsAtIso: string
  manageToken: string
  /**
   * Optional link to the client's online consent form. When provided, a line
   * asking them to complete it before the appointment is added. The live
   * booking flow does NOT pass this yet, so confirmation emails are unchanged
   * until consent forms are switched on (see docs/CONSENT_FORMS.md).
   */
  consentUrl?: string
}): { subject: string; html: string; text: string } {
  const manageUrl = `${SITE}/book/manage/${input.manageToken}`
  const consentLine = input.consentUrl
    ? `\n\n**Before your appointment:** please [complete your consent form here](${input.consentUrl}). It only takes a couple of minutes and saves time when you arrive.`
    : ''
  const body = `Hi ${firstName(input.name)},

Your appointment is confirmed. Here are the details:

**${input.serviceName}**
${whenLine(input.startsAtIso)}
${ADDRESS}${consentLine}

If you need to change or cancel, you can [manage your booking here](${manageUrl}).

You can also see all your appointments any time at ${SITE}/account (we email you a private link, no password needed).

Looking forward to seeing you in clinic.`
  const opts = { preheader: 'Your appointment is confirmed.', headline: 'You are booked in', body, cta: 'none' as const }
  return {
    subject: `Your booking is confirmed: ${input.serviceName}`,
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline: opts.headline, body, cta: 'none' }),
  }
}

export function portalLoginEmail(input: { name: string; url: string }): { subject: string; html: string; text: string } {
  const body = `Hi ${firstName(input.name)},

Here is your private link to see your appointments at Visage Aesthetics:

[See my appointments](${input.url})

From there you can view everything booked, change or cancel a time, and update your details. There is no password to remember. The link is just for you, so please do not forward it.

If you did not ask for this, you can ignore this email.`
  const opts = { preheader: 'Your link to manage your appointments.', headline: 'Your appointments', body, cta: 'none' as const }
  return {
    subject: 'Your link to manage your appointments',
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline: opts.headline, body, cta: 'none' }),
  }
}

export function bookingCancellationEmail(input: {
  name: string
  serviceName: string
  startsAtIso: string
}): { subject: string; html: string; text: string } {
  const bookUrl = `${SITE}/book-online`
  const body = `Hi ${firstName(input.name)},

Your ${input.serviceName} appointment on ${whenLine(input.startsAtIso)} has been cancelled.

If you would like to rebook, you can [find a new time here](${bookUrl}).`
  const opts = { preheader: 'Your appointment has been cancelled.', headline: 'Booking cancelled', body, cta: 'none' as const }
  return {
    subject: 'Your booking has been cancelled',
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline: opts.headline, body, cta: 'none' }),
  }
}
