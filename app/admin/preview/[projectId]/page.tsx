import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { ExcelPreviewPage } from '@/components/excel-preview-page'
import { CloseButton } from '@/components/close-button'

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
          <button
            onClick={() => window.close()}
            className="text-primary hover:underline text-sm"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-md p-4 flex-shrink-0">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{submission.clave}</h1>
            <p className="text-xs opacity-75">{submission.titulo}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen()
                } else {
                  document.documentElement.requestFullscreen().catch(() => {
                    // Ignore fullscreen errors
                  })
                }
              }}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
              title="Pantalla completa (F11)"
            >
              ⛶
            </button>
            <CloseButton />
          </div>
        </div>
      </div>

      {/* Viewer */}
      <ExcelPreviewPage projectId={projectId} />
    </div>
  )
}
