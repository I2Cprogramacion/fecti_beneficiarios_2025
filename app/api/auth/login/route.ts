import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { makeSessionCookie } from '@/lib/auth'

function errorRedirect(req: NextRequest, msg: string) {
  const url = new URL('/admin', req.url)
  url.searchParams.set('error', msg)
  return NextResponse.redirect(url, { status: 303 })
}

export async function POST(req: NextRequest) {
  // Soportar tanto form-data (native form) como JSON (fetch)
  let email = ''
  let password = ''
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    email = (formData.get('email') as string) ?? ''
    password = (formData.get('password') as string) ?? ''
  } else {
    const body = await req.json()
    email = body.email ?? ''
    password = body.password ?? ''
  }

  if (!email || !password) {
    return errorRedirect(req, 'Credenciales requeridas.')
  }

  const rows = await sql`
    SELECT id, email, password_hash, role, project_id, must_change_password
    FROM users WHERE email = ${email.toLowerCase().trim()}
  `

  if (!rows.length) {
    return errorRedirect(req, 'Correo o contraseña incorrectos.')
  }

  const user = rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return errorRedirect(req, 'Correo o contraseña incorrectos.')
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    projectId: user.project_id,
    mustChangePassword: user.must_change_password,
  }

  const cookie = makeSessionCookie(sessionUser)
  const redirectUrl = user.must_change_password ? '/admin/change-password' : '/admin/dashboard'
  const res = NextResponse.redirect(new URL(redirectUrl, req.url), { status: 303 })
  res.cookies.set('session', cookie, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8,
    sameSite: 'none',
    secure: true,
  })
  return res
}
