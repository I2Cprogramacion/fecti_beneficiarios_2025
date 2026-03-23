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

    if (!file || !projectId || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const blob = await put(`projects/${projectId}/${fileType}/${file.name}`, file, {
      access: 'private',
    })

    await sql`
      INSERT INTO submissions (project_id, user_id, file_type, file_pathname, uploaded_at)
      VALUES (${projectId}, ${session.id}, ${fileType}, ${blob.pathname}, NOW())
    `

    return NextResponse.json({ ok: true, pathname: blob.pathname })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
