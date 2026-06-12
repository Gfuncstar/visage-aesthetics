import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET ?name=<client>&formId=<consent form id> — has this client's consent form
// for the treatment been completed, or at least sent? Matched by name (the same
// forgiving way the rest of the consent reconciliation works) and, when given,
// the specific form, so a Botox booking checks the Botox consent form.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ completed: false, sent: false })

  const { searchParams } = new URL(req.url)
  const name = (searchParams.get('name') ?? '').trim()
  const formId = (searchParams.get('formId') ?? '').trim()
  if (!name) return NextResponse.json({ completed: false, sent: false })

  // PostgREST ilike — strip characters that would break the filter.
  const enc = name.replace(/[%,()]/g, ' ')

  try {
    const subParams: Record<string, string | number> = {
      client_name: `ilike.${enc}`,
      order: 'submitted_at.desc',
      select: 'submitted_at,form_id',
      limit: 1,
    }
    const reqParams: Record<string, string | number> = {
      client_name: `ilike.${enc}`,
      status: 'in.(sent,completed,waived)',
      order: 'created_at.desc',
      select: 'created_at,status',
      limit: 1,
    }
    if (formId) {
      subParams.form_id = `eq.${formId}`
      reqParams.form_id = `eq.${formId}`
    }

    const [subs, reqs] = await Promise.all([
      select<{ submitted_at: string }>('consent_submissions', subParams).catch(() => []),
      select<{ created_at: string; status: string }>('consent_requests', reqParams).catch(() => []),
    ])

    return NextResponse.json({
      completed: subs.length > 0,
      completedAt: subs[0]?.submitted_at ?? null,
      sent: reqs.length > 0,
      sentAt: reqs[0]?.created_at ?? null,
    })
  } catch {
    return NextResponse.json({ completed: false, sent: false })
  }
}
