import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
