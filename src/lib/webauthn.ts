import { select, insert, update } from './assistant/db'

export const RP_ID = process.env.WEBAUTHN_RP_ID ?? 'vaclinic.co.uk'
export const RP_NAME = 'Visage Aesthetics'

// Accept both www and non-www, plus both Vercel deployments
export const ALLOWED_ORIGINS: string[] = [
  'https://www.vaclinic.co.uk',
  'https://vaclinic.co.uk',
  ...(process.env.WEBAUTHN_EXTRA_ORIGINS ?? '').split(',').filter(Boolean),
]

type ChallengeRow = { id: string; challenge: string; purpose: string; expires_at: string }
type CredentialRow = {
  id: string
  credential_id: string
  public_key: string
  sign_count: number
  device_type: string | null
}

export async function saveChallenge(challenge: string, purpose: 'register' | 'authenticate'): Promise<void> {
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  await insert('webauthn_challenges', { challenge, purpose, expires_at: expires })
}

export async function consumeChallenge(purpose: 'register' | 'authenticate'): Promise<string | null> {
  const now = new Date().toISOString()
  const rows = await select<ChallengeRow>('webauthn_challenges', {
    purpose: `eq.${purpose}`,
    expires_at: `gt.${now}`,
    order: 'created_at.desc',
    limit: 1,
  })
  const row = rows[0]
  if (!row) return null
  // Consume it — best-effort delete, non-fatal if it fails
  try {
    const { remove } = await import('./assistant/db')
    await remove('webauthn_challenges', { id: row.id })
  } catch { /* */ }
  return row.challenge
}

export async function saveCredential(
  credentialId: string,
  publicKey: string,
  signCount: number,
  deviceType: string,
): Promise<void> {
  // Only one passkey at a time — replace any existing
  const existing = await select<CredentialRow>('webauthn_credentials', { limit: 1 })
  if (existing.length > 0) {
    // update() adds eq. prefix automatically — pass raw UUID
    await update('webauthn_credentials', { id: existing[0].id }, {
      credential_id: credentialId,
      public_key: publicKey,
      sign_count: signCount,
      device_type: deviceType,
    })
  } else {
    await insert('webauthn_credentials', {
      credential_id: credentialId,
      public_key: publicKey,
      sign_count: signCount,
      device_type: deviceType,
    })
  }
}

export async function getCredential(): Promise<CredentialRow | null> {
  const rows = await select<CredentialRow>('webauthn_credentials', { limit: 1 })
  return rows[0] ?? null
}

export async function updateSignCount(credentialId: string, signCount: number): Promise<void> {
  // update() adds eq. prefix automatically — pass raw credential_id
  await update('webauthn_credentials', { credential_id: credentialId }, { sign_count: signCount })
}
