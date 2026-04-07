import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId requerido.' }, { status: 400 })

  const rows = await sql`SELECT file_pathname FROM submissions WHERE project_id = ${projectId}`
  if (!rows.length) return NextResponse.json({ error: 'Sin archivo.' }, { status: 404 })

  const { file_pathname } = rows[0]

  try {
    const { get } = await import('@vercel/blob')
    const result = await get(file_pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })

    if (!result) return new NextResponse('Not found', { status: 404 })

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType,
        'Content-Disposition': 'inline',
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener archivo.' }, { status: 500 })
  }
}
