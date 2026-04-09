import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { sql } from '@/lib/db'

// Make this page dynamic to avoid build-time database queries
export const dynamic = 'force-dynamic'

const COMPONENT_LABELS: Record<string, string> = {
  'C01-INFRA': 'C01 – Infraestructura',
  'C02-IBA':   'C02 – Investigación Básica Aplicada',
  'C03-FT':    'C03 – Formación de Talento',
  'C04-IYE':   'C04 – Innovación y Emprendimiento',
}

async function getProjects() {
  try {
    return await sql`
      SELECT p.id, p.num, p.clave, p.componente, p.titulo,
        CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS submitted
      FROM projects p
      LEFT JOIN submissions s ON s.project_id = p.id
      ORDER BY p.num ASC
    `
  } catch {
    return []
  }
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
      <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Proyectos FECTI 2025</h1>
          <p className="text-muted-foreground mt-2">
            <span className="font-semibold text-foreground">{projects.length}</span> proyectos beneficiarios. Haz clic en tu proyecto para acceder.
          </p>
        </div>

        <div className="space-y-10">
          {componentOrder.map((comp) => {
            const group = byComponent[comp]
            if (!group?.length) return null
            return (
              <section key={comp}>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                  <div className="w-2 h-6 bg-primary rounded-full" />
                  <h2 className="text-lg font-bold text-foreground">
                    {COMPONENT_LABELS[comp] ?? comp}
                  </h2>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{group.length} proyectos</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.map((p) => (
                    <Link
                      key={p.id}
                      href={`/proyectos/${p.id}`}
                      className="group bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-md shrink-0">
                            #{p.num}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground truncate">{p.clave}</span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 flex items-center gap-1 ${
                            p.submitted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {p.submitted ? (
                            <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>Subido</>
                          ) : (
                            <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Pendiente</>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed text-pretty group-hover:text-primary transition-colors font-medium">
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

      <footer className="bg-primary/5 border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p className="font-medium">FECTI &copy; 2025</p>
        <p className="text-xs mt-1 opacity-70">Fondo Estatal de Ciencia, Tecnología e Innovación</p>
      </footer>
    </div>
  )
}
