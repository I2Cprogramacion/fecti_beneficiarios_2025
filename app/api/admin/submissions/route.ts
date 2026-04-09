import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submissions = await sql`
      SELECT id, project_id, file_name, file_pathname, uploaded_at 
      FROM submissions 
      ORDER BY uploaded_at DESC 
      LIMIT 100
    `

    return NextResponse.json(submissions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
