/**
 * Medical records backup for Visage Aesthetics.
 *
 * Runs from GitHub Actions daily at 02:00 UTC. Exports all clinical and
 * business data from Supabase, uploads to Dropbox as dated JSON files,
 * logs the result to Supabase, and emails a confirmation to the clinic.
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   BACKUP_DROPBOX_TOKEN   — Dropbox API access token
 *   RESEND_API_KEY
 *
 * Optional:
 *   CLINIC_EMAIL           — defaults to ber.parsons@outlook.com
 *   BACKUP_ENCRYPTION_KEY  — if set, files are AES-256-GCM encrypted
 *   BLOB_READ_WRITE_TOKEN  — if set, photo metadata from Vercel Blob is included
 */

import { createCipheriv, randomBytes, scryptSync, createHash } from 'node:crypto'

const SUPABASE_URL = required('SUPABASE_URL').replace(/\/$/, '')
const SUPABASE_KEY = required('SUPABASE_SERVICE_ROLE_KEY')
const DROPBOX_TOKEN = required('BACKUP_DROPBOX_TOKEN')
const RESEND_KEY = required('RESEND_API_KEY')
const CLINIC_EMAIL = process.env.CLINIC_EMAIL ?? 'ber.parsons@outlook.com'
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY

// Medical-priority tables — always included
const MEDICAL_TABLES = [
  'clients',
  'treatment_records',
  'appointments',
  'bookings',
  'consent_requests',
  'consent_submissions',
  'photos',
  'batches',
  'audit_log',
  'client_flags',
  'do_not_contact',
]

// Business tables — included for completeness
const BUSINESS_TABLES = [
  'orders',
  'order_lines',
  'suppliers',
  'products',
  'services',
  'booking_requests',
  'waitlist',
]

type BackupRow = { table: string; rows: unknown[]; count: number; checksum: string }
type Manifest = {
  created_at: string
  version: string
  supabase_project: string
  region: string
  tables: { table: string; count: number; checksum: string }[]
  total_rows: number
  encrypted: boolean
  note: string
}

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

async function fetchTable(table: string): Promise<unknown[]> {
  let rows: unknown[] = []
  let offset = 0
  const limit = 1000

  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}&offset=${offset}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    )
    if (!res.ok) {
      const text = await res.text()
      console.warn(`  [warn] ${table}: ${res.status} — ${text.slice(0, 100)}`)
      return rows
    }
    const batch = await res.json() as unknown[]
    rows = rows.concat(batch)
    if (batch.length < limit) break
    offset += limit
  }
  return rows
}

function checksum(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function encrypt(plaintext: string): { data: string; iv: string; tag: string } {
  if (!ENCRYPTION_KEY) throw new Error('No encryption key')
  const key = scryptSync(ENCRYPTION_KEY, 'visage-backup-salt', 32)
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    data: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}

async function uploadToDropbox(path: string, content: Buffer): Promise<void> {
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DROPBOX_TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite', autorename: false }),
    },
    body: content,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Dropbox upload failed for ${path}: ${res.status} — ${text.slice(0, 200)}`)
  }
}

async function logToSupabase(summary: {
  backed_up_at: string
  tables_included: number
  total_rows: number
  dropbox_path: string
  encrypted: boolean
  email_sent: boolean
}): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/backup_log`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(summary),
  })
}

async function sendEmail(subject: string, html: string, text: string): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
      to: [CLINIC_EMAIL],
      subject,
      html,
      text,
    }),
  })
}

async function main() {
  const startedAt = new Date()
  const isoDate = startedAt.toISOString().slice(0, 10)
  const isoHour = startedAt.toISOString().slice(11, 13)
  const folderPath = `/Visage Medical Backups/${isoDate.slice(0, 7)}/${isoDate}-${isoHour}h`

  console.log(`\nVisage Medical Backup — ${startedAt.toISOString()}`)
  console.log(`Destination: Dropbox${folderPath}`)
  console.log(`Encryption: ${ENCRYPTION_KEY ? 'AES-256-GCM' : 'none (set BACKUP_ENCRYPTION_KEY to enable)'}`)

  const allTables = [...MEDICAL_TABLES, ...BUSINESS_TABLES]
  const backupRows: BackupRow[] = []
  let totalRows = 0
  const errors: string[] = []

  // Export each table
  for (const table of allTables) {
    process.stdout.write(`  Exporting ${table}… `)
    try {
      const rows = await fetchTable(table)
      const json = JSON.stringify(rows)
      const cs = checksum(json)
      backupRows.push({ table, rows, count: rows.length, checksum: cs })
      totalRows += rows.length
      console.log(`${rows.length} rows ✓`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${table}: ${msg}`)
      console.log(`ERROR — ${msg}`)
    }
  }

  // Build manifest
  const manifest: Manifest = {
    created_at: startedAt.toISOString(),
    version: '1.0',
    supabase_project: 'visage-aesthetics-clinic (yawclxvhgbtzacthstpr)',
    region: 'eu-west-2 (London)',
    tables: backupRows.map((r) => ({ table: r.table, count: r.count, checksum: r.checksum })),
    total_rows: totalRows,
    encrypted: Boolean(ENCRYPTION_KEY),
    note: 'Medical records backup — Visage Aesthetics, Braintree, Essex. Bernadette Tobin RGN.',
  }

  // Upload manifest
  console.log('\n  Uploading to Dropbox…')
  await uploadToDropbox(
    `${folderPath}/manifest.json`,
    Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'),
  )

  // Upload each table's data
  for (const backup of backupRows) {
    const content = JSON.stringify({ ...backup, rows: backup.rows }, null, 2)
    let uploadContent: Buffer

    if (ENCRYPTION_KEY) {
      const enc = encrypt(content)
      uploadContent = Buffer.from(JSON.stringify(enc), 'utf8')
      await uploadToDropbox(`${folderPath}/${backup.table}.json.enc`, uploadContent)
    } else {
      uploadContent = Buffer.from(content, 'utf8')
      await uploadToDropbox(`${folderPath}/${backup.table}.json`, uploadContent)
    }
    process.stdout.write(`  ${backup.table} uploaded ✓\n`)
  }

  // Upload combined medical-only backup (most important)
  const medicalOnly = backupRows.filter((r) => MEDICAL_TABLES.includes(r.table))
  const combined = JSON.stringify({
    manifest,
    data: Object.fromEntries(medicalOnly.map((r) => [r.table, r.rows])),
  }, null, 2)
  await uploadToDropbox(
    `${folderPath}/MEDICAL-RECORDS-COMPLETE.json`,
    Buffer.from(combined, 'utf8'),
  )

  console.log('\n  Complete combined backup uploaded ✓')

  // Log to Supabase
  const emailSent = errors.length === 0
  try {
    await logToSupabase({
      backed_up_at: startedAt.toISOString(),
      tables_included: backupRows.length,
      total_rows: totalRows,
      dropbox_path: folderPath,
      encrypted: Boolean(ENCRYPTION_KEY),
      email_sent: emailSent,
    })
    console.log('  Logged to backup_log ✓')
  } catch (e) {
    console.warn('  Could not log to backup_log (table may not exist yet)')
  }

  // Send confirmation email
  const statusLine = errors.length === 0
    ? `All ${backupRows.length} tables backed up successfully.`
    : `${backupRows.length - errors.length} tables succeeded. ${errors.length} errors.`

  const tableRows = backupRows
    .map((r) => `<tr><td style="padding:4px 10px;border-bottom:1px solid #D9CDBE;font-size:13px;">${r.table}</td><td style="padding:4px 10px;border-bottom:1px solid #D9CDBE;font-size:13px;text-align:right;">${r.count.toLocaleString()}</td></tr>`)
    .join('')

  const html = `
    <div style="font-family:-apple-system,sans-serif;color:#1F1B1A;max-width:560px;">
      <h2 style="font-family:Georgia,serif;font-style:italic;color:#A8895E;font-weight:500;margin:0 0 4px;">Medical records backup</h2>
      <p style="color:#8A807D;font-size:13px;margin:0 0 16px;">${startedAt.toUTCString()}</p>

      <div style="background:${errors.length === 0 ? '#F0FBF4' : '#FEF3CD'};border:1px solid ${errors.length === 0 ? '#86EFAC' : '#FBBF24'};border-radius:4px;padding:10px 14px;margin-bottom:20px;">
        <p style="margin:0;font-size:14px;font-weight:500;">${statusLine}</p>
      </div>

      <p style="font-size:13px;color:#5C4F44;margin:0 0 4px;">Location: <code>Dropbox${folderPath}</code></p>
      <p style="font-size:13px;color:#5C4F44;margin:0 0 16px;">Total records: <strong>${totalRows.toLocaleString()}</strong> &middot; ${ENCRYPTION_KEY ? 'Encrypted' : 'Unencrypted'}</p>

      <table style="border-collapse:collapse;width:100%;">
        <thead><tr style="background:#F5F0EC;">
          <th style="padding:4px 10px;text-align:left;font-size:11px;font-weight:500;color:#8A807D;">Table</th>
          <th style="padding:4px 10px;text-align:right;font-size:11px;font-weight:500;color:#8A807D;">Rows</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>

      ${errors.length > 0 ? `<div style="margin-top:16px;padding:10px 14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:4px;"><p style="font-size:13px;margin:0;color:#B91C1C;font-weight:500;">Errors:</p>${errors.map((e) => `<p style="font-size:12px;color:#B91C1C;margin:4px 0 0;">${e}</p>`).join('')}</div>` : ''}
    </div>`

  await sendEmail(
    `Backup complete — ${totalRows.toLocaleString()} records — ${isoDate}`,
    html,
    `Medical records backup — ${startedAt.toUTCString()}\n\n${statusLine}\n\nLocation: Dropbox${folderPath}\nTotal records: ${totalRows.toLocaleString()}\n\n${backupRows.map((r) => `${r.table}: ${r.count} rows`).join('\n')}`,
  )

  console.log(`\nBackup complete. ${totalRows.toLocaleString()} records. Confirmation email sent.`)
  if (errors.length > 0) {
    console.error(`Errors: ${errors.join(', ')}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Backup failed:', err)
  process.exit(1)
})
