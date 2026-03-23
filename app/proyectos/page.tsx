import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { sql } from '@/lib/db'

async function getProjects() {
  return sql`
    SELECT p.id, p.clave, p.titulo,
      CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS submitted
    FROM projects p
    LEFT JOIN submissions s ON s.project_id = p.id
    ORDER BY p.clave ASC
  `
}

export default async function ProyectosPage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Proyectos FECTI 2024</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} proyectos beneficiarios. Haz clic en tu proyecto para continuar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/proyectos/${p.id}`}
              className="group bg-card border border-border rounded-lg p-4 hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-accent font-semibold">{p.clave}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    p.submitted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {p.submitted ? 'Subido' : 'Pendiente'}
                </span>
              </div>
              <p className="text-sm text-foreground mt-2 leading-snug text-pretty group-hover:text-accent transition-colors">
                {p.titulo}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2024 &mdash; Todos los derechos reservados
      </footer>
    </div>
  )
}
