import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import {
  POLICY_META,
  POLICY_KNOWLEDGE,
  POLICY_SYSTEM_PROMPT,
  ENDORSEMENTS,
  auditLiveTreatments,
} from '@/lib/assistant/insurance-policy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Verdict = {
  status: 'covered' | 'conditions' | 'excluded' | 'refer'
  headline: string
  summary: string
  mapsTo: string
  conditions: string[]
  exclusions: string[]
  requirements: string[]
  citations: string[]
  referToBroker: boolean
}

// JSON schema the model must return. Kept to supported types only (string,
// boolean, arrays of strings, enum) so structured outputs validate cleanly.
const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'status',
    'headline',
    'summary',
    'mapsTo',
    'conditions',
    'exclusions',
    'requirements',
    'citations',
    'referToBroker',
  ],
  properties: {
    status: {
      type: 'string',
      enum: ['covered', 'conditions', 'excluded', 'refer'],
      description: 'covered, conditions (covered if conditions met), excluded, or refer to broker',
    },
    headline: { type: 'string', description: 'One short verdict line for the clinic to read first' },
    summary: { type: 'string', description: 'Two or three plain sentences explaining the verdict' },
    mapsTo: {
      type: 'string',
      description: 'Which Band A line, General Beauty line or Minor Surgery line this maps to, or "none"',
    },
    conditions: {
      type: 'array',
      items: { type: 'string' },
      description: 'What the clinic must do for this to be covered',
    },
    exclusions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Relevant exclusions or named traps that apply',
    },
    requirements: {
      type: 'array',
      items: { type: 'string' },
      description: 'Standing requirements such as consent, records, registration, patch test',
    },
    citations: {
      type: 'array',
      items: { type: 'string' },
      description: 'The endorsement or schedule sections relied on',
    },
    referToBroker: {
      type: 'boolean',
      description: 'True if the clinic should confirm with the broker before going ahead',
    },
  },
} as const

// GET returns the policy summary and the live-treatment audit for the panel.
export async function GET() {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  return NextResponse.json({
    meta: {
      wording: POLICY_META.wording,
      insurer: POLICY_META.insurer,
      policyNumber: POLICY_META.policyNumber,
      periodFrom: POLICY_META.periodFrom,
      periodTo: POLICY_META.periodTo,
      aggregateLimit: POLICY_META.aggregateLimit,
      standardDeductible: POLICY_META.standardDeductible,
      bandsPurchased: POLICY_META.bandsPurchased,
      broker: POLICY_META.broker,
    },
    endorsements: ENDORSEMENTS.map((e) => ({ id: e.id, title: e.title, kind: e.kind, summary: e.summary })),
    audit: auditLiveTreatments(),
    aiReady: Boolean(process.env.ANTHROPIC_API_KEY),
  })
}

// POST { treatment, details, prescriber } returns a structured compliance verdict.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'The assistant is not configured (no API key).' }, { status: 503 })
  }

  let treatment = ''
  let details = ''
  let prescriber = ''
  try {
    const b = (await req.json()) as { treatment?: unknown; details?: unknown; prescriber?: unknown }
    if (typeof b.treatment === 'string') treatment = b.treatment.trim().slice(0, 200)
    if (typeof b.details === 'string') details = b.details.trim().slice(0, 2000)
    if (typeof b.prescriber === 'string') prescriber = b.prescriber.trim().slice(0, 200)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!treatment) {
    return NextResponse.json({ error: 'Name the treatment or product to check.' }, { status: 400 })
  }

  const userPrompt = `Assess this proposed treatment or product against the policy.

Treatment / product: ${treatment}
${details ? `Details: ${details}` : ''}
${prescriber ? `Who would perform / prescribe it: ${prescriber}` : ''}

Return the structured verdict.`

  try {
    const client = new Anthropic({ apiKey })
    const res = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      system: [
        { type: 'text', text: POLICY_SYSTEM_PROMPT },
        { type: 'text', text: POLICY_KNOWLEDGE, cache_control: { type: 'ephemeral' } },
      ],
      output_config: { format: { type: 'json_schema', schema: VERDICT_SCHEMA } },
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = res.content.find((b) => b.type === 'text') as { text: string } | undefined
    if (!textBlock) {
      return NextResponse.json({ error: 'No answer returned.' }, { status: 502 })
    }
    const verdict = JSON.parse(textBlock.text) as Verdict
    return NextResponse.json({ verdict })
  } catch (err) {
    console.error('[compliance] check failed', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not assess this treatment.' },
      { status: 502 },
    )
  }
}
