import type { Metadata } from 'next'
import { ExternalLink, FileText, Megaphone } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../notes/StaffGate'

export const metadata: Metadata = {
  title: 'PR tracker',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const TRACKER_URL =
  'https://docs.google.com/spreadsheets/d/13o7zv9377zxqxSXHOT4s6O1vj6R3oumiHTZcIXBQPcU/edit'

function Admin() {
  return (
    <section className="bg-cream text-charcoal min-h-[80vh]">
      <div className="max-w-[900px] mx-auto px-5 md:px-8 py-20">
        <div className="inline-flex w-12 h-12 rounded-full bg-charcoal text-cream items-center justify-center mb-5">
          <Megaphone size={18} strokeWidth={1.75} />
        </div>
        <div className="eyebrow text-gold mb-2">Clinic staff</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">
          PR &amp; media tracker
        </h1>
        <p className="text-ink-soft mt-3 leading-relaxed max-w-2xl">
          The live tracker of local press, magazine, radio, awards and partnership targets, with their
          status and any replies. The full operation lives in the visage-pr folder in the website
          repository.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-px bg-line/40 border border-line/40">
          <a
            href={TRACKER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cream p-6 flex items-center gap-4 hover:bg-cream-soft transition-colors"
          >
            <ExternalLink size={20} className="text-gold shrink-0" strokeWidth={1.6} />
            <span>
              <span className="block text-body text-charcoal">Open the live Google Sheet tracker</span>
              <span className="block text-eyebrow text-stone mt-1">Targets, status and replies</span>
            </span>
          </a>
          <div className="bg-cream p-6 flex items-start gap-4">
            <FileText size={20} className="text-gold shrink-0 mt-1" strokeWidth={1.6} />
            <span>
              <span className="block text-body text-charcoal">How it runs</span>
              <span className="block text-ink-soft text-sm mt-2 leading-relaxed max-w-xl">
                Type <strong>RUN PR VISAGE</strong> to run the full cycle: check the inbox and reply,
                send the next three to five local pitches, update the tracker, and get a short summary.
                The runbook and all materials are in visage-pr in the repository.
              </span>
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-soft mt-6">For Visage Aesthetics clinic staff only.</p>
      </div>
    </section>
  )
}

export default async function StaffPrPage() {
  const authed = await isStaffAuthed()
  return authed ? (
    <Admin />
  ) : (
    <StaffGate title="PR tracker" subtitle="Enter the staff passcode to view the PR tracker." />
  )
}
