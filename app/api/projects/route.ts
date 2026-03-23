import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let rows
    if (session.role === 'admin') {
      rows = await sql`
        SELECT p.id, p.title, p.principal_investigator, p.institution, p.status
        FROM projects p
        ORDER BY p.id ASC
      `
    } else {
      rows = await sql`
        SELECT p.id, p.title, p.principal_investigator, p.institution, p.status
        FROM projects p
        WHERE p.id = ${session.projectId}
      `
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
