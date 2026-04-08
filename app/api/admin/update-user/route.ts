import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID del proyecto requerido' },
        { status: 400 }
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

    // Find the user assigned to this project
    const userRows = await sql`
      SELECT id FROM users WHERE project_id = ${projectId} AND role = 'beneficiary'
    `

    if (!userRows.length) {
      return NextResponse.json(
        { error: 'No hay usuario asignado a este proyecto' },
        { status: 404 }
      )
    }

    const userId = userRows[0].id
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user
    await sql`
      UPDATE users SET email = ${email.toLowerCase().trim()}, password_hash = ${passwordHash}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      ok: true,
      message: 'Usuario actualizado correctamente',
    })
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar usuario.' },
      { status: 500 }
    )
  }
}
