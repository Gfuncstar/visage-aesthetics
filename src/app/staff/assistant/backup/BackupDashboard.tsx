'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Download, LogOut, Shield } from 'lucide-react'

type BackupEntry = {
  id: string
  backed_up_at: string
  tables_included: number
  total_rows: number
  dropbox_path: string
  email_sent: boolean
}

export default function BackupDashboard() {
  const [backups, setBackups] = useState<BackupEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetch('/api/staff/assistant/backup', { method: 'POST' })
      .then((r) => r.json())
      .then((d: { backups?: BackupEntry[] }) => setBackups(d.backups ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function downloadBackup() {
    setDownloading(true)
    try {
      const res = await fetch('/api/staff/assistant/backup')
      if (!res.ok) { alert('Download failed — please try again.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `visage-backup-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const latest = backups[0]
  const hoursSince = latest
    ? Math.round((Date.now() - new Date(latest.backed_up_at).getTime()) / 3_600_000)
    : null
  const backupHealthy = hoursSince !== null && hoursSince < 30

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Backup</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
              Medical records backup.
            </h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Clinical records, treatment notes, consent forms, and appointments — backed up daily
              to Dropbox, completely independent of the clinic&apos;s main servers.
            </p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {/* Status */}
        <div className={`rounded-sm border p-4 mb-8 flex items-start gap-3 ${
          loading
            ? 'border-line/40 bg-cream-soft'
            : backupHealthy
            ? 'border-green-200 bg-green-50'
            : latest
            ? 'border-amber-200 bg-amber-50'
            : 'border-clay/30 bg-clay/10'
        }`}>
          {loading ? (
            <Clock size={18} strokeWidth={1.75} className="text-stone mt-0.5 shrink-0" />
          ) : backupHealthy ? (
            <CheckCircle2 size={18} strokeWidth={1.75} className="text-green-600 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={18} strokeWidth={1.75} className="text-amber-600 mt-0.5 shrink-0" />
          )}
          <div>
            {loading && <p className="text-sm text-stone">Loading backup status…</p>}
            {!loading && backupHealthy && latest && (
              <>
                <p className="text-sm font-medium text-green-800">
                  Last backup: {new Date(latest.backed_up_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  {latest.total_rows.toLocaleString()} records across {latest.tables_included} tables &middot; Dropbox: {latest.dropbox_path}
                </p>
              </>
            )}
            {!loading && latest && !backupHealthy && (
              <>
                <p className="text-sm font-medium text-amber-800">
                  Last backup {hoursSince}h ago — next automated backup at 02:00 UTC
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {latest.total_rows.toLocaleString()} records &middot; {latest.dropbox_path}
                </p>
              </>
            )}
            {!loading && !latest && (
              <p className="text-sm text-clay">
                No automated backups recorded yet. The daily backup runs at 02:00 UTC.
                Use the download button below to take an immediate manual backup.
              </p>
            )}
          </div>
        </div>

        {/* Download now */}
        <div className="bg-cream-soft border border-line/40 rounded-sm p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="inline-flex w-9 h-9 rounded-full bg-charcoal text-cream items-center justify-center shrink-0 mt-0.5">
              <Download size={15} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <h2 className="font-display italic text-lg text-charcoal leading-tight">Download backup now</h2>
              <p className="text-xs text-ink-soft mt-1 leading-snug">
                Downloads a complete JSON export of all clinical and business data directly to your device.
                Save it to an external drive, USB stick, or a second cloud service.
              </p>
              <button
                onClick={downloadBackup}
                disabled={downloading}
                className="mt-3 btn btn-primary disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Download size={15} strokeWidth={1.75} />
                  {downloading ? 'Preparing download…' : 'Download complete backup'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* What's backed up */}
        <div className="bg-cream-soft border border-line/40 rounded-sm p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="inline-flex w-9 h-9 rounded-full bg-charcoal text-cream items-center justify-center shrink-0 mt-0.5">
              <Shield size={15} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display italic text-lg text-charcoal leading-tight">What&apos;s included</h2>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                {[
                  { label: 'Treatment records', note: 'doses, products, batch numbers' },
                  { label: 'Clinical notes', note: 'all write-ups' },
                  { label: 'Client records', note: 'names, contact details' },
                  { label: 'Consent records', note: 'forms sent and signed' },
                  { label: 'Appointments', note: 'full history' },
                  { label: 'Bookings', note: 'all booking data' },
                  { label: 'Product batches', note: 'expiry, traceability' },
                  { label: 'Audit log', note: 'all recorded actions' },
                  { label: 'Orders & invoices', note: 'supplier history' },
                  { label: 'Photos metadata', note: 'URLs to clinical images' },
                ].map(({ label, note }) => (
                  <div key={label} className="text-sm">
                    <span className="text-charcoal font-medium">{label}</span>
                    <span className="text-stone"> — {note}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone mt-4 border-t border-line/30 pt-3">
                <strong>Photos (images):</strong> Clinical photographs are stored in Vercel Blob.
                Their URLs are captured in this backup. To back up the image files themselves,
                download them from the client records section.
              </p>
            </div>
          </div>
        </div>

        {/* Recent automated backups */}
        {backups.length > 0 && (
          <div>
            <div className="eyebrow text-stone mb-3">Recent automated backups</div>
            <div className="space-y-2">
              {backups.map((b) => (
                <div key={b.id} className="bg-cream-soft border border-line/40 rounded-sm px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-charcoal">
                      {new Date(b.backed_up_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="text-xs text-stone mt-0.5">
                      {b.total_rows.toLocaleString()} records &middot; {b.tables_included} tables &middot; Dropbox
                    </p>
                  </div>
                  <CheckCircle2 size={16} strokeWidth={1.75} className="text-green-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
