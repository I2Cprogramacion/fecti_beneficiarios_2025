import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function DELETE(req: NextRequest) {
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

    // Delete the user (beneficiary) assigned to this project
    await sql`DELETE FROM users WHERE project_id = ${projectId} AND role = 'beneficiary'`

    return NextResponse.json({
      ok: true,
      message: 'Usuario eliminado correctamente',
    })
  } catch {
    return NextResponse.json(
      { error: 'Error al eliminar usuario.' },
      { status: 500 }
    )
  }
}
