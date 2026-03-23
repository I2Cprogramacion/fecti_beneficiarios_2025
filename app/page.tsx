import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { ResultsGallery } from '@/components/results-gallery'
import { SponsorsFooter } from '@/components/sponsors-footer'
import { GuiaPdfModal } from '@/components/guia-pdf-modal'
import { sql } from '@/lib/db'

// Make this page dynamic to avoid build-time database queries
export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [total] = await sql`SELECT COUNT(*) AS count FROM projects`
    const [submitted] = await sql`SELECT COUNT(*) AS count FROM submissions`
    return { total: Number(total.count), submitted: Number(submitted.count) }
  } catch (error) {
    // Database not ready yet, return defaults
    console.log('Database query failed, using defaults:', error)
    return { total: 0, submitted: 0 }
  }
}

export default async function HomePage() {
  const { total, submitted } = await getStats()
  const pending = total - submitted

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SiteHeader />

      {/* Banner - fondo azul con gradiente sutil */}
      <div className="w-full bg-gradient-to-br from-primary to-primary/90 py-16 sm:py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-primary-foreground/90 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">
            Convocatoria 2025
          </p>
          <h1 className="text-primary-foreground text-3xl sm:text-5xl font-bold text-balance leading-tight">
            Fondo Estatal de Ciencia,<br className="hidden sm:block" /> Tecnología e Innovación
          </h1>
          <p className="text-primary-foreground/70 text-base sm:text-lg mt-4 max-w-xl">
            Plataforma de seguimiento para proyectos beneficiarios
          </p>
        </div>
      </div>

      {/* Stats */}
      <main className="max-w-6xl mx-auto px-4 py-12 w-full flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard label="Proyectos totales" value={total} color="bg-primary" icon="projects" />
          <StatCard label="Archivos subidos" value={submitted} color="bg-accent" icon="uploaded" />
          <StatCard label="Pendientes" value={pending} color="bg-muted" textColor="text-foreground" icon="pending" />
        </div>

        {/* CTA */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-md mb-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="sm:flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acceso a proyectos</h2>
            <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
              Busca tu proyecto en la lista, descarga la plantilla y sube tu reporte una vez llenado.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <GuiaPdfModal />
            <Link
              href="/proyectos"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
            >
              Ver todos los proyectos
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>

        {/* Galería de resultados oficiales */}
        <ResultsGallery />
      </main>

      {/* Sponsors Footer */}
      <SponsorsFooter />

      <footer className="bg-primary/5 border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p className="font-medium">FECTI &copy; 2025</p>
        <p className="text-xs mt-1 opacity-70">Fondo Estatal de Ciencia, Tecnología e Innovación</p>
      </footer>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  textColor = 'text-primary-foreground',
  icon,
}: {
  label: string
  value: number
  color: string
  textColor?: string
  icon?: 'projects' | 'uploaded' | 'pending'
}) {
  const icons = {
    projects: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
    ),
    uploaded: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
    ),
    pending: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
  }
  return (
    <div className={`${color} rounded-xl p-6 shadow-md transition-transform hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
          <p className={`text-sm mt-2 ${textColor} opacity-80 font-medium`}>{label}</p>
        </div>
        {icon && <div className={textColor}>{icons[icon]}</div>}
      </div>
    </div>
  )
}
