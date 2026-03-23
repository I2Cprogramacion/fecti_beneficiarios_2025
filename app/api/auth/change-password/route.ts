import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { getSession, makeSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await sql`
    UPDATE users SET password_hash = ${hash}, must_change_password = FALSE
    WHERE id = ${session.id}
  `

  const updated = { ...session, mustChangePassword: false }
  const cookie = makeSessionCookie(updated)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', cookie, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8,
    sameSite: 'lax',
  })
  return res
}
