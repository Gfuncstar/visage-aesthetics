'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, LogOut } from 'lucide-react'
import { treatments } from '@/lib/treatments'

type YesNo = 'Yes' | 'No'

type FormValues = {
  name: string
  dateOfTreatment: string
  treatment: string
  specificArea: string
  productUsed: string
  lotNoExp: string
  dosage: string
  beforePhotosTaken: YesNo
  problemsNoted: YesNo
  aftercareProvided: YesNo
  additionalNotes: string
  emergencyContactProvided: YesNo
  dateSigned: string
}

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

export default function PatientNotesForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      dateOfTreatment: today,
      dateSigned: today,
      beforePhotosTaken: 'Yes',
      problemsNoted: 'No',
      aftercareProvided: 'Yes',
      emergencyContactProvided: 'Yes',
    },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const res = await fetch('/api/staff/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
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
      beforePhotosTaken: 'Yes',
      problemsNoted: 'No',
      aftercareProvided: 'Yes',
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

          <YesNoField label="Before photos taken" name="beforePhotosTaken" register={register} />
          <YesNoField label="Any problems / abnormality noted by practitioner or voiced by client" name="problemsNoted" register={register} />
          <YesNoField label="Aftercare instructions provided (verbal or written)" name="aftercareProvided" register={register} />
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
