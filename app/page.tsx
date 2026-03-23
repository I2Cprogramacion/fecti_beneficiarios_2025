import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { sql } from '@/lib/db'

async function getStats() {
  const [total] = await sql`SELECT COUNT(*) AS count FROM projects`
  const [submitted] = await sql`SELECT COUNT(*) AS count FROM submissions`
  return { total: Number(total.count), submitted: Number(submitted.count) }
}

export default async function HomePage() {
  const { total, submitted } = await getStats()
  const pending = total - submitted

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <SiteHeader />

      {/* Banner */}
      <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-primary">
        <Image
          src="/banner-fecti.jpg"
          alt="FECTI – Fondo Estatal para la Ciencia, Tecnología e Innovación"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
          <p className="text-primary-foreground text-xs sm:text-sm font-medium uppercase tracking-widest opacity-80 mb-1">
            Convocatoria 2024
          </p>
          <h1 className="text-primary-foreground text-2xl sm:text-4xl font-bold text-balance leading-tight">
            Fondo Estatal para la Ciencia,<br className="hidden sm:block" /> Tecnología e Innovación
          </h1>
          <p className="text-primary-foreground/80 text-sm sm:text-base mt-2">
            Plataforma de seguimiento para proyectos beneficiarios
          </p>
        </div>
      </div>

      {/* Stats */}
      <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Proyectos totales" value={total} color="bg-primary" />
          <StatCard label="Archivos subidos" value={submitted} color="bg-accent" />
          <StatCard label="Pendientes" value={pending} color="bg-muted" textColor="text-foreground" />
        </div>

        {/* CTA */}
        <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-2">Acceso a proyectos</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Busca tu proyecto en la lista, descarga la plantilla y sube tu reporte una vez llenado.
          </p>
          <Link
            href="/proyectos"
            className="inline-block bg-primary text-primary-foreground text-sm font-medium px-6 py-2.5 rounded hover:bg-primary/90 transition-colors"
          >
            Ver todos los proyectos
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2024 &mdash; Todos los derechos reservados
      </footer>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  textColor = 'text-primary-foreground',
}: {
  label: string
  value: number
  color: string
  textColor?: string
}) {
  return (
    <div className={`${color} rounded-lg p-6 shadow-sm`}>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      <p className={`text-sm mt-1 ${textColor} opacity-80`}>{label}</p>
    </div>
  )
}
