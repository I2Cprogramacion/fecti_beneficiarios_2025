import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { SiteHeader } from '@/components/site-header'
import { ProjectLoginForm } from '@/components/project-login-form'
import { UploadArea } from '@/components/upload-area'

const COMPONENT_LABELS: Record<string, string> = {
  'C01-INFRA': 'C01 – Infraestructura',
  'C02-IBA':   'C02 – Investigación Básica Aplicada',
  'C03-FT':    'C03 – Formación de Talento',
  'C04-IYE':   'C04 – Innovación y Empresa',
}

async function getProject(id: string) {
  const rows = await sql`
    SELECT p.id, p.num, p.clave, p.componente, p.titulo, p.monto,
      s.file_name, s.uploaded_at
    FROM projects p
    LEFT JOIN submissions s ON s.project_id = p.id
    WHERE p.id = ${id}
  `
  return rows[0] ?? null
}

async function hasTemplate() {
  const rows = await sql`SELECT 1 FROM settings WHERE key = 'template_pathname'`
  return rows.length > 0
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, templateAvailable, session] = await Promise.all([
    getProject(id),
    hasTemplate(),
    getSession(),
  ])

  if (!project) notFound()

  const isOwner = session && session.role === 'beneficiary' && session.projectId === project.id

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SiteHeader userEmail={session?.email} showLogout={!!session} />

      <main className="max-w-2xl mx-auto px-4 py-8 w-full flex-1">
        {/* Project header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              #{project.num}
            </span>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded font-medium">
              {COMPONENT_LABELS[project.componente] ?? project.componente}
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{project.clave}</span>
          <h1 className="text-xl font-bold text-foreground mt-1 text-balance leading-snug">
            {project.titulo}
          </h1>
          {project.monto && (
            <p className="text-sm text-accent font-semibold mt-3">
              Monto asignado:{' '}
              {Number(project.monto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </p>
          )}
        </div>

        {/* Template download - always visible */}
        <div className="bg-card border border-border rounded-lg p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-1">Plantilla de reporte</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Descarga la plantilla oficial, llénala y vuelve a esta página para subir tu archivo.
          </p>
          {templateAvailable ? (
            <a
              href="/api/template"
              className="inline-block bg-accent text-white text-sm font-medium px-4 py-2 rounded hover:bg-accent/90 transition-colors"
            >
              Descargar plantilla
            </a>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              La plantilla aún no ha sido cargada por el administrador.
            </p>
          )}
        </div>

        {/* Auth / Upload section */}
        {isOwner ? (
          <UploadArea
            projectId={project.id}
            fileName={project.file_name ?? null}
            uploadedAt={project.uploaded_at ?? null}
          />
        ) : (
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-1">Subir reporte</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Inicia sesión con las credenciales asignadas a este proyecto para subir tu archivo.
            </p>
            <ProjectLoginForm projectId={project.id} />
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2025 &mdash; Todos los derechos reservados
      </footer>
    </div>
  )
}
