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
  console.log('🔍 getSession() - Cookie raw value:', raw ? raw.substring(0, 50) + '...' : 'NOT FOUND')
  if (!raw) return null
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
    console.log('🔍 getSession() - Parsed cookie data:', data)
    const rows = await sql`SELECT id, email, role, project_id, must_change_password FROM users WHERE id = ${data.id}`
    console.log('🔍 getSession() - DB lookup result:', rows)
    if (!rows.length) {
      console.log('🔍 getSession() - User not found in DB!')
      return null
    }
    const u = rows[0]
    const session = {
      id: u.id,
      email: u.email,
      role: u.role,
      projectId: u.project_id,
      mustChangePassword: u.must_change_password,
    }
    console.log('🔍 getSession() - Returning session:', session)
    return session
  } catch (error) {
    console.log('🔍 getSession() - Error:', error)
    return null
  }
}

export function makeSessionCookie(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64')
}
