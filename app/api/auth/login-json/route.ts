import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { makeSessionCookie } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en un minuto.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      )
    }

    const rows = await sql`
      SELECT id, email, password_hash, role, project_id, must_change_password
      FROM users WHERE email = ${email.toLowerCase().trim()}
    `

    if (!rows.length) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      )
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      )
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      projectId: user.project_id,
      mustChangePassword: user.must_change_password,
    }

    const cookie = makeSessionCookie(sessionUser)

    // Determine redirect URL based on role
    let redirectUrl = '/dashboard'
    if (user.role === 'admin') {
      redirectUrl = user.must_change_password ? '/admin/change-password' : '/admin/dashboard'
    } else if (user.role === 'beneficiary' && user.project_id) {
      redirectUrl = `/proyectos/${user.project_id}`
    }

    const response = NextResponse.json({
      ok: true,
      user: sessionUser,
      redirectUrl: redirectUrl,
    })

    response.cookies.set('session', cookie, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
