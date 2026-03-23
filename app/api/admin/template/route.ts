import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
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

  const safeName = `templates/plantilla-fecti-${Date.now()}.${ext}`
  const blob = await put(safeName, file, { access: 'private' })

  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('template_pathname', ${blob.pathname}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `

  return NextResponse.json({ ok: true, fileName: file.name })
}
