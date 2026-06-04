import { select, insert, update, remove } from './assistant/db'

export const RP_ID = process.env.WEBAUTHN_RP_ID ?? 'vaclinic.co.uk'
export const RP_NAME = 'Visage Aesthetics'
export const ORIGIN = process.env.WEBAUTHN_ORIGIN ?? 'https://www.vaclinic.co.uk'

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
  // Clean up expired challenges while we're here
  await remove('webauthn_challenges', { expires_at: `lt.${new Date().toISOString()}` }).catch(() => {})
}

export async function consumeChallenge(purpose: 'register' | 'authenticate'): Promise<string | null> {
  const rows = await select<ChallengeRow>('webauthn_challenges', {
    purpose: `eq.${purpose}`,
    expires_at: `gt.${new Date().toISOString()}`,
    order: 'created_at.desc',
    limit: 1,
  })
  const row = rows[0]
  if (!row) return null
  await remove('webauthn_challenges', { id: row.id }).catch(() => {})
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
    await update('webauthn_credentials', { id: `eq.${existing[0].id}` }, {
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
  await update('webauthn_credentials', { credential_id: `eq.${credentialId}` }, { sign_count: signCount })
}
