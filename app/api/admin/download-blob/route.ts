import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId requerido.' }, { status: 400 })

  try {
    const rows = await sql`SELECT file_pathname, file_name FROM submissions WHERE project_id = ${projectId}`
    if (!rows.length) return NextResponse.json({ error: 'Sin archivo.' }, { status: 404 })

    const { file_pathname, file_name } = rows[0]

    const result = await get(file_pathname, {
      access: 'private',
    })

    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Convert Readable stream to Buffer
    const chunks: Buffer[] = []
    for await (const chunk of result.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)
    const base64 = buffer.toString('base64')

    return NextResponse.json({
      data: base64,
      fileName: file_name,
      contentType: result.blob.contentType,
    })
  } catch {
    return NextResponse.json({ error: 'Error al descargar archivo.' }, { status: 500 })
  }
}
