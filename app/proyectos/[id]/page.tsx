import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { SiteHeader } from '@/components/site-header'
import { ProjectLoginForm } from '@/components/project-login-form'
import { UploadArea } from '@/components/upload-area'

// Make this page dynamic to avoid build-time database queries
export const dynamic = 'force-dynamic'

const COMPONENT_LABELS: Record<string, string> = {
  'C01-INFRA': 'C01 – Infraestructura',
  'C02-IBA':   'C02 – Investigación Básica Aplicada',
  'C03-FT':    'C03 – Formación de Talento',
  'C04-IYE':   'C04 – Innovación y Emprendimiento',
}

async function getProject(id: string) {
  try {
    const rows = await sql`
      SELECT p.id, p.num, p.clave, p.componente, p.titulo, p.monto,
        s.file_name, s.uploaded_at
      FROM projects p
      LEFT JOIN submissions s ON s.project_id = p.id
      WHERE p.id = ${id}
    `
    return rows[0] ?? null
  } catch (error) {
    console.log('Database query failed:', error)
    return null
  }
}

async function hasTemplate() {
  try {
    const rows = await sql`SELECT 1 FROM settings WHERE key = 'template_pathname'`
    return rows.length > 0
  } catch (error) {
    console.log('Database query failed:', error)
    return false
  }
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

  // Debug logging
  console.log('📍 ProjectPage Debug:')
  console.log('  Project ID from URL:', id, 'Type:', typeof id)
  console.log('  Project from DB:', { id: project.id, num: project.num })
  console.log('  Session:', session)
  console.log('  Comparison: session?.projectId === project.id?', session?.projectId, '===', project.id, '?', session?.projectId === project.id)

  const isOwner = session && session.role === 'beneficiary' && session.projectId === project.id

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SiteHeader userEmail={session?.email} showLogout={!!session} />

      <main className="max-w-2xl mx-auto px-4 py-10 w-full flex-1">
        {/* Project header */}
        <div className="bg-card border border-border rounded-xl p-8 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm font-bold text-primary-foreground bg-primary px-3 py-1 rounded-lg">
              #{project.num}
            </span>
            <span className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-lg font-medium">
              {COMPONENT_LABELS[project.componente] ?? project.componente}
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{project.clave}</span>
          <h1 className="text-2xl font-bold text-foreground mt-2 text-balance leading-snug">
            {project.titulo}
          </h1>
          {project.monto && (
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Monto asignado</p>
              <p className="text-xl text-accent font-bold">
                {Number(project.monto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
              </p>
            </div>
          )}
        </div>

        {/* Template download - always visible */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-foreground mb-1">Plantilla de reporte</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Descarga la plantilla oficial, llénala y vuelve a esta página para subir tu archivo.
              </p>
              {templateAvailable ? (
                <a
                  href="/api/template"
                  className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-accent/90 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Descargar plantilla
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  La plantilla aún no ha sido cargada por el administrador.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Auth / Upload section */}
        {isOwner ? (
          <UploadArea
            projectId={project.id}
            fileName={project.file_name ?? null}
            uploadedAt={project.uploaded_at ?? null}
          />
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground mb-1">Subir reporte</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Inicia sesión con las credenciales asignadas a este proyecto para subir tu archivo.
                </p>
                <ProjectLoginForm projectId={project.id} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-primary/5 border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p className="font-medium">FECTI &copy; 2025</p>
        <p className="text-xs mt-1 opacity-70">Fondo Estatal de Ciencia, Tecnología e Innovación</p>
      </footer>
    </div>
  )
}
