import type { ConsentField, ConsentForm } from '@/lib/consent/forms'

// Read-only rendering of a consent form — the questions, options and
// declaration exactly as the client sees them, but non-interactive. Used by the
// staff preview page so staff can read a form before sending it. Mirrors the
// fillable layout in ConsentFormClient without any inputs or state.
export default function ConsentFormView({ form }: { form: ConsentForm }) {
  return (
    <div>
      {/* Verbatim information / preamble */}
      <div className="mt-6 border border-line/40 bg-cream-soft rounded-sm p-4 max-h-72 overflow-y-auto">
        <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{form.intro}</p>
      </div>

      <div className="mt-8 space-y-6">
        {form.fields.map((field, i) => (
          <ViewField key={`${field.label}-${i}`} field={field} />
        ))}
      </div>

      {/* Declaration — tick to agree (shown read-only) */}
      <div className="mt-8 border-t border-line/40 pt-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex w-6 h-6 mt-0.5 rounded-sm border border-line bg-cream shrink-0" />
          <span className="text-sm text-charcoal leading-relaxed">{form.declaration}</span>
        </div>
      </div>
    </div>
  )
}

function ViewField({ field }: { field: ConsentField }) {
  if (field.type === 'heading') {
    return <h2 className="font-display italic text-2xl text-charcoal pt-4">{field.label}</h2>
  }
  if (field.type === 'info') {
    return <p className="text-sm text-ink-soft leading-relaxed">{field.label}</p>
  }

  const labelEl = (
    <span className="text-eyebrow text-ink-soft mb-2 block">
      {field.label}
      {field.required && <span className="text-gold"> *</span>}
    </span>
  )

  if (field.type === 'yes-no' || field.type === 'single-choice' || field.type === 'multi-choice') {
    const options = field.options ?? (field.type === 'yes-no' ? ['Yes', 'No'] : [])
    const shape = field.type === 'multi-choice' ? 'rounded-full px-3 py-1.5' : 'rounded-sm px-4 py-2.5'
    return (
      <div>
        {labelEl}
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <span key={opt} className={`border border-line/50 bg-cream-soft text-ink-soft text-sm ${shape}`}>
              {opt}
            </span>
          ))}
        </div>
        {field.helper && <p className="text-xs text-stone mt-1.5">{field.helper}</p>}
      </div>
    )
  }

  // Text-like and long-text fields: an empty box standing in for the input.
  const boxHeight = field.type === 'long-text' ? 'h-20' : 'h-12'
  return (
    <div>
      {labelEl}
      <div className={`w-full bg-cream border border-line/40 rounded-sm ${boxHeight}`} />
      {field.helper && <p className="text-xs text-stone mt-1">{field.helper}</p>}
    </div>
  )
}
