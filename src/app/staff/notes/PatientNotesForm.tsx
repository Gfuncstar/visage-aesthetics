'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Check, LogOut } from 'lucide-react'
import { treatments } from '@/lib/treatments'

type YesNo = 'Yes' | 'No'

type SavedNote = { source: 'notes-form' | 'write-up'; date: string | null; treatment: string | null; body: string; created_at: string }

function formatNoteDate(d: string | null): string {
  if (!d) return ''
  const dt = new Date(`${d.slice(0, 10)}T12:00:00Z`)
  return Number.isNaN(dt.getTime())
    ? d
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(dt)
}

type FormValues = {
  name: string
  dateOfTreatment: string
  treatment: string
  specificArea: string
  productUsed: string
  lotNoExp: string
  dosage: string
  consultationDone: boolean
  beforePhotosTaken: boolean
  problemsNoted: YesNo
  aftercareProvided: boolean
  additionalNotes: string
  emergencyContactProvided: YesNo
  dateSigned: string
}

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

export default function PatientNotesForm({ prefillName = '', prefillDate = '' }: { prefillName?: string; prefillDate?: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
  const today = new Date().toISOString().slice(0, 10)

  // When opened for a specific client (tapped from a landing-page card), pull the
  // notes already on file so they can be read before adding more.
  useEffect(() => {
    if (!prefillName) return
    let cancelled = false
    const q = new URLSearchParams({ name: prefillName })
    if (prefillDate) q.set('date', prefillDate)
    fetch(`/api/staff/notes?${q.toString()}`)
      .then((r) => (r.ok ? r.json() : { notes: [] }))
      .then((d) => { if (!cancelled) setSavedNotes(d.notes ?? []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [prefillName, prefillDate])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: prefillName,
      dateOfTreatment: prefillDate || today,
      dateSigned: today,
      consultationDone: false,
      beforePhotosTaken: false,
      problemsNoted: 'No',
      aftercareProvided: false,
      emergencyContactProvided: 'Yes',
    },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const payload = {
      ...values,
      consultationDone: values.consultationDone ? 'Yes' : 'No',
      beforePhotosTaken: values.beforePhotosTaken ? 'Yes' : 'No',
      aftercareProvided: values.aftercareProvided ? 'Yes' : 'No',
    }
    const res = await fetch('/api/staff/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setServerError(data.error || 'Could not save the record. Please try again.')
      return
    }
    setSubmitted(true)
  }

  function startAnother() {
    reset({
      dateOfTreatment: today,
      dateSigned: today,
      consultationDone: false,
      beforePhotosTaken: false,
      problemsNoted: 'No',
      aftercareProvided: false,
      emergencyContactProvided: 'Yes',
    })
    setSubmitted(false)
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  if (submitted) {
    return (
      <section className="bg-cream text-charcoal">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-24 text-center">
          <div className="inline-flex w-12 h-12 rounded-full bg-gold text-charcoal items-center justify-center mb-5">
            <Check size={20} strokeWidth={1.75} />
          </div>
          <h2 className="font-display italic text-3xl md:text-4xl text-charcoal">Saved to the record.</h2>
          <p className="text-ink-soft mt-3 max-w-md mx-auto leading-relaxed">
            The treatment note has been added to the patient notes sheet.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button onClick={startAnother} className="btn btn-primary">Add another</button>
            <button onClick={signOut} className="btn">Sign out</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream text-charcoal">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-20 md:pt-24 pb-20">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <Link
              href="/staff"
              className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4"
            >
              <ArrowLeft size={14} strokeWidth={1.75} />
              Staff
            </Link>
            <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Patient notes</div>
            <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">
              Record a treatment.
            </h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Fill in the details below. The record is saved straight to the clinic notes sheet.
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

        {savedNotes.length > 0 && (
          <div className="mb-8 border border-line/40 rounded-sm bg-cream-soft overflow-hidden">
            <div className="px-4 py-3 border-b border-line/40 flex items-center justify-between gap-2">
              <span className="text-eyebrow text-gold-deep">Notes already on file{prefillName ? ` · ${prefillName}` : ''}</span>
              <span className="text-xs text-stone shrink-0">{savedNotes.length} saved</span>
            </div>
            <div className="divide-y divide-line/30 max-h-80 overflow-y-auto">
              {savedNotes.map((n, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-charcoal">{n.treatment || 'Note'}</span>
                    <span className="text-xs text-stone whitespace-nowrap shrink-0">
                      {formatNoteDate(n.date)}{n.date ? ' · ' : ''}{n.source === 'write-up' ? 'Write-up' : 'Notes'}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">{n.body}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-line/40 text-xs text-ink-soft">
              Add a new note below if there is anything more to record.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="text-eyebrow text-ink-soft mb-2 block">Patient name</label>
              <input id="name" autoComplete="off" className={inputClass} {...register('name', { required: 'Required' })} />
              {errors.name && <p className="text-xs text-gold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="dateOfTreatment" className="text-eyebrow text-ink-soft mb-2 block">Date of treatment</label>
              <input id="dateOfTreatment" type="date" className={inputClass} {...register('dateOfTreatment', { required: 'Required' })} />
              {errors.dateOfTreatment && <p className="text-xs text-gold mt-1">{errors.dateOfTreatment.message}</p>}
            </div>

            <div>
              <label htmlFor="treatment" className="text-eyebrow text-ink-soft mb-2 block">Treatment</label>
              <input
                id="treatment"
                list="treatment-options"
                className={inputClass}
                placeholder="e.g. Botox"
                {...register('treatment', { required: 'Required' })}
              />
              <datalist id="treatment-options">
                {treatments.map((t) => (
                  <option key={t.slug} value={t.name} />
                ))}
              </datalist>
              {errors.treatment && <p className="text-xs text-gold mt-1">{errors.treatment.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="specificArea" className="text-eyebrow text-ink-soft mb-2 block">Specific area treated</label>
              <input id="specificArea" className={inputClass} placeholder="e.g. Forehead & Frown Region" {...register('specificArea')} />
            </div>

            <div>
              <label htmlFor="productUsed" className="text-eyebrow text-ink-soft mb-2 block">Product used</label>
              <input id="productUsed" className={inputClass} placeholder="e.g. Allergan Botox" {...register('productUsed')} />
            </div>

            <div>
              <label htmlFor="lotNoExp" className="text-eyebrow text-ink-soft mb-2 block">Lot No / Exp</label>
              <input id="lotNoExp" className={inputClass} placeholder="e.g. 04/26 C8611C3" {...register('lotNoExp')} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="dosage" className="text-eyebrow text-ink-soft mb-2 block">Dosage</label>
              <input id="dosage" className={inputClass} placeholder="e.g. Forehead 18 units, Frown 20 units" {...register('dosage')} />
            </div>
          </div>

          <div>
            <span className="text-eyebrow text-ink-soft mb-3 block">
              Checklist <span className="text-stone normal-case tracking-normal">(optional — none required to save)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CheckboxField label="Consultation done" name="consultationDone" register={register} />
              <CheckboxField label="Photographs taken" name="beforePhotosTaken" register={register} />
              <CheckboxField label="Aftercare sent" name="aftercareProvided" register={register} />
            </div>
          </div>
          <YesNoField label="Any problems / abnormality noted by practitioner or voiced by client" name="problemsNoted" register={register} />
          <YesNoField label="Emergency contact details provided" name="emergencyContactProvided" register={register} />

          <div>
            <label htmlFor="additionalNotes" className="text-eyebrow text-ink-soft mb-2 block">Additional notes</label>
            <textarea
              id="additionalNotes"
              rows={5}
              className={inputClass}
              placeholder="Consultation form completed, contraindications, risks discussed, etc."
              {...register('additionalNotes')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateSigned" className="text-eyebrow text-ink-soft mb-2 block">Date signed</label>
              <input id="dateSigned" type="date" className={inputClass} {...register('dateSigned', { required: 'Required' })} />
              {errors.dateSigned && <p className="text-xs text-gold mt-1">{errors.dateSigned.message}</p>}
            </div>
          </div>

          {serverError && (
            <div className="border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3">
              {serverError}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
              {isSubmitting ? 'Saving…' : 'Save to patient notes'}
            </button>
            <p className="text-xs text-ink-soft text-center mt-3">
              Saved directly to the clinic notes sheet.
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

function CheckboxField({
  label,
  name,
  register,
}: {
  label: string
  name: keyof FormValues
  register: ReturnType<typeof useForm<FormValues>>['register']
}) {
  return (
    <label className="flex items-center gap-3 border border-line/40 rounded-sm px-4 py-3 cursor-pointer has-[:checked]:bg-gold/10 has-[:checked]:border-gold transition-colors min-h-[48px]">
      <input type="checkbox" className="w-5 h-5 accent-gold shrink-0" {...register(name)} />
      <span className="text-sm text-charcoal">{label}</span>
    </label>
  )
}

function YesNoField({
  label,
  name,
  register,
}: {
  label: string
  name: keyof FormValues
  register: ReturnType<typeof useForm<FormValues>>['register']
}) {
  return (
    <div>
      <span className="text-eyebrow text-ink-soft mb-3 block">{label}</span>
      <div className="grid grid-cols-2 gap-2 max-w-xs">
        {(['Yes', 'No'] as const).map((value) => (
          <label
            key={value}
            className="flex items-center justify-center gap-2 border border-line/40 rounded-sm py-3 cursor-pointer has-[:checked]:bg-gold has-[:checked]:text-charcoal has-[:checked]:border-gold transition-colors"
          >
            <input type="radio" value={value} className="sr-only" {...register(name, { required: true })} />
            <span className="text-sm">{value}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
