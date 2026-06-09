import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, audit } from '@/lib/assistant/db'
import { bookingIntegrityCheck } from '@/lib/assistant/integrity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
// Drift alerts go to Giles by default; override with INTEGRITY_ALERT_EMAIL.
const ALERT_TO = process.env.INTEGRITY_ALERT_EMAIL ?? 'giles@hieb.co.uk'

// Daily booking-integrity check. Emails an alert ONLY when something has drifted
// out of line (an Ovatu appointment with no matching booking, a duplicate, or two
// clients overlapping). Silent on a clean run. Called by the scheduler with an
// Authorization: Bearer <CRON_SECRET> header, the push_cron_secret via ?key=, or
// a signed-in staff session. ?test=1 returns the report without emailing.
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  const isStaff = await isStaffAuthed()

  const cronSecret = process.env.CRON_SECRET
  const bearerOk = Boolean(cronSecret) && req.headers.get('authorization') === `Bearer ${cronSecret}`

  let secretOk = false
  try {
    const rows = await select<{ value: string }>('app_config', { key: 'eq.push_cron_secret', limit: 1 })
    secretOk = Boolean(rows[0]?.value) && key === rows[0].value
  } catch {
    /* ignore */
  }
  if (!bearerOk && !secretOk && !isStaff) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  const report = await bookingIntegrityCheck()

  if (url.searchParams.get('test') === '1' && isStaff) {
    return NextResponse.json({ ok: true, test: true, report })
  }

  let alerted = false
  if (!report.ok) {
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const lines: string[] = ['The daily booking check found something that needs a look:', '']
      if (report.uncovered.length) {
        lines.push(`Ovatu appointments not in the new system (${report.uncovered.length}) — slot may be bookable twice:`)
        lines.push(...report.uncovered.map((s) => `  • ${s}`), '')
      }
      if (report.duplicates.length) {
        lines.push(`Duplicate bookings (${report.duplicates.length}) — same client booked twice:`)
        lines.push(...report.duplicates.map((s) => `  • ${s}`), '')
      }
      if (report.overlaps.length) {
        lines.push(`Overlapping bookings (${report.overlaps.length}) — two clients in one slot:`)
        lines.push(...report.overlaps.map((s) => `  • ${s}`), '')
      }
      lines.push('Open the staff diary to sort these out. (Sent only because something drifted — a clean day sends nothing.)')
      const subject = `⚠️ Booking check: ${report.uncovered.length + report.duplicates.length + report.overlaps.length} to look at`
      try {
        await new Resend(apiKey).emails.send({
          from: FROM_EMAIL,
          to: [ALERT_TO],
          subject,
          text: lines.join('\n'),
        })
        alerted = true
      } catch (err) {
        console.error('[integrity] alert email failed', err)
      }
    }
  }

  await audit('integrity-check', 'booking', undefined, {
    ok: report.ok,
    uncovered: report.uncovered.length,
    duplicates: report.duplicates.length,
    overlaps: report.overlaps.length,
    alerted,
  })

  return NextResponse.json({ ok: true, report, alerted })
}
