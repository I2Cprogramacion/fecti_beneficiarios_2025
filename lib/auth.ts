import { cookies } from 'next/headers'
import { sql } from './db'

export interface SessionUser {
  id: number
  email: string
  role: 'admin' | 'beneficiary'
  projectId: number | null
  mustChangePassword: boolean
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('session')?.value
  if (!raw) return null
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
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

export function makeSessionCookie(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64')
}
