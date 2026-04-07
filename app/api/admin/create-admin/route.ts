import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET: List all admin users
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const users = await sql`
      SELECT id, email, role, must_change_password, created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// POST: Create new admin user
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.email !== 'daron.tarin@i2c.com.mx') {
      return NextResponse.json({ error: 'Solo daron.tarin@i2c.com.mx puede crear administradores' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 })
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10)

    // Create admin user
    const result = await sql`
      INSERT INTO users (email, password_hash, role, must_change_password)
      VALUES (${email.toLowerCase().trim()}, ${hash}, 'admin', true)
      RETURNING id, email, role, created_at
    `

    return NextResponse.json(
      {
        success: true,
        message: 'Admin creado correctamente',
        user: result[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Error al crear admin: ' + (error instanceof Error ? error.message : 'desconocido') },
      { status: 500 }
    )
  }
}

// DELETE: Remove an admin user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.email !== 'daron.tarin@i2c.com.mx') {
      return NextResponse.json({ error: 'Solo daron.tarin@i2c.com.mx puede eliminar administradores' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get('id')

    if (!adminId) {
      return NextResponse.json({ error: 'ID del administrador requerido' }, { status: 400 })
    }

    // Prevent deleting yourself
    const adminToDelete = await sql`SELECT email FROM users WHERE id = ${adminId}`
    if (!adminToDelete.length) {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 })
    }

    if (adminToDelete[0].email === session.email) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })
    }

    // Delete the admin
    await sql`DELETE FROM users WHERE id = ${adminId} AND role = 'admin'`

    return NextResponse.json({
      ok: true,
      message: 'Administrador eliminado correctamente',
    })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { error: 'Error al eliminar admin: ' + (error instanceof Error ? error.message : 'desconocido') },
      { status: 500 }
    )
  }
}
