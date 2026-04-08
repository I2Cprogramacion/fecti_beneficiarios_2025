import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'beneficiary' || !session.projectId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    // Get current submission
    const existing = await sql`SELECT file_pathname FROM submissions WHERE project_id = ${session.projectId}`
    
    if (!existing.length) {
      return NextResponse.json({ error: 'No hay archivo para eliminar.' }, { status: 404 })
    }

    // Delete from Vercel Blob
    if (existing[0].file_pathname) {
      try {
        await del(existing[0].file_pathname)
      } catch (e) {
        console.error('Error deleting blob:', e)
        // Continue even if blob deletion fails
      }
    }

    // Delete from database
    await sql`DELETE FROM submissions WHERE project_id = ${session.projectId}`

    return NextResponse.json({ ok: true, message: 'Archivo eliminado correctamente.' })
  } catch {
    return NextResponse.json(
      { error: 'Error al eliminar archivo.' },
      { status: 500 }
    )
  }
}
