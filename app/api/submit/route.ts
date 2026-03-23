import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
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
    return NextResponse.json({ error: 'No se recibió archivo.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['xls', 'xlsx'].includes(ext ?? '')) {
    return NextResponse.json({ error: 'Solo se permiten archivos .xls y .xlsx.' }, { status: 400 })
  }

  // Delete old submission blob if exists
  const existing = await sql`SELECT file_pathname FROM submissions WHERE project_id = ${session.projectId}`
  if (existing.length && existing[0].file_pathname) {
    try {
      const { del: blobDel } = await import('@vercel/blob')
      // Get blob URL from pathname - construct it
      await blobDel(existing[0].file_pathname)
    } catch {
      // ignore deletion errors
    }
  }

  const safeName = `submissions/project-${session.projectId}-${Date.now()}.${ext}`
  const blob = await put(safeName, file, { access: 'private' })

  await sql`
    INSERT INTO submissions (project_id, file_pathname, file_name)
    VALUES (${session.projectId}, ${blob.pathname}, ${file.name})
    ON CONFLICT (project_id) DO UPDATE SET
      file_pathname = EXCLUDED.file_pathname,
      file_name = EXCLUDED.file_name,
      uploaded_at = NOW()
  `

  return NextResponse.json({ ok: true, fileName: file.name })
}
