import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const rows = await sql`SELECT value FROM settings WHERE key = 'template_pathname'`
  if (!rows.length) {
    return NextResponse.json({ error: 'No hay plantilla disponible aún.' }, { status: 404 })
  }

  const pathname = rows[0].value

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })

    if (!result) {
      return new NextResponse('Not found', { status: 404 })
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          'Cache-Control': 'private, no-cache',
        },
      })
    }

    const filename = pathname.split('/').pop() || 'plantilla.xlsx'
    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener la plantilla.' }, { status: 500 })
  }
}
