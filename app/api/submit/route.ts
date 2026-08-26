import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'beneficiary' || !session.projectId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

if (!file) {
  return NextResponse.json(
    { error: 'No se recibió archivo.' },
    { status: 400 }
  )
}

const MAX_FILE_SIZE = 16 * 1024 * 1024

if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: 'El archivo no puede superar los 16 MB.' },
    { status: 400 }
  )
}

const ext = file.name.split('.').pop()?.toLowerCase()
  if (
  ![
    'xls',
    'xlsx',
    'pdf',
    'doc',
    'docx',
    'jpg',
    'jpeg',
    'png',
    'xml'
  ].includes(ext ?? '')) {
    return NextResponse.json({ error: 'Solo se permiten archivos Excel, PDF, Word o imágenes JPG y PNG.' }, { status: 400 })
  }

  const safeName = `submissions/project-${session.projectId}-${Date.now()}.${ext}`
  const blob = await put(safeName, file, { access: 'private' })

await sql`
  INSERT INTO submissions (
    project_id,
    file_pathname,
    file_name,
    uploaded_at
  )
  VALUES (
    ${session.projectId},
    ${blob.pathname},
    ${file.name},
    NOW()
  )
`

  return NextResponse.json({ ok: true, fileName: file.name })
}
