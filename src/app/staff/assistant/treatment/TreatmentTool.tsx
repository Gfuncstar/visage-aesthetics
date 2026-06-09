'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  LogOut,
  Mail,
  Plus,
  Save,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { TREATMENT_TYPES, getTreatmentType, matchTreatmentType } from '@/lib/assistant/treatment-types'
import { notifyDone } from '@/lib/staff-toast'
import { ukDate } from '@/lib/assistant/format'
import { bodyToText } from '@/lib/broadcast-email'
import DictateButton from '@/components/ui/DictateButton'
import {
  buildClientEmail,
  buildClinicalNote,
  totalDose,
  type WriteUpInput,
} from '@/lib/assistant/notes'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'
const textareaClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold leading-relaxed'

type Suggestion = { id: string | null; name: string; email: string | null; source: string }
type AreaRow = { area: string; dose: number }
type RecentAppt = { id: string; client_name: string; date: string; service_name: string; status: string }

// Carry-forward memory: remember the product / batch / expiry / technique per
// treatment type so the same batch auto-fills for the rest of the day. Stored
// locally on this device only (no patient data).
type Memory = { product?: string; batchNumber?: string; expiry?: string; technique?: string }
function loadMemory(typeId: string): Memory {
  try {
    return JSON.parse(localStorage.getItem(`va_tx_mem_${typeId}`) || '{}') as Memory
  } catch {
    return {}
  }
}
function saveMemory(typeId: string, mem: Memory) {
  try {
    localStorage.setItem(`va_tx_mem_${typeId}`, JSON.stringify(mem))
  } catch {
    /* ignore */
  }
}

export default function TreatmentTool() {
  const today = new Date().toISOString().slice(0, 10)

  // Client
  const [clientName, setClientName] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)
  const [clientEmail, setClientEmail] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSug, setShowSug] = useState(false)
  const [appts, setAppts] = useState<RecentAppt[]>([])
  const [pickDate, setPickDate] = useState(today)
  const [pickedApptId, setPickedApptId] = useState<string | null>(null)

  // Treatment
  const [typeId, setTypeId] = useState(TREATMENT_TYPES[0].id)
  const type = useMemo(() => getTreatmentType(typeId)!, [typeId])
  const [date, setDate] = useState(today)
  const [areas, setAreas] = useState<AreaRow[]>([])
  const [customArea, setCustomArea] = useState('')
  const [product, setProduct] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [technique, setTechnique] = useState('')
  const [consent, setConsent] = useState(true)
  const [reviewDate, setReviewDate] = useState('')
  const [notes, setNotes] = useState('')
  const [interest, setInterest] = useState('')

  // Outputs
  const [generated, setGenerated] = useState(false)
  const [clinicalNote, setClinicalNote] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null)

  const [copied, setCopied] = useState(false)
  const [confirmSend, setConfirmSend] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null)

  const [aiEnhancing, setAiEnhancing] = useState(false)
  const [aiNextSteps, setAiNextSteps] = useState<string[]>([])

  const isConsult = typeId === 'consultation'

  const [txPhotos, setTxPhotos] = useState<{ url: string; type: string }[]>([])
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoErr, setPhotoErr] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement | null>(null)

  const sugTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function uploadPhoto(file: File) {
    if (!clientName.trim()) { setPhotoErr('Add the client first.'); return }
    if (!consent) { setPhotoErr('Tick consent before adding a photo.'); return }
    setPhotoBusy(true)
    setPhotoErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('client_name', clientName)
      fd.append('type', photoType)
      fd.append('date', date)
      fd.append('consent', 'true')
      fd.append('treatment_type', type.name)
      const res = await fetch('/api/staff/assistant/photos', { method: 'POST', body: fd })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setPhotoErr(d.error || 'Upload failed.'); return }
      setTxPhotos((prev) => [...prev, { url: d.url, type: photoType }])
    } catch {
      setPhotoErr('Network error.')
    } finally {
      setPhotoBusy(false)
    }
  }

  // Pull the chosen day's appointments (today by default) so the clinician can
  // pick who came at the end of clinic instead of typing.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/staff/assistant/appointments?date=${pickDate}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return
        setAppts(d?.appointments ?? [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pickDate])

  // On treatment-type change: reset areas and pull product/batch/expiry/
  // technique from carry-forward memory so repeat write-ups need almost no typing.
  useEffect(() => {
    setAreas([])
    const mem = loadMemory(type.id)
    setProduct(mem.product || type.products[0] || '')
    setBatchNumber(mem.batchNumber || '')
    setExpiry(mem.expiry || '')
    setTechnique(mem.technique || '')
    setGenerated(false)
    setSaveResult(null)
  }, [type])

  // When the product changes, pull the latest stock batch for it (sourced from
  // supplier order emails). A real batch takes precedence over carry-forward.
  useEffect(() => {
    if (type.unit === 'none' || !product.trim()) return
    let cancelled = false
    fetch(`/api/staff/assistant/batches?product=${encodeURIComponent(product)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.latest) return
        setBatchNumber(d.latest.batch_number || '')
        if (d.latest.expiry) {
          // Show expiry as MM/YY to match how it is recorded by hand.
          const dt = new Date(d.latest.expiry)
          if (!Number.isNaN(dt.getTime())) {
            setExpiry(`${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}`)
          }
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [product, type])

  // Step the appointment-pick day backwards/forwards. Going further into the
  // past is unbounded (write up an older clinic); the future is capped at today.
  function shiftPickDate(delta: number) {
    const d = new Date(`${pickDate}T00:00:00`)
    d.setDate(d.getDate() + delta)
    const next = d.toISOString().slice(0, 10)
    if (next > today) return
    setPickDate(next)
  }

  function pickAppt(a: RecentAppt) {
    setPickedApptId(a.id)
    setClientName(a.client_name)
    setClientId(null)
    setClientEmail(null)
    setDate(a.date)
    const matched = matchTreatmentType(a.service_name)
    if (matched) setTypeId(matched)
    // For a consultation, seed "what they came in for" from the booked service.
    if (matched === 'consultation') setInterest(a.service_name || '')
  }

  // Default the review date when a treatment type with a follow-up gap is chosen.
  useEffect(() => {
    if (type.followUpDays && date) {
      const d = new Date(date)
      d.setDate(d.getDate() + type.followUpDays)
      setReviewDate(d.toISOString().slice(0, 10))
    } else {
      setReviewDate('')
    }
  }, [type, date])

  function searchClients(q: string) {
    if (sugTimer.current) clearTimeout(sugTimer.current)
    sugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/staff/assistant/clients?q=${encodeURIComponent(q)}`)
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.clients ?? [])
        setShowSug(true)
      } catch {
        /* ignore */
      }
    }, 180)
  }

  function pickClient(s: Suggestion) {
    setClientName(s.name)
    setClientId(s.id)
    setClientEmail(s.email)
    setShowSug(false)
  }

  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.some((a) => a.area === area)
        ? prev.filter((a) => a.area !== area)
        : [...prev, { area, dose: 0 }],
    )
  }

  function addCustomArea() {
    const a = customArea.trim()
    if (!a) return
    if (!areas.some((x) => x.area === a)) setAreas((prev) => [...prev, { area: a, dose: 0 }])
    setCustomArea('')
  }

  function setDose(area: string, dose: number) {
    setAreas((prev) => prev.map((a) => (a.area === area ? { ...a, dose } : a)))
  }

  function currentInput(): WriteUpInput {
    return {
      clientName,
      treatmentTypeId: typeId,
      date,
      product,
      batchNumber,
      expiry,
      areas,
      unit: type.unit,
      technique,
      consent,
      reviewDate,
      notes,
      interest,
    }
  }

  function generate() {
    saveMemory(type.id, { product, batchNumber, expiry, technique })
    const input = currentInput()
    setClinicalNote(buildClinicalNote(input))
    const email = buildClientEmail(input)
    setEmailSubject(email.subject)
    setEmailBody(email.body)
    setGenerated(true)
    setSaveResult(null)
    setSendResult(null)
    setCopied(false)
    setAiNextSteps([])
    // For a consultation, rewrite the follow-up email in Bernadette's voice from
    // the fields straight away, so it is ready to send without a second step.
    if (isConsult && clientName.trim()) void enhanceConsultationEmail()
    setTimeout(() => {
      document.getElementById('outputs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  async function enhanceConsultationEmail() {
    setAiEnhancing(true)
    try {
      const res = await fetch('/api/staff/assistant/consultation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, interest, notes, date }),
      })
      const data = await res.json() as { ok?: boolean; email?: { subject: string; body: string }; next_steps?: string[] }
      if (res.ok && data.email) {
        setEmailSubject(data.email.subject)
        setEmailBody(data.email.body)
        setAiNextSteps(data.next_steps ?? [])
      }
    } catch {
      // enhancement is best-effort
    } finally {
      setAiEnhancing(false)
    }
  }

  async function saveNote() {
    setSaving(true)
    setSaveResult(null)
    try {
      const res = await fetch('/api/staff/assistant/treatment-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentInput(), clientId, clinicalNote }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveResult({ ok: false, message: data.error || 'Could not save the note.' })
        return
      }
      const where = [
        data.savedToDatabase ? 'clinic record' : null,
        data.savedToSheet ? 'notes sheet' : null,
      ]
        .filter(Boolean)
        .join(' and ')
      setSaveResult({ ok: true, message: `Saved to the ${where || 'record'}.` })
    } catch {
      setSaveResult({ ok: false, message: 'Network error while saving.' })
    } finally {
      setSaving(false)
    }
  }

  // Plain-text version of the edited email (strips the **bold** markers etc.),
  // used for copy-to-clipboard and the "open in email app" link.
  const emailPlain = useMemo(() => bodyToText(emailBody), [emailBody])
  const mailtoHref = `mailto:${clientEmail ?? ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailPlain)}`

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailPlain}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function sendEmail() {
    setSending(true)
    setSendResult(null)
    setConfirmSend(false)
    try {
      const res = await fetch('/api/staff/assistant/client-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          treatmentTypeId: typeId,
          date,
          interest,
          notes,
          subject: emailSubject,
          body: emailBody,
          to: clientEmail,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSendResult({ ok: false, message: data.error || 'Could not send the email.' })
        return
      }
      setSendResult({ ok: true, message: `Sent to ${clientEmail}.` })
      notifyDone(`Email sent to ${clientEmail}`)
    } catch {
      setSendResult({ ok: false, message: 'Network error while sending.' })
    } finally {
      setSending(false)
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const u = type.unit === 'units' ? 'units' : type.unit === 'ml' ? 'ml' : ''
  const showDoses = type.unit !== 'none'

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="eyebrow text-gold mb-2">Assistant &nbsp;·&nbsp; Treatment write-up</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
              Write up a treatment.
            </h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Tap the areas, add the doses, and generate the clinical note, yours to edit before it&apos;s saved.
            </p>
          </div>
          <button
            onClick={signOut}
            className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2"
            aria-label="Sign out"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="space-y-7">
          {/* Appointment quick-pick — pick the day (today by default), tap who came */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <span className="text-eyebrow text-ink-soft">
                {pickDate === today ? "Today's clinic" : 'Clinic'} &nbsp;·&nbsp; {ukDate(pickDate)}{' '}
                <span className="text-stone normal-case tracking-normal">(tap who came)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => shiftPickDate(-1)}
                  aria-label="Previous day"
                  className="inline-flex items-center justify-center rounded-sm border border-line/40 text-ink-soft hover:border-gold/60 w-8 h-8 transition-colors"
                >
                  <ChevronLeft size={16} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => setPickDate(today)}
                  className={`text-xs rounded-sm border px-2.5 py-1.5 transition-colors ${
                    pickDate === today ? 'border-gold bg-gold/10 text-charcoal' : 'border-line/40 text-ink-soft hover:border-gold/60'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => shiftPickDate(1)}
                  disabled={pickDate >= today}
                  aria-label="Next day"
                  className="inline-flex items-center justify-center rounded-sm border border-line/40 text-ink-soft hover:border-gold/60 w-8 h-8 transition-colors disabled:opacity-40 disabled:hover:border-line/40"
                >
                  <ChevronRight size={16} strokeWidth={1.75} />
                </button>
                <input
                  type="date"
                  value={pickDate}
                  max={today}
                  onChange={(e) => setPickDate(e.target.value)}
                  className="bg-cream border border-line/40 rounded-sm px-2.5 py-1.5 text-sm text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            {appts.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {appts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => pickAppt(a)}
                    className={`shrink-0 text-left rounded-sm border px-4 py-3 transition-colors min-w-[190px] max-w-[260px] ${
                      pickedApptId === a.id
                        ? 'border-gold bg-gold/10'
                        : 'border-line/40 bg-cream-soft hover:border-gold/60'
                    }`}
                  >
                    <div className="text-base font-medium text-charcoal truncate">{a.client_name || 'Unnamed'}</div>
                    <div className="text-sm text-ink-soft truncate mt-0.5">{a.service_name || 'Appointment'}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3 text-sm text-ink-soft leading-relaxed">
                No appointments on {ukDate(pickDate)}. Pick another day, or just type the client name below.
              </p>
            )}
          </div>

          {/* Client */}
          <div className="relative">
            <label htmlFor="client" className="text-eyebrow text-ink-soft mb-2 block">Client</label>
            <input
              id="client"
              autoComplete="off"
              className={inputClass}
              placeholder="Start typing a name…"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value)
                setClientId(null)
                setClientEmail(null)
                searchClients(e.target.value)
              }}
              onFocus={() => clientName && searchClients(clientName)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
            />
            {clientEmail && (
              <p className="text-xs text-stone mt-1">{clientEmail}</p>
            )}
            {showSug && suggestions.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-1 bg-cream border border-line rounded-sm shadow-lg max-h-64 overflow-auto">
                {suggestions.map((s, i) => (
                  <li key={`${s.email ?? s.name}-${i}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickClient(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-cream-soft flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-charcoal">{s.name}</span>
                      <span className="text-xs text-stone truncate max-w-[55%]">{s.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Treatment type */}
          <div>
            <span className="text-eyebrow text-ink-soft mb-2 block">Treatment</span>
            <div className="flex flex-wrap gap-2">
              {TREATMENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypeId(t.id)}
                  className={`text-sm rounded-sm border px-3 py-2 transition-colors ${
                    typeId === t.id
                      ? 'border-gold bg-gold/10 text-charcoal'
                      : 'border-line/40 bg-cream-soft hover:border-gold/60 text-ink-soft'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="text-eyebrow text-ink-soft mb-2 block">Date of treatment</label>
              <input id="date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            {type.followUpDays !== null && (
              <div>
                <label htmlFor="review" className="text-eyebrow text-ink-soft mb-2 block">Review / next session</label>
                <input id="review" type="date" className={inputClass} value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
              </div>
            )}
          </div>

          {/* What they came in for — drives the consultation follow-up email */}
          {isConsult && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label htmlFor="interest" className="text-eyebrow text-ink-soft">
                  What they came in for
                </label>
                <DictateButton onText={(t) => setInterest((prev) => (prev ? `${prev} ${t}` : t).trim())} />
              </div>
              <input
                id="interest"
                className={inputClass}
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g. lip filler, or anti-wrinkle for the forehead"
              />
              <p className="text-xs text-ink-soft mt-1.5">
                Used to personalise the follow-up email.
              </p>
            </div>
          )}

          {/* Areas */}
          {type.areas.length > 0 && (
            <div>
              <span className="text-eyebrow text-ink-soft mb-2 block">
                Areas {showDoses && <span className="text-stone normal-case tracking-normal">(tap to add, then enter the dose)</span>}
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {type.areas.map((area) => {
                  const on = areas.some((a) => a.area === area)
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`text-sm rounded-full border px-3 py-1.5 transition-colors ${
                        on
                          ? 'border-gold bg-gold text-charcoal'
                          : 'border-line/60 bg-cream-soft hover:border-gold text-ink-soft'
                      }`}
                    >
                      {area}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  className={inputClass}
                  placeholder="Add another area"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomArea()
                    }
                  }}
                />
                <button type="button" onClick={addCustomArea} className="btn btn-secondary shrink-0" style={{ minHeight: 48 }}>
                  <Plus size={16} strokeWidth={1.75} />
                </button>
              </div>

              {areas.length > 0 && (
                <div className="border border-line/40 rounded-sm divide-y divide-line/30 bg-cream-soft">
                  {areas.map((a) => (
                    <div key={a.area} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-sm text-charcoal flex-1">{a.area}</span>
                      {showDoses && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            step={type.unit === 'ml' ? '0.1' : '1'}
                            min="0"
                            value={a.dose || ''}
                            onChange={(e) => setDose(a.area, Number(e.target.value))}
                            className="w-20 bg-cream border border-line/40 rounded-sm px-2 py-1.5 text-right text-sm focus:outline-none focus:border-gold"
                          />
                          <span className="text-xs text-stone w-8">{u}</span>
                        </div>
                      )}
                      <button type="button" onClick={() => toggleArea(a.area)} className="text-stone hover:text-gold-deep" aria-label={`Remove ${a.area}`}>
                        <X size={15} strokeWidth={1.75} />
                      </button>
                    </div>
                  ))}
                  {showDoses && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-cream">
                      <span className="text-eyebrow text-ink-soft">Total</span>
                      <span className="text-sm font-medium text-charcoal">{totalDose(areas)} {u}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Product / batch */}
          {type.unit !== 'none' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="product" className="text-eyebrow text-ink-soft mb-2 block">Product</label>
                <input id="product" list="product-options" className={inputClass} value={product} onChange={(e) => setProduct(e.target.value)} />
                <datalist id="product-options">
                  {type.products.map((p) => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="batch" className="text-eyebrow text-ink-soft mb-2 block">Batch no.</label>
                  <input id="batch" className={inputClass} value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="expiry" className="text-eyebrow text-ink-soft mb-2 block">Expiry</label>
                  <input id="expiry" className={inputClass} placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="technique" className="text-eyebrow text-ink-soft mb-2 block">Technique / dilution (optional)</label>
            <input id="technique" className={inputClass} value={technique} onChange={(e) => setTechnique(e.target.value)} placeholder="e.g. 2.5ml saline dilution, linear threading" />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <label htmlFor="notes" className="text-eyebrow text-ink-soft">
                {isConsult ? 'What you discussed' : 'Notes (optional)'}
              </label>
              <DictateButton onText={(t) => setNotes((prev) => (prev ? `${prev} ${t}` : t).trim())} />
            </div>
            <textarea
              id="notes"
              rows={isConsult ? 5 : 3}
              className={textareaClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isConsult
                  ? 'What you talked through, what you recommended, suitability, next steps… or tap Dictate and talk. This goes into the follow-up email.'
                  : 'Consultation, contraindications checked, anything noted… or tap Dictate and talk.'
              }
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span
              className={`inline-flex w-6 h-6 rounded-sm border items-center justify-center transition-colors ${
                consent ? 'bg-gold border-gold text-charcoal' : 'border-line bg-cream'
              }`}
            >
              {consent && <Check size={14} strokeWidth={2.5} />}
            </span>
            <input type="checkbox" className="sr-only" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="text-sm text-charcoal">Consent obtained and recorded</span>
          </label>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-eyebrow text-ink-soft inline-flex items-center gap-2"><Camera size={14} strokeWidth={1.75} /> Photos (optional)</span>
              <div className="grid grid-cols-2 gap-1">
                {(['before', 'after'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setPhotoType(t)} className={`text-xs rounded-sm border px-2.5 py-1 capitalize transition-colors ${photoType === t ? 'border-gold bg-gold/10 text-charcoal' : 'border-line/40 text-ink-soft'}`}>{t}</button>
                ))}
              </div>
            </div>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" capture="environment" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadPhoto(f); e.target.value = '' }} />
            {txPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {txPhotos.map((p, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.type} className="w-16 h-16 object-cover rounded-sm border border-line/40" />
                    <span className="absolute bottom-0 left-0 text-[9px] uppercase tracking-wide bg-charcoal/70 text-cream px-1 rounded-sm">{p.type}</span>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => photoRef.current?.click()} disabled={photoBusy} className="btn btn-secondary disabled:opacity-50">
              <span className="inline-flex items-center gap-2"><Camera size={15} strokeWidth={1.75} /> {photoBusy ? 'Uploading…' : `Add ${photoType} photo`}</span>
            </button>
            {photoErr && <p className="text-xs text-clay mt-2">{photoErr}</p>}
            <p className="text-xs text-ink-soft mt-2">Saved to this client&apos;s photo vault, with consent recorded.</p>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={!clientName.trim()}
            className="btn btn-primary btn-block disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-flex items-center gap-3">
              <Sparkles size={15} strokeWidth={1.75} />
              {isConsult ? 'Generate note & follow-up email' : 'Generate clinical note'}
            </span>
            <span className="btn-arrow">→</span>
          </button>
          {isConsult ? (
            <p className="text-xs text-ink-soft mt-2 text-center leading-snug">
              Drafts the follow-up email in Bernadette’s voice from your notes — you can review, edit and send it below.
            </p>
          ) : (
            <p className="text-xs text-ink-soft mt-1.5 leading-snug text-center">Produces a clinical note and client email.</p>
          )}
        </div>

        {/* Outputs */}
        {generated && (
          <div id="outputs" className="mt-12 space-y-8 scroll-mt-6">
            <div className="border-t border-line/40 pt-8">
              <div className="flex items-center gap-2 mb-3">
                <ChevronRight size={16} className="text-gold-deep" />
                <span className="text-eyebrow text-gold-deep">Clinical note</span>
              </div>
              <textarea
                rows={12}
                className={`${textareaClass} font-body`}
                value={clinicalNote}
                onChange={(e) => setClinicalNote(e.target.value)}
              />
              <div className="mt-3">
                <button type="button" onClick={saveNote} disabled={saving} className="btn btn-primary disabled:opacity-50">
                  <span className="inline-flex items-center gap-2">
                    <Save size={15} strokeWidth={1.75} />
                    {saving ? 'Saving…' : 'Save to patient notes'}
                  </span>
                </button>
              </div>
              {saveResult && (
                <div className={`mt-3 border rounded-sm px-4 py-3 text-sm flex items-start gap-3 ${saveResult.ok ? 'border-sage/50 bg-sage/10' : 'border-gold/40 bg-gold/10'}`}>
                  <Check size={16} strokeWidth={1.75} className="text-gold-deep mt-0.5 shrink-0" />
                  <span>{saveResult.message}</span>
                </div>
              )}
            </div>

            {/* Client follow-up email — consultation follow-up, or aftercare */}
            <div className="border-t border-line/40 pt-8">
              <div className="flex items-center gap-2 mb-1">
                <ChevronRight size={16} className="text-gold-deep" />
                <span className="text-eyebrow text-gold-deep">
                  {isConsult ? 'Consultation follow-up email' : 'Aftercare email'}
                </span>
              </div>
              <p className="text-xs text-ink-soft mb-3">
                {isConsult
                  ? 'Written in Bernadette’s voice from their name, the date, what they came in for and what you discussed. Edit it, then copy, open in your email app, or send.'
                  : 'A warm aftercare email for the client. Edit it, then copy, open in your email app, or send.'}
              </p>

              <label htmlFor="email-subject" className="text-eyebrow text-ink-soft mb-2 block">Subject</label>
              <input
                id="email-subject"
                className={inputClass}
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />

              {isConsult && (
                <>
                  <button
                    type="button"
                    onClick={enhanceConsultationEmail}
                    disabled={aiEnhancing}
                    className="mb-2 inline-flex items-center gap-2 text-sm text-gold-deep hover:text-charcoal border border-gold/40 hover:border-gold rounded-sm px-3 py-2 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={14} strokeWidth={1.75} />
                    {aiEnhancing ? "Writing in Bernadette’s voice…" : "Rewrite in Bernadette’s voice"}
                  </button>
                  <p className="text-xs text-ink-soft mt-1.5 leading-snug mb-4">Adds suggested aftercare and follow-up notes.</p>
                </>
              )}

              <label htmlFor="email-body" className="text-eyebrow text-ink-soft mb-2 mt-4 block">Message</label>
              <textarea
                id="email-body"
                rows={14}
                className={`${textareaClass} font-body`}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />

              {clientEmail ? (
                <p className="text-xs text-stone mt-2">To: {clientEmail}</p>
              ) : (
                <p className="text-xs text-ink-soft mt-2">
                  No email on file for this client. Copy the message or open it in your email app to address it.
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={copyEmail} className="btn btn-secondary">
                  <span className="inline-flex items-center gap-2">
                    {copied ? <Check size={15} strokeWidth={1.75} /> : <Copy size={15} strokeWidth={1.75} />}
                    {copied ? 'Copied' : 'Copy email'}
                  </span>
                </button>
                <a href={mailtoHref} className="btn btn-secondary">
                  <span className="inline-flex items-center gap-2">
                    <Mail size={15} strokeWidth={1.75} />
                    Open in email app
                  </span>
                </a>
                {clientEmail && !confirmSend && (
                  <button type="button" onClick={() => { setConfirmSend(true); setSendResult(null) }} disabled={sending} className="btn btn-primary disabled:opacity-50">
                    <span className="inline-flex items-center gap-2">
                      <Send size={15} strokeWidth={1.75} /> Send from clinic
                    </span>
                  </button>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                <p className="text-xs text-ink-soft leading-snug">Copy email — paste into records or messages.</p>
                {clientEmail && <p className="text-xs text-ink-soft leading-snug">Send — delivers to client&apos;s email on file.</p>}
              </div>

              {confirmSend && (
                <div className="mt-3 border border-gold/50 bg-gold/8 rounded-sm px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-charcoal">
                    Send <span className="font-medium">{emailSubject}</span> to <span className="font-medium">{clientEmail}</span>?
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={sendEmail} disabled={sending} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 36 }}>
                      <span className="inline-flex items-center gap-1.5">
                        <Send size={13} strokeWidth={1.75} />
                        {sending ? 'Sending…' : 'Confirm send'}
                      </span>
                    </button>
                    <button type="button" onClick={() => setConfirmSend(false)} className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-line/40 text-ink-soft hover:text-charcoal transition-colors">
                      <X size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              )}

              {sendResult && (
                <div className={`mt-3 border rounded-sm px-4 py-3 text-sm flex items-start gap-3 ${sendResult.ok ? 'border-sage/50 bg-sage/10' : 'border-gold/40 bg-gold/10'}`}>
                  <Check size={16} strokeWidth={1.75} className="text-gold-deep mt-0.5 shrink-0" />
                  <span>{sendResult.message}</span>
                </div>
              )}
            </div>

            {/* Suggested next steps — populated after AI personalisation */}
            {isConsult && aiNextSteps.length > 0 && (
              <div className="border-t border-line/40 pt-8">
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight size={16} className="text-gold-deep" />
                  <span className="text-eyebrow text-gold-deep">Suggested next steps</span>
                </div>
                <ul className="space-y-2">
                  {aiNextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-charcoal">
                      <span className="inline-flex w-5 h-5 rounded-full bg-gold/15 text-gold-deep items-center justify-center shrink-0 mt-0.5 text-[11px] font-medium">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
