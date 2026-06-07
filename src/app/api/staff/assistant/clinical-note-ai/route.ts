import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { CLINIC_PROFILE } from '@/lib/assistant/opportunities'
import { getTreatmentType, type UnitType } from '@/lib/assistant/treatment-types'
import { totalDose, type WriteUpInput } from '@/lib/assistant/notes'
import { ukDate } from '@/lib/assistant/format'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Turns a clinician's plain-language dictation into a professional, in-depth
// clinical note in Bernadette's voice. This is a medico-legal record, so the
// model is instructed to use only the facts dictated or entered in the form and
// to invent NOTHING. The clinician always reviews and edits before saving.
function sanitiseInput(raw: unknown): (WriteUpInput & { clinicalNote: string }) | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  const t = getTreatmentType(String(b.treatmentTypeId ?? ''))
  if (!t) return null
  const areasRaw = Array.isArray(b.areas) ? b.areas : []
  const areas = areasRaw
    .map((a) => {
      const o = a as Record<string, unknown>
      return { area: String(o.area ?? '').slice(0, 120), dose: Number(o.dose) || 0 }
    })
    .filter((a) => a.area)
  return {
    clientName: String(b.clientName ?? '').trim().slice(0, 200),
    treatmentTypeId: t.id,
    date: String(b.date ?? '').slice(0, 10),
    product: String(b.product ?? '').trim().slice(0, 200),
    batchNumber: String(b.batchNumber ?? '').trim().slice(0, 120),
    expiry: String(b.expiry ?? '').trim().slice(0, 40),
    areas,
    unit: t.unit as UnitType,
    technique: String(b.technique ?? '').trim().slice(0, 500),
    consent: Boolean(b.consent),
    reviewDate: String(b.reviewDate ?? '').slice(0, 10),
    notes: String(b.notes ?? '').trim().slice(0, 6000),
    clinicalNote: String(b.clinicalNote ?? '').trim().slice(0, 8000),
  }
}

/** A deterministic block of the facts the clinician actually entered. */
function factsBlock(input: WriteUpInput): string {
  const t = getTreatmentType(input.treatmentTypeId)
  const u = input.unit === 'units' ? 'units' : input.unit === 'ml' ? 'ml' : ''
  const lines: string[] = []
  lines.push(`Treatment: ${t?.name ?? input.treatmentTypeId}`)
  if (input.date) lines.push(`Date: ${ukDate(input.date)}`)
  if (input.product) lines.push(`Product: ${input.product}`)
  if (input.batchNumber || input.expiry) {
    lines.push(`Batch / expiry: ${[input.batchNumber, input.expiry].filter(Boolean).join(' / ')}`)
  }
  if (input.areas.length > 0) {
    const parts = input.areas.map((a) => (u ? `${a.area} (${a.dose} ${u})` : a.area))
    lines.push(`Areas treated: ${parts.join(', ')}`)
    if (u) lines.push(`Total dose: ${totalDose(input.areas)} ${u}`)
  }
  if (input.technique) lines.push(`Technique / dilution: ${input.technique}`)
  lines.push(`Consent: ${input.consent ? 'Obtained and recorded' : 'NOT recorded'}`)
  return lines.join('\n')
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI is not configured (ANTHROPIC_API_KEY not set).' }, { status: 503 })
  }

  let parsed: unknown
  try { parsed = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const input = sanitiseInput(parsed)
  if (!input) return NextResponse.json({ error: 'A treatment type is required.' }, { status: 400 })

  const dictation = input.notes || input.clinicalNote
  if (!dictation.trim()) {
    return NextResponse.json({ error: 'Nothing to write up yet. Add or dictate some notes first.' }, { status: 400 })
  }

  const prompt = `${CLINIC_PROFILE}

You are documenting a contemporaneous clinical treatment note on behalf of Bernadette Tobin RGN (NMC PIN 05G1755E), a nurse prescriber. This note becomes part of the permanent patient record and may be reviewed months or years later if there is ever a complication, complaint or audit. It must read as a professional medical record written by an experienced aesthetic nurse.

THE FACTS (entered by the clinician on the form — treat these as authoritative):
${factsBlock(input)}

THE CLINICIAN'S PLAIN-LANGUAGE DICTATION (what actually happened, in their own words):
"""
${dictation}
"""

Rewrite this into a thorough, professional clinical note. Requirements:
- Use precise clinical / medical terminology and an objective, factual register. British English. First person where natural (e.g. "I administered…", "I advised…").
- Be in-depth and well-structured. Use clear headed sections where they help, for example: Presenting concern / indication, Pre-treatment assessment, Consent, Procedure, Products & batch, Patient tolerance & immediate response, Complications, Aftercare advice given, Follow-up / review plan.
- Only include a section if there is genuine information for it from the facts or the dictation.

ABSOLUTE RULE — this is a medico-legal record:
- Do NOT invent, assume, embellish or infer ANY clinical detail, finding, measurement, dose, product, batch, observation, complication or event that is not explicitly in the facts above or the dictation.
- Do not add reassuring boilerplate that implies checks or observations were done if they were not mentioned.
- If something normally documented is absent (e.g. no contraindications check mentioned, no batch number), either omit it or note it neutrally as "not documented" — never fabricate it.
- Preserve every clinical fact and number exactly as given. Improve the language and structure only.

Return the clinical note as plain text only. No preamble, no commentary, no markdown code fences.`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    const note = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    if (!note) return NextResponse.json({ error: 'Could not generate a note.' }, { status: 502 })
    return NextResponse.json({ ok: true, note })
  } catch (err) {
    console.error('[clinical-note-ai]', err)
    return NextResponse.json({ error: 'AI generation failed.' }, { status: 502 })
  }
}
