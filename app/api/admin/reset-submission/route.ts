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

    // Delete the submission for this project
    await sql`DELETE FROM submissions WHERE project_id = ${projectId}`
    
    // Delete the user (beneficiary) assigned to this project
    await sql`DELETE FROM users WHERE project_id = ${projectId} AND role = 'beneficiary'`

    return NextResponse.json({
      ok: true,
      message: 'Envío reiniciado correctamente',
    })
  } catch (error) {
    console.error('Reset submission error:', error)
    return NextResponse.json(
      { error: 'Error al reiniciar envío: ' + (error instanceof Error ? error.message : 'desconocido') },
      { status: 500 }
    )
  }
}
