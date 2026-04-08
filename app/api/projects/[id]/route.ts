import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { id } = await params

  // Beneficiaries can only see their own project
  if (session.role === 'beneficiary' && String(session.projectId) !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rows = await sql`
    SELECT p.id, p.clave, p.titulo,
      s.file_name, s.uploaded_at, s.file_pathname,
      u.email AS assigned_email
    FROM projects p
    LEFT JOIN submissions s ON s.project_id = p.id
    LEFT JOIN users u ON u.project_id = p.id AND u.role = 'beneficiary'
    WHERE p.id = ${id}
  `
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}
