import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { makeSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
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
    console.log('🔐 Login attempt - User found:', { id: user.id, email: user.email, role: user.role, project_id: user.project_id })
    
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      console.log('🔐 Login attempt - Invalid password')
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

    console.log('🔐 Login attempt - Session user object:', sessionUser)

    const cookie = makeSessionCookie(sessionUser)
    console.log('🔐 Login attempt - Cookie created:', cookie.substring(0, 50) + '...')
    
    // Determine redirect URL based on role
    let redirectUrl = '/dashboard'
    if (user.role === 'admin') {
      redirectUrl = user.must_change_password ? '/admin/change-password' : '/admin/dashboard'
    } else if (user.role === 'beneficiary' && user.project_id) {
      redirectUrl = `/proyectos/${user.project_id}`
    }
    
    console.log('🔐 Login attempt - Redirect URL:', redirectUrl)
    
    const response = NextResponse.json({
      ok: true,
      user: sessionUser,
      redirectUrl: redirectUrl,
    })

    response.cookies.set('session', cookie, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión: ' + (error instanceof Error ? error.message : 'desconocido') },
      { status: 500 }
    )
  }
}
