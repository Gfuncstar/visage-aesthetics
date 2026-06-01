// Communications log. Every transactional message the system sends a client is
// recorded here so the client record shows one history of every contact, across
// SMS and email. Fire-and-forget: logging never breaks a send.

import { insert } from './db'

export type MessageKind =
  | 'confirmation'
  | 'reminder'
  | 'review'
  | 'waitlist'
  | 'cancellation'
  | 'reschedule'
  | 'rebook'
  | 'reply'
  | 'other'

function norm(s: string | null | undefined): string | null {
  if (!s) return null
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function recordMessage(m: {
  clientName?: string | null
  email?: string | null
  phone?: string | null
  channel: 'sms' | 'email'
  kind: MessageKind
  subject?: string | null
  body?: string | null
  bookingId?: string | null
  direction?: 'out' | 'in'
}): Promise<void> {
  try {
    await insert('messages', {
      client_name: m.clientName ?? null,
      name_normalised: norm(m.clientName),
      client_email: m.email?.toLowerCase() ?? null,
      client_phone: m.phone ?? null,
      channel: m.channel,
      direction: m.direction ?? 'out',
      kind: m.kind,
      subject: m.subject ?? null,
      body: m.body ?? null,
      booking_id: m.bookingId ?? null,
    })
  } catch (err) {
    console.error('[messages] log failed', err)
  }
}
