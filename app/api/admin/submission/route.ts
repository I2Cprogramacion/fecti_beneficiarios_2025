import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    const rows = await sql`
      SELECT p.clave, p.titulo, s.file_pathname
      FROM submissions s
      JOIN projects p ON p.id = s.project_id
      WHERE s.project_id = ${projectId}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error in /api/admin/submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
