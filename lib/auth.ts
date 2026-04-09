import crypto from 'crypto'
import { cookies } from 'next/headers'
import { sql } from './db'

/** Return the signing secret, failing fast if misconfigured. */
function getSecret(): string {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error(
      'FATAL: SESSION_SECRET is missing or too short (min 32 chars).'
    )
  }
  return s
}

export interface SessionUser {
  id: number
  email: string
  role: 'admin' | 'beneficiary'
  projectId: number | null
  mustChangePassword: boolean
}

/** Sign a payload string with HMAC-SHA256 and return the hex digest. */
function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
}

/** Verify that a signature matches the expected HMAC for a payload. */
function verify(payload: string, sig: string): boolean {
  const expected = sign(payload)
  if (sig.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('session')?.value
  if (!raw) return null

  try {
    const dotIdx = raw.lastIndexOf('.')
    if (dotIdx === -1) return null // unsigned cookie → force re-login

    const payload = raw.slice(0, dotIdx)
    const sig = raw.slice(dotIdx + 1)

    if (!verify(payload, sig)) return null // tampered

    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    const rows = await sql`SELECT id, email, role, project_id, must_change_password FROM users WHERE id = ${data.id}`
    if (!rows.length) return null

    const u = rows[0]
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      projectId: u.project_id,
      mustChangePassword: u.must_change_password,
    }
  } catch {
    return null
  }
}

/** Create an HMAC-signed session cookie value. Format: base64payload.hmacHex */
export function makeSessionCookie(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64')
  return `${payload}.${sign(payload)}`
}
