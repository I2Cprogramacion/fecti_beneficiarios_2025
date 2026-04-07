import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import Link from 'next/link'

async function getSubmission(projectId: string) {
  try {
    const rows = await sql`
      SELECT p.clave, p.titulo, s.file_pathname
      FROM submissions s
      JOIN projects p ON p.id = s.project_id
      WHERE s.project_id = ${projectId}
    `
    return rows[0] ?? null
  } catch {
    return null
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin')

  const { projectId } = await params
  const submission = await getSubmission(projectId)

  if (!submission) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Archivo no encontrado</h1>
          <p className="text-muted-foreground mb-4">No hay archivo subido para este proyecto</p>
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Use Microsoft Office Online Viewer with our API endpoint
  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || 'https://fecti-beneficiarios-2025.vercel.app'}/api/admin/download?projectId=${projectId}`)}`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-md p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{submission.clave}</h1>
            <p className="text-xs opacity-75">{submission.titulo}</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          title="Vista previa del archivo"
          sandbox="allow-same-origin allow-scripts allow-popups allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  )
}
