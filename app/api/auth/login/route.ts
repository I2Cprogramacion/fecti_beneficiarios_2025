import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { makeSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Credenciales requeridas.' }, { status: 400 })
  }

  const rows = await sql`
    SELECT id, email, password_hash, role, project_id, must_change_password
    FROM users WHERE email = ${email.toLowerCase().trim()}
  `

  if (!rows.length) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 })
  }

  const user = rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 })
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    projectId: user.project_id,
    mustChangePassword: user.must_change_password,
  }

  const cookie = makeSessionCookie(sessionUser)
  const res = NextResponse.json({ ok: true, user: sessionUser })
  res.cookies.set('session', cookie, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: 'lax',
  })
  return res
}
