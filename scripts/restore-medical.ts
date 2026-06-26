/**
 * Restore (decrypt) a medical backup file produced by scripts/backup-medical.ts.
 *
 * Every file in a Visage medical backup is AES-256-GCM encrypted with a random
 * per-file salt. This is the counterpart that turns a `.enc` file back into
 * readable JSON — without it the backups are not recoverable, so it is part of
 * the backup, not an afterthought.
 *
 * Usage:
 *   BACKUP_ENCRYPTION_KEY=… npx tsx scripts/restore-medical.ts <file.enc> [out.json]
 *
 * With no output path the decrypted JSON is written to stdout, so you can pipe
 * it (e.g. `… restore-medical.ts MEDICAL-RECORDS-COMPLETE.json.enc | jq .`).
 */

import { createDecipheriv, scryptSync } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

type EncryptedFile = {
  v: number
  alg: string
  salt: string
  iv: string
  tag: string
  data: string
}

function decrypt(enc: EncryptedFile, key: string): string {
  if (enc.alg !== 'aes-256-gcm') throw new Error(`Unsupported alg: ${enc.alg}`)
  const derived = scryptSync(key, Buffer.from(enc.salt, 'base64'), 32)
  const decipher = createDecipheriv('aes-256-gcm', derived, Buffer.from(enc.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(enc.tag, 'base64'))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(enc.data, 'base64')),
    decipher.final(),
  ])
  return plaintext.toString('utf8')
}

function main() {
  const key = process.env.BACKUP_ENCRYPTION_KEY
  if (!key) throw new Error('Set BACKUP_ENCRYPTION_KEY to the key used for the backup.')

  const inPath = process.argv[2]
  const outPath = process.argv[3]
  if (!inPath) throw new Error('Usage: restore-medical.ts <file.enc> [out.json]')

  const enc = JSON.parse(readFileSync(inPath, 'utf8')) as EncryptedFile
  const plaintext = decrypt(enc, key)

  if (outPath) {
    writeFileSync(outPath, plaintext)
    console.error(`Decrypted ${inPath} → ${outPath} (${plaintext.length.toLocaleString()} bytes)`)
  } else {
    process.stdout.write(plaintext)
  }
}

main()
