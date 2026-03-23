import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const rows = await sql`
    SELECT u.id, u.email, u.project_id, p.clave, p.titulo
    FROM users u
    LEFT JOIN projects p ON p.id = u.project_id
    WHERE u.role = 'beneficiary'
    ORDER BY p.clave ASC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const { email, password, projectId } = await req.json()

  if (!email || !password || !projectId) {
    return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)

  // Upsert: if user exists for that project, update; otherwise insert
  const existing = await sql`SELECT id FROM users WHERE project_id = ${projectId} AND role = 'beneficiary'`

  if (existing.length) {
    await sql`UPDATE users SET email = ${email.toLowerCase().trim()}, password_hash = ${hash} WHERE id = ${existing[0].id}`
  } else {
    await sql`
      INSERT INTO users (email, password_hash, project_id, role, must_change_password)
      VALUES (${email.toLowerCase().trim()}, ${hash}, ${projectId}, 'beneficiary', FALSE)
    `
  }

  return NextResponse.json({ ok: true })
}
