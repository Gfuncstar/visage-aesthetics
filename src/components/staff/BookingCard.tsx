'use client'

// The one shared appointment card + detail modal, used everywhere a booking is
// shown to staff (home landing, reception desk, diary). One implementation so
// the style and the actions — tap to open, the confirm/remind/consent/cancel
// modal, the past/current/confirmed tinting — are always identical.

import { useEffect, useState } from 'react'
import { Check, Mail, Phone, Send, Sparkles, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'
import ConsentStatus from '@/components/staff/ConsentStatus'

const TZ = 'Europe/London'

export type BookingLite = {
  id: string
  service_name: string
  client_name: string
  client_email?: string | null
  client_phone: string | null
  starts_at: string
  ends_at?: string
  status: string
  source?: string
  notes?: string | null
  confirmed_at: string | null
}

function toLocalMin(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(iso))
  return Number(parts.find((p) => p.type === 'hour')?.value ?? '0') * 60 + Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
}
function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}
function localDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
}
function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}
function dayLabelShort(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${ds}T12:00:00Z`))
}

const statusTone: Record<string, string> = {
  confirmed: 'text-sage',
  pending: 'text-gold-deep',
  completed: 'text-stone',
  cancelled: 'text-clay line-through',
  no_show: 'text-clay',
}

// A 'confirmed' booking only means the slot is held; whether the *client* has
// actually confirmed is confirmed_at. Keep the label honest.
function statusLabel(status: string, confirmedAt: string | null): string {
  if (status === 'confirmed') return confirmedAt ? 'Confirmed' : 'Unconfirmed'
  if (status === 'no_show') return 'No show'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
function statusToneFor(status: string, confirmedAt: string | null): string {
  if (status === 'confirmed' && !confirmedAt) return 'text-gold-deep'
  return statusTone[status] ?? 'text-stone'
}

export function ConfirmedDot({ status, confirmedAt, onDark = false }: { status: string; confirmedAt: string | null; onDark?: boolean }) {
  // On a solid card the status word already says it, so the dot would just
  // clash with the background — hide it.
  if (onDark) return null
  if (status === 'confirmed' && confirmedAt) return <span title="Client confirmed" className="w-2 h-2 rounded-full bg-sage inline-block shrink-0" />
  if (status === 'confirmed' && !confirmedAt) return <span title="Awaiting confirmation" className="w-2 h-2 rounded-full bg-gold inline-block shrink-0" />
  if (status === 'pending') return <span title="Deposit pending" className="w-2 h-2 rounded-full bg-gold-deep inline-block shrink-0" />
  return null
}

export function ConsentFlag({ name, missing, onDark = false }: { name: string; missing: Set<string> | null; onDark?: boolean }) {
  if (missing === null) return null
  if (missing.has(name.trim().toLowerCase())) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold shrink-0 whitespace-nowrap ${onDark ? 'text-cream' : 'text-avail'}`}>
        <X size={10} strokeWidth={3} /> Consent
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-normal shrink-0 whitespace-nowrap ${onDark ? 'text-cream/70' : 'text-sage/70'}`}>
      <Check size={9} strokeWidth={2.5} /> Consent
    </span>
  )
}

// ---- The tappable appointment card -----------------------------------------
export function BookingRow({ booking: b, nowMin, missing, justBooked = false, onCancel, onOpen }: {
  booking: BookingLite
  nowMin: number
  missing: Set<string> | null
  justBooked?: boolean
  onCancel: (booking: BookingLite) => void
  onOpen: (booking: BookingLite) => void
}) {
  const start = toLocalMin(b.starts_at)
  const end = b.ends_at ? toLocalMin(b.ends_at) : start + 60
  const bookingDay = localDate(b.starts_at)
  const today = todayStr()
  const isPast = bookingDay < today || (bookingDay === today && nowMin >= end)
  const isCurrent = bookingDay === today && nowMin >= start && nowMin < end
  const isConfirmed = b.status === 'confirmed' && !!b.confirmed_at
  const isPastOrCurrent = isPast || isCurrent
  // Three solid states: charcoal (dark, top-banner) once the client has been
  // and gone; gold-deep (warm solid, matches the New Booking button) for
  // confirmed-and-coming; light cream for anything still unconfirmed.
  const solid = isPastOrCurrent || isConfirmed
  const cardTone = isPastOrCurrent
    ? 'border-charcoal bg-charcoal'
    : isConfirmed
      ? 'border-gold bg-gold'
      : justBooked
        ? 'border-gold/70 bg-gold/[0.10]'
        : 'border-line/40 bg-cream'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(b)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(b) } }}
      title={`Open ${b.client_name}'s booking`}
      className={`flex items-center justify-between gap-3 border-2 rounded-sm px-4 py-3 transition cursor-pointer hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${cardTone}`}
    >
      <div className="min-w-0 flex-1">
        <div className={`text-sm truncate flex items-center gap-2 ${solid ? 'text-cream' : 'text-charcoal'}`}>
          {isCurrent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cream shrink-0" />}
          <span><span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>
          {justBooked && !solid && <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-gold-deep bg-gold/15 border border-gold/40 rounded-full px-1.5 py-0.5"><Sparkles size={9} strokeWidth={2} /> Just booked</span>}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <ConsentFlag name={b.client_name} missing={missing} onDark={solid} />
          <ConfirmedDot status={b.status} confirmedAt={b.confirmed_at} onDark={solid} />
          <span className={`text-xs ${solid ? 'text-cream/85' : statusToneFor(b.status, b.confirmed_at)}`}>{statusLabel(b.status, b.confirmed_at)}</span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <span className={`text-sm font-semibold truncate max-w-[8rem] text-right ${isPastOrCurrent ? 'text-gold' : isConfirmed ? 'text-cream' : 'text-gold-deep'}`}>{b.service_name}</span>
        <button onClick={(e) => { e.stopPropagation(); onCancel(b) }} className={`transition-colors ${solid ? 'text-cream/70 hover:text-cream' : 'text-stone/70 hover:text-clay'}`} title={`Cancel ${b.client_name}'s booking and release the slot`} aria-label="Cancel booking">
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ---- Cancel confirmation — a dark brand pop-up card ------------------------
export function CancelConfirmModal({ booking, onConfirm, onClose }: { booking: BookingLite; onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 px-5" role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title" onClick={onClose}>
      <div className="bg-charcoal text-cream border border-gold/45 rounded-md shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <span className="inline-flex w-12 h-12 rounded-full bg-clay/20 text-clay items-center justify-center mb-4">
          <X size={24} strokeWidth={2} />
        </span>
        <h2 id="cancel-booking-title" className="font-display italic text-2xl leading-tight">Cancel this booking?</h2>
        <p className="text-sm text-cream/85 mt-2 leading-relaxed">
          <span className="font-medium text-cream">{booking.client_name}</span>
          {' · '}{timeLabel(booking.starts_at)}{' · '}{booking.service_name}
        </p>
        <p className="text-xs text-cream/55 mt-2 leading-relaxed">This frees the slot and texts anyone on the waitlist for that treatment.</p>
        <div className="flex items-center gap-2 mt-5">
          <button onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-sm bg-clay text-cream font-medium px-4 hover:bg-clay/90 transition-colors" style={{ minHeight: 40 }} autoFocus>
            <X size={15} strokeWidth={2} /> Yes, cancel
          </button>
          <button onClick={onClose} className="inline-flex items-center justify-center rounded-sm border border-cream/30 text-cream px-4 hover:bg-cream/10 transition-colors" style={{ minHeight: 40 }}>
            Keep booking
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Booking detail — tap a card to open it, confirm / message / cancel -----
export function BookingDetailModal({ booking: b, onClose, onCancel, onChanged }: { booking: BookingLite; onClose: () => void; onCancel: (booking: BookingLite) => void; onChanged: () => void }) {
  const [busy, setBusy] = useState<null | 'remind' | 'confirm'>(null)
  const [note, setNote] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const isConfirmed = b.status === 'confirmed' && !!b.confirmed_at
  const noContact = !b.client_email && !b.client_phone

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function act(action: 'remind' | 'confirm') {
    setBusy(action); setErr(null); setNote(null)
    try {
      const res = await fetch('/api/staff/assistant/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: b.id, action }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(d.error || 'Could not do that.'); return }
      if (action === 'confirm') { notifyDone('Marked as confirmed'); onChanged(); onClose() }
      else { setNote(`Confirmation request sent by ${d.channel === 'sms' ? 'text' : 'email'}.`); onChanged() }
    } catch {
      setErr('Network error — please try again.')
    } finally {
      setBusy(null)
    }
  }

  const dayLabel = dayLabelShort(localDate(b.starts_at))
  const timeRange = `${timeLabel(b.starts_at)}${b.ends_at ? ` – ${timeLabel(b.ends_at)}` : ''}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 px-5" role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" onClick={onClose}>
      <div className="bg-cream rounded-md shadow-xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-charcoal text-cream px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.16em] text-cream/55">{dayLabel}</div>
            <div className="text-lg font-medium text-gold-soft leading-tight mt-0.5">{timeRange}</div>
            <h2 id="booking-detail-title" className="font-display italic text-2xl leading-tight truncate capitalize mt-2">{b.client_name}</h2>
            <div className="text-sm text-cream/75 mt-0.5 truncate">{b.service_name}</div>
          </div>
          <button onClick={onClose} className="text-cream/60 hover:text-cream shrink-0" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${isConfirmed ? 'text-sage' : 'text-gold-deep'}`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isConfirmed ? 'bg-sage' : 'bg-gold'}`} />
              {isConfirmed ? 'Confirmed by client' : 'Awaiting confirmation'}
            </span>
            {b.source && <span className="text-xs text-stone shrink-0">via {b.source === 'ovatu' ? 'Ovatu' : b.source === 'online' ? 'online' : 'staff'}</span>}
          </div>

          <div className="text-sm text-charcoal space-y-2 border-t border-line/40 pt-3.5">
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-stone shrink-0" />
              {b.client_phone ? <span className="text-charcoal">{b.client_phone}</span> : <span className="text-stone/60">No phone on file</span>}
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <Mail size={14} className="text-stone shrink-0" />
              {b.client_email ? <a href={`mailto:${b.client_email}`} className="text-gold-deep hover:underline truncate">{b.client_email}</a> : <span className="text-stone/60">No email on file</span>}
            </div>
          </div>

          {b.notes && <div className="text-xs text-stone leading-relaxed whitespace-pre-wrap">{b.notes}</div>}

          <ConsentStatus clientName={b.client_name} serviceName={b.service_name} bookingId={b.id} clientEmail={b.client_email} />

          {noContact && (
            <p className="text-xs text-clay leading-snug">No contact details on file, so a confirmation can&apos;t be sent yet — add a phone or email first. You can still mark them confirmed by hand if they&apos;ve told you.</p>
          )}
          {note && <p className="text-xs text-sage">{note}</p>}
          {err && <p className="text-xs text-clay">{err}</p>}

          <div className="flex flex-col gap-2 pt-1">
            {!isConfirmed && (
              <button onClick={() => act('confirm')} disabled={busy !== null} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 40 }}>
                <span className="inline-flex items-center gap-2"><Check size={15} strokeWidth={2} /> {busy === 'confirm' ? 'Marking…' : 'Mark as confirmed'}</span>
              </button>
            )}
            <button onClick={() => act('remind')} disabled={busy !== null || noContact} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 40 }}>
              <span className="inline-flex items-center gap-2"><Send size={14} strokeWidth={1.75} /> {busy === 'remind' ? 'Sending…' : 'Send confirmation request'}</span>
            </button>
            <button onClick={() => onCancel(b)} className="text-sm text-clay border border-clay/30 hover:bg-clay/5 rounded-sm transition-colors" style={{ minHeight: 40 }}>
              Cancel &amp; release slot
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
