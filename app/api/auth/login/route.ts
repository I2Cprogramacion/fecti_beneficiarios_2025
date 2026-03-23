import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { makeSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  console.log('[v0] Login attempt:', email)

  if (!email || !password) {
    return NextResponse.json({ error: 'Credenciales requeridas.' }, { status: 400 })
  }

  const rows = await sql`
    SELECT id, email, password_hash, role, project_id, must_change_password
    FROM users WHERE email = ${email.toLowerCase().trim()}
  `

  if (!rows.length) {
    console.log('[v0] User not found:', email)
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 })
  }

  const user = rows[0]
  console.log('[v0] User found:', { email: user.email, role: user.role, mustChangePassword: user.must_change_password })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    console.log('[v0] Invalid password')
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 })
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    projectId: user.project_id,
    mustChangePassword: user.must_change_password,
  }

  console.log('[v0] Session created:', sessionUser)

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
