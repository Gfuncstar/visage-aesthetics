// Transactional booking emails, rendered through the shared branded template
// (buildBroadcastHtml) so confirmations and cancellations match the clinic's
// broadcast design.

import { buildBroadcastHtml, buildBroadcastText } from './broadcast-email'
import { londonParts, dayLabel, clockLabel } from './booking-engine/time'
import { withinChangeCutoff } from './booking-engine/policy'

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
  // The Rearrange button only works more than 24 hours before the appointment
  // (the manage page and API both enforce this). For a last-minute booking that
  // is already inside the 24h window, drop the button and tell them to call.
  const allowRearrange = !withinChangeCutoff(input.startsAtIso)
  const changeLine = allowRearrange
    ? 'If you need to rearrange or cancel, use the button below. Changes can be made up to 24 hours before your appointment.'
    : `If you need to rearrange or cancel, please call the clinic — as your appointment is within 24 hours, it can no longer be changed online. You can see all your appointments any time at ${SITE}/account.`
  const body = `Hi ${firstName(input.name)},

Your appointment is confirmed. Here are the details:

**${input.serviceName}**
${whenLine(input.startsAtIso)}
${ADDRESS}${consentLine}

${changeLine}${allowRearrange ? `\n\nYou can also see all your appointments any time at ${SITE}/account (we email you a private link, no password needed).` : ''}

Looking forward to seeing you in clinic.`
  const opts = {
    preheader: 'Your appointment is confirmed.',
    headline: 'You are booked in',
    body,
    ...(allowRearrange ? { ctaCustom: { label: 'Rearrange appointment', url: manageUrl } } : { cta: 'none' as const }),
  }
  return {
    subject: `Your booking is confirmed: ${input.serviceName}`,
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline: opts.headline, body, ...(allowRearrange ? { ctaCustom: { label: 'Rearrange appointment', url: manageUrl } } : { cta: 'none' as const }) }),
  }
}

export function appointmentConfirmEmail(input: {
  name: string
  serviceName: string
  startsAtIso: string
  manageToken: string
  /** 48h reminder offers a Rearrange button; the 24h reminder does not. */
  allowRearrange: boolean
}): { subject: string; html: string; text: string } {
  const confirmUrl = `${SITE}/book/confirm/${input.manageToken}`
  const manageUrl = `${SITE}/book/manage/${input.manageToken}`
  const closing = input.allowRearrange
    ? 'Please confirm you are still coming using the button below — it only takes a second and lets us know to expect you. If the time no longer suits, tap Rearrange to pick another. (Changes can be made up to 24 hours before your appointment.)'
    : 'Please confirm you are still coming using the button below — it only takes a second and lets us know to expect you. As your appointment is now within 24 hours, it can no longer be changed online; if something has come up, please call the clinic.'
  const body = `Hi ${firstName(input.name)},

This is a reminder of your appointment with us:

**${input.serviceName}**
${whenLine(input.startsAtIso)}
${ADDRESS}

${closing}`
  const opts = {
    preheader: 'Please confirm your appointment.',
    headline: 'Please confirm your appointment',
    body,
    ctaCustom: { label: 'Confirm appointment', url: confirmUrl },
    ...(input.allowRearrange ? { ctaSecondary: { label: 'Rearrange', url: manageUrl } } : {}),
  }
  return {
    subject: `Please confirm your appointment: ${input.serviceName}`,
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline: opts.headline, body, ctaCustom: opts.ctaCustom, ctaSecondary: input.allowRearrange ? { label: 'Rearrange', url: manageUrl } : undefined }),
  }
}

export function bookingMovedEmail(input: {
  name: string
  serviceName: string
  startsAtIso: string
  manageToken: string
}): { subject: string; html: string; text: string } {
  const confirmUrl = `${SITE}/book/confirm/${input.manageToken}`
  const manageUrl = `${SITE}/book/manage/${input.manageToken}`
  // More than 24h out, they can rearrange online; inside that window, ask them
  // to call instead (the manage page + API enforce the same cutoff).
  const allowRearrange = !withinChangeCutoff(input.startsAtIso)
  const closing = allowRearrange
    ? 'Please confirm the new time still works for you using the button below. If it does not suit, tap Rearrange to pick another (changes can be made up to 24 hours before).'
    : 'Please confirm the new time still works for you using the button below. As it is now within 24 hours, it can no longer be changed online — if it does not suit, please call the clinic and we will find another time.'
  const body = `Hi ${firstName(input.name)},

We have had to move the time of your appointment. Apologies for the change — here are the new details:

**${input.serviceName}**
${whenLine(input.startsAtIso)}
${ADDRESS}

${closing}`
  const opts = {
    preheader: 'Your appointment time has changed — please confirm.',
    headline: 'Your appointment has been moved',
    body,
    ctaCustom: { label: 'Confirm new time', url: confirmUrl },
    ...(allowRearrange ? { ctaSecondary: { label: 'Rearrange', url: manageUrl } } : {}),
  }
  return {
    subject: `Your appointment has been moved: ${input.serviceName}`,
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline: opts.headline, body, ctaCustom: opts.ctaCustom, ctaSecondary: allowRearrange ? { label: 'Rearrange', url: manageUrl } : undefined }),
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

export function passwordResetEmail(input: { name: string; url: string; isNew: boolean }): { subject: string; html: string; text: string } {
  const intro = input.isNew
    ? `You asked to set up an account for your Visage Aesthetics appointments. Choose a password using the secure link below — it is just for you, so please do not forward it.`
    : `You asked to reset the password for your Visage Aesthetics account. Set a new one using the secure link below — it is just for you, so please do not forward it.`
  const label = input.isNew ? 'Set up my account' : 'Reset my password'
  const body = `Hi ${firstName(input.name)},

${intro}

[${label}](${input.url})

This link lasts one hour. If you did not ask for this, you can safely ignore this email — nothing will change.`
  const headline = input.isNew ? 'Set up your account' : 'Reset your password'
  const opts = { preheader: 'Your secure link to set a password.', headline, body, cta: 'none' as const }
  return {
    subject: input.isNew ? 'Set up your Visage Aesthetics account' : 'Reset your Visage Aesthetics password',
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline, body, cta: 'none' }),
  }
}

export function consentSubmittedEmail(input: {
  clientName: string
  serviceName?: string | null
  formName: string
  submissionId: string
}): { subject: string; html: string; text: string } {
  const viewUrl = `${SITE}/staff/assistant/consent?submission=${input.submissionId}`
  const lines = [
    `**${input.clientName}** has completed and submitted a consent form.`,
    '',
    `**Form:** ${input.formName}`,
  ]
  if (input.serviceName) lines.push(`**Treatment:** ${input.serviceName}`)
  lines.push('', 'Tap below to read everything they completed.')
  const body = lines.join('\n')
  const opts = {
    preheader: `${input.clientName} completed their consent form.`,
    headline: 'Consent form completed',
    body,
    ctaCustom: { label: 'View consent form', url: viewUrl },
  }
  return {
    subject: `Consent form completed: ${input.clientName} — ${input.formName}`,
    html: buildBroadcastHtml(opts),
    text: buildBroadcastText({ headline: opts.headline, body, ctaCustom: opts.ctaCustom }),
  }
}

export function staffNewBookingEmail(input: {
  clientName: string
  serviceName: string
  startsAtIso: string
  clientEmail?: string | null
  clientPhone?: string | null
  depositPending?: boolean
  notes?: string | null
}): { subject: string; html: string; text: string } {
  const when = whenLine(input.startsAtIso)
  const lines = [
    `**${input.clientName}** has just booked online.`,
    '',
    `**Treatment:** ${input.serviceName}`,
    `**When:** ${when}`,
  ]
  if (input.clientEmail) lines.push(`**Email:** ${input.clientEmail}`)
  if (input.clientPhone) lines.push(`**Phone:** ${input.clientPhone}`)
  if (input.depositPending) lines.push(`**Status:** Awaiting deposit — the slot is held but not confirmed until they pay.`)
  if (input.notes) lines.push(`**Notes:** ${input.notes}`)
  lines.push('', `[Open the diary](${SITE}/staff/assistant/diary)`)
  const body = lines.join('\n')
  const subject = `New booking: ${input.clientName} — ${input.serviceName}, ${when}`
  const opts = { preheader: `${input.clientName} booked ${input.serviceName}.`, headline: 'New booking', body, cta: 'none' as const }
  return {
    subject,
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
