import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { sql } from '@/lib/db'

const COMPONENT_LABELS: Record<string, string> = {
  'C01-INFRA': 'C01 – Infraestructura',
  'C02-IBA':   'C02 – Investigación Básica Aplicada',
  'C03-FT':    'C03 – Formación de Talento',
  'C04-IYE':   'C04 – Innovación y Empresa',
}

async function getProjects() {
  return sql`
    SELECT p.id, p.num, p.clave, p.componente, p.titulo,
      CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS submitted
    FROM projects p
    LEFT JOIN submissions s ON s.project_id = p.id
    ORDER BY p.num ASC
  `
}

export default async function ProyectosPage() {
  const projects = await getProjects()

  // Group by component
  const byComponent: Record<string, typeof projects> = {}
  for (const p of projects) {
    const key = p.componente as string
    if (!byComponent[key]) byComponent[key] = []
    byComponent[key].push(p)
  }
  const componentOrder = ['C01-INFRA', 'C02-IBA', 'C03-FT', 'C04-IYE']

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Proyectos FECTI 2025</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} proyectos beneficiarios. Haz clic en tu proyecto para acceder.
          </p>
        </div>

        <div className="space-y-8">
          {componentOrder.map((comp) => {
            const group = byComponent[comp]
            if (!group?.length) return null
            return (
              <section key={comp}>
                <h2 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
                  {COMPONENT_LABELS[comp] ?? comp}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({group.length} proyectos)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.map((p) => (
                    <Link
                      key={p.id}
                      href={`/proyectos/${p.id}`}
                      className="group bg-card border border-border rounded-lg p-4 hover:border-accent hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                            #{p.num}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground truncate">{p.clave}</span>
                        </div>
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
                      <p className="text-sm text-foreground leading-snug text-pretty group-hover:text-accent transition-colors">
                        {p.titulo}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2025 &mdash; Todos los derechos reservados
      </footer>
    </div>
  )
}
