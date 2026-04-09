import { put } from '@vercel/blob'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const fileType = formData.get('fileType') as string

    // Beneficiaries can only upload to their own project
    if (session.role === 'beneficiary' && String(session.projectId) !== projectId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!file || !projectId || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // H4-fix: Validate file size (max 10 MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido (10 MB).' },
        { status: 400 }
      )
    }

    // H4-fix: Validate file extension
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xls', 'xlsx'].includes(ext ?? '')) {
      return NextResponse.json(
        { error: 'Solo se permiten archivos .xls y .xlsx.' },
        { status: 400 }
      )
    }

    // Sanitize filename for storage path
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')

    const blob = await put(`projects/${projectId}/${fileType}/${safeName}`, file, {
      access: 'private',
    })

    await sql`
      INSERT INTO submissions (project_id, user_id, file_type, file_pathname, uploaded_at)
      VALUES (${projectId}, ${session.id}, ${fileType}, ${blob.pathname}, NOW())
    `

    return NextResponse.json({ ok: true, pathname: blob.pathname })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
